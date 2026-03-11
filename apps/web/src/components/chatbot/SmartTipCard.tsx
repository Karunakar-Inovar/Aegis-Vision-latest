"use client";

import { useState } from "react";
import { ChevronRight, X } from "lucide-react";
import type { SmartTip } from "@/services/chatbot/pageContext";

interface SmartTipCardProps {
  tip: SmartTip;
  onAction: (tip: SmartTip) => void;
  onDismiss: (tipId: string) => void;
}

const variantStyles = {
  warning: {
    border: "border-l-4 border-l-amber-500",
    bg: "bg-amber-50/50 dark:bg-amber-950/20",
    action: "text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400",
  },
  info: {
    border: "border-l-4 border-l-blue-500",
    bg: "bg-blue-50/50 dark:bg-blue-950/20",
    action: "text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400",
  },
  success: {
    border: "border-l-4 border-l-green-500",
    bg: "bg-green-50/50 dark:bg-green-950/20",
    action: "text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400",
  },
  insight: {
    border: "border-l-4 border-l-indigo-500",
    bg: "bg-indigo-50/50 dark:bg-indigo-950/20",
    action: "text-indigo-600 hover:text-indigo-700 dark:text-indigo-500 dark:hover:text-indigo-400",
  },
} as const;

export function SmartTipCard({ tip, onAction, onDismiss }: SmartTipCardProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const styles = variantStyles[tip.variant];

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    setTimeout(() => onDismiss(tip.id), 200);
  };

  const handleAction = () => {
    onAction(tip);
  };

  return (
    <div
      className={`rounded-xl border border-gray-200 px-3 py-3 transition-opacity duration-200 dark:border-gray-700 ${
        isDismissed ? "opacity-0" : "opacity-100"
      } animate-in fade-in slide-in-from-bottom-2 duration-150 ${styles.border} ${styles.bg}`}
    >
      <div className="relative">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute -top-1 -right-1 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="pr-6 text-sm font-semibold text-gray-800 dark:text-gray-100">
          {tip.title}
        </p>
        <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
          {tip.description}
        </p>
        <button
          type="button"
          onClick={handleAction}
          className={`mt-2 flex items-center gap-0.5 text-xs font-medium ${styles.action}`}
        >
          {tip.actionLabel}
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
