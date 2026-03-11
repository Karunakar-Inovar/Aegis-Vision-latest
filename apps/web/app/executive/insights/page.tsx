"use client";

import { useState } from "react";
import { Icon } from "ui";
import {
  ChevronDown,
  ArrowUp,
  ArrowDown,
} from "ui/utils/icons";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// ─── Mock Data ─────────────────────────────────────────────────────────────

const ZONE_COLORS = ["#4F46E5", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6"];

const ZONE_HEALTH_TRENDS = [
  { date: "W1", zoneA: 96, zoneC: 78, zoneE: 88, zoneF: 62, zoneH: 94 },
  { date: "W2", zoneA: 94, zoneC: 75, zoneE: 86, zoneF: 58, zoneH: 95 },
  { date: "W3", zoneA: 95, zoneC: 72, zoneE: 84, zoneF: 54, zoneH: 96 },
  { date: "W4", zoneA: 97, zoneC: 70, zoneE: 82, zoneF: 52, zoneH: 97 },
  { date: "W5", zoneA: 96, zoneC: 68, zoneE: 80, zoneF: 50, zoneH: 96 },
  { date: "W6", zoneA: 98, zoneC: 72, zoneE: 85, zoneF: 55, zoneH: 97 },
];

const ALERT_VOLUME_DATA = [
  { date: "Oct 1", critical: 4, high: 8, medium: 12, low: 6 },
  { date: "Oct 8", critical: 6, high: 10, medium: 14, low: 8 },
  { date: "Oct 15", critical: 3, high: 7, medium: 11, low: 5 },
  { date: "Oct 22", critical: 5, high: 9, medium: 13, low: 7 },
  { date: "Oct 29", critical: 7, high: 11, medium: 15, low: 9 },
];

const INCIDENTS_BY_SEVERITY = [
  { week: "W1", critical: 2, high: 4, medium: 6, low: 3 },
  { week: "W2", critical: 3, high: 5, medium: 5, low: 2 },
  { week: "W3", critical: 4, high: 6, medium: 7, low: 4 },
  { week: "W4", critical: 2, high: 4, medium: 8, low: 3 },
  { week: "W5", critical: 5, high: 7, medium: 6, low: 2 },
];

const HIGH_IMPACT_USE_CASES = [
  { name: "Surface Scratch Detection", incidents: 24, avgResolution: "2.3h", impact: 92 },
  { name: "Weld Integrity Check", incidents: 18, avgResolution: "1.8h", impact: 85 },
  { name: "Color Deviation", incidents: 14, avgResolution: "3.1h", impact: 78 },
  { name: "Dimension Mismatch", incidents: 11, avgResolution: "2.5h", impact: 72 },
  { name: "Foreign Object Detection", incidents: 9, avgResolution: "1.2h", impact: 65 },
];

const ZONE_PERFORMANCE = [
  { zone: "Zone H — Final Inspection", healthScore: 97, alerts: 0, incidents: 2, avgResolution: "1.2h" },
  { zone: "Zone A — Assembly Line 1", healthScore: 96, alerts: 0, incidents: 3, avgResolution: "1.5h" },
  { zone: "Zone D — Quality Check Area", healthScore: 96, alerts: 0, incidents: 1, avgResolution: "0.8h" },
  { zone: "Zone G — CNC Machine Area", healthScore: 94, alerts: 1, incidents: 4, avgResolution: "2.1h" },
  { zone: "Zone B — Painting Bay", healthScore: 95, alerts: 1, incidents: 2, avgResolution: "1.4h" },
  { zone: "Zone E — Packaging Line", healthScore: 88, alerts: 2, incidents: 6, avgResolution: "2.8h" },
  { zone: "Zone C — Welding Station", healthScore: 72, alerts: 3, incidents: 8, avgResolution: "3.2h" },
  { zone: "Zone F — Raw Material Storage", healthScore: 54, alerts: 5, incidents: 12, avgResolution: "4.1h" },
];

const RECURRING_ISSUES = [
  { issueType: "Temperature Threshold Exceeded", zone: "Zone F", occurrences: 18, trend: "up" as const, lastSeen: "45m ago", avgImpact: "High" },
  { issueType: "PPE Violation", zone: "Zone C", occurrences: 14, trend: "up" as const, lastSeen: "2h ago", avgImpact: "Medium" },
  { issueType: "Packaging Defect Spike", zone: "Zone E", occurrences: 11, trend: "down" as const, lastSeen: "5h ago", avgImpact: "Medium" },
  { issueType: "Surface Scratch", zone: "Zone A", occurrences: 9, trend: "down" as const, lastSeen: "1d ago", avgImpact: "Low" },
  { issueType: "Color Deviation", zone: "Zone B", occurrences: 7, trend: "up" as const, lastSeen: "2d ago", avgImpact: "Medium" },
  { issueType: "Dimension Out of Spec", zone: "Zone D", occurrences: 5, trend: "down" as const, lastSeen: "3d ago", avgImpact: "Low" },
];

const TIME_PRESETS = ["7D", "30D", "90D"] as const;
const ZONE_OPTIONS = ["All Zones", "Zone A", "Zone B", "Zone C", "Zone D", "Zone E", "Zone F", "Zone G", "Zone H"];

// ─── Component ─────────────────────────────────────────────────────────────

export default function ExecutiveInsightsPage() {
  const [timePreset, setTimePreset] = useState<(typeof TIME_PRESETS)[number]>("30D");
  const [zoneFilter, setZoneFilter] = useState("All Zones");
  const [zoneDropdownOpen, setZoneDropdownOpen] = useState(false);

  const maxImpact = Math.max(...HIGH_IMPACT_USE_CASES.map((u) => u.impact));

  const bestZone = ZONE_PERFORMANCE[0];
  const worstZone = ZONE_PERFORMANCE[ZONE_PERFORMANCE.length - 1];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Insights</h1>
          <p className="mt-1 text-base text-gray-500">
            Trends, patterns, and performance analysis
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Time preset pills */}
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
                        zoneFilter === opt ? "font-medium text-indigo-600" : "text-gray-700"
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

      {/* SECTION 1 — Zone Health Trends */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Zone Health Trends
          </h2>
        </div>
        <div className="p-4">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ZONE_HEALTH_TRENDS}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#6B7280" fontSize={11} tickLine={false} ticks={[0, 25, 50, 75, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number, name: string) => {
                    const zoneMap: Record<string, string> = {
                      zoneA: "Zone A",
                      zoneC: "Zone C",
                      zoneE: "Zone E",
                      zoneF: "Zone F",
                      zoneH: "Zone H",
                    };
                    return [`${value}`, zoneMap[name] || name];
                  }}
                  labelFormatter={(label) => `Week ${label}`}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "16px" }}
                  formatter={(value) => {
                    const zoneMap: Record<string, string> = {
                      zoneA: "Zone A — Assembly Line 1",
                      zoneC: "Zone C — Welding Station",
                      zoneE: "Zone E — Packaging Line",
                      zoneF: "Zone F — Raw Material Storage",
                      zoneH: "Zone H — Final Inspection",
                    };
                    return zoneMap[value] || value;
                  }}
                />
                <Line type="monotone" dataKey="zoneA" stroke={ZONE_COLORS[0]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} name="zoneA" />
                <Line type="monotone" dataKey="zoneC" stroke={ZONE_COLORS[1]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} name="zoneC" />
                <Line type="monotone" dataKey="zoneE" stroke={ZONE_COLORS[2]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} name="zoneE" />
                <Line type="monotone" dataKey="zoneF" stroke={ZONE_COLORS[3]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} name="zoneF" />
                <Line type="monotone" dataKey="zoneH" stroke={ZONE_COLORS[4]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} name="zoneH" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 2 — Two columns: Alert Volume | Incidents by Severity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Alert Volume by Severity */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Alert Volume by Severity
            </h2>
          </div>
          <div className="p-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ALERT_VOLUME_DATA}>
                  <defs>
                    <linearGradient id="critical" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F87171" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#F87171" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="high" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FB923C" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#FB923C" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="medium" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FACC15" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#FACC15" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="low" x1="0" y1="0" x2="0" y2="1">
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
                  <Area type="monotone" dataKey="critical" stackId="1" stroke="#EF4444" fill="url(#critical)" name="Critical" />
                  <Area type="monotone" dataKey="high" stackId="1" stroke="#FB923C" fill="url(#high)" name="High" />
                  <Area type="monotone" dataKey="medium" stackId="1" stroke="#EAB308" fill="url(#medium)" name="Medium" />
                  <Area type="monotone" dataKey="low" stackId="1" stroke="#3B82F6" fill="url(#low)" name="Low" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Incidents by Severity */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Incidents by Severity
            </h2>
          </div>
          <div className="p-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={INCIDENTS_BY_SEVERITY} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="week" stroke="#6B7280" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6B7280" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="critical" fill="#EF4444" name="Critical" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="high" fill="#FB923C" name="High" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="medium" fill="#EAB308" name="Medium" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="low" fill="#3B82F6" name="Low" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3 — Two columns: Highest Impact Use Cases | Zone Performance Comparison */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Highest Impact Use Cases */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Highest Impact Use Cases
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {HIGH_IMPACT_USE_CASES.map((uc, idx) => (
                <div key={uc.name} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900">{uc.name}</p>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${(uc.impact / maxImpact) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-sm">
                    <span className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 font-medium text-gray-700">
                      {uc.incidents} incidents
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Zone Performance Comparison */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Zone Performance Comparison
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Zone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Health Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Alerts
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Incidents
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Avg Resolution
                  </th>
                </tr>
              </thead>
              <tbody>
                {ZONE_PERFORMANCE.map((row) => (
                  <tr
                    key={row.zone}
                    className={`border-b border-gray-100 py-4 ${
                      row.zone === bestZone?.zone ? "bg-green-50" : row.zone === worstZone?.zone ? "bg-red-50" : ""
                    }`}
                  >
                    <td className="px-4 py-4 font-medium text-gray-900">{row.zone}</td>
                    <td className="px-4 py-4 text-gray-600">{row.healthScore}</td>
                    <td className="px-4 py-4 text-gray-600">{row.alerts}</td>
                    <td className="px-4 py-4 text-gray-600">{row.incidents}</td>
                    <td className="px-4 py-4 text-gray-600">{row.avgResolution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 4 — Recurring Issues by Use Case */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Recurring Issues by Use Case
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Issue Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Zone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Occurrences (30D)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Trend
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Last Seen
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Avg Impact
                </th>
              </tr>
            </thead>
            <tbody>
              {RECURRING_ISSUES.map((row) => (
                <tr key={row.issueType} className="border-b border-gray-100">
                  <td className="px-4 py-4 font-medium text-gray-900">{row.issueType}</td>
                  <td className="px-4 py-4 text-gray-600">{row.zone}</td>
                  <td className="px-4 py-4 text-gray-600">{row.occurrences}</td>
                  <td className="px-4 py-4">
                    {row.trend === "up" ? (
                      <span className="inline-flex items-center gap-1 text-red-600">
                        <Icon icon={ArrowUp} className="h-4 w-4" />
                        Up
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <Icon icon={ArrowDown} className="h-4 w-4" />
                        Down
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-gray-600">{row.lastSeen}</td>
                  <td className="px-4 py-4 text-gray-600">{row.avgImpact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
