import { throwForUnauthorized } from "./authSession";

const API = import.meta.env.VITE_API_URL;
export async function chatWithAssistant(message) {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("Sign in to use TravelGenie chat.");
  const response = await fetch(`${API}/assistant/chat`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  const data = await response.json().catch(() => ({}));
  throwForUnauthorized(response, data, "Travel chat could not respond. Please try again.");
  return data;
}
