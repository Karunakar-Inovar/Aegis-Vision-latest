"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type {
  ChatMessage,
  IncidentDraft,
  IncidentResponse,
} from "@/services/chatbot/types";
import { IncidentConfirmCard } from "./IncidentConfirmCard";

interface IncidentCardMetadata {
  status: "confirming" | "creating" | "created" | "error";
  incident?: IncidentResponse;
  draft?: IncidentDraft;
  error?: string;
}

interface IncidentCardMessageProps {
  message: ChatMessage;
  onConfirmIncident?: (draft: IncidentDraft, notes?: string) => void;
  onCancelIncident?: () => void;
  isCreating?: boolean;
}

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function severityBadgeColor(severity: "critical" | "major" | "minor") {
  switch (severity) {
    case "critical":
      return "bg-red-100 text-red-700";
    case "major":
      return "bg-amber-100 text-amber-700";
    case "minor":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export function IncidentCardMessage({
  message,
  onConfirmIncident,
  onCancelIncident,
  isCreating = false,
}: IncidentCardMessageProps) {
  const meta = (message.metadata ?? {}) as IncidentCardMetadata;
  const isConfirming =
    meta.status === "confirming" || meta.status === "creating";

  if (isConfirming && meta.draft) {
    return (
      <div className="animate-msg-enter flex max-w-[95%] flex-col items-start">
        <IncidentConfirmCard
          draft={meta.draft}
          onConfirm={onConfirmIncident ?? (() => {})}
          onCancel={onCancelIncident ?? (() => {})}
          isCreating={isCreating}
        />
        <p className="mt-1 text-xs text-gray-400">
          {formatTimestamp(message.timestamp)}
        </p>
      </div>
    );
  }

  if (meta.status === "error") {
    return (
      <div className="animate-msg-enter flex max-w-[95%] flex-col items-start">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-800">
            Failed to log incident
          </p>
          <p className="mt-1 text-sm text-red-600">{meta.error}</p>
        </div>
      </div>
    );
  }

  const incident = meta.incident as IncidentResponse | undefined;
  const draft = meta.draft;

  if (!incident) return null;

  return (
    <div className="animate-msg-enter flex max-w-[95%] flex-col items-start">
      <div className="w-full rounded-xl border-l-4 border-green-500 bg-green-50 px-4 py-3">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="font-semibold">Incident Logged</span>
        </div>
        <div className="mt-2 font-mono text-sm font-medium text-gray-900">
          {incident.incidentId}
        </div>
        {draft && (
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-gray-700">{draft.defectType}</span>
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${severityBadgeColor(draft.severity)}`}
            >
              {draft.severity}
            </span>
          </div>
        )}
        {draft?.frameTimestamp && (
          <div className="mt-1 text-xs text-gray-500">
            Frame at {draft.frameTimestamp}
          </div>
        )}
        <Link
          href={incident.link}
          className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline"
        >
          View Incident →
        </Link>
      </div>
      <p className="mt-1 text-xs text-gray-400">
        {formatTimestamp(incident.createdAt ?? message.timestamp)}
      </p>
    </div>
  );
}
