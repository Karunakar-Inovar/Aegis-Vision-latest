"use client";

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from "react";
import { Paperclip, ArrowUp, X, Plus, Play } from "lucide-react";
import { DetectionModelSelector } from "./DetectionModelSelector";
import { validateMediaFile } from "@/services/chatbot/api";
import type { AttachedFile } from "@/services/ai-chat/types";

export interface ChatInputAreaHandle {
  openFilePicker: () => void;
  setPrompt: (text: string) => void;
}

function getModelName(modelId: string): string {
  const names: Record<string, string> = {
    "scratch-detection": "Scratch Detection",
    "dent-detection": "Dent Detection",
    "crack-detection": "Crack Detection",
    "surface-anomaly": "Surface Anomaly",
    "ppe-detection": "PPE Kit Detection",
    "fire-smoke-detection": "Fire & Smoke Detection",
    "safety-hazard": "Safety Hazard Detection",
    "vehicle-detection": "Vehicle Detection",
    "face-detection": "Face Detection",
    "object-counting": "Object Counting",
  };
  return names[modelId] || modelId;
}

interface ChatInputAreaProps {
  attachedFiles: AttachedFile[];
  onAttachFile: (file: File) => void;
  onRemoveFile: (id: string) => void;
  onSend: (content: string, detectionModel?: string | null) => void;
  disabled?: boolean;
}

export const ChatInputArea = forwardRef<
  ChatInputAreaHandle,
  ChatInputAreaProps
>(function ChatInputArea(
  { attachedFiles, onAttachFile, onRemoveFile, onSend, disabled = false },
  ref
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDetectionModel, setSelectedDetectionModel] = useState<
    string | null
  >(null);

  useImperativeHandle(ref, () => ({
    openFilePicker: () => fileInputRef.current?.click(),
    setPrompt: (t: string) => setText(t),
  }));
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const canSend =
    (text.trim().length > 0 || attachedFiles.length > 0) && !disabled;

  // Reset detection model when all files are removed
  useEffect(() => {
    if (attachedFiles.length === 0) {
      setSelectedDetectionModel(null);
    }
  }, [attachedFiles.length]);

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      let firstError: string | null = null;
      for (const file of fileArray) {
        const validation = validateMediaFile(file);
        if (validation.valid) {
          onAttachFile(file);
        } else {
          firstError ??= validation.error ?? "Invalid file";
        }
      }
      if (firstError) {
        setError(firstError);
        setTimeout(() => setError(null), 3000);
      } else {
        setError(null);
      }
    },
    [onAttachFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files?.length) return;
      processFiles(files);
      e.target.value = "";
    },
    [processFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (!files?.length) return;
      processFiles(files);
    },
    [processFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleSend = useCallback(() => {
    if (!canSend) return;
    onSend(text.trim(), selectedDetectionModel);
    setText("");
    setSelectedDetectionModel(null);
  }, [canSend, text, selectedDetectionModel, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const lineHeight = 24;
    const maxHeight = 200;
    ta.style.height = `${Math.min(ta.scrollHeight, maxHeight)}px`;
  }, [text]);

  return (
    <div className="w-full pb-4 pt-2">
      <div className="mx-auto w-full px-8 md:px-16 lg:px-24 xl:px-32">
        {error && (
          <div className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {attachedFiles.length > 0 && (
          <div className="mb-3 flex items-start gap-3">
            <div className="flex gap-2">
              {attachedFiles.map((file) => (
                <div key={file.id} className="group relative">
                  {file.type === "image" ? (
                    <img
                      src={file.localUrl}
                      alt={file.fileName}
                      className="h-16 w-16 rounded-lg border border-gray-200 object-cover"
                    />
                  ) : (
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200">
                      <video
                        src={file.localUrl}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="h-5 w-5 fill-white text-white drop-shadow-lg" />
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemoveFile(file.id)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-white opacity-0 transition-opacity hover:bg-gray-900 group-hover:opacity-100"
                    aria-label="Remove file"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-400 transition-colors hover:border-gray-400 hover:text-gray-500 disabled:opacity-50"
                aria-label="Add more files"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Detection model selector — shown when files attached */}
        <DetectionModelSelector
          selectedModel={selectedDetectionModel}
          onModelSelect={(id) => setSelectedDetectionModel(id || null)}
          isVisible={attachedFiles.length > 0}
        />

        <div
          className={`relative flex items-end gap-2 rounded-2xl border px-4 py-3 transition-all focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 ${
            isDragging
              ? "border-indigo-400 bg-indigo-50/50"
              : "border-gray-200 bg-gray-50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="mb-0.5 flex-shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-200/50 hover:text-gray-600 disabled:opacity-50"
            aria-label="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              attachedFiles.length === 0
                ? "Ask anything about an image or video..."
                : selectedDetectionModel
                  ? `Describe what to look for (optional — ${getModelName(selectedDetectionModel)} will run automatically)...`
                  : "Describe what you want to analyze in the uploaded media..."
            }
            disabled={disabled}
            rows={1}
            className="min-h-[24px] max-h-[200px] flex-1 resize-none border-none bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className="mb-0.5 flex-shrink-0 rounded-xl bg-indigo-600 p-2 text-white transition-colors hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400"
            aria-label="Send"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-2 text-center text-xs text-gray-400">
          AegisVision AI can make mistakes. Verify important inspection results.
        </p>
      </div>
    </div>
  );
});
