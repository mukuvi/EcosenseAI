"""
Waste Image Classifier Router
Uses a CNN model to classify waste types from uploaded images.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from PIL import Image
import numpy as np
import io

router = APIRouter()

# Waste type labels matching the database schema
WASTE_LABELS = [
    "plastic", "organic", "electronic", "hazardous",
    "construction", "medical", "textile", "mixed", "other"
]


class ClassificationResult(BaseModel):
    waste_type: str
    confidence: float
    all_predictions: dict[str, float]


def preprocess_image(image_bytes: bytes, target_size: tuple = (224, 224)) -> np.ndarray:
    """Preprocess image for the CNN model."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(target_size)
    arr = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)


@router.post("/classify", response_model=ClassificationResult)
async def classify_waste(image: UploadFile = File(...)):
    """
    Classify waste type from an uploaded image.
    Returns the predicted waste type and confidence score.
    """
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        image_bytes = await image.read()
        processed = preprocess_image(image_bytes)

        # TODO: Load actual trained model
        # model = tf.keras.models.load_model("models/waste_classifier.h5")
        # predictions = model.predict(processed)[0]

        # Placeholder: random predictions for development
        predictions = np.random.dirichlet(np.ones(len(WASTE_LABELS)))

        predicted_idx = int(np.argmax(predictions))
        waste_type = WASTE_LABELS[predicted_idx]
        confidence = float(predictions[predicted_idx])

        all_predictions = {
            label: float(prob)
            for label, prob in zip(WASTE_LABELS, predictions)
        }

        return ClassificationResult(
            waste_type=waste_type,
            confidence=confidence,
            all_predictions=all_predictions,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")
