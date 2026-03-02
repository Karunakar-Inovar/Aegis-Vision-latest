"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  Button,
  Icon,
  Badge,
  Alert,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  ToggleSwitch,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  useSnackbar,
  Snackbar,
} from "ui";
import {
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  Camera,
  CalendarIcon,
  Brain,
  FileText,
  Play,
  Pause,
  Download,
  ExternalLink,
  Save,
} from "ui/utils/icons";
import {
  fetchIncidentStatuses,
  fetchIncidents,
  updateIncident,
  type Incident,
  MomentUtils,
  getCurrentUser,
} from "app";
import { fetchUsers } from "app/utils/user";

const assignedToOptions: Array<{ value: string; label: string }> = [];

export function IncidentDetailPage({
  incidentId,
  backHref,
  mode,
}: {
  incidentId: number;
  backHref: string;
  mode: "admin" | "monitor";
}) {
  const router = useRouter();
  const snackbar = useSnackbar();

  const [isPlaying, setIsPlaying] = useState(false);
  const [notes, setNotes] = useState("");
  const [highlightForNextShift, setHighlightForNextShift] = useState(false);
  const [status, setStatus] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [assignedToName, setAssignedToName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [pendingCloseStatus, setPendingCloseStatus] = useState<
    "Resolved" | "False Positive" | null
  >(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusOptions, setStatusOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [incident, setFetchedIncident] = useState<Incident | null>(null);
  const [isLoadingIncident, setIsLoadingIncident] = useState(true);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Get attachment data from incident
  const attachment = useMemo(() => {
    if (!incident?.Attachments || incident.Attachments.length === 0) {
      return null;
    }
    return incident.Attachments[0];
  }, [incident]);

  // Fetch incident details by ID
  useEffect(() => {
    const loadIncidentDetails = async () => {
      setIsLoadingIncident(true);
      try {
        const response = await fetchIncidents({
          filters: {
            incidentId: incidentId,
          },
        });

        if (response.incidents && response.incidents.length > 0) {
          setFetchedIncident(response.incidents[0] ?? null);
          response.incidents[0]?.IncidentStatusId &&
            setStatus(`${response.incidents[0]?.IncidentStatusId}`);
        } else {
          setFetchedIncident(null);
        }
      } catch (error) {
        setFetchedIncident(null);
      } finally {
        setIsLoadingIncident(false);
      }
    };

    loadIncidentDetails();
  }, [incidentId]);

  // Fetch status options
  useEffect(() => {
    const loadStatusOptions = async () => {
      try {
        const statuses = await fetchIncidentStatuses();
        setStatusOptions(statuses);
      } catch (error) {
        // Fallback to default statuses
        setStatusOptions([]);
      }
    };
    const loadUserOptions = async () => {
      try {
        const users = await fetchUsers();
        const userOptions = users.map((user) => ({
          value: user.userid.toString(),
          label: user.name,
        }));
        assignedToOptions.push(...userOptions);
      } catch (error) {
        // Fallback to default assignedToOptions
      }
    };
    loadStatusOptions();
    loadUserOptions();
  }, []);

  const lastIncidentHistory =
    incident?.IncidentHistory && incident.IncidentHistory.length > 0
      ? incident.IncidentHistory[incident.IncidentHistory.length - 1]
      : null;
  // Initialize state from incident data
  useEffect(() => {
    if (lastIncidentHistory) {
      setNotes(lastIncidentHistory.notes || "");
      setAssignedTo(lastIncidentHistory.assignedTo?.id || "");
      setAssignedToName(lastIncidentHistory.assignedTo?.name || "");
      setLastSavedAt(lastIncidentHistory.dateTime || null);
    }
  }, [lastIncidentHistory]);

  // Handle video play/pause
  useEffect(() => {
    if (videoRef.current && attachment?.VideoPath) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, attachment?.VideoPath]);

  // Clear form error as user edits relevant fields
  useEffect(() => {
    setFormError(null);
  }, [status, assignedTo, notes]);

  const validateBeforeSave = () => {
    // Monitor users close incidents -> require accountability + reason
    if (!assignedTo || assignedTo === "unassigned") {
      return "Please assign this incident before closing it.";
    }
    if (!notes.trim()) {
      return "Please add notes before closing this incident.";
    }
    return null;
  };

  const handleSave = async () => {
    if (!incident) return;
    const error = validateBeforeSave();
    if (error) {
      setFormError(error);
      return;
    }

    const foundStatus = statusOptions.find((i) => i.value === status);
    const label = foundStatus?.label;
    if (label === "Resolved" || label === "False Positive") {
      setPendingCloseStatus(label);
      setConfirmCloseOpen(true);
      return;
    } else {
      setPendingCloseStatus(null);
    }

    // Save incident updates
    setIsSaving(true);
    try {
      const currentUser = getCurrentUser();
      const selectedUser = assignedToOptions.find(
        (u) => u.value === assignedTo,
      );
      const IncidentHistory = [];
      if (
        incident?.IncidentHistory &&
        Array.isArray(incident.IncidentHistory)
      ) {
        IncidentHistory.push(...incident.IncidentHistory);
      }
      IncidentHistory.push({
        assignedTo: {
          id: assignedTo,
          name: selectedUser?.label || assignedToName,
        },
        notes: notes,
        dateTime: new Date().toISOString(),
        updateBy: currentUser?.name || "System",
      });

      await updateIncident({
        incidentId: incident.IncidentId,
        incidentStatusId: parseInt(status),
        incidentHistory: IncidentHistory,
      });

      const now = new Date().toLocaleString();
      setLastSavedAt(now);
      snackbar.success("Incident updated successfully");
    } catch (error) {
      snackbar.error(
        error instanceof Error ? error.message : "Failed to update incident",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const confirmClose = async () => {
    if (!incident) return;
    const error = validateBeforeSave();
    if (error) {
      setFormError(error);
      setConfirmCloseOpen(false);
      setPendingCloseStatus(null);
      return;
    }

    setIsSaving(true);
    try {
      const currentUser = getCurrentUser();
      const selectedUser = assignedToOptions.find(
        (u) => u.value === assignedTo,
      );

      const IncidentHistory = [];
      if (
        incident?.IncidentHistory &&
        Array.isArray(incident.IncidentHistory)
      ) {
        IncidentHistory.push(...incident.IncidentHistory);
      }
      IncidentHistory.push({
        assignedTo: {
          id: assignedTo,
          name: selectedUser?.label || assignedToName,
        },
        notes: notes,
        dateTime: new Date().toISOString(),
        updateBy: currentUser?.name || "System",
      });

      await updateIncident({
        incidentId: incident.IncidentId,
        incidentStatusId: parseInt(status),
        incidentHistory: IncidentHistory,
      });

      const now = new Date().toLocaleString();
      setConfirmCloseOpen(false);
      setPendingCloseStatus(null);
    } catch (error) {
      snackbar.error(
        error instanceof Error ? error.message : "Failed to close incident",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "Critical":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-700 border-red-300 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800"
          >
            <Icon icon={AlertCircle} className="h-3 w-3 mr-1" />
            Critical
          </Badge>
        );
      case "High":
        return (
          <Badge
            variant="outline"
            className="bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/40 dark:text-orange-400 dark:border-orange-800"
          >
            <Icon icon={AlertTriangle} className="h-3 w-3 mr-1" />
            High
          </Badge>
        );
      case "Medium":
        return (
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800"
          >
            Medium
          </Badge>
        );
      case "Low":
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

  // Helper function to format seconds as MM:SS
  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle export/download of media files
  const handleExport = async (url: string, filename: string) => {
    try {
      snackbar.info("Starting export...");
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      snackbar.success("Export started");
    } catch (error) {
      snackbar.error("Failed to export file");
    }
  };

  // Calculate timeline position percentage
  const timelinePosition = useMemo(() => {
    if (videoDuration === 0) return 0;
    return (currentVideoTime / videoDuration) * 100;
  }, [currentVideoTime, videoDuration]);

  // Handle timeline click for seeking
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * videoDuration;
    videoRef.current.currentTime = newTime;
    setCurrentVideoTime(newTime);
  };

  // Show loading state while fetching
  if (isLoadingIncident) {
    return (
      <div className="space-y-6 p-6">
        <Button
          variant="ghost"
          size="sm"
          className="flex-row items-center"
          onPress={() => router.push(backHref)}
        >
          <Icon icon={ArrowLeft} className="h-4 w-4 mr-2" />
          Back to Incidents
        </Button>
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center gap-2">
              <Icon
                icon={Clock}
                className="h-10 w-10 text-muted-foreground mb-2 animate-spin"
              />
              <p className="font-medium text-foreground">
                Loading incident details...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="space-y-6 p-6">
        <Button
          variant="ghost"
          size="sm"
          className="flex-row items-center"
          onPress={() => router.push(backHref)}
        >
          <Icon icon={ArrowLeft} className="h-4 w-4 mr-2" />
          Back to Incidents
        </Button>
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center gap-2">
              <Icon
                icon={AlertCircle}
                className="h-10 w-10 text-muted-foreground mb-2"
              />
              <p className="font-medium text-foreground">Incident not found</p>
              <p className="text-sm text-muted-foreground max-w-md">
                The incident you are trying to view does not exist in the
                current dataset.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fallbackPos = { left: "20%", top: "40%", width: "15%", height: "20%" };
  const positions = [
    fallbackPos,
    { left: "60%", top: "35%", width: "20%", height: "25%" },
  ];
  const pos = positions[0] ?? fallbackPos;

  return (
    <div className="space-y-6 p-6">
      <Dialog open={confirmCloseOpen} onOpenChange={setConfirmCloseOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirm closure</DialogTitle>
            <DialogDescription>
              You are about to mark this incident as{" "}
              <span className="font-medium text-foreground">
                {pendingCloseStatus}
              </span>
              . This action should include a clear note explaining the outcome.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={isSaving}
              onPress={() => {
                setConfirmCloseOpen(false);
                setPendingCloseStatus(null);
              }}
            >
              Cancel
            </Button>
            <Button onPress={confirmClose} disabled={isSaving}>
              {isSaving ? "Closing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        className="flex-row items-center"
        onPress={() => router.push(backHref)}
      >
        <Icon icon={ArrowLeft} className="h-4 w-4 mr-2" />
        Back to Incidents
      </Button>

      {/* Main Content - Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        {/* Left Column - Evidence Playback */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Evidence Playback
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Incident occurred at{" "}
                    {MomentUtils.formatDate(incident.CreatedDateTime)} at{" "}
                    {MomentUtils.formatTime(incident.CreatedDateTime)} on{" "}
                    {incident.SourceName}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-xs bg-muted text-muted-foreground"
                >
                  Export actions are audited
                </Badge>
              </div>
            </div>

            {/* Video/Image Player Area */}
            <div className="relative bg-black aspect-video">
              {/* Alert Banner */}
              <div className="absolute top-0 left-0 right-0 bg-red-600 text-white px-4 py-2 z-10">
                <div className="flex items-center gap-2">
                  <Icon icon={AlertTriangle} className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {incident.IncidentTypeName}
                  </span>
                </div>
              </div>

              {/* Media Content */}
              {attachment?.VideoPath ? (
                /* Video Player */
                <video
                  ref={videoRef}
                  src={attachment.VideoPath}
                  className="w-full h-full object-contain"
                  controls={false}
                  playsInline
                  onEnded={() => setIsPlaying(false)}
                  onTimeUpdate={(e) =>
                    setCurrentVideoTime(e.currentTarget.currentTime)
                  }
                  onLoadedMetadata={(e) =>
                    setVideoDuration(e.currentTarget.duration)
                  }
                />
              ) : attachment?.ImagePath ? (
                /* Image Display */
                <img
                  src={attachment.ImagePath}
                  alt="Incident Evidence"
                  className="w-full h-full object-contain"
                />
              ) : (
                /* Placeholder when no media */
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Icon
                      icon={Camera}
                      className="h-16 w-16 mx-auto mb-4 opacity-50"
                    />
                    <p className="text-lg font-medium">No Evidence Available</p>
                    <p className="text-sm opacity-75">
                      No media attached to this incident
                    </p>
                  </div>
                </div>
              )}

              {/* Video Controls Overlay - Only show for videos */}
              {attachment?.VideoPath && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                      onPress={() => setIsPlaying(!isPlaying)}
                    >
                      <Icon
                        icon={isPlaying ? Pause : Play}
                        className="h-4 w-4 mr-2"
                      />
                      {isPlaying ? "Pause" : "Play"}
                    </Button>

                    {/* Timeline */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs text-white/75 mb-1">
                        <span>{formatTime(currentVideoTime)}</span>
                        <span>{formatTime(videoDuration)}</span>
                      </div>
                      <div
                        className="relative h-2 bg-white/20 rounded-full cursor-pointer"
                        onClick={handleTimelineClick}
                      >
                        <div
                          className="absolute left-0 top-0 h-full bg-red-500 rounded-full pointer-events-none"
                          style={{ width: `${timelinePosition}%` }}
                        />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full border-2 border-white pointer-events-none"
                          style={{ left: `${timelinePosition}%` }}
                        />
                      </div>
                    </div>

                    {/* Export Controls */}
                    <div className="flex items-center gap-2 ml-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                        onPress={() => {
                          if (attachment?.VideoPath) {
                            const filename = `incident_${incident.IncidentId}_video.mp4`;
                            handleExport(attachment.VideoPath, filename);
                          }
                        }}
                      >
                        <Icon icon={Download} className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                      >
                        <Icon icon={ExternalLink} className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Image Export Controls - Only show for images */}
              {attachment?.ImagePath && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                      onPress={() => {
                        if (attachment?.ImagePath) {
                          const filename = `incident_${incident.IncidentId}_image.jpg`;
                          handleExport(attachment.ImagePath, filename);
                        }
                      }}
                    >
                      <Icon icon={Download} className="h-4 w-4 mr-2" />
                      Export Image
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      <Icon icon={ExternalLink} className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Incident Details & Actions */}
        <div className="space-y-6">
          {/* Incident Summary */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h1 className="text-xl font-semibold text-foreground">
                      {incident.IncidentTitle}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                      Zone: {incident.LocationName}
                    </p>
                  </div>
                  {getSeverityBadge(incident.SeverityLevel)}
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon
                        icon={Brain}
                        className="h-4 w-4 text-muted-foreground"
                      />
                      <span className="text-xs text-muted-foreground">
                        Confidence
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-foreground">
                      {incident.ConfidencePercentage}%
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon
                        icon={Clock}
                        className="h-4 w-4 text-muted-foreground"
                      />
                      <span className="text-xs text-muted-foreground">
                        Status
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {incident.SeverityLevel}
                    </p>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Icon
                    icon={CalendarIcon}
                    className="h-4 w-4 text-muted-foreground"
                  />
                  <span className="text-sm text-muted-foreground">
                    {/* {incident.CreatedDateTime} */}
                    {MomentUtils.formatDate(incident.CreatedDateTime)} at{" "}
                    {MomentUtils.formatTime(incident.CreatedDateTime)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Behavior Analysis */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Behavior Analysis
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {incident.IncidentDescription}
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-6 space-y-4">
              {formError ? (
                <Alert variant="destructive">
                  <p className="text-sm">{formError}</p>
                </Alert>
              ) : null}

              <div className="grid gap-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Status</p>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Assigned To
                  </p>
                  <Select
                    value={assignedTo}
                    onValueChange={(value) => {
                      setAssignedTo(value);
                      const selectedUser = assignedToOptions.find(
                        (u) => u.value === value,
                      );
                      if (selectedUser) {
                        setAssignedToName(selectedUser.label);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignedToOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Notes</p>
                  <Textarea
                    placeholder="Add notes for this incident..."
                    value={notes}
                    onChangeText={setNotes}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Notes are required to close incidents.
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Highlight for next shift
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Shows up in shift handoff summary
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={highlightForNextShift}
                    onCheckedChange={setHighlightForNextShift}
                  />
                </div>
              </div>

              <Button
                onPress={handleSave}
                className="w-full"
                disabled={isSaving}
              >
                <Icon icon={Save} className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Updates"}
              </Button>

              <div className="text-xs text-muted-foreground">
                Last updated:{" "}
                {lastSavedAt ??
                  MomentUtils.formatDate(incident.CreatedDateTime)}{" "}
                by {MomentUtils.formatTime(incident.CreatedDateTime)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Snackbar for notifications */}
      <Snackbar
        visible={snackbar.state.visible}
        message={snackbar.state.message}
        variant={snackbar.state.variant}
        onClose={snackbar.hide}
      />
    </div>
  );
}
