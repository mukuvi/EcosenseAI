# EcoSense AI — AI Service

Python-based microservice for waste image classification, hotspot prediction, and route optimization.

## Components

- **Image Classifier**: CNN-based waste type classification (TensorFlow/PyTorch)
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
