"use client";

import { useClearSession, useCreateSession } from "@/providers/chatbot";
import { useState, useEffect } from "react";

export default function SessionControls() {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const { mutateAsync: createSession, isLoading: isCreating } = useCreateSession();
  const { mutateAsync: clearSession, isLoading: isClearing } = useClearSession();

  useEffect(() => {
    const token = localStorage.getItem("session_token");
    if (token) {
      setSessionToken(token);
    }
  }, []);

  const handleStartSession = async () => {
    try {
      const response = await createSession();
      if (!response.session_token) {
        alert("Token is undefined");
        return;
      }
      localStorage.setItem("session_token", response.session_token);
      setSessionToken(response.session_token);
      window.location.reload(); 
    } catch (error) {
      console.error("Error starting session:", error);
      alert("Failed to start session.");
    }
  };

  const handleClearSession = async () => {
    if (!sessionToken) return;
    try {
      await clearSession(sessionToken);
      localStorage.removeItem("session_token");
      setSessionToken(null);
      window.location.reload(); // Reload to reset chat
    } catch (error) {
      console.error("Error clearing session:", error);
      alert("Failed to clear session.");
    }
  };

  return (
    <div className="mb-4 flex space-x-2">
      <button
        onClick={handleStartSession}
        className="p-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        disabled={isCreating}
      >
        {isCreating ? "Starting..." : "Start New Session"}
      </button>
      <button
        onClick={handleClearSession}
        className="p-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
        disabled={isClearing}
      >
        {isClearing ? "Clearing..." : "Clear Session"}
      </button>
    </div>
  );
}