"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  Icon,
} from "ui";
import {
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  Camera,
} from "ui/utils/icons";

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

// ─── Timeline Item Type ─────────────────────────────────────────────────────

type TimelineDotColor = "blue" | "orange" | "green";

interface TimelineItem {
  time: string;
  description: string;
  dotColor: TimelineDotColor;
}

// ─── Mock Incident Detail Data ───────────────────────────────────────────────

interface IncidentDetail {
  id: number;
  title: string;
  type: string;
  zone: string;
  camera: string;
  detectedAt: string;
  confidence: number;
  pipeline: string;
  severity: string;
  status: string;
  assignedTo: string;
  resolutionTime: string;
  downtimeImpact: string;
  slaStatus: "Within SLA" | "SLA Breached";
  frameCaption: string;
  defectType: string;
  model: string;
  timeline: TimelineItem[];
  rootCause: string;
  resolutionNotes: string;
  affectedUnits: string;
  productionLineImpact: string;
}

const MOCK_INCIDENT_DETAILS: Record<string, IncidentDetail> = {
  "1001": {
    id: 1001,
    title: "Temperature Threshold Exceeded",
    type: "Temperature Threshold Exceeded",
    zone: "Zone F — Raw Material Storage",
    camera: "CAM-F-01",
    detectedAt: "Mar 2, 2026 at 08:45:00",
    confidence: 94.2,
    pipeline: "Environmental Monitoring",
    severity: "Critical",
    status: "Active",
    assignedTo: "—",
    resolutionTime: "Ongoing",
    downtimeImpact: "—",
    slaStatus: "Within SLA",
    frameCaption: "CAM-F-01 — Frame captured at 08:45:00",
    defectType: "Temperature Spike",
    model: "TempGuard v1.2",
    timeline: [
      { time: "08:45:00", description: "Alert Generated", dotColor: "blue" },
      { time: "08:46:12", description: "Incident Created", dotColor: "orange" },
      { time: "08:50:00", description: "Assigned to Maintenance Team", dotColor: "blue" },
      { time: "08:55:00", description: "Investigation Started", dotColor: "blue" },
      { time: "09:10:00", description: "HVAC Check In Progress", dotColor: "orange" },
      { time: "—", description: "In Progress...", dotColor: "blue" },
    ],
    rootCause: "Investigation ongoing. Preliminary assessment indicates possible HVAC sensor drift in Zone F.",
    resolutionNotes: "—",
    affectedUnits: "—",
    productionLineImpact: "Raw material storage area under monitoring; no production impact yet.",
  },
  "1002": {
    id: 1002,
    title: "PPE Violation — No Helmet",
    type: "PPE Violation — No Helmet",
    zone: "Zone C — Welding Station",
    camera: "CAM-C-02",
    detectedAt: "Mar 2, 2026 at 07:22:00",
    confidence: 89.5,
    pipeline: "Safety Compliance",
    severity: "Critical",
    status: "Acknowledged",
    assignedTo: "Safety Officer — Priya Sharma",
    resolutionTime: "Ongoing",
    downtimeImpact: "0 hrs",
    slaStatus: "Within SLA",
    frameCaption: "CAM-C-02 — Frame captured at 07:22:00",
    defectType: "PPE Violation",
    model: "SafetyNet v2.1",
    timeline: [
      { time: "07:22:00", description: "Alert Generated", dotColor: "blue" },
      { time: "07:23:45", description: "Incident Created", dotColor: "orange" },
      { time: "07:28:00", description: "Assigned to Priya Sharma", dotColor: "blue" },
      { time: "07:35:00", description: "Worker Corrected On-Site", dotColor: "orange" },
      { time: "—", description: "In Progress...", dotColor: "blue" },
    ],
    rootCause: "Worker entered welding zone without retrieving helmet from locker. Training reinforcement scheduled.",
    resolutionNotes: "Immediate correction applied. Follow-up training scheduled for shift.",
    affectedUnits: "N/A",
    productionLineImpact: "No production impact. Brief safety pause.",
  },
  "1003": {
    id: 1003,
    title: "Surface Defect — Assembly Line 1",
    type: "Surface Scratch Detection",
    zone: "Zone C — Welding Station",
    camera: "CAM-C-03",
    detectedAt: "Feb 28, 2026 at 14:32:07",
    confidence: 94.2,
    pipeline: "Safety Zone Violation",
    severity: "High",
    status: "Resolved",
    assignedTo: "Rajesh Kumar, Quality Engineer",
    resolutionTime: "1.2 hours",
    downtimeImpact: "0.5 hours",
    slaStatus: "Within SLA",
    frameCaption: "CAM-C-03 — Frame captured at 14:32:07",
    defectType: "Surface Scratch",
    model: "ScratchNet v2.4",
    timeline: [
      { time: "14:32:07", description: "Alert Generated", dotColor: "blue" },
      { time: "14:33:15", description: "Incident Created", dotColor: "orange" },
      { time: "14:35:00", description: "Assigned to Rajesh Kumar", dotColor: "blue" },
      { time: "14:48:00", description: "Investigation Started", dotColor: "blue" },
      { time: "15:12:00", description: "Root Cause Identified", dotColor: "orange" },
      { time: "15:44:00", description: "Resolved — Tool replaced", dotColor: "green" },
    ],
    rootCause: "Worn deburring tool on Station 3 caused micro-scratches on component surfaces. Tool had exceeded recommended 500-cycle replacement interval.",
    resolutionNotes: "Deburring tool replaced. Affected units quarantined and reworked. Preventive maintenance schedule updated to flag tool age.",
    affectedUnits: "3 units quarantined",
    productionLineImpact: "Line paused for 28 minutes during tool replacement.",
  },
  "1004": {
    id: 1004,
    title: "Packaging Defect Spike",
    type: "Packaging Defect",
    zone: "Zone E — Packaging Line",
    camera: "CAM-E-02",
    detectedAt: "Mar 1, 2026 at 22:30:00",
    confidence: 82.1,
    pipeline: "Packaging QA",
    severity: "High",
    status: "Resolved",
    assignedTo: "Anita Patel, Packaging Lead",
    resolutionTime: "2.1 hours",
    downtimeImpact: "0.8 hours",
    slaStatus: "Within SLA",
    frameCaption: "CAM-E-02 — Frame captured at 22:30:00",
    defectType: "Seal Misalignment",
    model: "PackQA v1.8",
    timeline: [
      { time: "22:30:00", description: "Alert Generated", dotColor: "blue" },
      { time: "22:31:20", description: "Incident Created", dotColor: "orange" },
      { time: "22:35:00", description: "Assigned to Anita Patel", dotColor: "blue" },
      { time: "22:50:00", description: "Investigation Started", dotColor: "blue" },
      { time: "23:15:00", description: "Sealer Calibration Issue Found", dotColor: "orange" },
      { time: "00:36:00", description: "Resolved — Sealer recalibrated", dotColor: "green" },
    ],
    rootCause: "Thermal sealer calibration drift caused inconsistent seal quality. Ambient temperature variation in packaging area contributed.",
    resolutionNotes: "Sealer recalibrated. 12 units rejected and repackaged. HVAC settings adjusted for packaging zone.",
    affectedUnits: "12 units repackaged",
    productionLineImpact: "Packaging line paused for 48 minutes.",
  },
  "1005": {
    id: 1005,
    title: "Color Deviation Detected",
    type: "Color Deviation",
    zone: "Zone B — Painting Bay",
    camera: "CAM-B-01",
    detectedAt: "Mar 1, 2026 at 18:45:00",
    confidence: 91.0,
    pipeline: "Color Match",
    severity: "Medium",
    status: "Resolved",
    assignedTo: "Vikram Singh, Paint Technician",
    resolutionTime: "0.9 hours",
    downtimeImpact: "0.2 hours",
    slaStatus: "Within SLA",
    frameCaption: "CAM-B-01 — Frame captured at 18:45:00",
    defectType: "Color Mismatch",
    model: "ColorMatch v3.0",
    timeline: [
      { time: "18:45:00", description: "Alert Generated", dotColor: "blue" },
      { time: "18:46:30", description: "Incident Created", dotColor: "orange" },
      { time: "18:50:00", description: "Assigned to Vikram Singh", dotColor: "blue" },
      { time: "19:05:00", description: "Paint Batch Variance Identified", dotColor: "orange" },
      { time: "19:38:00", description: "Resolved — Batch adjusted", dotColor: "green" },
    ],
    rootCause: "Slight batch-to-batch variance in paint formulation. Supplier notified. Acceptable tolerance verified for affected lot.",
    resolutionNotes: "Paint batch adjusted. 5 units re-sprayed. New batch QC protocol implemented.",
    affectedUnits: "5 units re-sprayed",
    productionLineImpact: "Minimal — 12-minute pause for batch verification.",
  },
  "1006": {
    id: 1006,
    title: "Dimension Mismatch",
    type: "Dimension Mismatch",
    zone: "Zone D — Quality Check Area",
    camera: "CAM-D-02",
    detectedAt: "Mar 1, 2026 at 14:20:00",
    confidence: 78.4,
    pipeline: "Dimensional QA",
    severity: "Medium",
    status: "False Positive",
    assignedTo: "—",
    resolutionTime: "0.3 hours",
    downtimeImpact: "0 hrs",
    slaStatus: "Within SLA",
    frameCaption: "CAM-D-02 — Frame captured at 14:20:00",
    defectType: "Dimension Check",
    model: "DimQA v2.0",
    timeline: [
      { time: "14:20:00", description: "Alert Generated", dotColor: "blue" },
      { time: "14:21:00", description: "Incident Created", dotColor: "orange" },
      { time: "14:35:00", description: "Manual Verification — Within Spec", dotColor: "green" },
    ],
    rootCause: "False positive — lighting angle caused shadow that triggered dimension check. Actual measurements within tolerance.",
    resolutionNotes: "No action required. Lighting adjusted to reduce shadow artifacts.",
    affectedUnits: "0",
    productionLineImpact: "None.",
  },
  "1007": {
    id: 1007,
    title: "Foreign Object in Product",
    type: "Contamination Detection",
    zone: "Zone E — Packaging Line",
    camera: "CAM-E-03",
    detectedAt: "Mar 1, 2026 at 11:00:00",
    confidence: 95.2,
    pipeline: "Contamination Check",
    severity: "Critical",
    status: "Active",
    assignedTo: "Quality Team Lead",
    resolutionTime: "Ongoing",
    downtimeImpact: "—",
    slaStatus: "Within SLA",
    frameCaption: "CAM-E-03 — Frame captured at 11:00:00",
    defectType: "Foreign Object",
    model: "ContamScan v1.5",
    timeline: [
      { time: "11:00:00", description: "Alert Generated", dotColor: "blue" },
      { time: "11:01:30", description: "Incident Created", dotColor: "orange" },
      { time: "11:05:00", description: "Assigned to Quality Team", dotColor: "blue" },
      { time: "11:15:00", description: "Investigation Started", dotColor: "blue" },
      { time: "—", description: "In Progress...", dotColor: "blue" },
    ],
    rootCause: "Investigation ongoing. Possible fiber from packaging material or environmental source.",
    resolutionNotes: "—",
    affectedUnits: "Batch under quarantine",
    productionLineImpact: "Line paused pending root cause.",
  },
  "1008": {
    id: 1008,
    title: "Equipment Fault — CNC Spindle",
    type: "Equipment Fault",
    zone: "Zone G — CNC Machine Area",
    camera: "CAM-G-01",
    detectedAt: "Feb 28, 2026 at 16:30:00",
    confidence: 88.7,
    pipeline: "Equipment Health",
    severity: "High",
    status: "Resolved",
    assignedTo: "Maintenance — Suresh Reddy",
    resolutionTime: "3.2 hours",
    downtimeImpact: "2.5 hours",
    slaStatus: "Within SLA",
    frameCaption: "CAM-G-01 — Frame captured at 16:30:00",
    defectType: "Spindle Vibration",
    model: "EquipHealth v2.2",
    timeline: [
      { time: "16:30:00", description: "Alert Generated", dotColor: "blue" },
      { time: "16:32:00", description: "Incident Created", dotColor: "orange" },
      { time: "16:40:00", description: "Assigned to Suresh Reddy", dotColor: "blue" },
      { time: "16:55:00", description: "Diagnosis Started", dotColor: "blue" },
      { time: "17:45:00", description: "Bearing Wear Identified", dotColor: "orange" },
      { time: "19:42:00", description: "Resolved — Bearing replaced", dotColor: "green" },
    ],
    rootCause: "CNC spindle bearing wear beyond tolerance. Preventive maintenance had been deferred. New PM schedule implemented.",
    resolutionNotes: "Spindle bearing replaced. Machine recalibrated. 8 units in-progress at time of fault were scrapped.",
    affectedUnits: "8 units scrapped",
    productionLineImpact: "CNC Zone G offline for 2.5 hours.",
  },
  "1009": {
    id: 1009,
    title: "Weld Integrity Failure",
    type: "Weld Integrity",
    zone: "Zone C — Welding Station",
    camera: "CAM-C-01",
    detectedAt: "Feb 28, 2026 at 09:15:00",
    confidence: 85.3,
    pipeline: "Weld Inspection",
    severity: "High",
    status: "Acknowledged",
    assignedTo: "Welding Supervisor — Deepak Mehta",
    resolutionTime: "Ongoing",
    downtimeImpact: "0.3 hours",
    slaStatus: "Within SLA",
    frameCaption: "CAM-C-01 — Frame captured at 09:15:00",
    defectType: "Weld Porosity",
    model: "WeldInspect v1.9",
    timeline: [
      { time: "09:15:00", description: "Alert Generated", dotColor: "blue" },
      { time: "09:16:45", description: "Incident Created", dotColor: "orange" },
      { time: "09:22:00", description: "Assigned to Deepak Mehta", dotColor: "blue" },
      { time: "09:35:00", description: "X-Ray Verification Scheduled", dotColor: "orange" },
      { time: "—", description: "In Progress...", dotColor: "blue" },
    ],
    rootCause: "Preliminary: possible gas flow inconsistency or surface contamination. X-ray verification pending.",
    resolutionNotes: "Awaiting X-ray results. Affected weld joints tagged.",
    affectedUnits: "2 weld joints under review",
    productionLineImpact: "Brief pause for initial assessment.",
  },
  "1010": {
    id: 1010,
    title: "Minor Scratch — Final Inspection",
    type: "Surface Quality",
    zone: "Zone H — Final Inspection",
    camera: "CAM-H-01",
    detectedAt: "Feb 27, 2026 at 13:45:00",
    confidence: 72.1,
    pipeline: "Surface Quality",
    severity: "Low",
    status: "Resolved",
    assignedTo: "Inspection Lead — Kavita Nair",
    resolutionTime: "0.5 hours",
    downtimeImpact: "0 hrs",
    slaStatus: "Within SLA",
    frameCaption: "CAM-H-01 — Frame captured at 13:45:00",
    defectType: "Minor Scratch",
    model: "SurfaceQA v1.4",
    timeline: [
      { time: "13:45:00", description: "Alert Generated", dotColor: "blue" },
      { time: "13:46:00", description: "Incident Created", dotColor: "orange" },
      { time: "13:50:00", description: "Assigned to Kavita Nair", dotColor: "blue" },
      { time: "14:12:00", description: "Resolved — Buffed per spec", dotColor: "green" },
    ],
    rootCause: "Cosmetic scratch from handling. Within rework tolerance. Buffing applied per standard procedure.",
    resolutionNotes: "Unit buffed and passed reinspection. No further action.",
    affectedUnits: "1 unit reworked",
    productionLineImpact: "None.",
  },
};

const DEFAULT_INCIDENT: IncidentDetail = MOCK_INCIDENT_DETAILS["1003"];

// ─── Component ─────────────────────────────────────────────────────────────

export default function ExecutiveIncidentDetailPage() {
  const params = useParams<{ id?: string }>();
  const idParam = params?.id;
  const incident = idParam
    ? MOCK_INCIDENT_DETAILS[idParam] ?? DEFAULT_INCIDENT
    : null;

  if (!incident) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6">
        <p className="text-sm text-gray-500">Incident not found.</p>
        <Link
          href="/executive/incidents"
          className="text-indigo-600 hover:underline"
        >
          ← Back to Incidents
        </Link>
      </div>
    );
  }

  const timelineDotClass = (color: TimelineDotColor) => {
    switch (color) {
      case "blue":
        return "bg-indigo-600";
      case "orange":
        return "bg-orange-400";
      case "green":
        return "bg-green-500";
      default:
        return "bg-indigo-600";
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FB" }}>
      <div className="space-y-6 p-6">
        {/* HEADER */}
        <div className="space-y-2">
          <Link
            href="/executive/incidents"
            className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline"
          >
            <Icon icon={ArrowLeft} className="h-4 w-4" />
            Back to Incidents
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{incident.title}</h1>
            {getSeverityBadge(incident.severity)}
            {getStatusBadge(incident.status)}
          </div>
        </div>

        {/* SECTION 1 — Incident Summary */}
        <Card className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Incident Summary
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Left column */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Type</p>
                  <p className="text-sm text-gray-900">{incident.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Zone</p>
                  <p className="text-sm text-gray-900">{incident.zone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Camera</p>
                  <p className="text-sm text-gray-900">{incident.camera}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Detected At</p>
                  <p className="text-sm text-gray-900">{incident.detectedAt}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Detection Confidence
                  </p>
                  <p className="text-sm text-gray-900">{incident.confidence}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Pipeline</p>
                  <p className="text-sm text-gray-900">{incident.pipeline}</p>
                </div>
              </div>
              {/* Right column */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(incident.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Assigned To</p>
                  <p className="text-sm text-gray-900">{incident.assignedTo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Resolution Time
                  </p>
                  <p className="text-sm text-gray-900">{incident.resolutionTime}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Downtime Impact
                  </p>
                  <p className="text-sm text-gray-900">{incident.downtimeImpact}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">SLA Status</p>
                  <p
                    className={`text-sm font-medium ${
                      incident.slaStatus === "Within SLA"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {incident.slaStatus}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2 — Detection Evidence + Timeline */}
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          {/* LEFT (60%) — Detection Evidence */}
          <Card className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Detection Evidence
              </h2>
              <div className="aspect-video overflow-hidden rounded-lg bg-gray-100">
                <div className="flex h-full w-full items-center justify-center">
                  <Icon
                    icon={Camera}
                    className="h-16 w-16 text-gray-400"
                  />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">{incident.frameCaption}</p>
              <div className="mt-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  AI Analysis
                </h3>
                <div>
                  <p className="text-sm text-gray-500">Defect type</p>
                  <p className="text-sm font-medium text-gray-900">
                    {incident.defectType}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-gray-500">Confidence</p>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-indigo-600"
                      style={{ width: `${incident.confidence}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500">Model: {incident.model}</p>
              </div>
            </CardContent>
          </Card>

          {/* RIGHT (40%) — Incident Timeline */}
          <Card className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Incident Timeline
              </h2>
              <div className="relative border-l-2 border-gray-200 pl-6">
                {incident.timeline.map((item, idx) => (
                  <div key={idx} className="relative pb-6 last:pb-0">
                    <div
                      className={`absolute left-0 top-1 h-4 w-4 -translate-x-1/2 rounded-full ${timelineDotClass(item.dotColor)}`}
                    />
                    <div className="pl-2">
                      <p className="text-sm font-bold text-gray-900">{item.time}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SECTION 3 — Impact & Resolution */}
        <Card className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Impact & Resolution
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Root Cause</p>
                  <p className="text-sm text-gray-700">{incident.rootCause}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Resolution Notes
                  </p>
                  <p className="text-sm text-gray-700">
                    {incident.resolutionNotes}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Affected Units
                  </p>
                  <p className="text-sm text-gray-700">{incident.affectedUnits}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Production Line Impact
                  </p>
                  <p className="text-sm text-gray-700">
                    {incident.productionLineImpact}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
