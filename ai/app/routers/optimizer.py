"""
Route Optimization Router
Optimizes waste collection vehicle routes using nearest-neighbor heuristic
with potential for upgrade to more sophisticated algorithms (e.g., OR-Tools).
"""

from fastapi import APIRouter
from pydantic import BaseModel
import numpy as np

router = APIRouter()


class Location(BaseModel):
    id: str
    latitude: float
    longitude: float
    priority: float = 1.0  # Higher = more urgent


class RouteRequest(BaseModel):
    depot: Location  # Starting/ending point (e.g., waste facility)
    locations: list[Location]  # Waste collection points
    max_stops: int | None = None  # Optional limit on stops per route


class RouteStop(BaseModel):
    location: Location
    order: int
    distance_from_previous_km: float


class RouteResponse(BaseModel):
    route: list[RouteStop]
    total_distance_km: float
    total_stops: int


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine distance in km."""
    R = 6371
    dlat = np.radians(lat2 - lat1)
    dlon = np.radians(lon2 - lon1)
    a = np.sin(dlat / 2) ** 2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon / 2) ** 2
    return R * 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))


@router.post("/optimize-route", response_model=RouteResponse)
async def optimize_route(request: RouteRequest):
    """
    Optimize waste collection route using a priority-weighted nearest-neighbor heuristic.
    Returns ordered list of stops with distances.
    """
    locations = list(request.locations)
    if request.max_stops and len(locations) > request.max_stops:
        # Keep highest priority locations
        locations.sort(key=lambda l: l.priority, reverse=True)
        locations = locations[: request.max_stops]

    if not locations:
        return RouteResponse(route=[], total_distance_km=0, total_stops=0)

    # Nearest-neighbor with priority weighting
    visited: list[RouteStop] = []
    remaining = list(locations)
    current_lat = request.depot.latitude
    current_lon = request.depot.longitude
    total_distance = 0.0

    while remaining:
        # Score = distance / priority (lower = better)
        scores = []
        for loc in remaining:
            dist = haversine_km(current_lat, current_lon, loc.latitude, loc.longitude)
            score = dist / max(loc.priority, 0.1)
            scores.append((score, dist, loc))

        scores.sort(key=lambda x: x[0])
        _, dist, best = scores[0]
        remaining.remove(best)

        total_distance += dist
        visited.append(RouteStop(
            location=best,
            order=len(visited) + 1,
            distance_from_previous_km=round(dist, 2),
        ))

        current_lat = best.latitude
        current_lon = best.longitude

    # Return to depot
    return_distance = haversine_km(current_lat, current_lon, request.depot.latitude, request.depot.longitude)
    total_distance += return_distance

    return RouteResponse(
        route=visited,
        total_distance_km=round(total_distance, 2),
        total_stops=len(visited),
    )
