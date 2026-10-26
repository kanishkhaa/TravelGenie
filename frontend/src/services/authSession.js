export function expireSession() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user_id");
  localStorage.removeItem("user_name");
  localStorage.removeItem("user_email");
  window.dispatchEvent(new Event("travelgenie:session-expired"));
}

export function throwForUnauthorized(response, data, fallbackMessage) {
  if (response.status === 401) {
    expireSession();
    throw new Error("Your session expired. Please sign in again.");
  }
  if (!response.ok) throw new Error(data.detail || fallbackMessage);
}
