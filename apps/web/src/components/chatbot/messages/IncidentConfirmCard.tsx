"use client";

import { useState } from "react";
import { ClipboardList, Check } from "lucide-react";
import type { IncidentDraft } from "@/services/chatbot/types";

interface IncidentConfirmCardProps {
  draft: IncidentDraft;
  onConfirm: (draft: IncidentDraft, notes?: string) => void;
  onCancel: () => void;
  isCreating?: boolean;
}

function severityBadgeColor(severity: IncidentDraft["severity"]) {
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

function severityRadioColor(severity: IncidentDraft["severity"]) {
  switch (severity) {
    case "critical":
      return "border-red-500 bg-red-50 text-red-700";
    case "major":
      return "border-amber-500 bg-amber-50 text-amber-700";
    case "minor":
      return "border-gray-400 bg-gray-50 text-gray-700";
    default:
      return "border-gray-400 bg-gray-50 text-gray-700";
  }
}

export function IncidentConfirmCard({
  draft,
  onConfirm,
  onCancel,
  isCreating = false,
}: IncidentConfirmCardProps) {
  const [severity, setSeverity] = useState<IncidentDraft["severity"]>(
    draft.severity
  );
  const [notes, setNotes] = useState(draft.notes ?? "");

  const handleConfirm = () => {
    onConfirm({ ...draft, severity, notes: notes.trim() || undefined }, notes);
  };

  const sourceLabel =
    draft.sourceType === "chatbot-video-frame" && draft.frameTimestamp
      ? `Chatbot Video Frame at ${draft.frameTimestamp}`
      : "Chatbot Image Inspection";

  return (
    <div className="max-w-[90%] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 rounded-t-xl bg-gray-50 px-4 py-2.5">
        <ClipboardList className="h-5 w-5 text-gray-600" />
        <span className="font-semibold text-gray-900">Log Incident</span>
        {draft.sourceType === "chatbot-video-frame" && draft.frameTimestamp && (
          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
            Frame at {draft.frameTimestamp}
          </span>
        )}
      </div>

      <div className="space-y-4 px-4 py-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500">
            Defect Type
          </label>
          <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${severityBadgeColor(severity)}`}
          >
            {draft.defectType}
          </span>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-gray-500">
            Severity
          </label>
          <div className="flex gap-2">
            {(["critical", "major", "minor"] as const).map((s) => (
              <label
                key={s}
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors ${
                  severity === s
                    ? severityRadioColor(s)
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="severity"
                  value={s}
                  checked={severity === s}
                  onChange={() => setSeverity(s)}
                  className="sr-only"
                />
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500">
            Source
          </label>
          <p className="text-sm text-gray-700">{sourceLabel}</p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500">
            Notes
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add optional notes..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            disabled={isCreating}
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isCreating}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isCreating}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-70"
        >
          {isCreating ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Logging...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Confirm & Log
            </>
          )}
        </button>
      </div>
    </div>
  );
}
