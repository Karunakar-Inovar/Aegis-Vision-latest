"use client";

import { useState, useCallback, useEffect } from "react";
import { sendMessageStream } from "@/services/ai-chat/chatService";
import {
  getAllConversations,
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation,
  renameConversation,
  pinConversation,
  unpinConversation,
  searchConversations,
  autoTitleConversation,
  type ChatConversation,
} from "@/services/ai-chat/chatHistory";
import type { ChatMessage, AttachedFile } from "@/services/ai-chat/types";

export function useChatState() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const refreshConversations = useCallback(() => {
    setConversations(getAllConversations());
  }, []);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  useEffect(() => {
    const all = getAllConversations();
    if (all.length > 0 && !activeConversationId) {
      setActiveConversationId(all[0].id);
    } else if (all.length === 0 && !activeConversationId) {
      const newConv = createConversation();
      setActiveConversationId(newConv.id);
      refreshConversations();
    }
  }, [conversations.length, activeConversationId, refreshConversations]);

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }
    const conv = getConversation(activeConversationId);
    setMessages(conv?.messages ?? []);
  }, [activeConversationId]);

  const attachFile = useCallback((file: File) => {
    const type = file.type.startsWith("video/") ? "video" : "image";
    const preview: AttachedFile = {
      id: crypto.randomUUID(),
      file,
      type,
      fileName: file.name,
      fileSize: file.size,
      localUrl: URL.createObjectURL(file),
    };
    setAttachedFiles((prev) => [...prev, preview]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setAttachedFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.localUrl);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const send = useCallback(
    async (
      content: string,
      options?: {
        historyOverride?: ChatMessage[];
        isRetry?: boolean;
        detectionModel?: string | null;
      }
    ) => {
      if (!content.trim() && attachedFiles.length === 0) return;

      let convId = activeConversationId;
      if (!convId) {
        const newConv = createConversation();
        convId = newConv.id;
        setActiveConversationId(convId);
        refreshConversations();
      }

      const history = options?.historyOverride ?? messages;
      const isRetry = options?.isRetry ?? false;
      const detectionModel = options?.detectionModel ?? null;
      const filesToSend = isRetry ? [] : attachedFiles;

      let nextMessages: ChatMessage[];
      if (isRetry) {
        nextMessages = [...history];
      } else {
        const userMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "user",
          content: content.trim(),
          timestamp: new Date().toISOString(),
          attachments: attachedFiles.map((f) => ({
            id: f.id,
            type: f.type,
            fileName: f.fileName,
            fileSize: f.fileSize,
            localUrl: f.localUrl,
            uploadStatus: "pending" as const,
          })),
        };
        nextMessages = [...history, userMsg];
      }

      setMessages(nextMessages);
      if (!isRetry) setAttachedFiles([]);
      setIsLoading(true);

      const assistantMsgId = crypto.randomUUID();
      let streamedContent = "";

      await sendMessageStream(
          content,
          filesToSend.map((f) => f.file),
          history,
          detectionModel,
          {
            onToken: (token) => {
              streamedContent += token;
              setIsLoading(false);
              setMessages((prev) => {
                const rest = prev.filter((m) => m.id !== assistantMsgId);
                const assistant: ChatMessage = {
                  id: assistantMsgId,
                  role: "assistant",
                  content: streamedContent,
                  timestamp: new Date().toISOString(),
                };
                return [...rest, assistant];
              });
            },
            onComplete: (metadata) => {
              // Add image URL to metadata for detection-result rendering
              const enrichedMetadata = metadata
                ? { ...metadata }
                : undefined;
              if (
                enrichedMetadata?.type === "detection-result" &&
                filesToSend.length > 0
              ) {
                const firstImage = filesToSend.find((f) => f.type === "image");
                if (firstImage) {
                  (enrichedMetadata as Record<string, unknown>).imageUrl =
                    firstImage.localUrl;
                }
              }
              setMessages((prev) => {
                const rest = prev.filter((m) => m.id !== assistantMsgId);
                const assistant: ChatMessage = {
                  id: assistantMsgId,
                  role: "assistant",
                  content: streamedContent,
                  timestamp: new Date().toISOString(),
                  metadata: enrichedMetadata,
                };
                const final = [...rest, assistant];
                updateConversation(convId!, { messages: final });
                const firstUser = final.find((m) => m.role === "user");
                if (firstUser?.content) {
                  autoTitleConversation(convId!, firstUser.content);
                }
                refreshConversations();
                return final;
              });
              setIsLoading(false);
            },
            onError: (error) => {
              const errorMsg: ChatMessage = {
                id: assistantMsgId,
                role: "assistant",
                content:
                  error.message ||
                  "Sorry, something went wrong. Please try again.",
                timestamp: new Date().toISOString(),
              };
              setMessages((prev) => {
                const final = [
                  ...prev.filter((m) => m.id !== assistantMsgId),
                  errorMsg,
                ];
                updateConversation(convId!, { messages: final });
                refreshConversations();
                return final;
              });
              setIsLoading(false);
            },
          }
        );
    },
    [attachedFiles, messages, activeConversationId, refreshConversations]
  );

  const handleNewChat = useCallback(() => {
    const newConv = createConversation();
    setActiveConversationId(newConv.id);
    setMessages([]);
    setAttachedFiles((prev) => {
      prev.forEach((f) => URL.revokeObjectURL(f.localUrl));
      return [];
    });
    refreshConversations();
  }, [refreshConversations]);

  const handleSelectChat = useCallback((id: string) => {
    setActiveConversationId(id);
    setAttachedFiles((prev) => {
      prev.forEach((f) => URL.revokeObjectURL(f.localUrl));
      return [];
    });
  }, []);

  const handleDeleteChat = useCallback(
    (id: string) => {
      deleteConversation(id);
      refreshConversations();
      if (activeConversationId === id) {
        const remaining = getAllConversations();
        if (remaining.length > 0) {
          setActiveConversationId(remaining[0].id);
        } else {
          const newConv = createConversation();
          setActiveConversationId(newConv.id);
          setMessages([]);
          refreshConversations();
        }
      }
    },
    [activeConversationId, refreshConversations]
  );

  const handleRenameChat = useCallback(
    (id: string, title: string) => {
      renameConversation(id, title);
      refreshConversations();
    },
    [refreshConversations]
  );

  const handlePinChat = useCallback(
    (id: string) => {
      pinConversation(id);
      refreshConversations();
    },
    [refreshConversations]
  );

  const handleUnpinChat = useCallback(
    (id: string) => {
      unpinConversation(id);
      refreshConversations();
    },
    [refreshConversations]
  );

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((o) => !o);
  }, []);

  const retryLastMessage = useCallback(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser || !lastUser.content?.trim()) return;
    const lastUserIdx = messages.findIndex((m) => m.id === lastUser.id);
    const lastAssistant = messages
      .slice(lastUserIdx + 1)
      .find((m) => m.role === "assistant");
    const filtered = lastAssistant
      ? messages.filter((m) => m.id !== lastAssistant.id)
      : messages;
    setMessages(filtered);
    send(lastUser.content, { historyOverride: filtered, isRetry: true });
  }, [messages, send]);

  const regenerateMessage = useCallback(
    (messageId: string) => {
      const assistantIdx = messages.findIndex(
        (m) => m.id === messageId && m.role === "assistant"
      );
      if (assistantIdx < 0) return;
      const userMsg = messages
        .slice(0, assistantIdx)
        .reverse()
        .find((m) => m.role === "user");
      if (!userMsg || !userMsg.content?.trim()) return;
      const filtered = messages.filter((m) => m.id !== messageId);
      setMessages(filtered);
      send(userMsg.content, { historyOverride: filtered, isRetry: true });
    },
    [messages, send]
  );

  const activeConversationTitle =
    activeConversationId
      ? getConversation(activeConversationId)?.title ?? ""
      : "";

  const displayedConversations = searchQuery.trim()
    ? searchConversations(searchQuery)
    : getAllConversations();

  return {
    messages,
    isLoading,
    attachedFiles,
    attachFile,
    removeFile,
    sendMessage: send,
    handleNewChat,
    handleSelectChat,
    handleDeleteChat,
    handleRenameChat,
    handlePinChat,
    handleUnpinChat,
    retryLastMessage,
    regenerateMessage,
    conversations: displayedConversations,
    activeConversationId,
    activeConversationTitle,
    isSidebarOpen,
    toggleSidebar,
    searchQuery,
    setSearchQuery,
  };
}
