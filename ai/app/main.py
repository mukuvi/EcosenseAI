"""
EcoSense AI — AI Microservice
FastAPI application for waste classification, hotspot prediction, and route optimization.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import classifier, hotspot, optimizer

app = FastAPI(
    title="EcoSense AI Service",
    description="AI-powered waste analysis for the EcoSense platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(classifier.router, prefix="/ai", tags=["Image Classification"])
app.include_router(hotspot.router, prefix="/ai", tags=["Hotspot Prediction"])
app.include_router(optimizer.router, prefix="/ai", tags=["Route Optimization"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "ecosense-ai-ml"}
