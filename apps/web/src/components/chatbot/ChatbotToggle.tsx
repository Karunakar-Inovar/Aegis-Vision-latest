"use client";

import { Sparkles } from "lucide-react";
import { cn } from "ui/src/utils/cn";

export function ChatbotToggle() {
  const handleClick = () => {
    window.open("/ai-chat", "_blank");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title="Open AI Inspector"
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-lg p-2 transition-all duration-200",
        "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
      )}
      aria-label="Open AI Inspector"
    >
      <Sparkles className="h-5 w-5" />
    </button>
  );
}
