const API = "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("Sign in to save destinations to your wishlist.");
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || "Could not update your wishlist.");
  return data;
}

export const getFavorites = async () => (await request("/favorites")).favorites || [];
export const addFavorite = (id) => request(`/favorites/${encodeURIComponent(id)}`, { method: "POST" });
export const removeFavorite = (id) => request(`/favorites/${encodeURIComponent(id)}`, { method: "DELETE" });
