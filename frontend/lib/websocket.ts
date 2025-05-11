let ws: WebSocket | null = null;
let messageCallback: ((message: string) => void) | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY = 3000;

export function connectWebSocket(token: string, callback: (message: string) => void) {
  if (ws) {
    disconnectWebSocket();
  }

  try {
    const wsBaseUrl = "wss://rag-backend-production-f8ae.up.railway.app"
    const url = `${wsBaseUrl}/chat/ws?token=${encodeURIComponent(token)}`
    console.log(`Attempting WebSocket connection to ${url}`);
    ws = new WebSocket(url);
    messageCallback = callback;

    ws.onopen = () => {
      console.log("WebSocket connected successfully");
      reconnectAttempts = 0; // Reset on successful connection
    };

    ws.onmessage = (event) => {
      console.log("WebSocket message received:", event.data);
      messageCallback?.(event.data);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      messageCallback?.("Error: WebSocket connection failed. Please try again.");
    };

    ws.onclose = (event) => {
      console.log(`WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`);
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        setTimeout(() => {
          console.log(`Reconnecting WebSocket (attempt ${reconnectAttempts + 1})...`);
          reconnectAttempts++;
          connectWebSocket(token, callback);
        }, RECONNECT_DELAY);
      } else {
        console.error("Max WebSocket reconnect attempts reached.");
        messageCallback?.("Error: WebSocket connection lost. Please start a new session.");
      }
    };
  } catch (error) {
    console.error("WebSocket connection failed:", error);
    messageCallback?.("Error: Failed to connect to WebSocket.");
  }
}

export function sendMessage(message: string) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.error("WebSocket is not connected");
    throw new Error("WebSocket is not connected");
  }
  console.log("Sending WebSocket message:", message);
  ws.send(message);
}

export function disconnectWebSocket() {
  if (ws) {
    console.log("Disconnecting WebSocket");
    ws.close();
    ws = null;
    messageCallback = null;
    reconnectAttempts = 0;
  }
}