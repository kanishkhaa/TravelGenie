const API_BASE_URL = "http://127.0.0.1:8000";

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