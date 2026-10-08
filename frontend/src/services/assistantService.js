const API = "http://127.0.0.1:8000";

async function post(path, body) {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("Sign in to use your personal travel assistant.");
  const response = await fetch(`${API}${path}`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || "The travel assistant could not respond. Please try again.");
  return data;
}

export const chatWithAssistant = (messages, trip_id, conversation_id) => post("/assistant/chat", { messages, trip_id: trip_id || null, conversation_id });
export const applyAssistantItinerary = (trip_id, itinerary) => post("/assistant/apply-itinerary", { trip_id, itinerary });

async function get(path) {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("Sign in to view chat history.");
  const response = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || "Could not load assistant data.");
  return data;
}

export const getAssistantConversations = async () => (await get("/assistant/conversations")).conversations || [];
export const getAssistantHistory = async (conversationId) => (await get(`/assistant/history/${encodeURIComponent(conversationId)}`)).messages || [];
