"use client";

import { Sparkles, Search, Users, ShieldAlert, FileVideo } from "lucide-react";

interface SuggestionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}

function SuggestionCard({ icon, title, subtitle, onClick }: SuggestionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-4 text-left transition-all hover:border-indigo-200 hover:bg-indigo-50/30"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-800">{title}</p>
        <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
      </div>
    </button>
  );
}

interface ChatEmptyStateProps {
  onSuggestionClick: (prompt: string) => void;
  onUploadClick: () => void;
}

export function ChatEmptyState({
  onSuggestionClick,
  onUploadClick,
}: ChatEmptyStateProps) {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-6">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
          <Sparkles className="h-7 w-7 text-indigo-600" />
        </div>
        <h1 className="mb-2 text-center text-2xl font-semibold text-gray-800">
          What can I help you inspect?
        </h1>
        <p className="mb-0 text-center text-sm text-gray-500">
          Upload an image or video and ask me anything — from defect detection
          to counting objects, identifying hazards, or analyzing scenes.
        </p>

        <div className="mt-8 grid w-full grid-cols-2 gap-3">
        <SuggestionCard
          icon={<Search className="h-4 w-4" />}
          title="Detect defects"
          subtitle="Upload a product image for quality inspection"
          onClick={() => onSuggestionClick("Can you detect any defects in this image?")}
        />
        <SuggestionCard
          icon={<Users className="h-4 w-4" />}
          title="Count & identify"
          subtitle="How many items, people, or objects are in this image?"
          onClick={() => onSuggestionClick("How many people or objects are in this image?")}
        />
        <SuggestionCard
          icon={<ShieldAlert className="h-4 w-4" />}
          title="Safety analysis"
          subtitle="Check for PPE compliance or hazard detection"
          onClick={() => onSuggestionClick("Are there any safety hazards or PPE compliance issues?")}
        />
        <SuggestionCard
          icon={<FileVideo className="h-4 w-4" />}
          title="Video analysis"
          subtitle="Upload a clip and get frame-by-frame insights"
          onClick={onUploadClick}
        />
        </div>
      </div>
    </div>
  );
}
