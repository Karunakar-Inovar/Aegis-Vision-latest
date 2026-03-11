"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  Button,
  Icon,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  ToggleSwitch,
} from "ui";
import {
  Activity,
  Grid,
  AlertTriangle,
  Clock,
  Download,
  Trash2,
} from "ui/utils/icons";

// ─── Types ─────────────────────────────────────────────────────────────────

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: typeof Activity;
  iconBgClass: string;
  iconColorClass: string;
}

interface GeneratedReport {
  id: string;
  reportName: string;
  type: string;
  dateGenerated: string;
  timeRange: string;
  format: "PDF" | "Excel";
  status: "Ready" | "Generating...";
}

// ─── Templates ─────────────────────────────────────────────────────────────

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: "weekly-health",
    name: "Weekly Health Report",
    description: "Comprehensive overview of plant health, zone status, and key metrics for the selected period.",
    icon: Activity,
    iconBgClass: "bg-green-100",
    iconColorClass: "text-green-600",
  },
  {
    id: "zone-performance",
    name: "Zone Performance Report",
    description: "Detailed performance metrics by zone including alerts, incidents, and resolution times.",
    icon: Grid,
    iconBgClass: "bg-indigo-100",
    iconColorClass: "text-indigo-600",
  },
  {
    id: "incident-summary",
    name: "Incident Summary Report",
    description: "Summary of all incidents with severity breakdown, root causes, and resolution outcomes.",
    icon: AlertTriangle,
    iconBgClass: "bg-orange-100",
    iconColorClass: "text-orange-600",
  },
  {
    id: "downtime-impact",
    name: "Downtime & Impact Report",
    description: "Analysis of production downtime, equipment faults, and business impact metrics.",
    icon: Clock,
    iconBgClass: "bg-red-100",
    iconColorClass: "text-red-600",
  },
];

// ─── Mock Generated Reports ───────────────────────────────────────────────

const INITIAL_REPORTS: GeneratedReport[] = [
  { id: "r1", reportName: "Weekly Health Report — Mar 2", type: "Weekly Health", dateGenerated: "Mar 2, 2026", timeRange: "7D", format: "PDF", status: "Ready" },
  { id: "r2", reportName: "Zone Performance — Feb 28", type: "Zone Performance", dateGenerated: "Feb 28, 2026", timeRange: "30D", format: "Excel", status: "Ready" },
  { id: "r3", reportName: "Incident Summary — Feb 25", type: "Incident Summary", dateGenerated: "Feb 25, 2026", timeRange: "90D", format: "PDF", status: "Ready" },
  { id: "r4", reportName: "Downtime & Impact — Feb 20", type: "Downtime & Impact", dateGenerated: "Feb 20, 2026", timeRange: "30D", format: "Excel", status: "Ready" },
  { id: "r5", reportName: "Weekly Health Report — Feb 18", type: "Weekly Health", dateGenerated: "Feb 18, 2026", timeRange: "7D", format: "PDF", status: "Ready" },
  { id: "r6", reportName: "Incident Summary — Feb 15", type: "Incident Summary", dateGenerated: "Feb 15, 2026", timeRange: "30D", format: "PDF", status: "Ready" },
];

// ─── Component ─────────────────────────────────────────────────────────────

export default function ExecutiveReportsPage() {
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>(INITIAL_REPORTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "90D">("30D");
  const [format, setFormat] = useState<"PDF" | "Excel">("PDF");
  const [subscriptionOn, setSubscriptionOn] = useState(true);

  const handleGenerateClick = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setTimeRange("30D");
    setFormat("PDF");
    setModalOpen(true);
  };

  const handleGenerateSubmit = () => {
    if (!selectedTemplate) return;

    const newReport: GeneratedReport = {
      id: `r-${Date.now()}`,
      reportName: `${selectedTemplate.name} — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
      type: selectedTemplate.name,
      dateGenerated: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      timeRange,
      format,
      status: "Generating...",
    };

    setGeneratedReports((prev) => [newReport, ...prev]);
    setModalOpen(false);
    setSelectedTemplate(null);

    setTimeout(() => {
      setGeneratedReports((prev) =>
        prev.map((r) =>
          r.id === newReport.id ? { ...r, status: "Ready" as const } : r
        )
      );
    }, 2000);
  };

  const handleDownload = (report: GeneratedReport) => {
    if (report.status !== "Ready") return;
    // Simulate download - in real app would trigger file download
    console.log("Download", report);
  };

  const handleDelete = (id: string) => {
    setGeneratedReports((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FB" }}>
      <div className="space-y-8 p-6">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="mt-1 text-base text-gray-500">
            Generate and download plant performance reports
          </p>
        </div>

        {/* SECTION 1 — Report Templates (no card wrapper) */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Report Templates
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {REPORT_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className={`mb-4 flex h-10 w-10 items-center justify-center rounded-full ${template.iconBgClass}`}
                >
                  <Icon
                    icon={template.icon}
                    className={`h-5 w-5 ${template.iconColorClass}`}
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {template.name}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {template.description}
                </p>
                <Button
                  className="mt-6 w-full"
                  onPress={() => handleGenerateClick(template)}
                >
                  Generate Report
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2 — Generated Reports */}
        <Card className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Generated Reports
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Report Name
                    </th>
                    <th className="py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Type
                    </th>
                    <th className="py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Date Generated
                    </th>
                    <th className="py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Time Range
                    </th>
                    <th className="py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Format
                    </th>
                    <th className="py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {generatedReports.map((report) => (
                    <tr
                      key={report.id}
                      className="border-b border-gray-100 py-4"
                    >
                      <td className="py-4 font-medium text-gray-900">
                        {report.reportName}
                      </td>
                      <td className="py-4 text-gray-600">{report.type}</td>
                      <td className="py-4 text-gray-600">
                        {report.dateGenerated}
                      </td>
                      <td className="py-4 text-gray-600">{report.timeRange}</td>
                      <td className="py-4">
                        <span className="inline-flex rounded-full border border-gray-300 px-2 py-0.5 text-xs font-medium text-gray-600">
                          {report.format}
                        </span>
                      </td>
                      <td className="py-4">
                        {report.status === "Ready" ? (
                          <span className="inline-flex rounded border border-green-200 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            Ready
                          </span>
                        ) : (
                          <span className="inline-flex animate-pulse rounded border border-orange-200 bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                            Generating...
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {report.status === "Ready" && (
                            <button
                              onClick={() => handleDownload(report)}
                              className="rounded-lg p-2 text-indigo-600 transition-colors hover:bg-indigo-50"
                              title="Download"
                            >
                              <Icon icon={Download} className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(report.id)}
                            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <Icon icon={Trash2} className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 3 — Weekly Report Subscription */}
        <Card className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-gray-900">
                  Weekly Report Subscription
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Receive an automated Weekly Health Report every Monday at 8:00
                  AM
                </p>
                {subscriptionOn && (
                  <div className="mt-2 space-y-0.5">
                    <p className="text-sm text-gray-500">
                      Next delivery: Monday, March 9, 2026 at 8:00 AM
                    </p>
                    <p className="text-sm text-gray-400">
                      karunakar@aegisvision.com
                    </p>
                  </div>
                )}
              </div>
              <div className="shrink-0">
                <ToggleSwitch
                  checked={subscriptionOn}
                  onCheckedChange={setSubscriptionOn}
                  size="md"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generate Report Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Generate {selectedTemplate?.name ?? "Report"}
            </DialogTitle>
            <DialogDescription>
              Configure report parameters
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">
                Time Range
              </p>
              <div className="flex gap-2">
                {(["7D", "30D", "90D"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setTimeRange(opt)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                      timeRange === opt
                        ? "bg-indigo-600 text-white"
                        : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Format</p>
              <div className="flex gap-2">
                {(["PDF", "Excel"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setFormat(opt)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      format === opt
                        ? "bg-indigo-600 text-white"
                        : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onPress={() => {
                setModalOpen(false);
                setSelectedTemplate(null);
              }}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button onPress={handleGenerateSubmit}>Generate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
