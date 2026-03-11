"use client";

import { useEffect, useRef, useState } from "react";
import { Paperclip, Send } from "lucide-react";
import { validateMediaFile } from "@/services/chatbot/api";

interface ChatbotInputProps {
  onSendMessage: (text: string) => void;
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  isAnalyzing?: boolean;
  onCancelAnalysis?: () => void;
  isPanelOpen?: boolean;
}

export function ChatbotInput({
  onSendMessage,
  onFileSelected,
  disabled = false,
  isAnalyzing = false,
  isPanelOpen = false,
}: ChatbotInputProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isAnalyzing) {
      setError("Please wait for the current analysis to complete.");
      setTimeout(() => setError(null), 3000);
      e.target.value = "";
      return;
    }

    const validation = validateMediaFile(file);
    if (!validation.valid) {
      setError(validation.error ?? "Invalid file");
      setTimeout(() => setError(null), 3000);
      e.target.value = "";
      return;
    }

    onFileSelected(file);
    setError(null);
    e.target.value = "";
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Shift+Enter allows newline (default behavior)
  };

  const canSend = text.trim().length > 0;

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const lineHeight = 20;
    const maxHeight = lineHeight * 3;
    ta.style.height = `${Math.min(ta.scrollHeight, maxHeight)}px`;
  }, [text]);

  useEffect(() => {
    if (isPanelOpen) {
      textareaRef.current?.focus();
    }
  }, [isPanelOpen]);

  const blockUpload = disabled || isAnalyzing;

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <div className="mb-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={handleAttachmentClick}
          disabled={blockUpload}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          aria-label="Attach file"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <div className="relative min-w-0 flex-1">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            disabled={blockUpload}
            rows={1}
            className="min-h-[40px] max-h-[72px] w-full resize-none overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
          />
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend || blockUpload}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600"
          aria-label="Send"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
      <p className="mt-2 pb-2 text-center text-xs text-gray-400">
        AI responses are generated and may not always be accurate.
      </p>
    </div>
  );
}
