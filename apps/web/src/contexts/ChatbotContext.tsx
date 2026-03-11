"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type {
  ChatMessage,
  ChatMessageType,
  ChatbotState,
  MediaType,
  VideoAnalysisProgress,
} from "@/services/chatbot/types";
import { getLastUsedModelId } from "@/services/chatbot/modelMemory";

// --- Initial state ---
const initialState: ChatbotState = {
  isOpen: false,
  messages: [],
  isLoading: false,
  selectedModelId: null,
  uploadProgress: null,
  videoAnalysisProgress: null,
};

// --- Action types ---
type ChatbotAction =
  | { type: "TOGGLE_PANEL" }
  | { type: "OPEN_PANEL" }
  | { type: "CLOSE_PANEL" }
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "UPDATE_MESSAGE"; payload: { id: string; updates: Partial<ChatMessage> } }
  | { type: "REMOVE_MESSAGE"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SELECT_MODEL"; payload: string | null }
  | {
      type: "SET_UPLOAD_PROGRESS";
      payload: {
        active: boolean;
        progress: number;
        fileName: string;
        mediaType: MediaType;
        fileSize?: number;
      };
    }
  | { type: "CLEAR_UPLOAD_PROGRESS" }
  | { type: "SET_VIDEO_ANALYSIS_PROGRESS"; payload: VideoAnalysisProgress | null }
  | { type: "CLEAR_VIDEO_ANALYSIS_PROGRESS" }
  | { type: "CLEAR_MESSAGES" };

// --- Reducer ---
function chatbotReducer(state: ChatbotState, action: ChatbotAction): ChatbotState {
  switch (action.type) {
    case "TOGGLE_PANEL":
      return { ...state, isOpen: !state.isOpen };
    case "OPEN_PANEL":
      return { ...state, isOpen: true };
    case "CLOSE_PANEL":
      return { ...state, isOpen: false };
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case "UPDATE_MESSAGE": {
      const { id, updates } = action.payload;
      return {
        ...state,
        messages: state.messages.map((m) => {
          if (m.id !== id) return m;
          const merged = { ...m, ...updates };
          if (updates.metadata && m.metadata) {
            merged.metadata = { ...m.metadata, ...updates.metadata };
          }
          return merged;
        }),
      };
    }
    case "REMOVE_MESSAGE":
      return {
        ...state,
        messages: state.messages.filter((m) => m.id !== action.payload),
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SELECT_MODEL":
      return { ...state, selectedModelId: action.payload };
    case "SET_UPLOAD_PROGRESS":
      return { ...state, uploadProgress: action.payload };
    case "CLEAR_UPLOAD_PROGRESS":
      return { ...state, uploadProgress: null };
    case "SET_VIDEO_ANALYSIS_PROGRESS":
      return { ...state, videoAnalysisProgress: action.payload };
    case "CLEAR_VIDEO_ANALYSIS_PROGRESS":
      return { ...state, videoAnalysisProgress: null };
    case "CLEAR_MESSAGES":
      return { ...state, messages: [] };
    default:
      return state;
  }
}

// --- Context value ---
interface ChatbotContextValue extends ChatbotState {
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;
  addMessage: (
    message: Partial<ChatMessage> & Pick<ChatMessage, "role" | "content" | "type">
  ) => void;
  addAssistantMessage: (
    content: string,
    type?: ChatMessageType,
    metadata?: Record<string, unknown>
  ) => void;
  addUserMessage: (
    content: string,
    type?: ChatMessageType,
    metadata?: Record<string, unknown>
  ) => void;
  addSystemMessage: (content: string) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  removeMessage: (id: string) => void;
  setLoading: (loading: boolean) => void;
  selectModel: (modelId: string | null) => void;
  setUploadProgress: (progress: number, fileName: string, mediaType: MediaType, fileSize?: number) => void;
  clearUploadProgress: () => void;
  setVideoAnalysisProgress: (progress: VideoAnalysisProgress | null) => void;
  clearVideoAnalysisProgress: () => void;
  clearMessages: () => void;
}

const ChatbotContext = createContext<ChatbotContextValue | null>(null);

// --- Provider ---
interface ChatbotProviderProps {
  children: ReactNode;
}

export function ChatbotProvider({ children }: ChatbotProviderProps) {
  const [state, dispatch] = useReducer(chatbotReducer, initialState);

  useEffect(() => {
    const lastUsed = getLastUsedModelId();
    if (lastUsed) {
      dispatch({ type: "SELECT_MODEL", payload: lastUsed });
    }
  }, []);

  const togglePanel = useCallback(() => dispatch({ type: "TOGGLE_PANEL" }), []);
  const openPanel = useCallback(() => dispatch({ type: "OPEN_PANEL" }), []);
  const closePanel = useCallback(() => dispatch({ type: "CLOSE_PANEL" }), []);

  const addMessage = useCallback(
    (
      message: Partial<ChatMessage> & Pick<ChatMessage, "role" | "content" | "type">
    ) => {
      const msg: ChatMessage = {
        ...message,
        id: message.id ?? crypto.randomUUID(),
        timestamp: message.timestamp ?? new Date().toISOString(),
      };
      dispatch({ type: "ADD_MESSAGE", payload: msg });
    },
    []
  );

  const addAssistantMessage = useCallback(
    (
      content: string,
      type: ChatMessageType = "text",
      metadata?: Record<string, unknown>
    ) => {
      addMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content,
        timestamp: new Date().toISOString(),
        type,
        metadata,
      });
    },
    [addMessage]
  );

  const addUserMessage = useCallback(
    (
      content: string,
      type: ChatMessageType = "text",
      metadata?: Record<string, unknown>
    ) => {
      addMessage({
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date().toISOString(),
        type,
        metadata,
      });
    },
    [addMessage]
  );

  const addSystemMessage = useCallback((content: string) => {
    addMessage({
      id: crypto.randomUUID(),
      role: "system",
      content,
      timestamp: new Date().toISOString(),
      type: "text",
    });
  }, [addMessage]);

  const updateMessage = useCallback(
    (id: string, updates: Partial<ChatMessage>) => {
      dispatch({ type: "UPDATE_MESSAGE", payload: { id, updates } });
    },
    []
  );

  const removeMessage = useCallback((id: string) => {
    dispatch({ type: "REMOVE_MESSAGE", payload: id });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  }, []);

  const selectModel = useCallback((modelId: string | null) => {
    dispatch({ type: "SELECT_MODEL", payload: modelId });
  }, []);

  const setUploadProgress = useCallback(
    (progress: number, fileName: string, mediaType: MediaType, fileSize?: number) => {
      dispatch({
        type: "SET_UPLOAD_PROGRESS",
        payload: {
          active: true,
          progress,
          fileName,
          mediaType,
          fileSize,
        },
      });
    },
    []
  );

  const clearUploadProgress = useCallback(() => {
    dispatch({ type: "CLEAR_UPLOAD_PROGRESS" });
  }, []);

  const setVideoAnalysisProgress = useCallback(
    (progress: VideoAnalysisProgress | null) => {
      dispatch({ type: "SET_VIDEO_ANALYSIS_PROGRESS", payload: progress });
    },
    []
  );

  const clearVideoAnalysisProgress = useCallback(() => {
    dispatch({ type: "CLEAR_VIDEO_ANALYSIS_PROGRESS" });
  }, []);

  const clearMessages = useCallback(() => {
    dispatch({ type: "CLEAR_MESSAGES" });
  }, []);

  const value = useMemo<ChatbotContextValue>(
    () => ({
      ...state,
      togglePanel,
      openPanel,
      closePanel,
      addMessage,
      addAssistantMessage,
      addUserMessage,
      addSystemMessage,
      updateMessage,
      removeMessage,
      setLoading,
      selectModel,
      setUploadProgress,
      clearUploadProgress,
      setVideoAnalysisProgress,
      clearVideoAnalysisProgress,
      clearMessages,
    }),
    [
      state,
      togglePanel,
      openPanel,
      closePanel,
      addMessage,
      addAssistantMessage,
      addUserMessage,
      addSystemMessage,
      updateMessage,
      removeMessage,
      setLoading,
      selectModel,
      setUploadProgress,
      clearUploadProgress,
      setVideoAnalysisProgress,
      clearVideoAnalysisProgress,
      clearMessages,
    ]
  );

  return (
    <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>
  );
}

// --- Hook ---
export function useChatbot(): ChatbotContextValue {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error("useChatbot must be used within a ChatbotProvider");
  }
  return context;
}
