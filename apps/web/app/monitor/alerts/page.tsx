"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  fetchAllAlerts,
  fetchSeverityLevels,
  setCurrentAlert,
  updateAlert,
  type Alert,
  type SeverityLevel,
} from "app/utils/alert";
import { MomentUtils, useDebounce } from "app";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Icon,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Textarea,
  TrimmedVideoPlayer,
  Snackbar,
  useSnackbar,
} from "ui";
import {
  ArrowLeft,
  Eye,
  Search,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Clock,
  Camera,
  RefreshCw,
} from "ui/src/utils/icons";
import { ALERT_STATUSES, INCIDENT_ACTION, ROUTES, SEVERITY_LEVELS, UI_MESSAGES } from "app/constants";

export default function AlertsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = React.useState("all"); // Timeline filter: all, days, week, month
  const [filterType, setFilterType] = React.useState("all"); // Severity filter: all or severity level ID
  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearchQuery = useDebounce(searchQuery);
  const [acknowledgeModalOpen, setAcknowledgeModalOpen] = React.useState(false);
  const [selectedAlertId, setSelectedAlertId] = React.useState<number | null>(
    null,
  );
  const [responseReason, setResponseReason] = React.useState("");
  const [alerts, setAlerts] = React.useState<any[]>([]);
  const [severityLevels, setSeverityLevels] = React.useState<SeverityLevel[]>(
    [],
  );
  const [loading, setLoading] = React.useState(true);
  const [frameModalOpen, setFrameModalOpen] = React.useState(false);
  const [selectedFrame, setSelectedFrame] = React.useState<string | null>(null);
  const [selectedFrameType, setSelectedFrameType] = React.useState<
    "image" | "video"
  >("image");
  const [videoTimeRange, setVideoTimeRange] = React.useState<{
    start: number;
    end: number;
  } | null>(null);
  const [croppedVideoUrl, setCroppedVideoUrl] = React.useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [metaData, setMetaData] = React.useState<any>(null);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const loadMoreTriggerRef = React.useRef<HTMLDivElement | null>(null);
  const snackbar = useSnackbar();

  const loadAlerts = async (append = false, cursor: any = null) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
      }

      const filters: Record<string, any> = {
        limit: 10,
      };

      if (filterType !== "all") {
        filters["severityLevelId"] = Number(filterType);
      }

      if (debouncedSearchQuery.trim() !== "") {
        filters["title"] = debouncedSearchQuery.trim();
      }

      if (viewMode !== "all") {
        const now = new Date();
        let startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(viewMode));
        filters["startDatetime"] = startDate.toISOString();
        filters["endDatetime"] = now.toISOString();
      }

      // Add cursor for pagination
      if (cursor) {
        Object.assign(filters, {
          cursorDetectedObjectsId: cursor.cursor_detectedobjectsid,
          cursorFrameId: cursor.cursor_frameid,
        });
      }

      const response = await fetchAllAlerts({ filters });

      // Transform API data to UI format
      const transformedAlerts = response?.alerts?.map((alert, index) => ({
        id: alert.DetectedObjectsId || index + 1,
        title: `${alert.ClassName} Detected`,
        description: `${alert.ClassName} detected with ${(Number(alert.ConfidenceValue) * 100).toFixed(2)}% confidence`,
        location:
          alert.LocationName || alert.SourceName || `Camera ${alert.SourceId}`,
        time: MomentUtils.fromNow(alert.Timestamp),
        timestamp: MomentUtils.formatDateTime(alert.Timestamp),
        severity: alert.SeverityLevel || "info",
        AlertStatus: alert.AlertStatus,
        isOverdue: false,
        FrameId: alert.FrameId,
        capturedFrame: alert.CapturedFrame,
        confidence: alert.ConfidenceValue,
        actions:
          alert.AlertStatus === ALERT_STATUSES.UN_ACKNOWLEDGED
            ? [INCIDENT_ACTION.ACKNOWLEDGE, INCIDENT_ACTION.CREATE_INCIDENT, INCIDENT_ACTION.VIEW_FOOTAGE]
            : alert.AlertStatus === ALERT_STATUSES.ACKNOWLEDGED
              ? [INCIDENT_ACTION.RESOLVED, INCIDENT_ACTION.CREATE_INCIDENT, INCIDENT_ACTION.VIEW_FOOTAGE]
              : [],
        rawData: alert,
      }));

      // Append or replace alerts
      if (append) {
        setAlerts((prev) => [...prev, ...transformedAlerts]);
      } else {
        setAlerts(transformedAlerts);
      }

      // Update pagination metadata
      setMetaData(response.metaData || null);
    } catch (error) {
      if (!append) {
        setAlerts([]);
      }
    } finally {
      if (append) {
        setIsLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  React.useEffect(() => {
    setMetaData(null);
    loadAlerts(false, null);
  }, [filterType, debouncedSearchQuery, viewMode]);

  React.useEffect(() => {
    const triggerElement = loadMoreTriggerRef.current;
    if (!triggerElement || !metaData?.has_more) return;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry && entry.isIntersecting && !isLoadingMore && !loading) {
        loadAlerts(true, metaData.next_cursor);
      }
    };

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: "200px",
      threshold: 0.1,
    });

    observer.observe(triggerElement);

    return () => {
      observer.disconnect();
    };
  }, [metaData?.has_more, isLoadingMore, loading]);

  React.useEffect(() => {
    const loadDataSeverity = async () => {
      try {
        const [severityData] = await Promise.all([fetchSeverityLevels()]);
        setSeverityLevels(severityData);
      } catch (error) {
        setSeverityLevels([]);
      }
    };
    loadDataSeverity();
  }, []);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case SEVERITY_LEVELS.CRITICAL:
        return XCircle;
      case SEVERITY_LEVELS.HIGH:
        return AlertTriangle;
      case SEVERITY_LEVELS.MEDIUM:
        return AlertCircle;
      default:
        return AlertCircle;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case SEVERITY_LEVELS.CRITICAL:
        return "bg-red-500";
      case SEVERITY_LEVELS.HIGH:
        return "bg-yellow-500";
      case SEVERITY_LEVELS.MEDIUM:
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadge = (alert: (typeof alerts)[0]) => {
    if (alert.AlertStatus === ALERT_STATUSES.RESOLVED) {
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800"
        >
          {alert.AlertStatus.toUpperCase()}
        </Badge>
      );
    }
    if (alert.AlertStatus === ALERT_STATUSES.UN_ACKNOWLEDGED) {
      return <Badge variant="destructive">{alert.AlertStatus.toUpperCase()}</Badge>;
    }
    if (alert.AlertStatus === ALERT_STATUSES.ACKNOWLEDGED) {
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800"
        >
          {alert.AlertStatus.toUpperCase()}
        </Badge>
      );
    }
    return null;
  };

  const handleViewFootage = async (alert: Alert) => {
    // based on url extension, determine if image or video
    const isImage = alert.FrameFileUrl.match(
      /\.(jpeg|jpg|gif|png|bmp|webp|tiff)$/i,
    );
    const isVideo = alert.FrameFileUrl.match(
      /\.(mp4|mov|wmv|flv|avi|mkv|webm|ogg)$/i,
    );
    setSelectedFrameType(isVideo ? "video" : "image");
    setSelectedFrame(
      isVideo
        ? alert.FrameFileUrl
        : isImage
          ? alert.FrameFileUrl
          : `data:image/jpeg;base64,${alert.CapturedFrame}`,
    );

    // Set video time range if provided (in seconds)
    if (isVideo) {
      // The example video URL
      const url = alert.FrameFileUrl;
      // 1. Extract the segment with time using regex
      const match = url.match(new RegExp(process.env.NEXT_PUBLIC_FRAME_URL_TIME_REGEX || ''));

      if (match) {
        const startStr = match[1]; // "2025-12-28 10 AM"
        const start =MomentUtils.formatDateTime(`${startStr}`, process.env.NEXT_PUBLIC_FRAME_URL_TIME_FORMAT);
        const startTimestamp = start.valueOf(); // Milliseconds since epoch
        const objectTime = MomentUtils.formatDateTime(`${alert.DetectedObjectCreatedDateTime}`, process.env.NEXT_PUBLIC_FRAME_URL_TIME_FORMAT);
        const objectTimestamp = objectTime.valueOf();
        const videoPlayTime = (Number(objectTimestamp) - Number(startTimestamp)) / 1000; // in seconds
        const startTime = videoPlayTime; // in seconds
        const endTime = videoPlayTime + Number(process.env.NEXT_PUBLIC_DEFAULT_VIDEO_CROP_SECONDS || 30); // in seconds
        setVideoTimeRange({ start: startTime, end: endTime });
        setCroppedVideoUrl(alert.FrameFileUrl);
      }
    } else {
      setVideoTimeRange(null);
      setCroppedVideoUrl(null);
    }

    setFrameModalOpen(true);
  };

  const handleOnPress = async (action: string, alert: Alert) => {
    if (action === INCIDENT_ACTION.CREATE_INCIDENT) {
      // Store alert data in sessionStorage for the create incident page
      setCurrentAlert(alert);
      router.push(ROUTES.MONITOR.INCIDENTS_CREATE);
    } else if (action === INCIDENT_ACTION.ACKNOWLEDGE) {
      setSelectedAlertId(alert.DetectedObjectsId);
      setAcknowledgeModalOpen(true);
      setResponseReason("");
    } else if (action === INCIDENT_ACTION.VIEW_FOOTAGE) {
      handleViewFootage(alert);
    } else if (action === INCIDENT_ACTION.RESOLVED) {
      // Directly mark as resolved
     try {
       await updateAlert({
        detectedObjectsId: alert.DetectedObjectsId,
        acknowledgeDescription: "",
        alertStatusId: 3, // 3 for Resolved status
      });
      snackbar.success(UI_MESSAGES.alerts.resolveSuccess);
      // after mark as resolved,  update status in UI
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alert.DetectedObjectsId
            ? { ...a, AlertStatus: ALERT_STATUSES.RESOLVED, AlertStatusId: 3, actions: [] }
            : a,
        ),
      );
     } catch (error: any) {
       snackbar.error(UI_MESSAGES.alerts.resolveError);
     }
    }
  };

  const handleOnSubmitAcknowledgement = async () => {
    if (!responseReason.trim()) {
      return;
    }
    if (!selectedAlertId) {
      return;
    }

    try {
      setIsSubmitting(true);
      await updateAlert({
        detectedObjectsId: selectedAlertId,
        acknowledgeDescription: responseReason.trim(),
        alertStatusId: 2, // 2 for Acknowledged status
      });

      // Update alert status in UI
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === selectedAlertId
            ? {
                ...a,
                AlertStatus: ALERT_STATUSES.ACKNOWLEDGED,
                AlertStatusId: 2,
                actions: [INCIDENT_ACTION.RESOLVED, INCIDENT_ACTION.CREATE_INCIDENT, INCIDENT_ACTION.VIEW_FOOTAGE],
              }
            : a,
        ),
      );
      // Close modal and reset
      setAcknowledgeModalOpen(false);
      setResponseReason("");
      setSelectedAlertId(null);
      snackbar.success(UI_MESSAGES.alerts.acknowledgeSuccess);
    } catch (error: any) {
      snackbar.error(UI_MESSAGES.alerts.acknowledgeError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = () => {
    setMetaData(null);
    loadAlerts(false, null);
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {UI_MESSAGES.monitor.alertManagementTitle}
            </h1>
            <p className="text-muted-foreground mt-1">
              {UI_MESSAGES.monitor.alertManagementSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search - Single Row with Alert Badges */}
      <Card className="relative z-[500] overflow-visible">
        <CardContent className="p-4 overflow-visible">
          <div className="flex flex-row items-center gap-4 flex-nowrap">
            <div className="flex-shrink-0">
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="2">Last 2 Days</SelectItem>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter by severity level */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onPress={() => setFilterType("all")}
                className="px-4"
              >
                All Alerts
              </Button>
              {severityLevels.map((level) => (
                <Button
                  key={level.SeverityLevelId}
                  variant={
                    filterType === level.SeverityLevelId.toString()
                      ? "destructive"
                      : "outline"
                  }
                  size="sm"
                  onPress={() =>
                    setFilterType(level.SeverityLevelId.toString())
                  }
                  className="px-3 py-1"
                >
                  {level.SeverityLevelName}
                </Button>
              ))}
            </div>

            <div className="relative flex-1 min-w-0">
              <Icon
                icon={Search}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10"
              />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="pl-10 w-full"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onPress={() => handleRefresh()}
              className="h-9 flex-row items-center"
            >
              <Icon icon={RefreshCw} className="h-4 w-4 mr-2" />
              <span>Refresh</span>
            </Button>

            {/* <div className="flex-shrink-0 flex items-center gap-2">
              <Badge variant="destructive" className="px-3 py-1">
                {criticalCount} Critical
              </Badge>
              <Badge
                variant="outline"
                className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800 px-3 py-1"
              >
                {warningCount} Warnings
              </Badge>
            </div> */}
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4 relative z-0">
        {loading ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Loading alerts...
            </CardContent>
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id} className="relative z-0 overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-4">
                  {/* Severity Icon */}
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${getSeverityColor(alert.severity)} shrink-0`}
                  >
                    <Icon
                      icon={getSeverityIcon(alert.severity)}
                      className="h-5 w-5 text-white"
                    />
                  </div>

                  {/* Alert Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1.5">
                          {alert.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {alert.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {getStatusBadge(alert)}
                      </div>
                    </div>

                    {/* Location, Time, Confidence, and Timestamp - Single Row, Justified */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Icon icon={Camera} className="h-4 w-4" />
                        <span>{alert.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Icon icon={Clock} className="h-4 w-4" />
                        <span>{alert.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Icon icon={AlertTriangle} className="h-4 w-4" />
                        <span>Confidence: {(Number(alert.confidence) * 100).toFixed(2)}%</span>
                      </div>
                      {/* <div className="flex items-center gap-1.5">
                      <span className="text-xs">{alert.timestamp}</span>
                    </div> */}
                    </div>

                    {/* Action Buttons */}
                    {alert.actions.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        {alert.actions.map((action: string, index: number) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onPress={() => handleOnPress(action, alert.rawData)}
                            className="h-9"
                          >
                            {action}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {/* Load More Trigger for Infinite Scroll */}
        {metaData?.has_more && (
          <div ref={loadMoreTriggerRef} className="py-4">
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                {isLoadingMore ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    <span>Loading more alerts...</span>
                  </div>
                ) : (
                  <span>Scroll to load more</span>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {alerts.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Icon
                icon={AlertCircle}
                className="h-12 w-12 text-muted-foreground mx-auto mb-4"
              />
              <p className="text-sm font-medium text-foreground mb-1">
                No alerts found
              </p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Acknowledge Critical Alert Modal */}
      <Dialog
        open={acknowledgeModalOpen}
        onOpenChange={setAcknowledgeModalOpen}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive">
                <Icon icon={XCircle} className="h-5 w-5 text-white" />
              </div>
              <DialogTitle>
                Critical Alert - Response Reason Required
              </DialogTitle>
            </div>
            <DialogDescription className="mt-3">
              Critical alerts require a response reason before acknowledgment.
              This ensures proper documentation and accountability.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Why are you acknowledging this critical alert?
              </p>
              <Textarea
                placeholder="Describe your immediate response plan and actions being taken..."
                value={responseReason}
                onChangeText={setResponseReason}
                rows={5}
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                This response will be logged for audit trail and quality
                compliance purposes.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onPress={() => {
                setAcknowledgeModalOpen(false);
                setResponseReason("");
                setSelectedAlertId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onPress={async () => handleOnSubmitAcknowledgement()}
              disabled={!responseReason.trim() || isSubmitting}
            >
              {isSubmitting ? "Acknowledging..." : "Acknowledge Critical Alert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Footage Modal */}
      <Dialog open={frameModalOpen} onOpenChange={setFrameModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <Icon icon={Eye} className="h-5 w-5 text-white" />
              </div>
              <DialogTitle>
                {selectedFrameType === "image"
                  ? "Captured Frame"
                  : "Video Footage"}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="py-4">
            {selectedFrame ? (
              <div className="relative w-full bg-black rounded-lg overflow-hidden">
                {selectedFrameType === "image" ? (
                  <img
                    src={selectedFrame}
                    alt="Captured Frame"
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                ) : (
                  croppedVideoUrl &&
                  videoTimeRange && (
                    <TrimmedVideoPlayer
                      videoUrl={croppedVideoUrl}
                      startTime={videoTimeRange.start}
                      endTime={videoTimeRange.end}
                    />
                  )
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                <p className="text-muted-foreground">
                  No {selectedFrameType === "image" ? "frame" : "video"} data
                  available
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onPress={() => {
                setFrameModalOpen(false);
                setSelectedFrame(null);
                setSelectedFrameType("image");
                setVideoTimeRange(null);
                setCroppedVideoUrl(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
