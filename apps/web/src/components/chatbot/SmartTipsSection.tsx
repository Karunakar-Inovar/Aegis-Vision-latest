"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SmartTipCard } from "./SmartTipCard";
import type { SmartTip } from "@/services/chatbot/pageContext";

interface SmartTipsSectionProps {
  smartTips: SmartTip[];
  pageKey: string;
  hasMessages: boolean;
  onSmartTipAction: (tip: SmartTip) => void;
}

export function SmartTipsSection({
  smartTips,
  pageKey,
  hasMessages,
  onSmartTipAction,
}: SmartTipsSectionProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(!hasMessages);

  useEffect(() => {
    setDismissedIds(new Set());
  }, [pageKey]);

  useEffect(() => {
    setIsExpanded((prev) => (hasMessages ? prev : true));
  }, [hasMessages]);

  const handleDismiss = (tipId: string) => {
    setDismissedIds((prev) => new Set(prev).add(tipId));
  };

  const visibleTips = smartTips.filter((t) => !dismissedIds.has(t.id));

  if (smartTips.length === 0 || visibleTips.length === 0) return null;

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-50/30">
      <button
        type="button"
        onClick={() => setIsExpanded((e) => !e)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Smart Tips
          </span>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
            {visibleTips.length} NEW
          </span>
        </span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div
          className="mt-3 flex flex-col gap-2"
          style={{
            animation: "fadeIn 200ms ease-out",
          }}
        >
          {visibleTips.map((tip, i) => (
            <div
              key={tip.id}
              style={{ animationDelay: `${i * 100}ms` }}
              className="animate-in fade-in slide-in-from-bottom-2"
            >
              <SmartTipCard
                tip={tip}
                onAction={onSmartTipAction}
                onDismiss={handleDismiss}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
