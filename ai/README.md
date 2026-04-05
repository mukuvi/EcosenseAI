# EcoSense AI — AI Service

Python-based microservice for waste image classification, hotspot prediction, and route optimization.

## Components

- **Image Classifier**: Waste type classification (TensorFlow / scikit-learn, with a lightweight heuristic fallback)
- **Hotspot Predictor**: ML model predicting waste accumulation areas
- **Route Optimizer**: Optimizes waste collection vehicle routes

## Setup

```bash
cd ai
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Models

The classifier route will load a real model file from `ai/models/` if present, otherwise it uses a deterministic heuristic fallback.

Note: `ai/models/` may not exist on a fresh clone. It will be created automatically when you train/export a model.

Supported files:

- `ai/models/waste_classifier.h5` or `ai/models/waste_classifier.keras` (TensorFlow / Keras)
- `ai/models/waste_classifier.pkl` (scikit-learn)

To train a simple scikit-learn baseline from your own labeled images:

```bash
python -m pip install -r requirements.txt
python scripts/train_waste_classifier.py --data-dir ./data/waste_images
```

Expected data layout:

```
data/waste_images/
	plastic/
	organic/
	electronic/
	hazardous/
	construction/
	medical/
	textile/
	mixed/
	other/
```
