"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

interface Detection {
  id: string;
  label: string;
  confidence: number;
  severity: "critical" | "major" | "minor" | "info";
  boundingBox: { x: number; y: number; width: number; height: number };
  description?: string;
}

interface ChartConfig {
  type: "bar" | "donut";
  title: string;
  data: Array<{ name: string; value?: number; count?: number; color: string }>;
  centerLabel?: string;
}

interface DetectionChartsProps {
  detections: Detection[];
  modelName?: string;
  detectionModel: string;
  /** Omit outer margin when nested (e.g. analytics accordion). */
  embedded?: boolean;
}

export function getSeverityChartColor(severity: string): string {
  switch (severity) {
    case "critical":
      return "#EF4444";
    case "major":
      return "#F97316";
    case "minor":
      return "#EAB308";
    case "info":
      return "#22C55E";
    default:
      return "#6B7280";
  }
}

export function getWorstSeverity(detections: Detection[]): string {
  const order = ["critical", "major", "minor", "info"] as const;
  for (const severity of order) {
    if (detections.some((d) => d.severity === severity)) return severity;
  }
  return "info";
}

export function getDetectionChartConfig(
  detectionModel: string,
  detections: Detection[]
): ChartConfig[] {
  const configs: ChartConfig[] = [];

  // 1. SEVERITY DISTRIBUTION — show for all detection models that have severity data
  const severityCounts: Record<string, number> = {
    critical: 0,
    major: 0,
    minor: 0,
    info: 0,
  };
  detections.forEach((d) => {
    const sev = d.severity || "info";
    severityCounts[sev] = (severityCounts[sev] || 0) + 1;
  });
  const hasSeverityVariation =
    Object.values(severityCounts).filter((v) => v > 0).length > 1;

  if (hasSeverityVariation) {
    configs.push({
      type: "donut",
      title: "Severity Distribution",
      data: [
        { name: "Critical", value: severityCounts.critical, color: "#EF4444" },
        { name: "Major", value: severityCounts.major, color: "#F97316" },
        { name: "Minor", value: severityCounts.minor, color: "#EAB308" },
        { name: "Info", value: severityCounts.info, color: "#3B82F6" },
      ].filter((d) => (d.value ?? 0) > 0),
    });
  }

  // 2. OBJECT COUNT BAR CHART — show for object counting, vehicle detection, and any model with multiple detection types
  const typeCounts: Record<string, number> = {};
  detections.forEach((d) => {
    typeCounts[d.label] = (typeCounts[d.label] || 0) + 1;
  });
  const uniqueTypes = Object.keys(typeCounts);

  if (uniqueTypes.length >= 2 || detectionModel === "object-counting") {
    configs.push({
      type: "bar",
      title: "Detection Breakdown",
      data: uniqueTypes.map((type) => {
        const detectionsOfType = detections.filter((d) => d.label === type);
        const worstSeverity = getWorstSeverity(detectionsOfType);
        return {
          name: type,
          count: typeCounts[type],
          color: getSeverityChartColor(worstSeverity),
        };
      }),
    });
  }

  // 3. COMPLIANCE DONUT — show specifically for PPE detection and safety models
  if (["ppe-detection", "safety-hazard"].includes(detectionModel)) {
    const passCount = detections.filter(
      (d) =>
        d.severity === "info" ||
        (d.label && d.label.includes("✓"))
    ).length;
    const failCount = detections.filter(
      (d) =>
        d.severity !== "info" &&
        !(d.label && d.label.includes("✓"))
    ).length;
    const total = passCount + failCount;

    if (total > 0) {
      configs.push({
        type: "donut",
        title: "Compliance Rate",
        data: [
          { name: "Compliant", value: passCount, color: "#22C55E" },
          { name: "Non-Compliant", value: failCount, color: "#EF4444" },
        ],
        centerLabel: `${Math.round((passCount / total) * 100)}%`,
      });
    }
  }

  return configs;
}

function BarChartComponent({
  data,
}: {
  data: Array<{ name: string; count: number; color: string }>;
}) {
  const chartData = data.map((d) => ({ name: d.name, count: d.count }));
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart
        data={chartData}
        margin={{ top: 5, right: 5, bottom: 5, left: -15 }}
      >
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "#6B7280" }}
          axisLine={{ stroke: "#E5E7EB" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#6B7280" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1F2937",
            border: "none",
            borderRadius: "8px",
            color: "white",
            fontSize: "12px",
            padding: "6px 10px",
          }}
          cursor={{ fill: "#F3F4F6" }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function DonutChartComponent({
  data,
  centerLabel,
}: {
  data: Array<{ name: string; value: number; color: string }>;
  centerLabel?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <ResponsiveContainer width={120} height={120}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={55}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {centerLabel && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-lg font-bold text-gray-800">
              {centerLabel}
            </span>
          </div>
        )}
      </div>
      <div className="space-y-1.5">
        {data.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-gray-600">{entry.name}</span>
            <span className="text-xs font-medium text-gray-800">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartCard({ chart }: { chart: ChartConfig }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h4 className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
        {chart.title}
      </h4>

      {chart.type === "bar" && (
        <BarChartComponent
          data={chart.data as Array<{ name: string; count: number; color: string }>}
        />
      )}

      {chart.type === "donut" && (
        <DonutChartComponent
          data={
            chart.data as Array<{ name: string; value: number; color: string }>
          }
          centerLabel={chart.centerLabel}
        />
      )}
    </div>
  );
}

export function DetectionCharts({
  detections,
  detectionModel,
  embedded = false,
}: DetectionChartsProps) {
  const chartConfig = getDetectionChartConfig(detectionModel, detections);

  if (!chartConfig || chartConfig.length === 0) return null;

  return (
    <div
      className={
        embedded
          ? "grid grid-cols-1 gap-3 md:grid-cols-2"
          : "my-3 grid grid-cols-1 gap-3 md:grid-cols-2"
      }
    >
      {chartConfig.map((chart, i) => (
        <ChartCard key={i} chart={chart} />
      ))}
    </div>
  );
}
