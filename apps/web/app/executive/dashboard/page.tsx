"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  Icon,
  StatsCard,
} from "ui";
import {
  ChevronDown,
  Camera,
  AlertTriangle,
  Clock,
} from "ui/utils/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
} from "recharts";

// ─── Mock Data ─────────────────────────────────────────────────────────────

const ZONES = [
  { id: "A", name: "Assembly Line 1", status: "healthy" as const, cameras: 4, alerts: 0, lastIncident: "—", healthScore: 98, topIssue: null as string | null },
  { id: "B", name: "Painting Bay", status: "healthy" as const, cameras: 3, alerts: 1, lastIncident: "—", healthScore: 95, topIssue: null },
  { id: "C", name: "Welding Station", status: "warning" as const, cameras: 6, alerts: 3, lastIncident: "2h ago", healthScore: 72, topIssue: "PPE violation detected" },
  { id: "D", name: "Quality Check Area", status: "healthy" as const, cameras: 2, alerts: 0, lastIncident: "—", healthScore: 96, topIssue: null },
  { id: "E", name: "Packaging Line", status: "healthy" as const, cameras: 5, alerts: 2, lastIncident: "5h ago", healthScore: 88, topIssue: null },
  { id: "F", name: "Raw Material Storage", status: "critical" as const, cameras: 2, alerts: 5, lastIncident: "45m ago", healthScore: 54, topIssue: "Temperature threshold exceeded" },
  { id: "G", name: "CNC Machine Area", status: "healthy" as const, cameras: 4, alerts: 1, lastIncident: "—", healthScore: 94, topIssue: null },
  { id: "H", name: "Final Inspection", status: "healthy" as const, cameras: 3, alerts: 0, lastIncident: "—", healthScore: 97, topIssue: null },
];

const HEALTH_TREND_DATA = [
  { label: "Mon", health: 92 },
  { label: "Tue", health: 88 },
  { label: "Wed", health: 91 },
  { label: "Thu", health: 85 },
  { label: "Fri", health: 87 },
  { label: "Sat", health: 94 },
  { label: "Sun", health: 96 },
  { label: "Mon", health: 89 },
  { label: "Tue", health: 91 },
  { label: "Wed", health: 88 },
  { label: "Thu", health: 90 },
  { label: "Fri", health: 86 },
];

const RECENT_INCIDENTS = [
  { id: 1, time: "45m ago", zone: "Zone F — Raw Material Storage", type: "Temperature Alert", severity: "Critical" as const },
  { id: 2, time: "2h ago", zone: "Zone C — Welding Station", type: "PPE Violation", severity: "Critical" as const },
  { id: 3, time: "5h ago", zone: "Zone E — Packaging Line", type: "Defect Spike", severity: "High" as const },
  { id: 4, time: "Yesterday", zone: "Zone B — Painting Bay", type: "Equipment Fault", severity: "Medium" as const },
  { id: 5, time: "Yesterday", zone: "Zone F — Raw Material Storage", type: "Intrusion Alert", severity: "Critical" as const },
];

const TIME_RANGE_OPTIONS = ["Today", "7D", "30D", "90D"] as const;

// ─── Component ─────────────────────────────────────────────────────────────

export default function ExecutiveDashboardPage() {
  const [timeRange, setTimeRange] = useState<(typeof TIME_RANGE_OPTIONS)[number]>("7D");
  const [timeRangeOpen, setTimeRangeOpen] = useState(false);

  const worstZone = ZONES.reduce((a, b) =>
    (a?.healthScore ?? 100) < (b?.healthScore ?? 100) ? a : b
  );

  const zonesAtRisk = ZONES.filter((z) => z.status === "warning" || z.status === "critical");

  const statusDot = (status: "healthy" | "warning" | "critical") => {
    const colors = {
      healthy: "bg-green-500",
      warning: "bg-orange-400",
      critical: "bg-red-500",
    };
    return (
      <span
        className={`inline-block h-3 w-3 shrink-0 rounded-full ${colors[status]}`}
      />
    );
  };

  const getSeverityBadge = (severity: string) => {
    if (severity === "Critical") {
      return (
        <span className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
          Critical
        </span>
      );
    }
    if (severity === "High") {
      return (
        <span className="inline-flex items-center gap-1 rounded border border-orange-200 bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
          High
        </span>
      );
    }
    if (severity === "Medium") {
      return (
        <span className="inline-flex items-center gap-1 rounded border border-yellow-200 bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
          Medium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded border border-blue-200 bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
        {severity}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER ROW */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Executive Dashboard
          </h1>
          <p className="mt-1 text-base text-gray-500">
            Real-time plant health overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <div className="relative">
            <button
              onClick={() => setTimeRangeOpen(!timeRangeOpen)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              {timeRange}
              <Icon icon={ChevronDown} className="h-4 w-4" />
            </button>
            {timeRangeOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setTimeRangeOpen(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-1 w-32 rounded-lg border border-gray-200 bg-white py-1 shadow-sm">
                  {TIME_RANGE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setTimeRange(opt);
                        setTimeRangeOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                        timeRange === opt
                          ? "font-medium text-indigo-600"
                          : "text-gray-700"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ROW 1 — KPI Cards (Admin design system: StatsCard) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="System Availability"
          value="99.2%"
          color="default"
        />
        <StatsCard
          label="Critical Incidents"
          value="3"
          color="green"
        />
        <StatsCard
          label="Alert Rate"
          value="12"
          suffix="/hr"
          color="red"
        />
        <StatsCard
          label="Zones at Risk"
          value={`${zonesAtRisk.length} of ${ZONES.length}`}
          color="orange"
        />
      </div>

      {/* ROW 2 — Two column layout: Zone Health (60%) | Health Trend + Worst Zone (40%) */}
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        {/* LEFT — Zone Health Status */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Zone Health Status
            </h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {ZONES.map((zone) => (
                <div
                  key={zone.id}
                  className={`rounded-lg border bg-white p-4 transition-shadow hover:shadow-sm ${
                    zone.status === "critical"
                      ? "border-gray-200 border-l-4 border-l-red-400"
                      : zone.status === "warning"
                        ? "border-gray-200 border-l-4 border-l-orange-400"
                        : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900">
                        Zone {zone.id} — {zone.name}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Icon icon={Camera} className="h-4 w-4" />
                          {zone.cameras} cameras
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon icon={AlertTriangle} className="h-4 w-4" />
                          {zone.alerts} alerts
                        </span>
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                        <Icon icon={Clock} className="h-3.5 w-3.5" />
                        Last incident: {zone.lastIncident}
                      </p>
                    </div>
                    {statusDot(zone.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Overall Health Trend + Worst Performing Zone */}
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Overall Health Trend
              </h2>
            </div>
            <div className="p-4">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={HEALTH_TREND_DATA}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E5E7EB"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      stroke="#6B7280"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      stroke="#6B7280"
                      fontSize={11}
                      tickLine={false}
                      ticks={[0, 25, 50, 75, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [`${value}`, "Health Index"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="health"
                      stroke="#4F46E5"
                      strokeWidth={2}
                      dot={{ fill: "#4F46E5", r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Worst Performing Zone callout */}
          <div className="rounded-lg border border-red-100 bg-red-50 p-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Worst Performing Zone
            </h3>
            <div className="mt-3 flex items-start gap-3">
              {statusDot(worstZone.status)}
              <div>
                <p className="font-medium text-gray-900">
                  Zone {worstZone.id} — {worstZone.name}
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {worstZone.healthScore}
                  <span className="ml-1 text-sm font-normal text-gray-500">
                    / 100
                  </span>
                </p>
                {worstZone.topIssue && (
                  <p className="mt-2 text-sm text-gray-600">
                    {worstZone.topIssue}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3 — Recent Critical Incidents (list style, not table) */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Critical Incidents
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {RECENT_INCIDENTS.map((inc) => (
            <div
              key={inc.id}
              className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-4">
                {/* Warning triangle in gray circle */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <Icon icon={AlertTriangle} className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {inc.type}
                    </span>
                    {getSeverityBadge(inc.severity)}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{inc.zone}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:shrink-0">
                <span className="text-sm text-gray-500">{inc.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
