"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  Button,
  Icon,
  Badge,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  StatsCard,
} from "ui";
import {
  Search,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Eye,
  ThumbsDown,
  Filter,
  Download,
  Camera,
  CalendarIcon,
  Brain,
  Plus,
} from "ui/utils/icons";
import { getAdminIncidentListItemsFromStorage } from "app";

type IncidentsListMode = "admin" | "monitor";

// Incidents data (mock)
const incidentsData = [
  {
    id: 1,
    type: "Person Detected",
    severity: "high",
    camera: "Camera 1 - Main Entry",
    pipeline: "Person Detection",
    timestamp: "2024-01-20 14:32:15",
    status: "new",
    confidence: 94.5,
    thumbnail: null,
  },
  {
    id: 2,
    type: "Unauthorized Access",
    severity: "critical",
    camera: "Camera 2 - Assembly Line",
    pipeline: "Person Detection",
    timestamp: "2024-01-20 14:28:42",
    status: "reviewing",
    confidence: 98.2,
    thumbnail: null,
  },
  {
    id: 3,
    type: "Object Left Behind",
    severity: "medium",
    camera: "Camera 3 - Storage Area",
    pipeline: "Object Classification",
    timestamp: "2024-01-20 14:15:33",
    status: "resolved",
    confidence: 87.3,
    thumbnail: null,
  },
  {
    id: 4,
    type: "Safety Violation",
    severity: "high",
    camera: "Camera 4 - Parking Lot",
    pipeline: "PPE Detection",
    timestamp: "2024-01-20 13:58:21",
    status: "false_positive",
    confidence: 72.1,
    thumbnail: null,
  },
  {
    id: 5,
    type: "Loitering Detected",
    severity: "low",
    camera: "Camera 5 - Exit",
    pipeline: "Person Detection",
    timestamp: "2024-01-20 13:45:09",
    status: "resolved",
    confidence: 91.8,
    thumbnail: null,
  },
  {
    id: 6,
    type: "Vehicle in Restricted Zone",
    severity: "medium",
    camera: "Camera 6 - Quality Check",
    pipeline: "Vehicle Recognition",
    timestamp: "2024-01-20 13:30:55",
    status: "new",
    confidence: 89.5,
    thumbnail: null,
  },
];

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case "critical":
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-700 border-red-300 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800"
        >
          <Icon icon={AlertCircle} className="h-3 w-3 mr-1" />
          Critical
        </Badge>
      );
    case "high":
      return (
        <Badge
          variant="outline"
          className="bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/40 dark:text-orange-400 dark:border-orange-800"
        >
          <Icon icon={AlertTriangle} className="h-3 w-3 mr-1" />
          High
        </Badge>
      );
    case "medium":
      return (
        <Badge
          variant="outline"
          className="bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800"
        >
          Medium
        </Badge>
      );
    case "low":
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800"
        >
          Low
        </Badge>
      );
    default:
      return null;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "new":
      return (
        <Badge
          variant="outline"
          className="bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/40 dark:text-purple-400 dark:border-purple-800"
        >
          New
        </Badge>
      );
    case "reviewing":
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800"
        >
          <Icon icon={Eye} className="h-3 w-3 mr-1" />
          Reviewing
        </Badge>
      );
    case "resolved":
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/40 dark:text-green-400 dark:border-green-800"
        >
          <Icon icon={CheckCircle} className="h-3 w-3 mr-1" />
          Resolved
        </Badge>
      );
    case "false_positive":
      return (
        <Badge
          variant="outline"
          className="bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/40 dark:text-gray-400 dark:border-gray-700"
        >
          <Icon icon={ThumbsDown} className="h-3 w-3 mr-1" />
          False Positive
        </Badge>
      );
    default:
      return null;
  }
};

export function IncidentsListPage({ mode }: { mode: IncidentsListMode }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [storedIncidents, setStoredIncidents] = useState(() =>
    getAdminIncidentListItemsFromStorage()
  );

  useEffect(() => {
    setStoredIncidents(getAdminIncidentListItemsFromStorage());
  }, []);

  const allIncidents = useMemo(
    () => [...storedIncidents, ...incidentsData],
    [storedIncidents]
  );

  // Calculate stats
  const totalIncidents = allIncidents.length;
  const newIncidents = allIncidents.filter((i) => i.status === "new").length;
  const criticalIncidents = allIncidents.filter(
    (i) => i.severity === "critical"
  ).length;
  const falsePositives = allIncidents.filter(
    (i) => i.status === "false_positive"
  ).length;

  // Filter incidents based on search and tab
  const filteredIncidents = allIncidents.filter((incident) => {
    const matchesSearch =
      incident.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.camera.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "new") return matchesSearch && incident.status === "new";
    if (activeTab === "reviewing")
      return matchesSearch && incident.status === "reviewing";
    if (activeTab === "resolved")
      return matchesSearch && incident.status === "resolved";
    if (activeTab === "false_positive")
      return matchesSearch && incident.status === "false_positive";
    return matchesSearch;
  });

  const detailBasePath = mode === "admin" ? "/admin/incidents" : "/monitor/incidents";

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Incidents
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and manage detected incidents
          </p>
        </div>

        {mode === "admin" ? (
          <Button variant="outline" className="w-full sm:w-auto">
            <Icon icon={Download} className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onPress={() => router.push("/monitor/incidents/create")}
          >
            <Icon icon={Plus} className="h-4 w-4 mr-2" />
            Create Incident
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Incidents" value={totalIncidents} color="default" />
        <StatsCard label="New" value={newIncidents} color="purple" />
        <StatsCard label="Critical" value={criticalIncidents} color="red" />
        <StatsCard label="False Positives" value={falsePositives} color="default" />
      </div>

      {/* Tabs and Filters */}
      <Tabs value={activeTab} onValueChange={setActiveTab} variant="underline">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList className="bg-transparent border-b border-border justify-start rounded-none p-0 w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="all">All Incidents</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="reviewing">Reviewing</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="false_positive">False Positives</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Icon
                icon={Search}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
              <Input
                placeholder="Search incidents..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Button variant="outline" size="icon" className="flex-shrink-0">
              <Icon icon={Filter} className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-6">
          {/* Incident Cards */}
          <div className="space-y-4">
            {filteredIncidents.map((incident) => (
              <Card key={incident.id} className="overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    {/* Left side - Incident info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Icon */}
                      <div className="p-3 rounded-lg bg-muted">
                        <Icon
                          icon={AlertTriangle}
                          className="h-5 w-5 text-muted-foreground"
                        />
                      </div>

                      {/* Incident Details */}
                      <div className="flex-1 space-y-3">
                        {/* Title and Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-foreground">
                            {incident.type}
                          </h3>
                          {getSeverityBadge(incident.severity)}
                          {getStatusBadge(incident.status)}
                        </div>

                        {/* Details */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Icon
                              icon={Camera}
                              className="h-4 w-4 text-muted-foreground"
                            />
                            <span className="text-sm text-foreground">
                              {incident.camera}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon
                              icon={Brain}
                              className="h-4 w-4 text-muted-foreground"
                            />
                            <span className="text-sm text-foreground">
                              Pipeline: {incident.pipeline}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon
                              icon={CalendarIcon}
                              className="h-4 w-4 text-muted-foreground"
                            />
                            <span className="text-sm text-muted-foreground">
                              {incident.timestamp}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              Confidence:
                            </span>
                            <span className="text-sm font-medium text-foreground">
                              {incident.confidence}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Action buttons (horizontal) */}
                    <div className="flex flex-row gap-2 sm:ml-6 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-muted items-center justify-center"
                        onPress={() =>
                          router.push(`${detailBasePath}/${incident.id}`)
                        }
                      >
                        <Icon
                          icon={Eye}
                          className="h-4 w-4 mr-2 text-muted-foreground"
                        />
                        View
                      </Button>
                      {incident.status !== "false_positive" &&
                        incident.status !== "resolved" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-muted items-center justify-center"
                            onPress={() =>
                              console.log("Mark false positive:", incident.id)
                            }
                          >
                            <Icon
                              icon={ThumbsDown}
                              className="h-4 w-4 mr-2 text-muted-foreground"
                            />
                            Mark False
                          </Button>
                        )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


