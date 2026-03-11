"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useChatbot } from "@/contexts/ChatbotContext";
import { usePageContext } from "@/hooks/chatbot/usePageContext";
import { validateMediaFile } from "@/services/chatbot/api";
import { ChatbotErrorBoundary } from "./ChatbotErrorBoundary";
import { ChatbotHeader } from "./ChatbotHeader";
import { ChatbotInput } from "./ChatbotInput";
import { EmptyState } from "./EmptyState";
import { SmartTipsSection } from "./SmartTipsSection";
import { MessageRenderer } from "./messages";
import { formatFileSize } from "@/services/chatbot/api";
import type {
  DetectionResult,
  FlaggedFrame,
  VideoAnalysisResult,
} from "@/services/chatbot/types";
import type { SmartTip } from "@/services/chatbot/pageContext";

interface ChatbotPanelProps {
  onSendMessage: (text: string) => void;
  onFileSelected: (file: File) => void | Promise<void>;
  onRetryError?: (messageId: string) => void;
  isAnalyzing?: boolean;
  onCancelAnalysis?: () => void;
  onLogIncident?: (result: DetectionResult & { sourceFileId?: string }) => void;
  onLogFrameIncident?: (
    frame: FlaggedFrame,
    metadata: { sourceFileId?: string; modelId?: string }
  ) => void;
  onLogAllIncidents?: (result: VideoAnalysisResult) => void;
  onLogAllConfirm?: (
    messageId: string,
    metadata: {
      flaggedFrames: FlaggedFrame[];
      fileId: string;
      modelId: string;
    }
  ) => void;
  onLogAllCancel?: (messageId: string) => void;
  onLogAllRetryFailed?: (messageId: string) => void | Promise<void>;
  onConfirmIncident?: (
    draft: import("@/services/chatbot/types").IncidentDraft,
    notes?: string
  ) => void | Promise<void>;
  onCancelIncident?: () => void;
  isCreating?: boolean;
  onModelSelectAndRun?: (messageId: string, modelId: string) => void;
  onModelSelectCancel?: (messageId: string) => void;
  onModelConfirmationRun?: (messageId: string) => void;
  onModelConfirmationChangeModel?: (messageId: string) => void;
}

export function ChatbotPanel({
  onSendMessage,
  onFileSelected,
  onRetryError,
  isAnalyzing = false,
  onCancelAnalysis,
  onLogIncident,
  onLogFrameIncident,
  onLogAllIncidents,
  onLogAllConfirm,
  onLogAllCancel,
  onLogAllRetryFailed,
  onConfirmIncident,
  onCancelIncident,
  isCreating = false,
  onModelSelectAndRun,
  onModelSelectCancel,
  onModelConfirmationRun,
  onModelConfirmationChangeModel,
}: ChatbotPanelProps) {
  const router = useRouter();
  const pageContext = usePageContext();
  const {
    isOpen,
    messages,
    isLoading,
    uploadProgress,
    closePanel,
  } = useChatbot();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const triggerUploadImage = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const triggerUploadVideo = useCallback(() => {
    videoInputRef.current?.click();
  }, []);

  const handleSmartTipAction = useCallback(
    (tip: SmartTip) => {
      if (tip.actionType === "send-message" && tip.actionPayload) {
        onSendMessage(tip.actionPayload);
      } else if (tip.actionType === "navigate" && tip.actionPayload) {
        router.push(tip.actionPayload);
      } else if (tip.actionType === "upload-image") {
        triggerUploadImage();
      } else if (tip.actionType === "upload-video") {
        triggerUploadVideo();
      }
    },
    [onSendMessage, router, triggerUploadImage, triggerUploadVideo]
  );

  const handleImageInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelected(file);
      e.target.value = "";
    },
    [onFileSelected]
  );

  const handleVideoInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelected(file);
      e.target.value = "";
    },
    [onFileSelected]
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, closePanel]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      const validation = validateMediaFile(file);
      if (!validation.valid) return;
      onFileSelected(file);
    },
    [onFileSelected]
  );

  return (
    <div
      className="flex h-full min-h-0 flex-col border-l border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
      role="dialog"
      aria-label="Chatbot panel"
    >
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageInputChange}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoInputChange}
        className="hidden"
      />
      <ChatbotHeader />

      <div className="flex flex-1 flex-col overflow-hidden">
        <div
          className="relative flex-1 overflow-y-auto px-4 py-4 scroll-smooth"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragOver && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-indigo-400 bg-indigo-50/90 dark:bg-indigo-950/50">
              <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                Drop image or video to inspect
              </p>
            </div>
          )}
          <ChatbotErrorBoundary>
            {messages.length === 0 ? (
              <EmptyState
                suggestions={pageContext.suggestions}
                smartTips={pageContext.smartTips}
                pageKey={pageContext.pageKey}
                onSendMessage={onSendMessage}
                onUploadImage={triggerUploadImage}
                onUploadVideo={triggerUploadVideo}
                onSmartTipAction={handleSmartTipAction}
              />
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((msg) => (
                  <MessageRenderer
                    key={msg.id}
                    message={msg}
                    onRetryError={onRetryError}
                    onCancelAnalysis={onCancelAnalysis}
                    onLogIncident={onLogIncident}
                    onLogAllIncidents={onLogAllIncidents}
                    onLogFrameIncident={onLogFrameIncident}
                    onLogAllConfirm={onLogAllConfirm}
                    onLogAllCancel={onLogAllCancel}
                    onLogAllRetryFailed={onLogAllRetryFailed}
                    onConfirmIncident={onConfirmIncident}
                    onCancelIncident={onCancelIncident}
                    isCreating={isCreating}
                    onModelSelectAndRun={onModelSelectAndRun}
                    onModelSelectCancel={onModelSelectCancel}
                    onModelConfirmationRun={onModelConfirmationRun}
                    onModelConfirmationChangeModel={onModelConfirmationChangeModel}
                  />
                ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl bg-gray-100 px-4 py-3">
                    <span className="flex gap-1">
                      <span className="h-2 w-2 animate-typing-dot-1 rounded-full bg-gray-500" />
                      <span className="h-2 w-2 animate-typing-dot-2 rounded-full bg-gray-500" />
                      <span className="h-2 w-2 animate-typing-dot-3 rounded-full bg-gray-500" />
                    </span>
                  </div>
                </div>
              )}
              </div>
            )}
          </ChatbotErrorBoundary>

          <div ref={messagesEndRef} />
        </div>

        {messages.length > 0 && pageContext.smartTips.length > 0 && (
          <SmartTipsSection
            smartTips={pageContext.smartTips}
            pageKey={pageContext.pageKey}
            hasMessages={true}
            onSmartTipAction={handleSmartTipAction}
          />
        )}

        {uploadProgress && uploadProgress.active && (
          <div className="border-t border-gray-200 bg-white px-4 py-2">
            <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
              <span className="min-w-0 truncate">
                {uploadProgress.mediaType === "video"
                  ? `Uploading video${uploadProgress.fileSize != null ? ` (${formatFileSize(uploadProgress.fileSize)})` : ""}...`
                  : "Uploading image..."}{" "}
                {(uploadProgress.fileName.length > 20
                  ? `${uploadProgress.fileName.slice(0, 17)}...`
                  : uploadProgress.fileName)}
              </span>
              <span className="ml-2 shrink-0">{uploadProgress.progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress.progress}%` }}
              />
            </div>
          </div>
        )}

        <ChatbotInput
          onSendMessage={onSendMessage}
          onFileSelected={onFileSelected}
          disabled={isLoading}
          isAnalyzing={isAnalyzing}
          onCancelAnalysis={onCancelAnalysis}
          isPanelOpen={isOpen}
        />
      </div>
    </div>
  );
}
