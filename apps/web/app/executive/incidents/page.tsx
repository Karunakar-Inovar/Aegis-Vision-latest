"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Icon,
  Input,
  StatsCard,
} from "ui";
import {
  Search,
  ChevronDown,
  AlertTriangle,
  AlertCircle,
  Eye,
  ThumbsDown,
  Download,
  Camera,
  Globe,
  CalendarIcon,
} from "ui/utils/icons";
import { ROUTES } from "app/constants";

// ─── Severity & Status Badges ───────────────────────────────────────────────

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case "Critical":
      return (
        <span className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
          <Icon icon={AlertCircle} className="h-3 w-3" />
          Critical
        </span>
      );
    case "High":
      return (
        <span className="inline-flex items-center gap-1 rounded border border-orange-200 bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
          <Icon icon={AlertTriangle} className="h-3 w-3" />
          High
        </span>
      );
    case "Medium":
      return (
        <span className="inline-flex items-center gap-1 rounded border border-yellow-200 bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
          Medium
        </span>
      );
    case "Low":
      return (
        <span className="inline-flex items-center gap-1 rounded border border-blue-200 bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
          Low
        </span>
      );
    default:
      return null;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Active":
    case "New":
    case "In Progress":
      return (
        <span className="inline-flex items-center rounded border border-green-200 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
          {status}
        </span>
      );
    case "Resolved":
      return (
        <span className="inline-flex items-center rounded border border-gray-300 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-gray-600">
          {status}
        </span>
      );
    case "False Positive":
      return (
        <span className="inline-flex items-center gap-1 rounded border border-gray-300 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-gray-600">
          <Icon icon={ThumbsDown} className="h-3 w-3" />
          {status}
        </span>
      );
    case "Acknowledged":
      return (
        <span className="inline-flex items-center rounded border border-blue-200 bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
          {status}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600">
          {status}
        </span>
      );
  }
};

// ─── Mock Data ─────────────────────────────────────────────────────────────

const MOCK_INCIDENTS = [
  { id: 1001, type: "Temperature Threshold Exceeded", zone: "Zone F — Raw Material Storage", pipeline: "Environmental Monitoring", date: "2025-03-02T08:45:00", confidence: 94.2, severity: "Critical" as const, status: "Active" as const },
  { id: 1002, type: "PPE Violation — No Helmet", zone: "Zone C — Welding Station", pipeline: "Safety Compliance", date: "2025-03-02T07:22:00", confidence: 89.5, severity: "Critical" as const, status: "Acknowledged" as const },
  { id: 1003, type: "Surface Defect — Assembly Line 1", zone: "Zone A — Assembly Line 1", pipeline: "Quality Inspection", date: "2025-03-02T06:15:00", confidence: 87.3, severity: "High" as const, status: "In Progress" as const },
  { id: 1004, type: "Packaging Defect Spike", zone: "Zone E — Packaging Line", pipeline: "Packaging QA", date: "2025-03-01T22:30:00", confidence: 82.1, severity: "High" as const, status: "Resolved" as const },
  { id: 1005, type: "Color Deviation Detected", zone: "Zone B — Painting Bay", pipeline: "Color Match", date: "2025-03-01T18:45:00", confidence: 91.0, severity: "Medium" as const, status: "Resolved" as const },
  { id: 1006, type: "Dimension Mismatch", zone: "Zone D — Quality Check Area", pipeline: "Dimensional QA", date: "2025-03-01T14:20:00", confidence: 78.4, severity: "Medium" as const, status: "False Positive" as const },
  { id: 1007, type: "Foreign Object in Product", zone: "Zone E — Packaging Line", pipeline: "Contamination Check", date: "2025-03-01T11:00:00", confidence: 95.2, severity: "Critical" as const, status: "Active" as const },
  { id: 1008, type: "Equipment Fault — CNC Spindle", zone: "Zone G — CNC Machine Area", pipeline: "Equipment Health", date: "2025-02-28T16:30:00", confidence: 88.7, severity: "High" as const, status: "Resolved" as const },
  { id: 1009, type: "Weld Integrity Failure", zone: "Zone C — Welding Station", pipeline: "Weld Inspection", date: "2025-02-28T09:15:00", confidence: 85.3, severity: "High" as const, status: "Acknowledged" as const },
  { id: 1010, type: "Minor Scratch — Final Inspection", zone: "Zone H — Final Inspection", pipeline: "Surface Quality", date: "2025-02-27T13:45:00", confidence: 72.1, severity: "Low" as const, status: "Resolved" as const },
];

const STATUS_TABS = [
  { value: "all", label: "All Incidents" },
  { value: "Active", label: "Active" },
  { value: "Acknowledged", label: "Acknowledged" },
  { value: "In Progress", label: "In Progress" },
  { value: "Resolved", label: "Resolved" },
  { value: "New", label: "New" },
] as const;

const TIME_PRESETS = ["7D", "30D", "90D"] as const;
const ZONE_OPTIONS = ["All Zones", "Zone A", "Zone B", "Zone C", "Zone D", "Zone E", "Zone F", "Zone G", "Zone H"];
const SEVERITY_OPTIONS = ["All Severities", "Critical", "High", "Medium", "Low"];

// ─── Export Helpers ────────────────────────────────────────────────────────

function escapeCsvValue(value: string): string {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function exportIncidentsToCsv(incidents: typeof MOCK_INCIDENTS) {
  const headers = ["ID", "Type", "Zone", "Pipeline", "Date", "Confidence (%)", "Severity", "Status"];
  const rows = incidents.map((inc) => [
    inc.id,
    escapeCsvValue(inc.type),
    escapeCsvValue(inc.zone),
    escapeCsvValue(inc.pipeline),
    inc.date,
    inc.confidence.toFixed(2),
    inc.severity,
    inc.status,
  ]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `incidents-report-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function ExecutiveIncidentsPage() {
  const router = useRouter();
  const [timePreset, setTimePreset] = useState<(typeof TIME_PRESETS)[number]>("30D");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("All Zones");
  const [severityFilter, setSeverityFilter] = useState("All Severities");
  const [zoneDropdownOpen, setZoneDropdownOpen] = useState(false);
  const [severityDropdownOpen, setSeverityDropdownOpen] = useState(false);

  const filteredIncidents = useMemo(() => {
    const now = new Date();
    const daysAgo = timePreset === "7D" ? 7 : timePreset === "30D" ? 30 : 90;
    const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    return MOCK_INCIDENTS.filter((inc) => {
      const incDate = new Date(inc.date);
      const matchesTime = incDate >= cutoff;
      const matchesTab = activeTab === "all" || inc.status === activeTab;
      const matchesZone = zoneFilter === "All Zones" || inc.zone.startsWith(zoneFilter);
      const matchesSeverity = severityFilter === "All Severities" || inc.severity === severityFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        inc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.zone.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTime && matchesTab && matchesZone && matchesSeverity && matchesSearch;
    });
  }, [timePreset, activeTab, zoneFilter, severityFilter, searchQuery]);

  const criticalOpen = filteredIncidents.filter((i) => i.severity === "Critical" && (i.status === "Active" || i.status === "New" || i.status === "Acknowledged")).length;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Incidents</h1>
          <p className="mt-1 text-base text-gray-500">
            Overview of all incidents across zones
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
          <Button
            variant="outline"
            className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={() => exportIncidentsToCsv(filteredIncidents)}
          >
            <Icon icon={Download} className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* STAT CARDS — Admin design system */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Incidents"
          value={filteredIncidents.length}
          color="default"
        />
        <StatsCard
          label="Critical Open"
          value={criticalOpen}
          color="green"
        />
        <StatsCard
          label="Avg Resolution Time"
          value="2.4"
          suffix="hrs"
          color="red"
        />
        <StatsCard
          label="SLA Breach Rate"
          value="8%"
          color="orange"
        />
      </div>

      {/* FILTER ROW */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Status tabs */}
            <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 pb-2 lg:border-b-0 lg:pb-0">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.value
                      ? "border-b-2 border-gray-900 text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Right: Zone, Severity dropdowns + Search */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => {
                    setZoneDropdownOpen(!zoneDropdownOpen);
                    setSeverityDropdownOpen(false);
                  }}
                  className="flex min-w-[120px] items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  {zoneFilter}
                  <Icon icon={ChevronDown} className="h-4 w-4" />
                </button>
                {zoneDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setZoneDropdownOpen(false)} />
                    <div className="absolute left-0 top-full z-20 mt-1 min-w-[140px] rounded-lg border border-gray-200 bg-white py-1 shadow-sm">
                      {ZONE_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setZoneFilter(opt);
                            setZoneDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
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
              <div className="relative">
                <button
                  onClick={() => {
                    setSeverityDropdownOpen(!severityDropdownOpen);
                    setZoneDropdownOpen(false);
                  }}
                  className="flex min-w-[130px] items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  {severityFilter}
                  <Icon icon={ChevronDown} className="h-4 w-4" />
                </button>
                {severityDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setSeverityDropdownOpen(false)} />
                    <div className="absolute left-0 top-full z-20 mt-1 min-w-[150px] rounded-lg border border-gray-200 bg-white py-1 shadow-sm">
                      {SEVERITY_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setSeverityFilter(opt);
                            setSeverityDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                            severityFilter === opt ? "font-medium text-indigo-600" : "text-gray-700"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="relative flex-1 min-w-[200px]">
                <Icon
                  icon={Search}
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="text"
                  placeholder="Search incidents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-700 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INCIDENT LIST */}
      <div className="space-y-4">
        {filteredIncidents.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              {searchQuery || zoneFilter !== "All Zones" || severityFilter !== "All Severities"
                ? "No incidents found matching your filters"
                : "No incidents available"}
            </p>
          </div>
        ) : (
          filteredIncidents.map((incident) => (
            <div
              key={incident.id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="flex flex-col gap-4 p-4 sm:p-6 sm:flex-row sm:items-start sm:justify-between">
                {/* Left — Incident info */}
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <Icon icon={AlertTriangle} className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {incident.type}
                      </h3>
                      {getSeverityBadge(incident.severity)}
                      {getStatusBadge(incident.status)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Icon icon={Camera} className="h-4 w-4 shrink-0 text-gray-500" />
                        <span>{incident.zone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Icon icon={Globe} className="h-4 w-4 shrink-0 text-gray-500" />
                        <span>Pipeline: {incident.pipeline}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Icon icon={CalendarIcon} className="h-4 w-4 shrink-0 text-gray-500" />
                        <span>{formatDate(incident.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Confidence:</span>
                        <span className="font-semibold text-gray-900">
                          {incident.confidence.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right — View button only (no Mark False) */}
                <div className="flex shrink-0 sm:ml-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-gray-100"
                    onClick={() => router.push(ROUTES.EXECUTIVE.INCIDENT_DETAIL(incident.id))}
                  >
                    <Icon icon={Eye} className="h-4 w-4 mr-2 text-gray-600" />
                    View
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
