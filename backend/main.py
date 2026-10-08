from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import json
import os

from planner import generate_travel_plan


# --------------------------------------------------
# FastAPI App
# --------------------------------------------------

app = FastAPI(title="TravelGenie API")


# --------------------------------------------------
# CORS Configuration
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Load Tourism Dataset
# --------------------------------------------------

DATASET_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "dataset",
    "tourism",
    "india_tourism_dataset.json"
)

with open(DATASET_PATH, "r", encoding="utf-8") as file:
    destinations = json.load(file)


# --------------------------------------------------
# Home Route
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "Welcome to TravelGenie API"
    }


# --------------------------------------------------
# Get Destinations
# --------------------------------------------------

@app.get("/destinations")
def get_destinations(
    search: str = "",
    state: str = "",
    trip_type: str = "",
    budget: str = ""
):
    results = destinations

    # Search by destination name, state or district
    if search:
        search = search.lower()

        results = [
            destination
            for destination in results
            if search in destination.get("destination_name", "").lower()
            or search in destination.get("state", "").lower()
            or search in destination.get("district", "").lower()
        ]

    # Filter by state
    if state:
        results = [
            destination
            for destination in results
            if destination.get("state", "").lower() == state.lower()
        ]

    # Filter by travel type
    if trip_type:
        results = [
            destination
            for destination in results
            if any(
                trip_type.lower() == trip.lower()
                for trip in destination.get("trip_types", [])
            )
        ]

    # Filter by budget
    if budget:
        results = [
            destination
            for destination in results
            if destination.get("budget_category", "").lower() == budget.lower()
        ]

    return {
        "count": len(results),
        "destinations": results
    }


class PlannerRequest(BaseModel):
    starting_location: str = "Delhi"
    destination: str = "Anywhere in India"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    duration_days: Optional[int] = None
    max_budget: float = Field(default=50000)
    travelers: int = 2
    interests: list[str] = []
    pace: str = "Balanced"
    stay_style: str = "Mid-range"
    group_type: str = "Friends"
    crowd_preference: str = "Mix"
    travel_mode: str = "Mixed"
    previous_trips: list[dict] = []


@app.get("/planner/options")
def planner_options():
    names = sorted(
        {
            item.get("destination_name")
            for item in destinations
            if item.get("destination_name")
        }
    )
    states = sorted({item.get("state") for item in destinations if item.get("state")})
    regions = sorted({item.get("region") for item in destinations if item.get("region")})
    trip_types = sorted(
        {
            trip
            for item in destinations
            for trip in (item.get("trip_types") or [])
        }
    )
    return {
        "destinations": names,
        "states": states,
        "regions": regions,
        "interests": trip_types,
        "starting_cities": [
            "Delhi",
            "Mumbai",
            "Bengaluru",
            "Chennai",
            "Kolkata",
            "Hyderabad",
            "Pune",
            "Ahmedabad",
            "Jaipur",
            "Kochi",
            "Chandigarh",
            "Lucknow",
            "Goa",
            "Guwahati",
            "Dehradun",
        ],
    }


@app.post("/planner/generate")
def create_travel_plan(payload: PlannerRequest):
    return generate_travel_plan(payload.model_dump(), destinations)