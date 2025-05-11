const BASE_URL = "http://0.0.0.0:800";

export async function startSession() {
  const response = await fetch(`${BASE_URL}/session/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to start session");
  return response.json();
}

export async function getHistory(sessionToken: string) {
  const response = await fetch(`${BASE_URL}/session/history/${sessionToken}`);
  if (!response.ok) throw new Error("Failed to fetch history");
  const data = await response.json();
  return data.history;
}

export async function clearSession(sessionToken: string) {
  const response = await fetch(`${BASE_URL}/session/clear/${sessionToken}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to clear session");
}

export async function sendQuery(query: string, sessionToken?: string) {
  const response = await fetch(`${BASE_URL}/chat/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, session_token: sessionToken }),
  });
  if (!response.ok) throw new Error("Failed to send query");
  return response.json();
}