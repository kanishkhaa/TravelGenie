const API_BASE_URL = "http://127.0.0.1:8000";

export const getPersonalizedRecommendations = async (filters = {}) => {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("Sign in to see recommendations tailored to your profile.");
  const response = await fetch(`${API_BASE_URL}/recommendations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(filters),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || "Could not load personalized recommendations.");
  return data;
};

export const getDestinations = async ({
  search = "",
  state = "",
  tripType = "",
  budget = "",
} = {}) => {
  const params = new URLSearchParams();

  if (search) params.append("search", search);
  if (state) params.append("state", state);
  if (tripType) params.append("trip_type", tripType);
  if (budget) params.append("budget", budget);

  const response = await fetch(
    `${API_BASE_URL}/destinations?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch destinations");
  }

  return response.json();
};
