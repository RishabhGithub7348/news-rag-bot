import { frontendAxios } from "@/config/axios";
import { ChatMessage, ChatQueryResponse, CreateSessionResponse } from "@/types/chatbot";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosInstance, AxiosResponse } from "axios";

/**
 * Creates a new session.
 * @param axiosInstance The Axios instance to use.
 * @returns A promise resolving to the session creation response.
 * @throws Error if the request fails.
 */
export const createSession = async (
  axiosInstance: AxiosInstance = frontendAxios
): Promise<CreateSessionResponse> => {
  const response = await axiosInstance.post<
    null,
    AxiosResponse<CreateSessionResponse>
  >("/session/start");

  return response.data;
};

/**
 * Fetches chat history for a session token.
 * @param axiosInstance The Axios instance to use.
 * @param sessionToken The session token to fetch history for.
 * @returns A promise resolving to an array of chat messages.
 * @throws Error if the request fails.
 */
export const fetchChatBySessionToken = async (
  axiosInstance: AxiosInstance,
  sessionToken: string
): Promise<ChatMessage[]> => {
  try {
    const response = await axiosInstance.get<
      null,
      AxiosResponse<{ history: ChatMessage[] }>
    >(`/session/history/${sessionToken}`);
    return response.data.history || [];
  } catch (err) {
    throw new Error(
      `Error fetching chat history: ${
        err instanceof Error ? err.message : "Unknown error"
      }`
    );
  }
};

/**
 * Sends a chat query.
 * @param query The user’s query.
 * @param sessionToken The session token.
 * @param axiosInstance The Axios instance to use.
 * @returns A promise resolving to the chat response.
 * @throws Error if the request fails.
 */
export const sendChatQuery = async (
  query: string,
  sessionToken: string,
  axiosInstance: AxiosInstance = frontendAxios
): Promise<ChatQueryResponse> => {
  const response = await axiosInstance.post<
    { query: string; session_token: string },
    AxiosResponse<ChatQueryResponse>
  >("/chat/query", { query, session_token: sessionToken });

  return response.data;
};

/**
 * Clears a session.
 * @param sessionToken The session token to clear.
 * @param axiosInstance The Axios instance to use.
 * @returns A promise resolving when the session is cleared.
 * @throws Error if the request fails.
 */
export const clearSession = async (
  sessionToken: string,
  axiosInstance: AxiosInstance = frontendAxios
): Promise<void> => {
  try {
    await axiosInstance.delete(`/session/clear/${sessionToken}`);
  } catch (err) {
    throw new Error(
      `Error clearing session: ${
        err instanceof Error ? err.message : "Unknown error"
      }`
    );
  }
};

/**
 * Hook to fetch chat history for a session token.
 * @param sessionToken The session token to fetch history for.
 * @param initialData Optional initial data for the history.
 * @returns A React Query instance for the chat history.
 */
export const useGetChatsBySessionToken = (
  sessionToken: string | null,
  initialData?: ChatMessage[]
) => {
  return useQuery<ChatMessage[], Error>({
    queryKey: ["chats", sessionToken],
    queryFn: () => {
      if (!sessionToken) {
        throw new Error("Session token is required");
      }
      return fetchChatBySessionToken(frontendAxios, sessionToken);
    },
    enabled: !!sessionToken,
    initialData: sessionToken ? initialData : [],
  });
};

/**
 * Hook to create a new session.
 * @returns A React Query mutation instance to create a session.
 */
export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => createSession(frontendAxios),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["createSession"] });
    },
  });
};

/**
 * Hook to send a chat query.
 * @returns A React Query mutation instance to send a query.
 */
export const useSendChatQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      query,
      sessionToken,
    }: {
      query: string;
      sessionToken: string;
    }) => sendChatQuery(query, sessionToken, frontendAxios),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chats", data.session_token] });
    },
  });
};

/**
 * Hook to clear a session.
 * @returns A React Query mutation instance to clear a session.
 */
export const useClearSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionToken: string) => clearSession(sessionToken, frontendAxios),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
};