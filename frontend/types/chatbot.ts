export type ChatMessage = {
  role: "user" | "bot";
  content: string;
}

export type CreateSessionResponse = {
  session_token: string;
}

export type ChatQueryResponse = {
  session_token: string;
  answer: string;
}