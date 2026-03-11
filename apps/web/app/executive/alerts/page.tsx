"use client";

import { useState } from "react";
import { Card, CardContent, Icon, StatsCard } from "ui";
import { ChevronDown, AlertTriangle, Camera, Clock } from "ui/utils/icons";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ─── Mock Data ─────────────────────────────────────────────────────────────

const TIME_PRESETS = ["7D", "30D", "90D"] as const;
const ZONE_OPTIONS = ["All Zones", "Zone A", "Zone B", "Zone C", "Zone D", "Zone E", "Zone F", "Zone G", "Zone H"];

const ALERT_RATE_TREND_DATA = [
  { date: "Feb 24", critical: 8, high: 14, medium: 22, low: 12 },
  { date: "Feb 25", critical: 6, high: 18, medium: 28, low: 16 },
  { date: "Feb 26", critical: 12, high: 22, medium: 24, low: 14 },
  { date: "Feb 27", critical: 5, high: 16, medium: 30, low: 18 },
  { date: "Feb 28", critical: 9, high: 20, medium: 26, low: 10 },
  { date: "Mar 1", critical: 7, high: 15, medium: 32, low: 20 },
  { date: "Mar 2", critical: 11, high: 19, medium: 28, low: 14 },
];

const ZONES_BY_ALERT_VOLUME = [
  { zone: "Zone F — Raw Material Storage", count: 312, maxCount: 312 },
  { zone: "Zone C — Welding Station", count: 248, maxCount: 312 },
  { zone: "Zone E — Packaging Line", count: 198, maxCount: 312 },
  { zone: "Zone A — Assembly Line 1", count: 156, maxCount: 312 },
  { zone: "Zone B — Painting Bay", count: 124, maxCount: 312 },
  { zone: "Zone G — CNC Machine Area", count: 98, maxCount: 312 },
  { zone: "Zone D — Quality Check Area", count: 67, maxCount: 312 },
  { zone: "Zone H — Final Inspection", count: 44, maxCount: 312 },
];

const ALERT_TYPES_DATA = [
  { name: "Surface Defect", value: 28, color: "#4F46E5" },
  { name: "Weld Issue", value: 22, color: "#FB923C" },
  { name: "Dimension Error", value: 18, color: "#EF4444" },
  { name: "Color Deviation", value: 14, color: "#10B981" },
  { name: "Foreign Object", value: 10, color: "#EAB308" },
  { name: "Other", value: 8, color: "#9CA3AF" },
];

const RECENT_CRITICAL_ALERTS = [
  { id: 1, title: "Temperature Threshold Exceeded", zone: "Zone F — Raw Material Storage", timeAgo: "12m ago", confidence: 94.2, status: "UNACKNOWLEDGED" as const },
  { id: 2, title: "PPE Violation — No Helmet", zone: "Zone C — Welding Station", timeAgo: "28m ago", confidence: 89.5, status: "ACKNOWLEDGED" as const },
  { id: 3, title: "Foreign Object in Product", zone: "Zone E — Packaging Line", timeAgo: "1h ago", confidence: 95.2, status: "UNACKNOWLEDGED" as const },
  { id: 4, title: "Weld Integrity Failure", zone: "Zone C — Welding Station", timeAgo: "2h ago", confidence: 85.3, status: "RESOLVED" as const },
  { id: 5, title: "Surface Defect — Assembly Line 1", zone: "Zone A — Assembly Line 1", timeAgo: "3h ago", confidence: 87.3, status: "RESOLVED" as const },
  { id: 6, title: "Packaging Defect Spike", zone: "Zone E — Packaging Line", timeAgo: "4h ago", confidence: 82.1, status: "RESOLVED" as const },
  { id: 7, title: "Equipment Fault — CNC Spindle", zone: "Zone G — CNC Machine Area", timeAgo: "5h ago", confidence: 88.7, status: "RESOLVED" as const },
  { id: 8, title: "Color Deviation Detected", zone: "Zone B — Painting Bay", timeAgo: "6h ago", confidence: 91.0, status: "RESOLVED" as const },
  { id: 9, title: "Temperature Spike — Zone F", zone: "Zone F — Raw Material Storage", timeAgo: "8h ago", confidence: 92.4, status: "RESOLVED" as const },
  { id: 10, title: "Dimension Mismatch", zone: "Zone D — Quality Check Area", timeAgo: "10h ago", confidence: 78.4, status: "RESOLVED" as const },
];

// ─── Component ─────────────────────────────────────────────────────────────

export default function ExecutiveAlertsPage() {
  const [timePreset, setTimePreset] = useState<(typeof TIME_PRESETS)[number]>("30D");
  const [zoneFilter, setZoneFilter] = useState("All Zones");
  const [zoneDropdownOpen, setZoneDropdownOpen] = useState(false);

  const totalAlerts = 1247;
  const criticalAlerts = 23;
  const alertRate = "8.2/hr";
  const alertNoiseRatio = 34;

  const getStatusBadge = (status: string) => {
    if (status === "UNACKNOWLEDGED") {
      return (
        <span className="inline-flex rounded-full bg-red-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          Unacknowledged
        </span>
      );
    }
    if (status === "RESOLVED") {
      return (
        <span className="inline-flex rounded border border-gray-300 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-gray-600">
          Resolved
        </span>
      );
    }
    return (
      <span className="inline-flex rounded border border-blue-200 bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
        Acknowledged
      </span>
    );
  };

  const totalPie = ALERT_TYPES_DATA.reduce((s, d) => s + d.value, 0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FB" }}>
      <div className="space-y-6 p-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
            <p className="mt-1 text-base text-gray-500">
              Alert patterns and noise analysis
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Time range pills */}
            <div className="flex items-center gap-2">
              {TIME_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setTimePreset(preset)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    timePreset === preset
                      ? "bg-indigo-600 text-white"
                      : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            {/* Zone dropdown */}
            <div className="relative">
              <button
                onClick={() => setZoneDropdownOpen(!zoneDropdownOpen)}
                className="flex min-w-[140px] items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                {zoneFilter}
                <Icon icon={ChevronDown} className="h-4 w-4 shrink-0" />
              </button>
              {zoneDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setZoneDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-20 mt-1 min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 shadow-sm">
                    {ZONE_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setZoneFilter(opt);
                          setZoneDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                          zoneFilter === opt
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

        {/* STAT CARDS — Admin design system */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            label="Total Alerts"
            value={totalAlerts.toLocaleString()}
            color="default"
          />
          <StatsCard
            label="Critical Alerts"
            value={criticalAlerts}
            color="green"
          />
          <StatsCard
            label="Alert Rate"
            value={alertRate}
            color="red"
          />
          <StatsCard
            label="Alert Noise Ratio"
            value={`${alertNoiseRatio}%`}
            color={alertNoiseRatio > 30 ? "orange" : "green"}
          />
        </div>

        {/* Alert Rate Trend — Area chart */}
        <Card className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Alert Rate Trend
            </h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ALERT_RATE_TREND_DATA}>
                  <defs>
                    <linearGradient id="exec-critical" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F87171" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#F87171" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="exec-high" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FB923C" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#FB923C" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="exec-medium" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FACC15" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#FACC15" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="exec-low" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="date" stroke="#6B7280" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6B7280" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Area type="monotone" dataKey="critical" stackId="1" stroke="#F87171" fill="url(#exec-critical)" name="Critical" />
                  <Area type="monotone" dataKey="high" stackId="1" stroke="#FB923C" fill="url(#exec-high)" name="High" />
                  <Area type="monotone" dataKey="medium" stackId="1" stroke="#EAB308" fill="url(#exec-medium)" name="Medium" />
                  <Area type="monotone" dataKey="low" stackId="1" stroke="#60A5FA" fill="url(#exec-low)" name="Low" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Two columns: Zones by Alert Volume | Alert Types */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* LEFT — Zones by Alert Volume */}
          <Card className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Zones by Alert Volume
              </h2>
              <div className="space-y-4">
                {ZONES_BY_ALERT_VOLUME.map((row, idx) => (
                  <div
                    key={row.zone}
                    className={`flex items-center gap-4 ${
                      idx < 3 ? "rounded-lg bg-indigo-50/50 p-2" : ""
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {row.zone}
                      </p>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-indigo-100">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{
                            width: `${(row.count / row.maxCount) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-gray-900">
                      {row.count}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* RIGHT — Alert Types (Donut) */}
          <Card className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Alert Types
              </h2>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                <div className="h-56 w-56 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ALERT_TYPES_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={56}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {ALERT_TYPES_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [
                          `${((value / totalPie) * 100).toFixed(1)}%`,
                          "",
                        ]}
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #E5E7EB",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-1 flex-wrap gap-x-4 gap-y-2">
                  {ALERT_TYPES_DATA.map((entry) => (
                    <div
                      key={entry.name}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-gray-700">{entry.name}</span>
                      <span className="text-gray-500">
                        {((entry.value / totalPie) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Critical Alerts — read-only list, NO action buttons */}
        <Card className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-0">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Critical Alerts
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {RECENT_CRITICAL_ALERTS.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-4 px-6 py-4"
                >
                  {/* Yellow/orange warning triangle in circle */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-100">
                    <Icon
                      icon={AlertTriangle}
                      className="h-5 w-5 text-yellow-600"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {alert.title}
                      </h3>
                      {getStatusBadge(alert.status)}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Icon icon={Camera} className="h-4 w-4" />
                        {alert.zone}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icon icon={Clock} className="h-4 w-4" />
                        {alert.timeAgo}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icon icon={AlertTriangle} className="h-4 w-4" />
                        Confidence: {alert.confidence}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
