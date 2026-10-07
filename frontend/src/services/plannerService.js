const API_BASE_URL = "http://127.0.0.1:8000";

const HISTORY_KEY = "travelgenie_trip_history";
const SAVED_PLANS_KEY = "travelgenie_saved_plans";

export const getPlannerOptions = async () => {
  const response = await fetch(`${API_BASE_URL}/planner/options`);
  if (!response.ok) {
    throw new Error("Failed to load planner options");
  }
  return response.json();
};

export const generateTravelPlan = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/planner/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to generate travel plan");
  }

  return response.json();
};

export const getTripHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
};

export const saveTripToHistory = (plan, form) => {
  const previous = getTripHistory();
  const entry = {
    created_at: new Date().toISOString(),
    destination_ids: (plan?.recommended_destinations || []).map((item) => item.id),
    destination_names: (plan?.recommended_destinations || []).map((item) => item.name),
    interests: form.interests || [],
    starting_location: form.starting_location,
    destination: form.destination,
  };
  const next = [entry, ...previous].slice(0, 12);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
};

export const getSavedPlans = () => {
  try {
    return JSON.parse(localStorage.getItem(SAVED_PLANS_KEY) || "[]");
  } catch {
    return [];
  }
};

export const saveFullPlan = (result, form) => {
  const previous = getSavedPlans();
  const entry = {
    id: Date.now(),
    saved_at: new Date().toISOString(),
    form,
    result,
  };
  const next = [entry, ...previous].slice(0, 8);
  localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(next));
  return next;
};
