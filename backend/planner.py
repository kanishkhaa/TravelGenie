import math
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Any


CITY_COORDINATES = {
    "delhi": (28.6139, 77.2090),
    "new delhi": (28.6139, 77.2090),
    "mumbai": (19.0760, 72.8777),
    "bengaluru": (12.9716, 77.5946),
    "bangalore": (12.9716, 77.5946),
    "chennai": (13.0827, 80.2707),
    "kolkata": (22.5726, 88.3639),
    "hyderabad": (17.3850, 78.4867),
    "pune": (18.5204, 73.8567),
    "ahmedabad": (23.0225, 72.5714),
    "jaipur": (26.9124, 75.7873),
    "lucknow": (26.8467, 80.9462),
    "chandigarh": (30.7333, 76.7794),
    "kochi": (9.9312, 76.2673),
    "cochin": (9.9312, 76.2673),
    "goa": (15.2993, 74.1240),
    "panaji": (15.4909, 73.8278),
    "varanasi": (25.3176, 82.9739),
    "agra": (27.1767, 78.0081),
    "amritsar": (31.6340, 74.8723),
    "indore": (22.7196, 75.8577),
    "bhopal": (23.2599, 77.4126),
    "nagpur": (21.1458, 79.0882),
    "surat": (21.1702, 72.8311),
    "patna": (25.5941, 85.1376),
    "bhubaneswar": (20.2961, 85.8245),
    "guwahati": (26.1445, 91.7362),
    "dehradun": (30.3165, 78.0322),
    "shimla": (31.1048, 77.1734),
    "manali": (32.2396, 77.1887),
    "rishikesh": (30.0869, 78.2676),
    "udaipur": (24.5854, 73.7125),
    "jaisalmer": (26.9157, 70.9083),
    "leh": (34.1526, 77.5771),
    "srinagar": (34.0837, 74.7973),
    "mysuru": (12.2958, 76.6394),
    "mysore": (12.2958, 76.6394),
    "thiruvananthapuram": (8.5241, 76.9366),
    "trivandrum": (8.5241, 76.9366),
    "visakhapatnam": (17.6868, 83.2185),
    "ranchi": (23.3441, 85.3096),
    "raipur": (21.2514, 81.6296),
    "madurai": (9.9252, 78.1198),
    "coimbatore": (11.0168, 76.9558),
    "vadodara": (22.3072, 73.1812),
    "jammu": (32.7266, 74.8570),
}

EMERGENCY_CONTACTS = [
    {"name": "National Emergency Number", "number": "112", "when": "Police, fire, ambulance, or any emergency"},
    {"name": "Tourist Helpline", "number": "1363", "when": "Travel assistance anywhere in India"},
    {"name": "Ambulance", "number": "108", "when": "Medical emergency"},
    {"name": "Women Helpline", "number": "1091", "when": "Women in distress"},
    {"name": "Railway Enquiry", "number": "139", "when": "Train schedules and booking help"},
    {"name": "Road Accident Emergency", "number": "1073", "when": "Highway accidents"},
]

INTEREST_ALIASES = {
    "beach": ["beach", "nightlife", "water"],
    "cultural": ["cultural", "heritage", "history"],
    "heritage": ["heritage", "cultural", "history"],
    "food": ["food", "cuisine"],
    "adventure": ["adventure", "trekking", "trek"],
    "nature": ["nature", "wildlife", "hill"],
    "wildlife": ["wildlife", "safari", "nature"],
    "wellness": ["wellness", "yoga", "spiritual"],
    "spiritual": ["spiritual", "pilgrim", "wellness"],
    "photography": ["photography", "scenic"],
    "trekking": ["trekking", "adventure", "trek"],
    "hill station": ["hill", "mountain", "nature"],
    "snow": ["snow", "ski", "winter"],
    "desert": ["desert", "dune"],
    "nightlife": ["nightlife", "beach"],
}

GROUP_KEYS = {
    "solo": ["solo", "solo_travellers"],
    "couple": ["couple", "couples", "honeymooners"],
    "family": ["family_with_kids", "families", "family_with_elderly", "families_with_kids"],
    "friends": ["friends"],
}


def haversine_km(lat1, lon1, lat2, lon2):
    r = 6371
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlon / 2) ** 2
    return round(2 * r * math.asin(math.sqrt(a)), 1)


def average_range(value):
    if isinstance(value, (list, tuple)) and len(value) >= 2:
        try:
            return (float(value[0]) + float(value[1])) / 2
        except (TypeError, ValueError):
            return 0
    if isinstance(value, (int, float)):
        return float(value)
    return 0


def coords_of(destination):
    coords = destination.get("coordinates") or {}
    return coords.get("latitude"), coords.get("longitude")


def lookup_city(name):
    if not name:
        return None
    key = name.strip().lower()
    if key in CITY_COORDINATES:
        return CITY_COORDINATES[key]
    for city, point in CITY_COORDINATES.items():
        if city in key or key in city:
            return point
    return None


def season_for_month(month):
    if month in (12, 1, 2):
        return "Winter"
    if month in (3, 4, 5):
        return "Summer"
    if month in (6, 7, 8, 9):
        return "Monsoon"
    return "Post-Monsoon"


def parse_trip_window(payload):
    start_date = payload.get("start_date") or None
    end_date = payload.get("end_date") or None
    duration = payload.get("duration_days")

    start = None
    end = None
    if start_date:
        start = datetime.strptime(start_date, "%Y-%m-%d")
    if end_date:
        end = datetime.strptime(end_date, "%Y-%m-%d")

    if start and end:
        days = max(1, (end - start).days + 1)
    elif duration:
        days = max(1, int(duration))
        if start:
            end = start + timedelta(days=days - 1)
        else:
            start = datetime.now()
            end = start + timedelta(days=days - 1)
    elif start:
        days = 5
        end = start + timedelta(days=days - 1)
    else:
        days = 5
        start = datetime.now()
        end = start + timedelta(days=days - 1)

    months = set()
    cursor = start
    while cursor <= end:
        months.add(cursor.month)
        cursor += timedelta(days=1)

    seasons = sorted({season_for_month(m) for m in months})
    return start, end, days, seasons


def cost_band(destination, stay_style):
    style = (stay_style or "Mid-range").lower()
    if "budget" in style:
        return destination.get("budget_category") or {}
    if "luxury" in style:
        return destination.get("luxury_category") or {}
    return destination.get("mid_range_category") or destination.get("budget_category") or {}


def destination_daily_costs(destination, stay_style):
    band = cost_band(destination, stay_style)
    return {
        "accommodation": average_range(band.get("accommodation_range")),
        "food": average_range(band.get("food_range")),
        "activities": average_range(band.get("activities_range")),
        "local_transport": average_range(band.get("local_transport_range")),
    }


def unique_destinations(raw):
    seen = set()
    unique = []
    for item in raw:
        name = (item.get("destination_name") or "").strip().lower()
        if not name or name in seen:
            continue
        seen.add(name)
        unique.append(item)
    return unique


def history_signals(previous_trips):
    visited = set()
    interest_counts = defaultdict(int)
    for trip in previous_trips or []:
        for dest_id in trip.get("destination_ids") or []:
            visited.add(dest_id)
        for name in trip.get("destination_names") or []:
            visited.add(str(name).strip().lower())
        for interest in trip.get("interests") or []:
            interest_counts[interest.lower()] += 1
    return visited, interest_counts


def matches_target(destination, target):
    if not target or target.strip().lower() in ("anywhere in india", "anywhere", "india"):
        return True, "open"

    needle = target.strip().lower()
    name = (destination.get("destination_name") or "").lower()
    state = (destination.get("state") or "").lower()
    region = (destination.get("region") or "").lower()
    district = (destination.get("district") or "").lower()

    if needle in name or name in needle:
        return True, "exact"
    if needle in region or needle.replace(" india", "") in region:
        return True, "region"
    if needle in state or state in needle:
        return True, "state"
    if needle in district:
        return True, "district"
    return False, ""


def interest_score(destination, interests):
    if not interests:
        return 12, []

    haystack = " ".join(
        [
            " ".join(destination.get("trip_types") or []),
            " ".join(destination.get("activities_available") or []),
            " ".join(destination.get("primary_attractions") or []),
            destination.get("unique_experiences") or "",
        ]
    ).lower()

    matched = []
    score = 0
    for interest in interests:
        aliases = INTEREST_ALIASES.get(interest.lower(), [interest.lower()])
        if any(alias in haystack for alias in aliases):
            matched.append(interest)
            score += 18
    return score, matched


def season_score(destination, seasons):
    best = [s.lower() for s in (destination.get("best_seasons") or [])]
    avoid = [s.lower() for s in (destination.get("avoid_seasons") or [])]
    score = 8
    notes = []
    for season in seasons:
        key = season.lower()
        if any(key in item or item in key for item in best):
            score += 16
            notes.append(f"{season} is a good time to visit")
        if any(key in item or item in key for item in avoid):
            score -= 18
            notes.append(f"{season} is usually avoided here")
    return score, notes


def score_destination(destination, context):
    reasons = []
    score = float(destination.get("popularity_score") or 0) * 2

    target_ok, target_kind = matches_target(destination, context["destination"])
    if not target_ok and context["strict_target"]:
        return None
    if target_kind == "exact":
        score += 80
        reasons.append("Matches the destination you asked for")
    elif target_kind == "region":
        score += 28
        reasons.append(f"In {destination.get('region')}")
    elif target_kind == "state":
        score += 24
        reasons.append(f"In {destination.get('state')}")

    i_score, matched = interest_score(destination, context["interests"])
    score += i_score
    if matched:
        reasons.append("Fits your interests: " + ", ".join(matched))

    s_score, s_notes = season_score(destination, context["seasons"])
    score += s_score
    reasons.extend(s_notes)

    safety = destination.get("safety_rating") or 5
    score += safety * 2
    if safety >= 8:
        reasons.append("Strong safety rating")

    group = context["group_type"].lower()
    ideal = [str(x).lower() for x in (destination.get("ideal_for") or [])]
    if any(key in " ".join(ideal) for key in GROUP_KEYS.get(group, [group])):
        score += 14
        reasons.append(f"Works well for {context['group_type'].lower()} trips")

    costs = destination_daily_costs(destination, context["stay_style"])
    daily = sum(costs.values())
    estimated_stay = daily * context["days"] * context["travelers"]
    if estimated_stay <= context["max_budget"] * 0.75:
        score += 18
        reasons.append("Comfortable for your budget")
    elif estimated_stay > context["max_budget"]:
        score -= 22
        reasons.append("On the expensive side for this budget")

    start = context["start_coords"]
    lat, lon = coords_of(destination)
    distance = None
    if start and lat is not None and lon is not None:
        distance = haversine_km(start[0], start[1], lat, lon)
        if context["days"] <= 4 and distance > 1400:
            score -= 16
        elif distance < 700:
            score += 10
            reasons.append("Reasonable distance from your starting point")

    connectivity = (destination.get("road_connectivity") or "").lower()
    airport = destination.get("nearest_airport") or {}
    if context["travel_mode"].lower() == "flight" and airport.get("name"):
        score += 8
    if context["travel_mode"].lower() in ("bus", "self-drive", "self drive") and "excellent" in connectivity:
        score += 8
    if context["travel_mode"].lower() == "train" and (destination.get("nearest_railway_station") or {}).get("name"):
        score += 8

    visited, hist_interests = context["history"]
    name_key = (destination.get("destination_name") or "").strip().lower()
    if destination.get("id") in visited or name_key in visited:
        score -= 12
        reasons.append("You have visited a similar place before, so this is ranked slightly lower")
    elif hist_interests:
        overlap = [k for k in hist_interests if k in " ".join(destination.get("trip_types") or []).lower()]
        if overlap:
            score += 10
            reasons.append("Similar to your previous trips")

    crowd = context["crowd_preference"].lower()
    popularity = destination.get("popularity_score") or 5
    if crowd == "offbeat" and popularity <= 6:
        score += 12
        reasons.append("Quieter / offbeat option")
    if crowd == "popular" and popularity >= 8:
        score += 8

    return {
        "destination": destination,
        "score": round(score, 1),
        "reasons": reasons[:5],
        "distance_km": distance,
        "daily_costs": costs,
    }


def destination_count_for_days(days, pace):
    pace_key = (pace or "balanced").lower()
    if days <= 3:
        count = 1
    elif days <= 6:
        count = 2
    elif days <= 10:
        count = 3
    else:
        count = 4
    if "relax" in pace_key:
        count = max(1, count - 1)
    if "packed" in pace_key:
        count = min(4, count + 1)
    return count


def order_route(start_coords, selected):
    remaining = selected[:]
    ordered = []
    current = start_coords

    while remaining:
        def dist(item):
            lat, lon = coords_of(item["destination"])
            if not current or lat is None:
                return 0
            return haversine_km(current[0], current[1], lat, lon)

        nxt = min(remaining, key=dist)
        remaining.remove(nxt)
        hop = dist(nxt)
        nxt = {**nxt, "hop_km": hop}
        ordered.append(nxt)
        lat, lon = coords_of(nxt["destination"])
        if lat is not None:
            current = (lat, lon)
    return ordered


def allocate_days(ordered, total_days, pace):
    if not ordered:
        return []
    weights = []
    for item in ordered:
        dest = item["destination"]
        ideal = dest.get("ideal_days") or dest.get("minimum_days") or 2
        weights.append(max(1, float(ideal)))
    raw = [w / sum(weights) * total_days for w in weights]
    days = [max(1, int(round(x))) for x in raw]
    while sum(days) > total_days:
        idx = days.index(max(days))
        if days[idx] > 1:
            days[idx] -= 1
        else:
            break
    while sum(days) < total_days:
        idx = days.index(min(days))
        days[idx] += 1
    if "relax" in (pace or "").lower() and len(days) > 1:
        days[0] = max(days[0], 2)
    return days


def transport_leg_cost(km, mode, travelers):
    mode_key = (mode or "mixed").lower()
    if km is None:
        km = 400
    if mode_key == "flight":
        per_person = 2800 + km * 4.2
    elif mode_key == "train":
        per_person = 180 + km * 1.35
    elif mode_key == "bus":
        per_person = 120 + km * 1.6
    elif mode_key in ("self-drive", "self drive", "car"):
        per_person = (km * 9.5) / max(1, travelers)
    else:
        if km > 900:
            per_person = 2500 + km * 3.6
        elif km > 350:
            per_person = 200 + km * 1.4
        else:
            per_person = 100 + km * 2.2
    return round(per_person * travelers)


def build_day_plan(destination, day_index, date_str, is_arrival, is_departure):
    attractions = list(destination.get("primary_attractions") or [])
    activities = list(destination.get("activities_available") or [])
    gems = list(destination.get("hidden_gems") or [])
    foods = list(destination.get("local_cuisine_must_try") or [])

    places = []
    if attractions:
        places.append(attractions[day_index % len(attractions)])
        if len(attractions) > 1:
            places.append(attractions[(day_index + 1) % len(attractions)])
    if gems and day_index % 2 == 1:
        places.append(gems[day_index % len(gems)])

    experiences = []
    if activities:
        experiences.append(activities[day_index % len(activities)])
        if len(activities) > 1:
            experiences.append(activities[(day_index + 2) % len(activities)])
    if foods:
        experiences.append("Try " + foods[day_index % len(foods)])

    title = f"Explore {destination.get('destination_name')}"
    if is_arrival:
        title = f"Arrive in {destination.get('destination_name')} and settle in"
    if is_departure:
        title = f"Final morning in {destination.get('destination_name')} and onward travel"

    return {
        "date": date_str,
        "destination": destination.get("destination_name"),
        "title": title,
        "places": places[:3],
        "activities": experiences[:3],
        "notes": destination.get("suggested_itinerary") if day_index == 0 else "",
    }


def weather_block(destination, seasons):
    temps = destination.get("average_temperature") or {}
    season_temps = []
    for season in seasons:
        key = season.lower()
        if key in temps:
            season_temps.append(f"{season}: {temps[key]}")
        elif "post-monsoon" in key and "winter" in temps:
            season_temps.append(f"{season}: closer to {temps['winter']}")
    suitable = []
    best = destination.get("best_seasons") or []
    avoid = destination.get("avoid_seasons") or []
    for season in seasons:
        if any(season.lower() in str(item).lower() for item in best):
            suitable.append(f"{season} is among the best seasons here")
        elif any(season.lower() in str(item).lower() for item in avoid):
            suitable.append(f"{season} is not ideal — expect weather disruption")
        else:
            suitable.append(f"{season} is workable with flexible plans")
    return {
        "destination": destination.get("destination_name"),
        "temperatures": season_temps or [f"Winter {temps.get('winter', 'n/a')} · Summer {temps.get('summer', 'n/a')}"],
        "rainfall": destination.get("rainfall_pattern") or "Not available",
        "peak_season": destination.get("peak_tourist_season") or "Not available",
        "off_season": destination.get("off_season") or "Not available",
        "suitability": suitable,
    }


def safety_block(destination):
    return {
        "destination": destination.get("destination_name"),
        "safety_rating": destination.get("safety_rating"),
        "safety_notes": destination.get("safety_notes") or "Stay aware in crowded tourist spots.",
        "special_considerations": destination.get("special_considerations") or "",
        "permits_required": bool(destination.get("permits_required")),
        "permits_details": destination.get("permits_details") or "Not required",
        "accessibility": destination.get("accessibility") or "",
        "road_connectivity": destination.get("road_connectivity") or "",
        "nearest_airport": destination.get("nearest_airport") or {},
        "nearest_railway_station": destination.get("nearest_railway_station") or {},
        "mobile_network": destination.get("mobile_network") or [],
        "atm_availability": destination.get("atm_availability") or "",
        "local_customs": destination.get("local_customs") or "",
    }


def cheaper_style(stay_style):
    key = (stay_style or "").lower()
    if "luxury" in key:
        return "Mid-range"
    return "Budget"


def summarize_destination(item, days):
    dest = item["destination"]
    return {
        "id": dest.get("id"),
        "name": dest.get("destination_name"),
        "state": dest.get("state"),
        "region": dest.get("region"),
        "nights": max(1, days - 1) if days > 1 else 1,
        "days": days,
        "distance_km": item.get("distance_km"),
        "hop_km": item.get("hop_km"),
        "reasons": item.get("reasons") or [],
        "trip_types": dest.get("trip_types") or [],
        "places": (dest.get("primary_attractions") or [])[:6],
        "activities": (dest.get("activities_available") or [])[:6],
        "hidden_gems": (dest.get("hidden_gems") or [])[:4],
        "safety_rating": dest.get("safety_rating"),
        "connectivity": dest.get("road_connectivity"),
        "airport": dest.get("nearest_airport") or {},
        "railway": dest.get("nearest_railway_station") or {},
    }


def assemble_plan(ordered, day_splits, context, start, label="primary"):
    itinerary = []
    weather = []
    safety = []
    route = []
    recommended = []

    accommodation = 0
    food = 0
    activities = 0
    local_transport = 0
    long_distance = 0
    cursor = start
    rooms = math.ceil(context["travelers"] / 2)

    previous_coords = context["start_coords"]
    for item, days in zip(ordered, day_splits):
        dest = item["destination"]
        recommended.append(summarize_destination(item, days))
        weather.append(weather_block(dest, context["seasons"]))
        safety.append(safety_block(dest))

        lat, lon = coords_of(dest)
        hop = item.get("hop_km")
        if hop is None and previous_coords and lat is not None:
            hop = haversine_km(previous_coords[0], previous_coords[1], lat, lon)
        hop = hop or 250
        long_distance += transport_leg_cost(hop, context["travel_mode"], context["travelers"])

        mode_label = context["travel_mode"]
        route.append(
            {
                "from": route[-1]["to"] if route else context["starting_location"],
                "to": dest.get("destination_name"),
                "distance_km": round(hop, 1),
                "mode": mode_label,
                "estimated_cost": transport_leg_cost(hop, mode_label, context["travelers"]),
            }
        )

        daily = destination_daily_costs(dest, context["stay_style"])
        nights = max(1, days) if days == 1 else days
        accommodation += daily["accommodation"] * nights * rooms
        food += daily["food"] * days * context["travelers"]
        activities += daily["activities"] * days * context["travelers"]
        local_transport += daily["local_transport"] * days * context["travelers"]

        for i in range(days):
            date_str = (cursor + timedelta(days=len(itinerary))).strftime("%Y-%m-%d")
            itinerary.append(
                build_day_plan(
                    dest,
                    i,
                    date_str,
                    is_arrival=(i == 0),
                    is_departure=(i == days - 1 and days > 1),
                )
            )

        if lat is not None:
            previous_coords = (lat, lon)

    totals = {
        "transportation": round(long_distance + local_transport),
        "long_distance_transport": round(long_distance),
        "local_transport": round(local_transport),
        "accommodation": round(accommodation),
        "food": round(food),
        "activities_and_entry": round(activities),
        "total": round(long_distance + local_transport + accommodation + food + activities),
    }
    budget = context["max_budget"]
    difference = round(budget - totals["total"])
    fits = totals["total"] <= budget

    return {
        "label": label,
        "fits_budget": fits,
        "budget_status": "within_budget" if fits else "over_budget",
        "budget_message": (
            f"This plan is about ₹{abs(difference):,} under your ₹{budget:,.0f} budget."
            if fits
            else f"This plan is about ₹{abs(difference):,} over your ₹{budget:,.0f} budget."
        ),
        "difference": difference,
        "max_budget": budget,
        "seasons": context["seasons"],
        "travel_window": {
            "start": start.strftime("%Y-%m-%d"),
            "end": (start + timedelta(days=context["days"] - 1)).strftime("%Y-%m-%d"),
            "days": context["days"],
        },
        "recommended_destinations": recommended,
        "route": route,
        "itinerary": itinerary,
        "costs": totals,
        "weather": weather,
        "safety": safety,
        "stay_style": context["stay_style"],
        "travel_mode": context["travel_mode"],
    }


def alternative_destinations(ranked, chosen_ids, limit=4):
    options = []
    for item in ranked:
        dest = item["destination"]
        if dest.get("id") in chosen_ids:
            continue
        options.append(
            {
                "id": dest.get("id"),
                "name": dest.get("destination_name"),
                "state": dest.get("state"),
                "region": dest.get("region"),
                "reasons": item.get("reasons") or [],
                "trip_types": dest.get("trip_types") or [],
                "why": "Lower-cost or different-fit option based on your interests",
            }
        )
        if len(options) >= limit:
            break
    return options


def generate_travel_plan(payload: dict[str, Any], destinations: list[dict]):
    start, end, days, seasons = parse_trip_window(payload)
    starting_location = (payload.get("starting_location") or "Delhi").strip()
    target = (payload.get("destination") or "Anywhere in India").strip()
    stay_style = payload.get("stay_style") or "Mid-range"
    travel_mode = payload.get("travel_mode") or "Mixed"
    travelers = max(1, int(payload.get("travelers") or 1))
    max_budget = float(payload.get("max_budget") or 0)
    interests = payload.get("interests") or []
    pace = payload.get("pace") or "Balanced"
    group_type = payload.get("group_type") or "Friends"
    crowd_preference = payload.get("crowd_preference") or "Mix"
    previous_trips = payload.get("previous_trips") or []

    start_coords = lookup_city(starting_location)
    catalog = unique_destinations(destinations)
    history = history_signals(previous_trips)
    strict = target.strip().lower() not in ("anywhere in india", "anywhere", "india", "")

    context = {
        "starting_location": starting_location,
        "destination": target,
        "start_coords": start_coords,
        "days": days,
        "seasons": seasons,
        "stay_style": stay_style,
        "travel_mode": travel_mode,
        "travelers": travelers,
        "max_budget": max_budget,
        "interests": interests,
        "pace": pace,
        "group_type": group_type,
        "crowd_preference": crowd_preference,
        "history": history,
        "strict_target": False,
    }

    ranked = []
    for dest in catalog:
        scored = score_destination(dest, context)
        if scored:
            if strict:
                ok, _ = matches_target(dest, target)
                if not ok:
                    continue
            ranked.append(scored)

    if strict and len(ranked) < 2:
        ranked = []
        for dest in catalog:
            scored = score_destination(dest, {**context, "strict_target": False})
            if scored:
                ranked.append(scored)

    ranked.sort(key=lambda item: item["score"], reverse=True)
    if not ranked:
        return {"error": "No destinations matched your filters. Try Anywhere in India or a broader region."}

    needed = destination_count_for_days(days, pace)
    seed = ranked[: max(needed * 3, needed)]
    selected = [seed[0]]
    for candidate in seed[1:]:
        if len(selected) >= needed:
            break
        c_lat, c_lon = coords_of(candidate["destination"])
        close_enough = False
        for chosen in selected:
            lat, lon = coords_of(chosen["destination"])
            if c_lat is None or lat is None:
                close_enough = candidate["destination"].get("region") == chosen["destination"].get("region")
            else:
                close_enough = haversine_km(lat, lon, c_lat, c_lon) < 850 or (
                    candidate["destination"].get("region") == chosen["destination"].get("region")
                )
        if close_enough:
            selected.append(candidate)

    if len(selected) < needed:
        for candidate in ranked:
            if candidate in selected:
                continue
            selected.append(candidate)
            if len(selected) >= needed:
                break

    ordered = order_route(start_coords, selected)
    splits = allocate_days(ordered, days, pace)
    primary = assemble_plan(ordered, splits, context, start, "primary")

    alternatives = {
        "destinations": alternative_destinations(ranked, {d["destination"].get("id") for d in ordered}),
        "activities": [],
        "travel_options": [],
        "budget_fit_plan": None,
    }

    if not primary["fits_budget"]:
        cheaper_context = {
            **context,
            "stay_style": cheaper_style(stay_style),
            "travel_mode": "Train" if travel_mode.lower() == "flight" else travel_mode,
        }
        cheaper_ordered = []
        for item in ordered:
            cheaper_ordered.append(
                {
                    **item,
                    "daily_costs": destination_daily_costs(item["destination"], cheaper_context["stay_style"]),
                }
            )
        budget_plan = assemble_plan(cheaper_ordered, splits, cheaper_context, start, "budget_fit")

        if not budget_plan["fits_budget"] and len(ordered) > 1:
            reduced = ordered[:1]
            reduced_days = [days]
            budget_plan = assemble_plan(reduced, reduced_days, cheaper_context, start, "budget_fit")

        alternatives["budget_fit_plan"] = budget_plan
        alternatives["travel_options"].append(
            {
                "title": "Switch stay style",
                "detail": f"Use {cheaper_context['stay_style']} stays instead of {stay_style} to cut accommodation cost.",
            }
        )
        if travel_mode.lower() == "flight":
            alternatives["travel_options"].append(
                {
                    "title": "Prefer train over flight",
                    "detail": "Long-distance trains usually cost less than flights on this route.",
                }
            )
        alternatives["travel_options"].append(
            {
                "title": "Shorten the circuit",
                "detail": "Dropping a far-off extra destination reduces transport and hotel nights.",
            }
        )
        for dest in ordered:
            acts = (dest["destination"].get("activities_available") or [])[:2]
            if acts:
                alternatives["activities"].append(
                    {
                        "destination": dest["destination"].get("destination_name"),
                        "swap": f"Keep free/low-cost experiences like {acts[0]} and skip paid extras.",
                    }
                )

    analysis = {
        "starting_location": starting_location,
        "target": target,
        "travelers": travelers,
        "interests": interests,
        "seasons_considered": seasons,
        "history_used": bool(previous_trips),
        "notes": [
            "Destinations were scored on interests, budget, weather/season, safety, distance, and connectivity.",
            "The route is ordered to reduce backtracking from your starting city.",
            "Costs are estimates from the destination dataset (stay band + distance-based transport).",
        ],
    }
    if previous_trips:
        analysis["notes"].append("Your previous trips slightly influenced destination ranking.")

    return {
        "analysis": analysis,
        "plan": primary,
        "alternatives": alternatives,
        "emergency_contacts": EMERGENCY_CONTACTS,
    }
