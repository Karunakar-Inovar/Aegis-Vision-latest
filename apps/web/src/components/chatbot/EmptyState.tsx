"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Bell,
  BellOff,
  Camera,
  ClipboardCheck,
  Download,
  FileText,
  Film,
  GitCompare,
  HelpCircle,
  Lightbulb,
  Sparkles,
  Shield,
  TrendingUp,
  Trophy,
  Upload,
  UserPlus,
  Users,
  Video,
  WifiOff,
  Workflow,
} from "lucide-react";
import { SmartTipCard } from "./SmartTipCard";
import type { PageContextConfig, Suggestion, SmartTip } from "@/services/chatbot/pageContext";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Bell,
  BellOff,
  Camera,
  ClipboardCheck,
  Download,
  FileText,
  Film,
  GitCompare,
  HelpCircle,
  Lightbulb,
  Shield,
  Sparkles,
  TrendingUp,
  Trophy,
  Upload,
  UserPlus,
  Users,
  Video,
  WifiOff,
  Workflow,
};

interface EmptyStateProps {
  suggestions: PageContextConfig["suggestions"];
  smartTips: PageContextConfig["smartTips"];
  pageKey: string;
  onSendMessage: (text: string) => void;
  onUploadImage: () => void;
  onUploadVideo: () => void;
  onSmartTipAction: (tip: SmartTip) => void;
}

export function EmptyState({
  suggestions,
  smartTips,
  pageKey,
  onSendMessage,
  onUploadImage,
  onUploadVideo,
  onSmartTipAction,
}: EmptyStateProps) {
  const [dismissedTipIds, setDismissedTipIds] = useState<Set<string>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevPageKeyRef = useRef(pageKey);

  useEffect(() => {
    setDismissedTipIds(new Set());
  }, [pageKey]);

  useEffect(() => {
    if (prevPageKeyRef.current !== pageKey) {
      prevPageKeyRef.current = pageKey;
      setIsTransitioning(true);
      const t = setTimeout(() => setIsTransitioning(false), 50);
      return () => clearTimeout(t);
    }
  }, [pageKey]);

  const handleSuggestionClick = (s: Suggestion) => {
    if (s.action === "send-message" && s.payload) {
      onSendMessage(s.payload);
    } else if (s.action === "upload-image") {
      onUploadImage();
    } else if (s.action === "upload-video") {
      onUploadVideo();
    }
  };

  const handleSmartTipDismiss = (tipId: string) => {
    setDismissedTipIds((prev) => new Set(prev).add(tipId));
  };

  const visibleTips = smartTips.filter((t) => !dismissedTipIds.has(t.id));
  const IconComponent = (iconName: string) =>
    iconMap[iconName] ?? Sparkles;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      {/* Greeting — STAYS THE SAME on all pages */}
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
        Hello! 👋
      </h3>
      <p className="mt-2 max-w-[280px] text-center text-sm text-gray-500 dark:text-gray-400">
        I&apos;m your AegisVision inspector. Upload an image or video to inspect
        for defects.
      </p>

      {/* Try asking — contextual suggestions */}
      <div
        className={`mt-8 w-full max-w-[320px] transition-opacity duration-200 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
          Try asking
        </p>
        <div className="flex flex-col gap-1">
          {suggestions.map((s, i) => {
            const Icon = IconComponent(s.icon);
            return (
              <button
                key={`${s.text}-${i}`}
                type="button"
                onClick={() => handleSuggestionClick(s)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <Icon className="h-4 w-4 shrink-0 text-indigo-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {s.text}
                </span>
              </button>
            );
          })}
        </div>

        {/* Smart Tips — only if configured */}
        {smartTips.length > 0 && (
          <div className="mt-6">
            <span className="flex items-center gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Smart Tips
              </p>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                {visibleTips.length} NEW
              </span>
            </span>
            <div className="mt-3 flex flex-col gap-2">
              {visibleTips.map((tip, i) => (
                <div
                  key={tip.id}
                  className="animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${i * 100}ms`, animationDuration: "150ms" }}
                >
                  <SmartTipCard
                    tip={tip}
                    onAction={onSmartTipAction}
                    onDismiss={handleSmartTipDismiss}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
