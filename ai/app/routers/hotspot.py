"""
Hotspot Prediction Router
Predicts areas with high likelihood of waste accumulation based on historical report data.
"""

from fastapi import APIRouter
from pydantic import BaseModel
import numpy as np
from sklearn.cluster import DBSCAN

router = APIRouter()


class ReportLocation(BaseModel):
    latitude: float
    longitude: float
    waste_type: str | None = None
    severity: str | None = None


class HotspotPrediction(BaseModel):
    latitude: float
    longitude: float
    risk_score: float
    report_count: int
    radius_meters: float


class HotspotRequest(BaseModel):
    reports: list[ReportLocation]
    eps_km: float = 0.5  # Clustering radius in km
    min_samples: int = 3  # Minimum reports to form a hotspot


class HotspotResponse(BaseModel):
    hotspots: list[HotspotPrediction]
    total_reports_analyzed: int


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points in km."""
    R = 6371  # Earth radius in km
    dlat = np.radians(lat2 - lat1)
    dlon = np.radians(lon2 - lon1)
    a = np.sin(dlat / 2) ** 2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon / 2) ** 2
    return R * 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))


@router.post("/hotspots/predict", response_model=HotspotResponse)
async def predict_hotspots(request: HotspotRequest):
    """
    Predict waste accumulation hotspots using DBSCAN clustering on report locations.
    Severity weights reports to produce a risk score per cluster.
    """
    if len(request.reports) < request.min_samples:
        return HotspotResponse(hotspots=[], total_reports_analyzed=len(request.reports))

    coords = np.array([[r.latitude, r.longitude] for r in request.reports])

    # Convert eps from km to approximate degrees (1 degree ≈ 111 km)
    eps_deg = request.eps_km / 111.0

    clustering = DBSCAN(eps=eps_deg, min_samples=request.min_samples, metric="haversine")
    # DBSCAN with haversine expects radians
    labels = clustering.fit_predict(np.radians(coords))

    severity_weight = {"low": 0.25, "medium": 0.5, "high": 0.75, "critical": 1.0}

    hotspots: list[HotspotPrediction] = []
    unique_labels = set(labels)
    unique_labels.discard(-1)  # Remove noise label

    for label in unique_labels:
        mask = labels == label
        cluster_coords = coords[mask]
        cluster_reports = [r for r, m in zip(request.reports, mask) if m]

        center_lat = float(cluster_coords[:, 0].mean())
        center_lon = float(cluster_coords[:, 1].mean())

        # Risk score based on report count and severity
        weighted_sum = sum(
            severity_weight.get(r.severity, 0.5) for r in cluster_reports
        )
        risk_score = min(weighted_sum / (len(cluster_reports) * 1.0), 1.0)

        # Estimate radius from furthest point
        distances = [
            haversine_distance(center_lat, center_lon, c[0], c[1])
            for c in cluster_coords
        ]
        radius_meters = float(max(distances) * 1000) if distances else 500.0

        hotspots.append(HotspotPrediction(
            latitude=center_lat,
            longitude=center_lon,
            risk_score=round(risk_score, 3),
            report_count=len(cluster_reports),
            radius_meters=round(max(radius_meters, 100), 1),
        ))

    # Sort by risk score descending
    hotspots.sort(key=lambda h: h.risk_score, reverse=True)

    return HotspotResponse(
        hotspots=hotspots,
        total_reports_analyzed=len(request.reports),
    )
