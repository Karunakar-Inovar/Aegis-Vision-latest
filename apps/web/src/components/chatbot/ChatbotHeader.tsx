"use client";

import { X } from "lucide-react";
import { useChatbot } from "@/contexts/ChatbotContext";
import { ShieldCheck } from "lucide-react";

export function ChatbotHeader() {
  const { closePanel } = useChatbot();

  return (
    <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
          <ShieldCheck className="h-4 w-4 text-indigo-600" />
        </div>
        <span className="truncate font-semibold text-gray-800">
          AegisVision Inspector
        </span>
      </div>
      <button
        type="button"
        onClick={closePanel}
        className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Close panel"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
