"""
Waste Image Classifier Router
Uses a CNN model to classify waste types from uploaded images.
"""

from functools import lru_cache
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

from app.ml.waste_classifier import WasteClassifier

router = APIRouter()


@lru_cache(maxsize=1)
def _get_classifier() -> WasteClassifier:
    return WasteClassifier()


class ClassificationResult(BaseModel):
    waste_type: str
    confidence: float
    all_predictions: dict[str, float]


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
        classifier = _get_classifier()
        result = classifier.classify(image_bytes)
        return ClassificationResult(
            waste_type=result.waste_type,
            confidence=result.confidence,
            all_predictions=result.all_predictions,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")
