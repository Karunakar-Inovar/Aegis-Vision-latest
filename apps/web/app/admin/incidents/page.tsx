
"use client";

import { useState, useEffect, useRef } from "react";
import { fetchIncidents, IncidentFilter, updateIncidentStatus } from "app/utils/incident";
import { fetchIncidentStatuses, type IncidentStatus } from "app/utils/incidentStatus";
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
  Snackbar,
  useSnackbar,
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
  Brain,
  CalendarIcon,
} from "ui/utils/icons";
import { MomentUtils, useDebounce } from "app";
import { INCIDENT_STATUS, ROUTES, SEVERITY_LEVELS, UI_MESSAGES } from "app/constants";
import { useRouter } from "next/navigation";

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case SEVERITY_LEVELS.CRITICAL:
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-700 border-red-300 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800"
        >
          <Icon icon={AlertCircle} className="h-3 w-3 mr-1" />
          {severity}
        </Badge>
      );
    case SEVERITY_LEVELS.HIGH:
      return (
        <Badge
          variant="outline"
          className="bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/40 dark:text-orange-400 dark:border-orange-800"
        >
          <Icon icon={AlertTriangle} className="h-3 w-3 mr-1" />
          {severity}
        </Badge>
      );
    case SEVERITY_LEVELS.MEDIUM:
      return (
        <Badge
          variant="outline"
          className="bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800"
        >
          {severity}
        </Badge>
      );
    case SEVERITY_LEVELS.LOW:
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800"
        >
          {severity}
        </Badge>
      );
    default:
      return null;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case INCIDENT_STATUS.NEW:
      return (
        <Badge
          variant="outline"
          className="bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/40 dark:text-purple-400 dark:border-purple-800"
        >
          {status}
        </Badge>
      );
    case INCIDENT_STATUS.ACTIVE:
      return (
        <Badge
          variant="outline"
          className="bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/40 dark:text-purple-400 dark:border-purple-800"
        >
          {status}
        </Badge>
      );
    case INCIDENT_STATUS.REVIEWING:
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800"
        >
          <Icon icon={Eye} className="h-3 w-3 mr-1" />
          {status}
        </Badge>
      );
    case INCIDENT_STATUS.RESOLVED:
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/40 dark:text-green-400 dark:border-green-800"
        >
          <Icon icon={CheckCircle} className="h-3 w-3 mr-1" />
          {status}
        </Badge>
      );
    case INCIDENT_STATUS.FALSE_POSITIVE:
      return (
        <Badge
          variant="outline"
          className="bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/40 dark:text-gray-400 dark:border-gray-700"
        >
          <Icon icon={ThumbsDown} className="h-3 w-3 mr-1" />
          {status}
        </Badge>
      );
    default:
      return null;
  }
};

export default function IncidentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery);
  const [activeTab, setActiveTab] = useState("all");
  const [incidentsData, setIncidentsData] = useState<any[]>([]);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(true);
  const [incidentStatuses, setIncidentStatuses] = useState<IncidentStatus[]>([]);
  const snackbar = useSnackbar();
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalIncident, setModalIncident] = useState<any | null>(null);
  const [modalIframeSrc, setModalIframeSrc] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [rawIncidents, setRawIncidents] = useState<any[]>([]);

  const openIncidentModal = async (id: number | string) => {
    setModalVisible(true);
    setModalIframeSrc(null);

    const found = rawIncidents.find(
      (r: any) => Number(r.IncidentId) === Number(id)
    );
    if (found) {
      setModalIncident(found);
      return;
    }

    try {
      const res = await fetchIncidents({
        filters: { incidentId: Number(id) } as IncidentFilter,
      });
      const item = res ?? res?.[0] ?? null;
      setModalIncident(item);
    } catch (e) {
      console.error(e);
      snackbar.error(UI_MESSAGES.incidents.loadFailed);
      setModalIncident(null);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalIncident(null);
    setModalIframeSrc(null);
  };

  const loadIncidents = async () => {
    try {
      setIsLoadingIncidents(true);
      const filters: IncidentFilter =
        activeTab !== "all" ? { incidentStatusId: activeTab } : {};
      if (debouncedSearchQuery) filters.incidentTitle = debouncedSearchQuery;

      const {incidents} = await fetchIncidents({ filters });
      setRawIncidents(incidents || []);

      const transformedIncidents = (incidents || [])?.map((incident) => ({
        id: incident.IncidentId,
        type: incident.IncidentTitle || incident.IncidentName,
        severity: incident.SeverityLevel,
        camera: incident.SourceName,
        pipeline: incident.IncidentTitle,
        timestamp: incident.CreatedDateTime,
        status: incident.IncidentStatus,
        confidence: incident.ConfidencePercentage,
        thumbnail: null,
      }));

      setIncidentsData(transformedIncidents);
    } catch (error) {
      snackbar.error(
        `${error instanceof Error ? error.message : UI_MESSAGES.incidents.loadFailed}`
      );
      setIncidentsData([]);
    } finally {
      setIsLoadingIncidents(false);
    }
  };

  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const statuses = await fetchIncidentStatuses();
        setIncidentStatuses(statuses);
      } catch {
        setIncidentStatuses([]);
      }
    };

    loadStatuses();
  }, []);

  useEffect(() => {
    loadIncidents();
  }, [debouncedSearchQuery, activeTab]);

  const handleMarkFalsePositive = async (incidentId: number) => {
    try {
      const statusId = incidentStatuses.find(
        (status) => status.label === INCIDENT_STATUS.FALSE_POSITIVE
      )?.id;
      if (!statusId) {
        snackbar.error(UI_MESSAGES.incidents.falsePositiveStatusNotFound);
        return;
      }
      await updateIncidentStatus(incidentId, Number(statusId));
      snackbar.success(UI_MESSAGES.incidents.markedFalsePositive);
      // after updating, update the status in the local state
      setIncidentsData((prev) =>
        prev.map((incident) =>
          incident.id === incidentId
            ? { ...incident, status: INCIDENT_STATUS.FALSE_POSITIVE, }
            : incident
        )
      );
    } catch (error) {
      snackbar.error(
        `${error instanceof Error ? error.message : UI_MESSAGES.incidents.updateFailed}`
      );
    }
  };

  const totalIncidents = incidentsData.length;
  const newIncidents = incidentsData.filter((i) => i.status === INCIDENT_STATUS.NEW).length;
  const criticalIncidents = incidentsData.filter((i) => i.severity === SEVERITY_LEVELS.CRITICAL).length;
  const falsePositives = incidentsData.filter((i) => i.status === INCIDENT_STATUS.FALSE_POSITIVE).length;

  // Build mediaUrls once for the modal preview/gallery
  const mediaUrls: string[] = [
    ...(modalIncident?.Attachments?.flatMap((a: any) => {
      const urls: string[] = [];
      if (a?.ImagePath) urls.push(a.ImagePath);
      if (a?.VideoPath) urls.push(a.VideoPath);
      if (a?.VideoUrl) urls.push(a.VideoUrl);
      return urls;
    }) || []),
    ...(modalIncident?.MediaUrls || []),
    ...(modalIncident?.media || []),
    ...(modalIncident?.Media || []),
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Incidents</h1>
          <p className="text-muted-foreground mt-1">Review and manage detected incidents</p>
        </div>
        <Button disabled variant="outline" className="w-full sm:w-auto">
          <Icon icon={Download} className="h-4 w-4 mr-2" />
          Export Report
        </Button>
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
            {incidentStatuses.map((status) => (
              <TabsTrigger key={status.id} value={status.value}>
                {status.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Icon icon={Search} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search incidents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-6">
          {/* Incident Cards */}
          <div className="space-y-4">
            {isLoadingIncidents ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground"><>Loading incidents...</></CardContent>
              </Card>
            ) : incidentsData.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  {searchQuery ? "No incidents found matching your search" : "No incidents available"}
                </CardContent>
              </Card>
            ) : (
              incidentsData.map((incident) => (
                <Card key={incident.id} className="overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      {/* Left side - Incident info */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Icon */}
                        <div className="p-3 rounded-lg bg-muted">
                          <Icon icon={AlertTriangle} className="h-5 w-5 text-muted-foreground" />
                        </div>

                        {/* Incident Details */}
                        <div className="flex-1 space-y-3">
                          {/* Title and Badges */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-foreground">{incident.type}</h3>
                            {getSeverityBadge(String(incident.severity))}
                            {getStatusBadge(String(incident.status))}
                          </div>

                          {/* Details */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Icon icon={Camera} className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-foreground">{incident.camera}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Icon icon={Brain} className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-foreground">Pipeline: {incident.pipeline}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Icon icon={CalendarIcon} className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {MomentUtils.formatDateTime(incident.timestamp)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Confidence:</span>
                              <span className="text-sm font-medium text-foreground">{(Number(incident.confidence)).toFixed(2)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right side - Action buttons */}
                      <div className="flex flex-row gap-2 sm:ml-6 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-muted items-center justify-center"
                          onClick={() => router.push(`${ROUTES.ADMIN.INCIDENTS}/${incident.id}`)}
                        >
                          <Icon icon={Eye} className="h-4 w-4 mr-2 text-muted-foreground" />
                          View
                        </Button>

                        {incident.status !== INCIDENT_STATUS.FALSE_POSITIVE && incident.status !== INCIDENT_STATUS.RESOLVED && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-muted items-center justify-center"
                            onClick={() => handleMarkFalsePositive(incident.id)}
                          >
                            <Icon icon={ThumbsDown} className="h-4 w-4 mr-2 text-muted-foreground" />
                            Mark False
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal */}
      {modalVisible && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div
            className="relative w-full max-w-3xl bg-background rounded-lg shadow-lg overflow-auto"
            style={{ maxHeight: "85vh" }}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold">
                  {modalIncident?.IncidentTitle || `Incident ${modalIncident?.IncidentId ?? ""}`}
                </h3>
                <div>{getSeverityBadge(String(modalIncident?.SeverityLevel || "").toLowerCase())}</div>
                <div>{getStatusBadge(String(modalIncident?.IncidentStatus || "").toLowerCase())}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={closeModal}>
                  Close
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Key info card */}
              <Card>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Icon icon={Camera} className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Camera / Source</div>
                      <div className="font-medium">
                        {modalIncident?.SourceName || modalIncident?.Source || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Timestamp</div>
                      <div className="font-medium">
                        {modalIncident?.CreatedDateTime
                          ? MomentUtils.formatDateTime(modalIncident.CreatedDateTime)
                          : "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Confidence</div>
                      <div className="font-medium">
                        {modalIncident?.ConfidencePercentage ?? modalIncident?.Confidence ?? "-"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Location</div>
                    <div className="font-medium">
                      {modalIncident?.LocationName || modalIncident?.IncidentLocation || "-"}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Description</div>
                    <div className="text-sm">
                      {modalIncident?.IncidentDescription || modalIncident?.UseCaseName || "-"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Media gallery - full width under info */}
              <div>
                <h4 className="text-md font-medium mb-2">Media</h4>

                {mediaUrls.length === 0 ? (
                  <Card>
                    <CardContent>No media available</CardContent>
                  </Card>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {mediaUrls.map((url: string, idx: number) => {
                        const str = String(url || "");
                        const isVideo = !!str.match(/\.(mp4|webm|ogg)$/i);
                        const isImage = !!str.match(/\.(jpe?g|png|gif|webp|bmp)$/i);
                        const isAudio = !!str.match(/\.(mp3|wav|aac|ogg)$/i);

                        const handleClick = () => {
                          setModalIframeSrc(url);
                          setTimeout(
                            () =>
                              previewRef?.current?.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                              }),
                            50
                          );
                        };

                        return (
                          <div
                            key={idx}
                            className="cursor-pointer"
                            onClick={handleClick}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") handleClick();
                            }}
                          >
                            <div className="w-full h-24 bg-muted flex items-center justify-center overflow-hidden rounded">
                              {isVideo ? (
                                <video src={url} className="max-h-24" muted />
                              ) : isImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={url} alt={`media-${idx}`} className="max-h-24 object-contain" />
                              ) : isAudio ? (
                                <div className="text-sm text-muted-foreground px-2">Audio</div>
                              ) : (
                                <div className="text-sm text-muted-foreground px-2">Preview</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* preview area below gallery */}
                    {modalIframeSrc && (
                      <div className="mt-3" ref={previewRef}>
                        {(() => {
                          const src = String(modalIframeSrc || "");
                          if (src.match(/\.(mp4|webm|ogg)$/i)) {
                            return <video src={src} controls className="w-full h-full object-contain" />;
                          }
                          if (src.match(/\.(jpe?g|png|gif|webp|bmp)$/i)) {
                            // eslint-disable-next-line @next/next/no-img-element
                            return <img src={src} alt="preview" className="w-full h-full object-contain" />;
                          }
                          if (src.match(/\.(mp3|wav|aac|ogg)$/i)) {
                            return <audio src={src} controls className="w-full" />;
                          }
                          // fallback iframe
                          return <iframe src={src} className="w-full h-full" title="media-preview" />;
                        })()}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      <Snackbar
        visible={snackbar.state.visible}
        message={snackbar.state.message}
        variant={snackbar.state.variant}
        onClose={snackbar.hide}
      />
    </div>
  );
}
