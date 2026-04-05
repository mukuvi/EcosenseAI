from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image

from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

import joblib

from app.ml.waste_classifier import WASTE_LABELS


def _load_image_features(path: Path, target_size: tuple[int, int] = (224, 224)) -> np.ndarray:
    img = Image.open(path).convert("RGB").resize(target_size)
    rgb = np.asarray(img, dtype=np.float32) / 255.0

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


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--data-dir",
        required=True,
        help="Directory with subfolders named by label (e.g. plastic/, organic/, ...)",
    )
    parser.add_argument(
        "--out",
        default=str(Path(__file__).resolve().parents[1] / "models" / "waste_classifier.pkl"),
        help="Output model path",
    )

    args = parser.parse_args()
    data_dir = Path(args.data_dir)
    out_path = Path(args.out)

    xs: list[np.ndarray] = []
    ys: list[int] = []

    for label_idx, label in enumerate(WASTE_LABELS):
        label_dir = data_dir / label
        if not label_dir.exists() or not label_dir.is_dir():
            continue

        for p in label_dir.rglob("*"):
            if not p.is_file():
                continue
            if p.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
                continue

            try:
                feats = _load_image_features(p)
                xs.append(feats)
                ys.append(label_idx)
            except Exception:
                continue

    if len(xs) < 20:
        raise SystemExit("Not enough training data. Add at least ~20 labeled images.")

    X = np.stack(xs, axis=0)
    y = np.asarray(ys, dtype=np.int64)

    clf = Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            (
                "lr",
                LogisticRegression(
                    max_iter=2000,
                    multi_class="multinomial",
                    solver="lbfgs",
                    n_jobs=1,
                ),
            ),
        ]
    )

    clf.fit(X, y)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(clf, out_path)

    print(f"Saved model: {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
