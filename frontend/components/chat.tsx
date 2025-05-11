"use client";

import { useState, useEffect, useRef } from "react";
import { connectWebSocket, disconnectWebSocket, sendMessage } from "../lib/websocket";
import { useGetChatsBySessionToken } from "@/providers/chatbot";
import Message from "./message";
import { ChatMessage } from "@/types/chatbot";

export type MessageType = {
  role: "user" | "bot";
  content: string;
};

// Thinking animation component styled as a chat bubble with typing dots
const ThinkingAnimation = () => (
  <div className="flex justify-start mb-2">
    <div className="max-w-xs p-3 rounded-lg bg-gray-200 flex items-center space-x-1">
      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "200ms" }}></div>
      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "400ms" }}></div>
    </div>
  </div>
);

export default function Chat() {
  const [input, setInput] = useState("");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat history using TanStack Query with default empty array
  const { data: chatMessages, isLoading, error } = useGetChatsBySessionToken(sessionToken);

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Set messages when chat data is loaded
  useEffect(() => {
    if (chatMessages) {
      setMessages(chatMessages);
    }
  }, [chatMessages]);

  useEffect(() => {
    const token = localStorage.getItem("session_token");
    if (token) {
      setSessionToken(token);
      // Connect WebSocket
      connectWebSocket(token, (messageStr: string) => {
        // Treat incoming WebSocket message as raw bot response
        const botMessage: ChatMessage = JSON.parse(messageStr);
        // Update messages
        setMessages((prev) => [...prev, botMessage]);
        // Stop thinking animation
        setIsBotThinking(false);
      });
    }

    return () => {
      disconnectWebSocket();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !sessionToken) return;

    const userMessage: ChatMessage = { role: "user", content: input };

    // Optimistically update messages
    setMessages((prev) => [...prev, userMessage]);
    // Start thinking animation
    setIsBotThinking(true);
    setInput("");

    try {
      // Send via WebSocket for real-time response
      sendMessage(input);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Error: Could not send message." } as ChatMessage,
      ]);
      setIsBotThinking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      {isLoading && <p className="p-4">Loading chat history...</p>}
      {error && <p className="p-4 text-red-500">Error: {(error as Error).message}</p>}
      <div className="flex-1 overflow-y-auto p-4 border rounded-lg bg-gray-50">
        {messages.map((msg, index) => (
          <Message key={index} role={msg.role} content={msg.content} />
        ))}
        {isBotThinking && <ThinkingAnimation />}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-4 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 p-2 border rounded-l-lg focus:outline-none"
          placeholder="Type your query..."
          disabled={!sessionToken}
        />
        <button
          onClick={handleSend}
          className="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 disabled:bg-gray-400"
          disabled={!sessionToken}
        >
          Send
        </button>
      </div>
      {!sessionToken && (
        <p className="mt-2 text-red-500">Please start a session to chat.</p>
      )}
    </div>
  );
}