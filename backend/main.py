from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pydantic import BaseModel, EmailStr, Field
import bcrypt 
from typing import Optional
import json
import os
import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timezone, timedelta
from typing import Literal
from urllib import request as urlrequest, error as urlerror
import re

from planner import generate_travel_plan, recommend_destinations_for_profile


# --------------------------------------------------
# FastAPI App
# --------------------------------------------------

app = FastAPI(title="TravelGenie API")
auth_scheme = HTTPBearer(auto_error=False)

def load_backend_env():
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    try:
        with open(env_path, "r", encoding="utf-8") as env_file:
            for line in env_file:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                os.environ.setdefault(key.strip(), value.strip().strip("'\""))
    except FileNotFoundError:
        pass

load_backend_env()
TOKEN_SECRET = os.environ.get("TRAVELGENIE_TOKEN_SECRET") or secrets.token_urlsafe(48)
TOKEN_SECRET = TOKEN_SECRET.encode()

def issue_token(user_id: str) -> str:
    payload = base64.urlsafe_b64encode(json.dumps({"sub": user_id}, separators=(",", ":")).encode()).decode().rstrip("=")
    signature = hmac.new(TOKEN_SECRET, payload.encode(), hashlib.sha256).digest()
    return payload + "." + base64.urlsafe_b64encode(signature).decode().rstrip("=")

def current_user(credentials: HTTPAuthorizationCredentials | None = Depends(auth_scheme)):
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Please log in to continue")
    try:
        payload, supplied = credentials.credentials.split(".", 1)
        expected = base64.urlsafe_b64encode(hmac.new(TOKEN_SECRET, payload.encode(), hashlib.sha256).digest()).decode().rstrip("=")
        if not hmac.compare_digest(supplied, expected):
            raise ValueError("Invalid signature")
        claims = json.loads(base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4)))
        from bson import ObjectId
        user = users_collection.find_one({"_id": ObjectId(claims["sub"])})
        if not user:
            raise ValueError("Unknown user")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Your session is invalid. Please log in again")

# --------------------------------------------------
# MongoDB Connection
# --------------------------------------------------

client = MongoClient(os.environ.get("MONGODB_URI", "mongodb://localhost:27017"), serverSelectionTimeoutMS=5000)

db = client["travelgenie"]

users_collection = db["users"]
favorites_collection = db["favorites"]
trips_collection = db["trips"]
assistant_conversations_collection = db["assistant_conversations"]
trip_invites_collection = db["trip_invites"]

# --------------------------------------------------
# Registration Model
# --------------------------------------------------

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    confirmPassword: str

# --------------------------------------------------
# Login Model
# --------------------------------------------------

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)

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


class TripRequest(BaseModel):
    title: str = ""
    notes: str = ""
    status: str = "planned"
    form: dict
    result: dict


class TripUpdateRequest(BaseModel):
    title: str
    notes: str = ""
    form: dict
    result: dict


class RecommendationRequest(BaseModel):
    season: str = ""
    duration_days: int | None = Field(default=None, ge=1, le=30)
    budget: float | None = Field(default=None, gt=0)
    starting_location: str = ""
    interests: list[str] = Field(default_factory=list)
    travelers: int | None = Field(default=None, ge=1, le=20)
    limit: int = Field(default=12, ge=1, le=24)


class AssistantMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class AssistantChatRequest(BaseModel):
    messages: list[AssistantMessage] = Field(min_length=1, max_length=24)
    trip_id: str | None = None
    conversation_id: str = Field(min_length=1, max_length=80)


class PlannerDraftRequest(BaseModel):
    form: dict


class ApplyItineraryRequest(BaseModel):
    trip_id: str
    itinerary: list[dict] = Field(min_length=1, max_length=30)


class TripInviteRequest(BaseModel):
    email: EmailStr
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

    if len(user.name.strip()) < 2:
        raise HTTPException(status_code=422, detail="Please enter your full name")
    if len(user.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")

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
        "name": user.name.strip(),
        "email": user.email.lower(),
        "hashed_password": hashed_password
    }

    # Insert into MongoDB
    result = users_collection.insert_one(new_user)

    return {
        "message": "User registered successfully",
        "user_id": str(result.inserted_id),
        "name": user.name.strip(),
        "email": user.email.lower(),
        "access_token": issue_token(str(result.inserted_id)),
        "token_type": "bearer",
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
        "email": existing_user["email"],
        "access_token": issue_token(str(existing_user["_id"])),
        "token_type": "bearer"
    }

# --------------------------------------------------
# Save / Update User Profile
# --------------------------------------------------

# --------------------------------------------------
# Save / Update User Profile
# --------------------------------------------------

@app.post("/profile")
def save_profile(profile: ProfileRequest, user=Depends(current_user)):

    # Profile data
    profile_data = {
        "name": profile.name.strip() or user["name"],
        "phone": profile.phone,
        "email": user["email"],
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
            "_id": user["_id"]
        },
        {
            "$set": {
                "profile": profile_data,
                "name": profile_data["name"],
                "profileCompleted": True
            }
        }
    )

    return {
        "message": "Profile saved successfully",
        "user_id": str(user["_id"])
    }
    # --------------------------------------------------
# Get User Profile
# --------------------------------------------------

@app.get("/profile/me")
def get_profile(user=Depends(current_user)):

    # Check profile exists
    if "profile" not in user:
        raise HTTPException(
            status_code=404,
            detail="Profile not completed"
        )

    return {
        "user_id": str(user["_id"]),
        "profile": user["profile"]
    }


@app.get("/trips")
def list_trips(user=Depends(current_user)):
    user_id = str(user["_id"])
    found = users_collection.database["trips"].find({"$or": [{"user_id": user_id}, {"collaborators": user_id}]}).sort("saved_at", -1)
    return {"trips": [
        {**{key: value for key, value in trip.items() if key != "_id"}, "id": str(trip["_id"]), "owner_id": trip.get("user_id"), "shared_with_me": trip.get("user_id") != user_id, "collaborator_count": len(trip.get("collaborators", []))}
        for trip in found
    ]}


@app.get("/planner/draft")
def get_planner_draft(user=Depends(current_user)):
    saved = users_collection.find_one({"_id": user["_id"]}, {"planner_draft": 1})
    return {"form": (saved or {}).get("planner_draft")}


@app.put("/planner/draft")
def save_planner_draft(draft: PlannerDraftRequest, user=Depends(current_user)):
    users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"planner_draft": draft.form, "planner_draft_updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    return {"message": "Planner draft saved"}


@app.get("/assistant/conversations")
def list_assistant_conversations(user=Depends(current_user)):
    user_id = str(user["_id"])
    rows = list(assistant_conversations_collection.find({"user_id": user_id}).sort("updated_at", -1).limit(100))
    conversations = []
    for row in rows:
        conversation_id = row.get("conversation_id", "legacy")
        messages = row.get("messages", [])
        first_question = next((item.get("content", "") for item in messages if item.get("role") == "user"), "Travel chat")
        conversations.append({
            "id": conversation_id,
            "title": row.get("title") or first_question[:72] or "Travel chat",
            "updated_at": row.get("updated_at", ""),
            "message_count": len(messages),
        })
    return {"conversations": conversations}


@app.get("/assistant/history/{conversation_id}")
def get_assistant_history(conversation_id: str, user=Depends(current_user)):
    conversation = assistant_conversations_collection.find_one(
        {"user_id": str(user["_id"]), "conversation_id": conversation_id}, {"messages": 1}
    )
    # Read the pre-conversations single-chat record created by earlier versions.
    if not conversation and conversation_id == "legacy":
        conversation = assistant_conversations_collection.find_one(
            {"user_id": str(user["_id"]), "conversation_id": {"$exists": False}}, {"messages": 1}
        )
    return {"messages": (conversation or {}).get("messages", [])}


@app.post("/trips")
def create_trip(trip: TripRequest, user=Depends(current_user)):
    if trip.status != "planned":
        raise HTTPException(status_code=422, detail="New trips must start as planned")
    document = trip.model_dump()
    document.update({"user_id": str(user["_id"]), "saved_at": datetime.now(timezone.utc).isoformat(), "status": "planned"})
    result = users_collection.database["trips"].insert_one(document)
    document["id"] = str(result.inserted_id)
    document.pop("_id", None)
    return {"trip": document}


@app.put("/trips/{trip_id}")
def update_trip(trip_id: str, trip: TripUpdateRequest, user=Depends(current_user)):
    from bson import ObjectId
    try:
        trip_object_id = ObjectId(trip_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid trip ID")
    collection = users_collection.database["trips"]
    user_id = str(user["_id"])
    existing = collection.find_one({"_id": trip_object_id, "$or": [{"user_id": user_id}, {"collaborators": user_id}]})
    if not existing:
        raise HTTPException(status_code=404, detail="Trip not found")
    changes = trip.model_dump()
    collection.update_one({"_id": trip_object_id}, {"$set": changes})
    return {"trip": {**{key: value for key, value in existing.items() if key != "_id"}, **changes, "id": trip_id}}


@app.patch("/trips/{trip_id}/complete")
def complete_trip(trip_id: str, user=Depends(current_user)):
    from bson import ObjectId
    try:
        trip_object_id = ObjectId(trip_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid trip ID")
    collection = users_collection.database["trips"]
    user_id = str(user["_id"])
    result = collection.update_one(
        {"_id": trip_object_id, "$or": [{"user_id": user_id}, {"collaborators": user_id}]},
        {"$set": {"status": "completed", "completed_at": datetime.now(timezone.utc).isoformat()}},
    )
    if not result.matched_count:
        raise HTTPException(status_code=404, detail="Trip not found")
    return {"message": "Trip moved to travel history", "status": "completed"}


@app.delete("/trips/{trip_id}")
def delete_trip(trip_id: str, user=Depends(current_user)):
    from bson import ObjectId
    try:
        trip_object_id = ObjectId(trip_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid trip ID")
    result = users_collection.database["trips"].delete_one(
        {"_id": trip_object_id, "user_id": str(user["_id"])}
    )
    if not result.deleted_count:
        raise HTTPException(status_code=404, detail="Trip not found")
    return {"message": "Trip deleted"}


@app.post("/trips/{trip_id}/invites")
def create_trip_invite(trip_id: str, request: TripInviteRequest, user=Depends(current_user)):
    from bson import ObjectId
    try:
        object_id = ObjectId(trip_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid trip ID")
    collection = users_collection.database["trips"]
    trip = collection.find_one({"_id": object_id, "user_id": str(user["_id"]), "status": "planned"})
    if not trip:
        raise HTTPException(status_code=404, detail="Only the trip owner can invite collaborators to a planned trip")
    now = datetime.now(timezone.utc)
    if trip_invites_collection.count_documents({"trip_id": trip_id, "claimed_by": {"$exists": False}, "expires_at": {"$gt": now.isoformat()}}) >= 5:
        raise HTTPException(status_code=429, detail="This trip already has five active invitation links")
    token = secrets.token_urlsafe(32)
    expires_at = now + timedelta(days=7)
    trip_invites_collection.insert_one({
        "trip_id": trip_id,
        "owner_id": str(user["_id"]),
        "invited_email": str(request.email).lower(),
        "token_hash": hashlib.sha256(token.encode()).hexdigest(),
        "created_at": now.isoformat(),
        "expires_at": expires_at.isoformat(),
    })
    return {"token": token, "email": str(request.email).lower(), "trip_title": trip.get("title") or "a trip", "expires_at": expires_at.isoformat()}


@app.post("/trip-invites/{token}/accept")
def accept_trip_invite(token: str, user=Depends(current_user)):
    now = datetime.now(timezone.utc).isoformat()
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    invite = trip_invites_collection.find_one({"token_hash": token_hash})
    if not invite or invite.get("expires_at", "") <= now:
        raise HTTPException(status_code=404, detail="This invitation link is invalid or has expired")
    user_id = str(user["_id"])
    if user.get("email", "").lower() != invite.get("invited_email", "").lower():
        raise HTTPException(status_code=403, detail="Sign in with the email address that received this invitation")
    if invite.get("claimed_by") and invite["claimed_by"] != user_id:
        raise HTTPException(status_code=409, detail="This invitation has already been used")
    if invite["owner_id"] == user_id:
        raise HTTPException(status_code=400, detail="You already own this trip")
    from bson import ObjectId
    trip_id = ObjectId(invite["trip_id"])
    collection = users_collection.database["trips"]
    trip = collection.find_one({"_id": trip_id, "user_id": invite["owner_id"], "status": "planned"})
    if not trip:
        raise HTTPException(status_code=404, detail="The shared trip is no longer available")
    collaborators = trip.get("collaborators", [])
    if user_id not in collaborators and len(collaborators) >= 10:
        raise HTTPException(status_code=409, detail="This trip has reached its collaborator limit")
    claim = trip_invites_collection.update_one(
        {"_id": invite["_id"], "$or": [{"claimed_by": {"$exists": False}}, {"claimed_by": user_id}]},
        {"$set": {"claimed_by": user_id, "claimed_at": now}},
    )
    if not claim.matched_count:
        raise HTTPException(status_code=409, detail="This invitation has already been used")
    collection.update_one({"_id": trip_id}, {"$addToSet": {"collaborators": user_id}})
    return {"trip_id": invite["trip_id"], "trip_title": trip.get("title", "Shared trip"), "message": f"You’re now collaborating on {trip.get('title') or 'this trip'}."}


@app.post("/recommendations")
def get_personalized_recommendations(
    filters: RecommendationRequest,
    user=Depends(current_user),
):
    profile = user.get("profile") or {}
    previous_trips = []
    for trip in users_collection.database["trips"].find({
        "user_id": str(user["_id"]),
        "status": "completed",
    }).sort("completed_at", -1).limit(30):
        plan = (trip.get("result") or {}).get("plan") or {}
        previous_trips.append({
            "destination_ids": [item.get("id") for item in plan.get("recommended_destinations", [])],
            "destination_names": [item.get("name") for item in plan.get("recommended_destinations", [])],
            "interests": (trip.get("form") or {}).get("interests", []),
        })
    result = recommend_destinations_for_profile(
        profile,
        filters.model_dump(),
        destinations,
        previous_trips,
    )
    result["profile_complete"] = bool(user.get("profileCompleted"))
    return result


@app.get("/favorites")
def list_favorites(user=Depends(current_user)):
    user_id = str(user["_id"])
    saved_ids = {str(item.get("destination_id")) for item in favorites_collection.find({"user_id": user_id})}
    return {"favorites": [item for item in destinations if str(item.get("id")) in saved_ids]}


@app.post("/favorites/{destination_id}")
def save_favorite(destination_id: str, user=Depends(current_user)):
    destination = next((item for item in destinations if str(item.get("id")) == destination_id), None)
    if not destination:
        raise HTTPException(status_code=404, detail="Destination not found")
    favorites_collection.update_one(
        {"user_id": str(user["_id"]), "destination_id": str(destination.get("id"))},
        {"$setOnInsert": {"user_id": str(user["_id"]), "destination_id": str(destination.get("id")), "saved_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    return {"message": "Destination saved", "destination": destination}


@app.delete("/favorites/{destination_id}")
def remove_favorite(destination_id: str, user=Depends(current_user)):
    deleted = favorites_collection.delete_one({"user_id": str(user["_id"]), "destination_id": destination_id})
    if not deleted.deleted_count:
        raise HTTPException(status_code=404, detail="Saved destination not found")
    return {"message": "Destination removed from your wishlist"}


def assistant_destination_context(query: str, limit: int = 8):
    terms = {word for word in re.findall(r"[a-zA-Z]{3,}", query.lower())}
    ranked = []
    for destination in destinations:
        searchable = " ".join(str(destination.get(key, "")) for key in (
            "destination_name", "state", "district", "region", "trip_types", "primary_attractions",
            "activities_available", "unique_experiences", "hidden_gems", "best_seasons", "local_cuisine_must_try",
        )).lower()
        score = sum(2 if term in (destination.get("destination_name", "").lower()) else 1 for term in terms if term in searchable)
        if score:
            ranked.append((score, destination))
    ranked.sort(key=lambda row: row[0], reverse=True)
    amount_match = re.search(r"(?:₹|rs\.?\s*)\s*([\d,]+)", query, re.IGNORECASE)
    duration_match = re.search(r"(\d+)\s*(?:day|days)", query, re.IGNORECASE)
    if amount_match:
        budget = float(amount_match.group(1).replace(",", ""))
        days = float(duration_match.group(1)) if duration_match else 1
        affordable = []
        for item in destinations:
            daily_range = ((item.get("budget_category") or {}).get("total_daily_range") or [])
            if len(daily_range) >= 2:
                try:
                    if float(daily_range[0]) * days <= budget:
                        affordable.append((next((score for score, dest in ranked if dest.get("id") == item.get("id")), 0), item))
                except (TypeError, ValueError):
                    continue
        if affordable:
            ranked = sorted(affordable, key=lambda row: row[0], reverse=True)
    if not ranked:
        ranked = [(0, item) for item in destinations[:limit]]
    fields = (
        "id", "destination_name", "state", "district", "region", "categories", "trip_types", "primary_attractions",
        "activities_available", "unique_experiences", "hidden_gems", "best_seasons", "avoid_seasons", "ideal_days",
        "local_cuisine_must_try", "safety_rating", "safety_notes", "road_connectivity", "nearest_airport", "nearest_railway_station",
    )
    return [{key: item[key] for key in fields if key in item} for _, item in ranked[:limit]]


@app.post("/assistant/chat")
def travel_assistant(request: AssistantChatRequest, user=Depends(current_user)):
    api_key = os.environ.get("GROQ_API_KEY", "").strip()
    if not api_key or api_key == "your_groq_api_key_here":
        raise HTTPException(status_code=503, detail="Groq API key is missing. Set GROQ_API_KEY in backend/.env and restart the backend.")
    from bson import ObjectId
    trip = None
    if request.trip_id:
        try:
            user_id = str(user["_id"])
            trip = trips_collection.find_one({"_id": ObjectId(request.trip_id), "$or": [{"user_id": user_id}, {"collaborators": user_id}]})
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid trip ID")
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")
    latest_query = next((message.content for message in reversed(request.messages) if message.role == "user"), "")
    trip_plan = (trip.get("result") or {}).get("plan") if trip else None
    itinerary = trip_plan.get("itinerary", []) if isinstance(trip_plan, dict) else []
    context = assistant_destination_context(latest_query)
    if trip_plan:
        trip_names = {str(item.get("name", "")).lower() for item in (trip_plan.get("recommended_destinations") or []) if isinstance(item, dict)}
        trip_names.update(str(day.get("destination", "")).lower() for day in itinerary if isinstance(day, dict))
        for item in destinations:
            if item.get("destination_name", "").lower() in trip_names and all(row.get("id") != item.get("id") for row in context):
                context.append(item)
        context = context[:12]
    known_names = {item.get("destination_name") for item in context}
    system_prompt = (
        "You are TravelGenie, a practical India travel assistant. Use ONLY the tourism database context and trip itinerary supplied below. "
        "Do not invent prices, opening times, transport schedules, or attractions. If the database lacks an answer, say so clearly. "
        "For itinerary change requests, propose a complete updated_itinerary with the same day count and dates; only use places and activities present in the supplied destination records. "
        "Return a JSON object with exactly: reply (string), updated_itinerary (array or null), source_destinations (array of destination names). "
        f"\nTOURISM DATABASE: {json.dumps(context, ensure_ascii=False)}"
        f"\nCURRENT TRIP ITINERARY: {json.dumps(itinerary, ensure_ascii=False)}"
    )
    configured_model = os.environ.get("GROQ_MODEL", "qwen/qwen3.8-27b")
    fallback_model = os.environ.get("GROQ_FALLBACK_MODEL", "openai/gpt-oss-20b")
    secondary_model = os.environ.get("GROQ_SECONDARY_MODEL", "openai/gpt-oss-120b")
    body = {
        "model": configured_model,
        "messages": [{"role": "system", "content": system_prompt}] + [message.model_dump() for message in request.messages],
        "temperature": 0.25,
        "max_completion_tokens": 2200,
        "response_format": {"type": "json_object"},
    }
    models_to_try = list(dict.fromkeys([configured_model, fallback_model, secondary_model]))
    answer = None
    model_used = configured_model
    last_status = None
    last_groq_message = ""
    for model_name in models_to_try:
        body["model"] = model_name
        req = urlrequest.Request(
            "https://api.groq.com/openai/v1/chat/completions",
            data=json.dumps(body).encode("utf-8"),
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urlrequest.urlopen(req, timeout=35) as response:
                result = json.loads(response.read().decode("utf-8"))
            answer = json.loads(result["choices"][0]["message"]["content"])
            model_used = model_name
            break
        except urlerror.HTTPError as error:
            last_status = error.code
            try:
                error_data = json.loads(error.read().decode("utf-8"))
                last_groq_message = (error_data.get("error") or {}).get("message", "")
            except (ValueError, AttributeError):
                last_groq_message = ""
            if error.code == 401:
                raise HTTPException(status_code=502, detail="Groq rejected this API key. Check that it is active and belongs to the selected Groq project.")
            if error.code == 429:
                raise HTTPException(status_code=503, detail="Groq is rate limiting this project. Please wait briefly and try again.")
            if error.code in (400, 403, 404):
                continue
            raise HTTPException(status_code=502, detail=f"Groq request failed with HTTP {error.code}. {last_groq_message}".strip())
        except (urlerror.URLError, TimeoutError) as error:
            raise HTTPException(status_code=502, detail=f"Could not reach Groq: {getattr(error, 'reason', error)}. Check backend internet access and DNS.")
        except (KeyError, ValueError, IndexError):
            raise HTTPException(status_code=502, detail="Groq responded, but its reply could not be read. Please retry.")
    if answer is None:
        if last_status == 403:
            message = f"Groq denied all configured models ({', '.join(models_to_try)}). Enable at least one of these models in both organization and project limits."
            if last_groq_message:
                message += f" Groq: {last_groq_message}"
            raise HTTPException(status_code=502, detail=message)
        message = f"Groq could not use any configured model ({', '.join(models_to_try)})."
        if last_groq_message:
            message += f" Groq: {last_groq_message}"
        raise HTTPException(status_code=502, detail=message)

    updated = answer.get("updated_itinerary")
    if updated is not None:
        if not trip or trip.get("status") == "completed" or not isinstance(updated, list) or len(updated) != len(itinerary):
            updated = None
        else:
            normalized = []
            for index, day in enumerate(updated):
                if not isinstance(day, dict):
                    updated = None
                    break
                original = itinerary[index] if isinstance(itinerary[index], dict) else {}
                catalog_values = set()
                for record in context:
                    for key in ("primary_attractions", "activities_available", "unique_experiences", "hidden_gems"):
                        values = record.get(key) or []
                        if isinstance(values, str):
                            values = [values]
                        catalog_values.update(str(value).strip().lower() for value in values)
                prior_values = {str(value).strip().lower() for key in ("places", "activities") for value in (original.get(key) or [])}
                normalized.append({
                    "date": original.get("date", day.get("date", "")),
                    "destination": str(day.get("destination", original.get("destination", "")))[:120],
                    "title": str(day.get("title", original.get("title", "")))[:180],
                    "places": [str(value)[:160] for value in day.get("places", []) if isinstance(value, str) and str(value).strip().lower() in catalog_values | prior_values][:12],
                    "activities": [str(value)[:160] for value in day.get("activities", []) if isinstance(value, str) and str(value).strip().lower() in catalog_values | prior_values][:12],
                    "notes": str(day.get("notes", original.get("notes", "")))[:500],
                })
            if updated is not None:
                updated = normalized
    sources = [name for name in answer.get("source_destinations", []) if name in known_names]
    reply = str(answer.get("reply", "Here are some ideas from the tourism database."))
    conversation_filter = {"user_id": str(user["_id"]), "conversation_id": request.conversation_id}
    previous_conversation = assistant_conversations_collection.find_one(conversation_filter) or {}
    persisted_messages = list(previous_conversation.get("messages", []))
    latest_user_message = next((message.content for message in reversed(request.messages) if message.role == "user"), "")
    if latest_user_message:
        persisted_messages.append({"role": "user", "content": latest_user_message})
    persisted_messages.append({"role": "assistant", "content": reply, "sources": sources, "model_used": model_used})
    first_question = next((message.content for message in request.messages if message.role == "user"), latest_user_message)
    assistant_conversations_collection.update_one(
        conversation_filter,
        {"$set": {"messages": persisted_messages[-200:], "updated_at": datetime.now(timezone.utc).isoformat()}, "$setOnInsert": {"title": first_question[:72] or "Travel chat"}},
        upsert=True,
    )
    return {"reply": reply, "sources": sources, "updated_itinerary": updated, "trip_id": request.trip_id, "model_used": model_used, "conversation_id": request.conversation_id}


@app.post("/assistant/apply-itinerary")
def apply_assistant_itinerary(request: ApplyItineraryRequest, user=Depends(current_user)):
    from bson import ObjectId
    try:
        trip_id = ObjectId(request.trip_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid trip ID")
    user_id = str(user["_id"])
    trip = trips_collection.find_one({"_id": trip_id, "$or": [{"user_id": user_id}, {"collaborators": user_id}], "status": "planned"})
    if not trip:
        raise HTTPException(status_code=404, detail="Planned trip not found")
    plan = (trip.get("result") or {}).get("plan") or {}
    existing = plan.get("itinerary") or []
    if len(request.itinerary) != len(existing):
        raise HTTPException(status_code=422, detail="The updated itinerary must keep the same number of days")
    safe_days = []
    catalog_values = set()
    for record in destinations:
        for key in ("primary_attractions", "activities_available", "unique_experiences", "hidden_gems"):
            values = record.get(key) or []
            if isinstance(values, str):
                values = [values]
            catalog_values.update(str(value).strip().lower() for value in values)
    for index, day in enumerate(request.itinerary):
        old = existing[index] if isinstance(existing[index], dict) else {}
        prior_values = {str(value).strip().lower() for key in ("places", "activities") for value in (old.get(key) or [])}
        submitted_values = [value for key in ("places", "activities") for value in day.get(key, []) if isinstance(value, str)]
        if any(value.strip().lower() not in catalog_values | prior_values for value in submitted_values):
            raise HTTPException(status_code=422, detail="Use places and activities from the tourism guide or the existing itinerary")
        safe_days.append({
            "date": old.get("date", ""),
            "destination": str(day.get("destination", ""))[:120],
            "title": str(day.get("title", ""))[:180],
            "places": [str(value)[:160] for value in day.get("places", []) if isinstance(value, str)][:12],
            "activities": [str(value)[:160] for value in day.get("activities", []) if isinstance(value, str)][:12],
            "notes": str(day.get("notes", ""))[:500],
        })
    plan["itinerary"] = safe_days
    result_data = trip.get("result") or {}
    result_data["plan"] = plan
    trips_collection.update_one({"_id": trip_id}, {"$set": {"result": result_data}})
    trip["result"] = result_data
    trip["id"] = str(trip.pop("_id"))
    return {"trip": trip}


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
        category_key = {
            "budget": "budget_category",
            "moderate": "mid_range_category",
            "mid-range": "mid_range_category",
            "luxury": "luxury_category",
        }.get(budget.lower())
        def matches_budget(destination):
            band = destination.get(category_key) or {} if category_key else {}
            daily = band.get("total_daily_range") or []
            try:
                estimate = sum(float(value) for value in daily[:2]) / min(2, len(daily))
            except (TypeError, ValueError, ZeroDivisionError):
                estimate = 0
            if budget.lower() == "budget":
                return 0 < estimate <= 3000
            if budget.lower() in ("moderate", "mid-range"):
                return 0 < estimate <= 6000
            if budget.lower() == "luxury":
                return estimate >= 10000
            return False

        results = [destination for destination in results if matches_budget(destination)]

    return {
        "count": len(results),
        "destinations": results
    }


class PlannerRequest(BaseModel):
    starting_location: str = "Delhi"
    destination: str = "Anywhere in India"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    duration_days: Optional[int] = Field(default=None, ge=1, le=30)
    max_budget: float = Field(default=50000, gt=0)
    travelers: int = Field(default=2, ge=1, le=20)
    interests: list[str] = Field(default_factory=list)
    pace: str = "Balanced"
    stay_style: str = "Mid-range"
    group_type: str = "Friends"
    crowd_preference: str = "Mix"
    travel_mode: str = "Mixed"
    previous_trips: list[dict] = Field(default_factory=list)
    preferred_destinations: list[str] = Field(default_factory=list)


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
    values = payload.model_dump()
    try:
        start = datetime.strptime(values["start_date"], "%Y-%m-%d") if values.get("start_date") else None
        end = datetime.strptime(values["end_date"], "%Y-%m-%d") if values.get("end_date") else None
    except ValueError:
        raise HTTPException(status_code=422, detail="Use valid departure and return dates")
    if start and end and end < start:
        raise HTTPException(status_code=422, detail="Return date must be on or after departure date")
    return generate_travel_plan(values, destinations)
