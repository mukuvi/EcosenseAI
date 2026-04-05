from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Literal
import os

import numpy as np
from PIL import Image
import io


WASTE_LABELS: list[str] = [
    "plastic",
    "organic",
    "electronic",
    "hazardous",
    "construction",
    "medical",
    "textile",
    "mixed",
    "other",
]


ModelKind = Literal["tensorflow", "sklearn", "heuristic"]


@dataclass(frozen=True)
class Classification:
    waste_type: str
    confidence: float
    all_predictions: dict[str, float]
    model_kind: ModelKind
    model_path: str | None


def _softmax(logits: np.ndarray) -> np.ndarray:
    x = logits.astype(np.float64)
    x = x - np.max(x)
    ex = np.exp(x)
    s = ex / np.sum(ex)
    return s.astype(np.float64)


def _preprocess_image_rgb(image_bytes: bytes, target_size: tuple[int, int] = (224, 224)) -> np.ndarray:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(target_size)
    arr = np.asarray(img, dtype=np.float32) / 255.0
    return arr


def _extract_features(image_rgb: np.ndarray) -> np.ndarray:
    rgb = image_rgb
    mean_rgb = rgb.mean(axis=(0, 1))
    std_rgb = rgb.std(axis=(0, 1))

    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    maxc = np.maximum(np.maximum(r, g), b)
    minc = np.minimum(np.minimum(r, g), b)
    brightness = maxc.mean()
    saturation = np.where(maxc > 1e-6, (maxc - minc) / (maxc + 1e-6), 0.0).mean()

    gray = (0.299 * r + 0.587 * g + 0.114 * b).astype(np.float32)
    dx = np.abs(np.diff(gray, axis=1))
    dy = np.abs(np.diff(gray, axis=0))
    edge_density = float((dx.mean() + dy.mean()) / 2.0)

    return np.array(
        [
            float(mean_rgb[0]),
            float(mean_rgb[1]),
            float(mean_rgb[2]),
            float(std_rgb[0]),
            float(std_rgb[1]),
            float(std_rgb[2]),
            float(brightness),
            float(saturation),
            float(edge_density),
        ],
        dtype=np.float32,
    )


def _heuristic_logits(features: np.ndarray) -> np.ndarray:
    mean_r, mean_g, mean_b, std_r, std_g, std_b, brightness, saturation, edge = features.tolist()

    logits = np.zeros(len(WASTE_LABELS), dtype=np.float64)

    def add(label: str, value: float) -> None:
        logits[WASTE_LABELS.index(label)] += float(value)

    add("organic", 2.0 * (mean_g - (mean_r + mean_b) / 2.0))
    add("organic", 0.8 * (0.6 - abs(brightness - 0.5)))

    add("plastic", 1.2 * saturation)
    add("plastic", 0.6 * (brightness - 0.4))

    add("electronic", 1.0 * (std_r + std_g + std_b))
    add("electronic", 1.1 * edge)
    add("electronic", -0.3 * saturation)

    add("construction", 1.1 * (0.5 - abs((mean_r + mean_g + mean_b) / 3.0 - 0.5)))
    add("construction", 0.9 * edge)
    add("construction", -0.2 * saturation)

    add("hazardous", 1.6 * (mean_r - (mean_g + mean_b) / 2.0))
    add("hazardous", 0.7 * saturation)

    add("medical", 1.2 * (brightness - 0.5))
    add("medical", -0.3 * edge)

    add("textile", 0.8 * saturation)
    add("textile", 0.6 * (std_r + std_g + std_b))

    add("mixed", 1.0 * (std_r + std_g + std_b))
    add("mixed", 0.6 * edge)

    add("other", 0.1)

    return logits


class WasteClassifier:
    def __init__(self) -> None:
        self.labels = list(WASTE_LABELS)
        self.models_dir = Path(__file__).resolve().parents[2] / "models"
        self.model_kind: ModelKind
        self.model_path: str | None
        self._model: Any | None

        self.model_kind, self.model_path, self._model = self._load_model()

    def _load_model(self) -> tuple[ModelKind, str | None, Any | None]:
        explicit_path = os.getenv("WASTE_CLASSIFIER_MODEL_PATH")
        if explicit_path:
            path = Path(explicit_path)
            return self._load_from_path(path)

        candidates = [
            self.models_dir / "waste_classifier.keras",
            self.models_dir / "waste_classifier.h5",
            self.models_dir / "waste_classifier.pkl",
        ]
        for path in candidates:
            if path.exists() and path.is_file():
                return self._load_from_path(path)

        return "heuristic", None, None

    def _load_from_path(self, path: Path) -> tuple[ModelKind, str | None, Any | None]:
        suffix = path.suffix.lower()

        if suffix in {".h5", ".keras"}:
            try:
                import tensorflow as tf

                model = tf.keras.models.load_model(path)
                return "tensorflow", str(path), model
            except Exception:
                return "heuristic", None, None

        if suffix == ".pkl":
            try:
                import joblib

                model = joblib.load(path)
                return "sklearn", str(path), model
            except Exception:
                return "heuristic", None, None

        return "heuristic", None, None

    def predict_proba(self, image_bytes: bytes) -> np.ndarray:
        image_rgb = _preprocess_image_rgb(image_bytes)

        if self.model_kind == "tensorflow" and self._model is not None:
            x = np.expand_dims(image_rgb, axis=0)
            preds = self._model.predict(x, verbose=0)
            preds = np.asarray(preds).reshape(-1)
            if preds.shape[0] != len(self.labels):
                features = _extract_features(image_rgb)
                logits = _heuristic_logits(features)
                return _softmax(logits)
            preds = np.clip(preds.astype(np.float64), 0.0, None)
            s = preds.sum()
            if s <= 0:
                return np.ones(len(self.labels), dtype=np.float64) / len(self.labels)
            return (preds / s).astype(np.float64)

        features = _extract_features(image_rgb)

        if self.model_kind == "sklearn" and self._model is not None:
            try:
                proba = self._model.predict_proba([features])[0]
                proba = np.asarray(proba, dtype=np.float64).reshape(-1)
                if proba.shape[0] != len(self.labels):
                    logits = _heuristic_logits(features)
                    return _softmax(logits)
                proba = np.clip(proba, 0.0, None)
                s = proba.sum()
                if s <= 0:
                    return np.ones(len(self.labels), dtype=np.float64) / len(self.labels)
                return (proba / s).astype(np.float64)
            except Exception:
                logits = _heuristic_logits(features)
                return _softmax(logits)

        logits = _heuristic_logits(features)
        return _softmax(logits)

    def classify(self, image_bytes: bytes) -> Classification:
        proba = self.predict_proba(image_bytes)
        idx = int(np.argmax(proba))

        all_predictions = {label: float(proba[i]) for i, label in enumerate(self.labels)}
        return Classification(
            waste_type=self.labels[idx],
            confidence=float(proba[idx]),
            all_predictions=all_predictions,
            model_kind=self.model_kind,
            model_path=self.model_path,
        )
