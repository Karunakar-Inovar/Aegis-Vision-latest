"use client";

import { useRef, useCallback, useState } from "react";
import { Upload } from "lucide-react";
import {
  ChatTopBar,
  ChatEmptyState,
  ChatInputArea,
  MessageThread,
  ChatSidebar,
  useChatState,
} from "@/components/ai-chat";
import type { ChatInputAreaHandle } from "@/components/ai-chat";

export default function AIChatPage() {
  const [isDragging, setIsDragging] = useState(false);
  const {
    messages,
    isLoading,
    attachedFiles,
    attachFile,
    removeFile,
    sendMessage,
    handleNewChat,
    handleSelectChat,
    handleDeleteChat,
    handleRenameChat,
    handlePinChat,
    handleUnpinChat,
    regenerateMessage,
    conversations,
    activeConversationId,
    activeConversationTitle,
    isSidebarOpen,
    toggleSidebar,
    searchQuery,
    setSearchQuery,
  } = useChatState();

  const inputRef = useRef<ChatInputAreaHandle>(null);

  const handleSuggestionClick = useCallback((prompt: string) => {
    inputRef.current?.setPrompt(prompt);
  }, []);

  const handleUploadClick = useCallback(() => {
    inputRef.current?.openFilePicker();
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* Sidebar */}
      <div
        className={`flex-shrink-0 overflow-hidden transition-all duration-200 ease-in-out ${
          isSidebarOpen ? "w-[260px]" : "w-[50px]"
        }`}
      >
        <div
          className={`h-full ${isSidebarOpen ? "w-[260px]" : "w-[50px]"}`}
        >
          <ChatSidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={toggleSidebar}
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
            onRenameChat={handleRenameChat}
            onDeleteChat={handleDeleteChat}
            onPinChat={handlePinChat}
            onUnpinChat={handleUnpinChat}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>
      </div>

      {/* Main chat area */}
      <div
        className="relative flex min-w-0 w-full flex-1 flex-col"
        onDragEnter={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragging(false);
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const files = Array.from(e.dataTransfer.files).filter(
            (f) =>
              f.type.startsWith("image/") || f.type.startsWith("video/")
          );
          files.forEach((file) => attachFile(file));
        }}
      >
        {isDragging && (
          <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg border-2 border-dashed border-indigo-300 bg-indigo-50/80 backdrop-blur-sm">
            <div className="text-center">
              <Upload className="mx-auto mb-2 h-10 w-10 text-indigo-400" />
              <p className="text-sm font-medium text-indigo-600">
                Drop images or videos here
              </p>
              <p className="mt-1 text-xs text-indigo-400">
                Supports JPG, PNG, MP4, MOV
              </p>
            </div>
          </div>
        )}
        <ChatTopBar conversationTitle={activeConversationTitle} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full px-8 pt-8 md:px-16 lg:px-24 xl:px-32">
              {messages.length === 0 ? (
                <ChatEmptyState
                  onSuggestionClick={handleSuggestionClick}
                  onUploadClick={handleUploadClick}
                />
              ) : (
                <MessageThread
                  messages={messages}
                  isLoading={isLoading}
                  onRegenerate={regenerateMessage}
                />
              )}
            </div>
          </div>
          <ChatInputArea
            ref={inputRef}
            attachedFiles={attachedFiles}
            onAttachFile={attachFile}
            onRemoveFile={removeFile}
            onSend={(content, detectionModel) =>
              sendMessage(content, { detectionModel })
            }
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
