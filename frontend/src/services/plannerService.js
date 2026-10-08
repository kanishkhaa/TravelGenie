const API_BASE_URL = "http://127.0.0.1:8000";
const LEGACY_PLANS_KEY = "travelgenie_saved_plans";
const LEGACY_IMPORT_KEY = "travelgenie_saved_plans_imported_v1";
let legacyImportPromise = null;

const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("Please log in to manage your trips.");
  return { Authorization: `Bearer ${token}` };
};

async function tripRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || "Trip request failed. Please try again.");
  return data;
}

export const getPlannerOptions = async () => {
  const response = await fetch(`${API_BASE_URL}/planner/options`);
  if (!response.ok) throw new Error("Failed to load planner options");
  return response.json();
};

export async function getPlannerDraft() {
  if (!localStorage.getItem("access_token")) return null;
  const data = await tripRequest("/planner/draft");
  return data.form || null;
}

export async function savePlannerDraft(form) {
  return tripRequest("/planner/draft", { method: "PUT", body: JSON.stringify({ form }) });
}

export const generateTravelPlan = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/planner/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || "Failed to generate travel plan.");
  return data;
};

export const getSavedPlans = async () => {
  if (!localStorage.getItem(LEGACY_IMPORT_KEY)) {
    if (!legacyImportPromise) {
      legacyImportPromise = (async () => {
        let legacyPlans = [];
        try { legacyPlans = JSON.parse(localStorage.getItem(LEGACY_PLANS_KEY) || "[]"); } catch { legacyPlans = []; }
        for (const plan of legacyPlans) {
          if (plan?.result && plan?.form) await saveFullPlan(plan.result, plan.form);
        }
        localStorage.setItem(LEGACY_IMPORT_KEY, "true");
        localStorage.removeItem(LEGACY_PLANS_KEY);
      })().finally(() => { legacyImportPromise = null; });
    }
    await legacyImportPromise;
  }
  const data = await tripRequest("/trips");
  return data.trips || [];
};

export const saveFullPlan = async (result, form, title = "") => {
  const destinations = (result?.plan?.recommended_destinations || []).map((item) => item.name);
  const tripTitle = title.trim() || destinations.join(" · ") || form.destination || "India getaway";
  const data = await tripRequest("/trips", {
    method: "POST",
    body: JSON.stringify({ title: tripTitle, notes: "", status: "planned", form, result }),
  });
  return data.trip;
};

export const updateSavedPlan = async (trip) => {
  const data = await tripRequest(`/trips/${trip.id}`, {
    method: "PUT",
    body: JSON.stringify({ title: trip.title, notes: trip.notes || "", form: trip.form, result: trip.result }),
  });
  return data.trip;
};

export const completeSavedPlan = (id) => tripRequest(`/trips/${id}/complete`, { method: "PATCH" });
export const deleteSavedPlan = (id) => tripRequest(`/trips/${id}`, { method: "DELETE" });

export const createTripInvite = async (id, email) => tripRequest(`/trips/${id}/invites`, { method: "POST", body: JSON.stringify({ email }) });

export const acceptTripInvite = async (token) => tripRequest(`/trip-invites/${encodeURIComponent(token)}/accept`, { method: "POST" });
