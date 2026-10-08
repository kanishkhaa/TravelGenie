from fastapi import FastAPI, HTTPException
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
# MongoDB Connection
# --------------------------------------------------

client = MongoClient("mongodb://localhost:27017")

db = client["travelgenie"]

users_collection = db["users"]

# --------------------------------------------------
# Registration Model
# --------------------------------------------------

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    confirmPassword: str

# --------------------------------------------------
# Login Model
# --------------------------------------------------

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# --------------------------------------------------
# Profile Model
# --------------------------------------------------

# --------------------------------------------------
# Profile Model
# --------------------------------------------------

class ProfileRequest(BaseModel):
    user_id: str

    name: str
    phone: str
    email: EmailStr
    dateOfBirth: str
    age: int | None = None
    gender: str = ""

    state: str
    city: str
    address: str
    pincode: str

    emergencyName: str
    emergencyPhone: str

    travelTypes: list[str] = []
    destinations: list[str] = []
    duration: str
    budget: str

    travelStyle: list[str] = []

    accommodation: list[str] = []
    accommodationBudget: str = ""

    transportation: list[str] = []

    foodPreference: list[str] = []
    cuisines: list[str] = []

    activities: list[str] = []

    safetyLevel: str = ""
    accessibility: list[str] = []

    otherPreferences: str = ""
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
# Register User
# --------------------------------------------------

@app.post("/register")
def register_user(user: RegisterRequest):

    # Check password match
    if user.password != user.confirmPassword:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match"
        )

    # Check if email already exists
    existing_user = users_collection.find_one({
        "email": user.email.lower()
    })

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Hash password
    hashed_password = bcrypt.hashpw(
        user.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    # Create user document
    new_user = {
        "name": user.name,
        "email": user.email.lower(),
        "hashed_password": hashed_password
    }

    # Insert into MongoDB
    result = users_collection.insert_one(new_user)

    return {
        "message": "User registered successfully",
        "user_id": str(result.inserted_id)
    }

# --------------------------------------------------
# Login User
# --------------------------------------------------

@app.post("/login")
def login_user(user: LoginRequest):

    # Find user by email
    existing_user = users_collection.find_one({
        "email": user.email.lower()
    })

    # Email not found
    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    # Get stored hashed password
    stored_password = existing_user["hashed_password"]

    # Compare entered password with stored hash
    password_match = bcrypt.checkpw(
        user.password.encode("utf-8"),
        stored_password.encode("utf-8")
    )

    # Password incorrect
    if not password_match:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    # Login successful
    return {
        "message": "Login successful",
        "user_id": str(existing_user["_id"]),
        "name": existing_user["name"],
        "email": existing_user["email"]
    }

# --------------------------------------------------
# Save / Update User Profile
# --------------------------------------------------

# --------------------------------------------------
# Save / Update User Profile
# --------------------------------------------------

@app.post("/profile")
def save_profile(profile: ProfileRequest):

    from bson import ObjectId

    # Check whether user_id is valid
    try:
        user_object_id = ObjectId(profile.user_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid user ID"
        )

    # Check whether registered user exists
    existing_user = users_collection.find_one({
        "_id": user_object_id
    })

    if not existing_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Profile data
    profile_data = {
        "name": profile.name,
        "phone": profile.phone,
        "email": profile.email.lower(),
        "dateOfBirth": profile.dateOfBirth,
        "age": profile.age,
        "gender": profile.gender,

        "state": profile.state,
        "city": profile.city,
        "address": profile.address,
        "pincode": profile.pincode,

        "emergencyName": profile.emergencyName,
        "emergencyPhone": profile.emergencyPhone,

        "travelTypes": profile.travelTypes,
        "destinations": profile.destinations,
        "duration": profile.duration,
        "budget": profile.budget,

        "travelStyle": profile.travelStyle,

        "accommodation": profile.accommodation,
        "accommodationBudget": profile.accommodationBudget,

        "transportation": profile.transportation,

        "foodPreference": profile.foodPreference,
        "cuisines": profile.cuisines,

        "activities": profile.activities,

        "safetyLevel": profile.safetyLevel,
        "accessibility": profile.accessibility,

        "otherPreferences": profile.otherPreferences
    }

    # Update registered user's MongoDB document
    users_collection.update_one(
        {
            "_id": user_object_id
        },
        {
            "$set": {
                "profile": profile_data,
                "profileCompleted": True
            }
        }
    )

    return {
        "message": "Profile saved successfully",
        "user_id": profile.user_id
    }
    # --------------------------------------------------
# Get User Profile
# --------------------------------------------------

@app.get("/profile/{user_id}")
def get_profile(user_id: str):

    from bson import ObjectId

    # Validate user ID
    try:
        user_object_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid user ID"
        )

    # Find user
    existing_user = users_collection.find_one({
        "_id": user_object_id
    })

    if not existing_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Check profile exists
    if "profile" not in existing_user:
        raise HTTPException(
            status_code=404,
            detail="Profile not completed"
        )

    return {
        "user_id": str(existing_user["_id"]),
        "profile": existing_user["profile"]
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