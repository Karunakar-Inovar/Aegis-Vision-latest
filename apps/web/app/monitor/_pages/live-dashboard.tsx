"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
  Icon,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  Snackbar,
  useSnackbar,
  VideoPlayer,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "ui";
import {
  fetchPipelines,
  type PipelineDetail,
} from "app/utils/pipeline";
import { fetchAllAlerts, type Alert } from "app/utils/alert";
import {
  Search,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Camera,
  Maximize2,
  Square,
  RefreshCw,
  Play,
  X,
} from "ui/src/utils/icons";
import {
  PIPELINE_STATUSES,
  SEVERITY_LEVELS,
  STATUS,
  UI_MESSAGES,
} from "app/constants";

const LIVE_BASE_ROUTE = "/monitor/live";

export default function MonitorLiveDashboard() {
  const router = useRouter();
  const [selectedPipeline, setSelectedPipeline] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [layout, setLayout] = React.useState("2x2");
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showStopDialog, setShowStopDialog] = React.useState(false);
  const [pipelines, setPipelines] = React.useState<PipelineDetail[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingAlerts, setIsLoadingAlerts] = React.useState(true);
  const [alerts, setAlerts] = React.useState<Alert[]>([]);
  const videoPlayerRefs = React.useRef<Map<number, any>>(new Map());
  const snackbar = useSnackbar();
  const [cameraDrawerOpen, setCameraDrawerOpen] = React.useState(false);
  const [cameraSearch, setCameraSearch] = React.useState("");
  const [filterSheetOpen, setFilterSheetOpen] = React.useState(false);
  
  // Filter mode: "usecase" or "zone"
  const [filterMode, setFilterMode] = React.useState<"usecase" | "zone">("usecase");
  
  // Draft filters (editing state - shown in filter sheet)
  const [draftFilters, setDraftFilters] = React.useState({
    useCase: [] as string[],
    pipeline: [] as string[],
    zone: [] as string[],
    camera: [] as string[],
    status: [] as string[],
  });
  
  // Applied filters (active state - used for actual filtering)
  const [appliedFilters, setAppliedFilters] = React.useState({
    useCase: [] as string[],
    pipeline: [] as string[],
    zone: [] as string[],
    camera: [] as string[],
    status: [] as string[],
  });
  
  // Legacy filter state for drawer (keep for backward compatibility)
  const [filterArea, setFilterArea] = React.useState<string[]>([]);
  const [filterLine, setFilterLine] = React.useState<string[]>([]);
  const [filterStatus, setFilterStatus] = React.useState<string[]>([]);
  const [filterUseCase, setFilterUseCase] = React.useState<string[]>([]);
  const [filterCamera, setFilterCamera] = React.useState<string[]>([]);

  const loadPipelines = async () => {
    try {
      setIsLoading(true);
      const response = await fetchPipelines();
      setPipelines(response.pipeline || []);
    } catch (error: any) {
      setPipelines([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      setIsLoadingAlerts(true);
      const alertData = await fetchAllAlerts({
        filters: {
          limit: 3,
        },
      });
      // Limit to 3 alerts
      setAlerts(alertData.alerts);
    } catch (error: any) {
      setAlerts([]);
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  // Fetch pipelines from API
  React.useEffect(() => {
    loadPipelines();
    loadAlerts();
  }, []);

  // Sync draft filters with applied filters when sheet opens
  React.useEffect(() => {
    if (filterSheetOpen) {
      setDraftFilters({
        useCase: Array.isArray(appliedFilters.useCase) ? appliedFilters.useCase : [],
        pipeline: Array.isArray(appliedFilters.pipeline) ? appliedFilters.pipeline : [],
        zone: Array.isArray(appliedFilters.zone) ? appliedFilters.zone : [],
        camera: Array.isArray(appliedFilters.camera) ? appliedFilters.camera : [],
        status: Array.isArray(appliedFilters.status) ? appliedFilters.status : [],
      });
    }
  }, [filterSheetOpen, appliedFilters]);

  const alertingCameraIds = React.useMemo(() => {
    const ids = new Set<number>();
    alerts.forEach((alert: any) => {
      if (alert?.SourceId) {
        ids.add(Number(alert.SourceId));
      }
    });
    return ids;
  }, [alerts]);

  // Transform pipeline data into camera feeds
  const allCameraFeeds = React.useMemo(() => {
    const feeds: any[] = [];

    pipelines.forEach((pipeline) => {
      pipeline.InputSources?.forEach((source) => {
        feeds.push({
          id: source.SourceId,
          name: source.SourceName,
          location: source.LocationName,
          status: source.InputSourceStatus,
          pipeline: pipeline.PipelineName ?? pipeline.UseCaseName ?? "Line / Station",
          isActive: source.IsActive,
          pipelineId: pipeline.PipelineId,
          useCaseName: pipeline.UseCaseName,
          area: source.LocationName ?? "Unknown Area",
          line: pipeline.PipelineName ?? pipeline.UseCaseName ?? "Line / Station",
          isAlerting: alertingCameraIds.has(source.SourceId),
        });
      });
    });

    return feeds;
  }, [pipelines, alertingCameraIds]);

  const enrichedCameras = React.useMemo(() => {
    return pipelines.flatMap((pipeline) =>
      (pipeline.InputSources || []).map((source) => ({
        id: source.SourceId,
        name: source.SourceName,
        location: source.LocationName ?? "Unknown Area",
        status: source.InputSourceStatus,
        pipelineId: pipeline.PipelineId,
        pipelineName: pipeline.PipelineName ?? pipeline.UseCaseName ?? "Line / Station",
        area: source.LocationName ?? "Unknown Area",
        line: pipeline.PipelineName ?? pipeline.UseCaseName ?? "Line / Station",
        isAlerting: alertingCameraIds.has(source.SourceId),
        useCaseName: pipeline.UseCaseName ?? "Use Case",
      })),
    );
  }, [pipelines, alertingCameraIds]);

  const cameraStatusLabel = (camera: {
    status?: string;
    isAlerting?: boolean;
  }) => {
    if (camera.isAlerting) return "Alerting";
    if (camera.status === STATUS.ONLINE) return "Live";
    return "Offline";
  };

  // Get current pipeline info
  const currentPipeline = pipelines.find(
    (p) => p.PipelineId.toString() === selectedPipeline,
  );

  // Filter cameras based on selected pipeline
  const pipelineFilteredCameras =
    selectedPipeline === "all"
      ? allCameraFeeds
      : allCameraFeeds.filter(
          (camera) => camera.pipelineId?.toString() === selectedPipeline,
        );

  const totalIncidents = React.useMemo<number>(() => {
    return pipelines.reduce((total, item) => {
      if (
        selectedPipeline === "all" ||
        item.PipelineId.toString() === selectedPipeline
      ) {
        return total + (item.IncidentCount || 0);
      }
      return total;
    }, 0);
  }, [selectedPipeline, pipelines]);

  const totalAlerts = React.useMemo<number>(
    () =>
      pipelines.reduce((total, item) => {
        if (
          selectedPipeline === "all" ||
          item.PipelineId.toString() === selectedPipeline
        ) {
          return total + (item.AlertCount || 0);
        }
        return total;
      }, 0),
    [pipelines, selectedPipeline],
  );

  const notificationChannels = React.useMemo(
    () =>
      pipelines.reduce((acc, item) => {
        if (
          item.NotificationChannels &&
          (selectedPipeline === "all" ||
            item.PipelineId.toString() === selectedPipeline)
        ) {
          acc.push(...item.NotificationChannels);
        }
        return acc;
      }, [] as string[]),
    [pipelines, selectedPipeline],
  );

  const onlineCamerasCount = pipelineFilteredCameras.reduce(
    (count, camera) =>
      camera.status === STATUS.ONLINE ? count + 1 : count,
    0,
  );

  // Handler to update pipeline InputSource status when camera connects/disconnects
  const handleCameraStatusChange = React.useCallback(
    (cameraId: number, connectionStatus: string) => {
      setPipelines((prevPipelines) => {
        return prevPipelines.map((pipeline) => ({
          ...pipeline,
          InputSources: pipeline.InputSources?.map((source) => {
            if (source.SourceId === cameraId) {
              return {
                ...source,
                InputSourceStatus:
                  connectionStatus === "Connected"
                    ? STATUS.ONLINE
                    : STATUS.OFFLINE,
              };
            }
            return source;
          }),
        }));
      });
    },
    [],
  );

  // Compute available options based on current selections (drill-down logic)
  const availableUseCases = React.useMemo(() => {
    return Array.from(new Set(enrichedCameras.map((c) => c.useCaseName ?? "Use Case"))).sort();
  }, [enrichedCameras]);

  const availablePipelines = React.useMemo(() => {
    const useCaseFilters = Array.isArray(draftFilters.useCase) ? draftFilters.useCase : [];
    if (useCaseFilters.length === 0) return [];
    return pipelines
      .filter((p) => useCaseFilters.includes(p.UseCaseName ?? ""))
      .map((p) => ({
        id: p.PipelineId.toString(),
        name: p.PipelineName,
        useCaseName: p.UseCaseName ?? "",
      }));
  }, [pipelines, draftFilters.useCase]);

  const availableZones = React.useMemo(() => {
    const pipelineFilters = Array.isArray(draftFilters.pipeline) ? draftFilters.pipeline : [];
    if (pipelineFilters.length === 0) return [];
    const selectedPipelineIds = pipelineFilters.map(Number);
    return Array.from(
      new Set(
        pipelines
          .filter((p) => selectedPipelineIds.includes(p.PipelineId))
          .flatMap((p) =>
            (p.InputSources || []).map((s) => s.LocationName ?? "Unknown Area")
          )
      )
    ).sort();
  }, [pipelines, draftFilters.pipeline]);

  const availableCameras = React.useMemo(() => {
    const zoneFilters = Array.isArray(draftFilters.zone) ? draftFilters.zone : [];
    const pipelineFilters = Array.isArray(draftFilters.pipeline) ? draftFilters.pipeline : [];
    if (zoneFilters.length === 0) return [];
    const selectedPipelineIds = pipelineFilters.map(Number);
    return pipelines
      .filter((p) => selectedPipelineIds.includes(p.PipelineId))
      .flatMap((p) =>
        (p.InputSources || [])
          .filter((s) => zoneFilters.includes(s.LocationName ?? "Unknown Area"))
          .map((s) => ({
            id: s.SourceId.toString(),
            name: s.SourceName,
            zone: s.LocationName ?? "Unknown Area",
          }))
      );
  }, [pipelines, draftFilters.pipeline, draftFilters.zone]);

  // Reset downstream filters when parent changes
  const resetDownstream = React.useCallback((changedField: "useCase" | "pipeline" | "zone") => {
    setDraftFilters((prev) => {
      const next = {
        useCase: Array.isArray(prev.useCase) ? prev.useCase : [],
        pipeline: Array.isArray(prev.pipeline) ? prev.pipeline : [],
        zone: Array.isArray(prev.zone) ? prev.zone : [],
        camera: Array.isArray(prev.camera) ? prev.camera : [],
        status: Array.isArray(prev.status) ? prev.status : [],
      };
      switch (changedField) {
        case "useCase":
          next.pipeline = [];
          next.zone = [];
          next.camera = [];
          break;
        case "pipeline":
          next.zone = [];
          next.camera = [];
          break;
        case "zone":
          next.camera = [];
          break;
      }
      return next;
    });
  }, []);

  // Handle filter changes with downstream reset
  const handleUseCaseChange = React.useCallback((values: string[]) => {
    const safeValues = Array.isArray(values) ? values : [];
    setDraftFilters((prev) => ({
      ...prev,
      useCase: safeValues,
      pipeline: [],
      zone: [],
      camera: [],
    }));
  }, []);

  const handlePipelineChange = React.useCallback((values: string[]) => {
    const safeValues = Array.isArray(values) ? values : [];
    setDraftFilters((prev) => ({
      ...prev,
      pipeline: safeValues,
      zone: [],
      camera: [],
    }));
  }, []);

  const handleZoneChange = React.useCallback((values: string[]) => {
    const safeValues = Array.isArray(values) ? values : [];
    setDraftFilters((prev) => ({
      ...prev,
      zone: safeValues,
      camera: [],
    }));
  }, []);

  const handleCameraChange = React.useCallback((values: string[]) => {
    const safeValues = Array.isArray(values) ? values : [];
    setDraftFilters((prev) => ({ ...prev, camera: safeValues }));
  }, []);

  const handleStatusChange = React.useCallback((values: string[]) => {
    const safeValues = Array.isArray(values) ? values : [];
    setDraftFilters((prev) => ({ ...prev, status: safeValues }));
  }, []);

  // Filter cameras based on search query and applied filters
  const filteredCameras = React.useMemo(() => {
    return pipelineFilteredCameras.filter((camera) => {
      const matchesSearch =
        camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        camera.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Use case filter
      const useCaseFilters = Array.isArray(appliedFilters.useCase) ? appliedFilters.useCase : [];
      const matchesUseCase =
        useCaseFilters.length === 0 ||
        useCaseFilters.includes((camera as any).useCaseName);
      
      // Pipeline filter (if use case is selected)
      const pipelineFilters = Array.isArray(appliedFilters.pipeline) ? appliedFilters.pipeline : [];
      const matchesPipeline =
        useCaseFilters.length === 0 ||
        pipelineFilters.length === 0 ||
        pipelineFilters.includes(camera.pipelineId?.toString() ?? "");
      
      // Zone filter
      const zoneFilters = Array.isArray(appliedFilters.zone) ? appliedFilters.zone : [];
      const matchesZone =
        zoneFilters.length === 0 ||
        zoneFilters.includes(camera.area);
      
      // Camera filter
      const cameraFilters = Array.isArray(appliedFilters.camera) ? appliedFilters.camera : [];
      const matchesCamera =
        cameraFilters.length === 0 ||
        cameraFilters.includes(camera.name);
      
      // Status filter
      const statusFilters = Array.isArray(appliedFilters.status) ? appliedFilters.status : [];
      const statusLabel = cameraStatusLabel(camera);
      const matchesStatus =
        statusFilters.length === 0 ||
        statusFilters.some((fs) => statusLabel.toLowerCase() === fs.toLowerCase());

      return (
        matchesSearch &&
        matchesUseCase &&
        matchesPipeline &&
        matchesZone &&
        matchesCamera &&
        matchesStatus
      );
    });
  }, [
    pipelineFilteredCameras,
    searchQuery,
    appliedFilters,
  ]);

  const areaOptions = React.useMemo(
    () => Array.from(new Set(enrichedCameras.map((c) => c.area))).sort(),
    [enrichedCameras],
  );

  const lineOptions = React.useMemo(
    () => Array.from(new Set(enrichedCameras.map((c) => c.line))).sort(),
    [enrichedCameras],
  );

  const useCaseOptions = React.useMemo(
    () => Array.from(new Set(enrichedCameras.map((c) => c.useCaseName ?? "Use Case"))).sort(),
    [enrichedCameras],
  );

  const cameraOptions = React.useMemo(
    () => Array.from(new Set(allCameraFeeds.map((c) => c.name))).sort(),
    [allCameraFeeds],
  );

  const drawerFilteredCameras = React.useMemo(() => {
    return enrichedCameras.filter((camera) => {
      const matchesSearch =
        camera.name.toLowerCase().includes(cameraSearch.toLowerCase()) ||
        camera.location.toLowerCase().includes(cameraSearch.toLowerCase());
      const matchesArea = filterArea.length === 0 || filterArea.includes(camera.area);
      const matchesLine = filterLine.length === 0 || filterLine.includes(camera.line);
      const statusLabel = cameraStatusLabel(camera);
      const matchesStatus =
        filterStatus.length === 0 || filterStatus.some(fs => statusLabel.toLowerCase() === fs.toLowerCase());

      return matchesSearch && matchesArea && matchesLine && matchesStatus;
    });
  }, [enrichedCameras, cameraSearch, filterArea, filterLine, filterStatus]);

  const groupedCameras = React.useMemo(() => {
    const byArea = new Map<
      string,
      Map<string, typeof drawerFilteredCameras>
    >();
    drawerFilteredCameras.forEach((camera) => {
      const areaKey = camera.area || "Unknown Area";
      const lineKey = camera.line || "Line / Station";
      if (!byArea.has(areaKey)) {
        byArea.set(areaKey, new Map());
      }
      const lineMap = byArea.get(areaKey)!;
      if (!lineMap.has(lineKey)) {
        lineMap.set(lineKey, []);
      }
      lineMap.get(lineKey)!.push(camera);
    });
    return byArea;
  }, [drawerFilteredCameras]);

  const handleSelectCamera = React.useCallback(
    (camera: {
      pipelineId: number;
      name: string;
    }) => {
      setSelectedPipeline(String(camera.pipelineId));
      setSearchQuery(camera.name);
      setCameraDrawerOpen(false);
      setIsFullscreen(false);
    },
    [],
  );

  const goToFullscreen = React.useCallback(
    (camera: {
      id: number;
      pipelineId: number;
      name: string;
      location?: string;
      status?: string;
      pipeline?: string;
      isActive?: boolean;
    }) => {
      const params = new URLSearchParams({
        cameraId: String(camera.id),
        pipelineId: String(camera.pipelineId),
        cameraName: camera.name,
        location: camera.location || "",
        pipeline: camera.pipeline || "",
        status: camera.status || "",
        isActive: String(camera.isActive ?? false),
      });
      router.push(`${LIVE_BASE_ROUTE}/fullscreen?${params.toString()}`);
    },
    [router],
  );

  // Render camera grid component (reusable for both views)
  const renderCameraGrid = React.useCallback(
    () => (
      <div
        className={`grid grid-cols-1 gap-4 ${isFullscreen ? "h-full" : ""} ${
          layout === "2x2"
            ? "md:grid-cols-2"
            : layout === "3x3"
              ? "md:grid-cols-3"
              : "md:grid-cols-4"
        }`}
      >
        {filteredCameras.map((camera, index) => {
          const uniqueKey = `${camera.id}-${camera.pipelineId}`;
          const statusLabel = cameraStatusLabel(camera);
          const statusPillClasses =
            statusLabel === "Live"
              ? "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-600/20 dark:text-emerald-200 dark:border-emerald-500/50"
              : statusLabel === "Alerting"
                ? "bg-red-100 text-red-800 border border-red-200 dark:bg-red-600/20 dark:text-red-100 dark:border-red-500/50"
                : "bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-500/20 dark:text-gray-200 dark:border-gray-400/40";

          return (
            <Card
              key={uniqueKey}
              className="overflow-hidden rounded-2xl bg-card text-card-foreground shadow-lg border border-border/50"
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-foreground">{camera.name}</h3>
                    {camera.location && (
                      <p className="text-sm text-muted-foreground">{camera.location}</p>
                    )}
                    {camera.pipeline && (
                      <p className="text-sm text-muted-foreground">{camera.pipeline}</p>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusPillClasses}`}
                  >
                    {statusLabel}
                  </span>
                </div>

                <div className="group relative rounded-lg overflow-hidden bg-black aspect-video">
                  {statusLabel === "Live" && (
                    <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-lg bg-red-600 text-white px-2.5 py-1 text-xs font-semibold shadow-md z-10">
                      ● LIVE
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => goToFullscreen(camera)}
                    className="absolute right-3 top-3 inline-flex items-center justify-center rounded-md bg-black/60 hover:bg-black/70 text-white h-9 w-9 z-10"
                    aria-label="Open fullscreen view"
                  >
                    <Icon icon={Maximize2} className="h-4 w-4" />
                  </button>

                  <VideoPlayer
                    ref={(ref) => {
                      if (ref) {
                        videoPlayerRefs.current.set(uniqueKey, ref);
                      } else {
                        videoPlayerRefs.current.delete(uniqueKey);
                      }
                    }}
                    key={`video-player-${uniqueKey}-${index}`}
                    pipeline={camera.pipeline}
                    cameraId={camera.id}
                    pipelineId={camera.pipelineId}
                    cameraName={camera.name}
                    location={camera.location}
                    InputSourceStatus={camera.status}
                    autoStart={camera.isActive}
                    isActive={!camera.isActive}
                    showControls={true}
                    onFullscreen={() => goToFullscreen(camera)}
                    onStatusChange={(status) => {
                      handleCameraStatusChange(camera.id, status);
                    }}
                    className="absolute inset-0"
                    showFullscreenButton={false}
                  />

                  <div className="absolute inset-0 pointer-events-none" />
                </div>

                {camera.isAlerting && (
                  <div className="rounded-md border border-red-200 bg-red-50 text-red-800 px-3 py-2 text-sm font-semibold dark:border-red-500/30 dark:bg-red-600/20 dark:text-red-100">
                    Alert: Activity detected
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    ),
    [
      filteredCameras,
      layout,
      handleCameraStatusChange,
      snackbar,
      pipelines,
      selectedPipeline,
      pipelineFilteredCameras,
    ],
  );

  const handleFullscreen = () => {
    setIsFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
  };

  const handleStopPipeline = () => {
    setShowStopDialog(true);
  };

  const handleConfirmStop = async () => {
    try {
      snackbar.info(UI_MESSAGES.pipelines.pipelineStop);

      // Stop streaming on all cameras in the selected pipeline
      pipelineFilteredCameras.forEach((camera) => {
        const videoPlayer = videoPlayerRefs.current.get(camera.id);
        if (videoPlayer && videoPlayer.stopStream) {
          videoPlayer.stopStream();
        }
      });

      // Update the camera statuses to Offline
      setPipelines((prevPipelines) => {
        return prevPipelines.map((pipeline) => ({
          ...pipeline,
          InputSources: pipeline.InputSources?.map((source) => {
            if (pipeline.PipelineId.toString() === selectedPipeline) {
              return {
                ...source,
                InputSourceStatus: STATUS.ONLINE,
              };
            }
            return source;
          }),
        }));
      });

      setTimeout(() => {
        snackbar.success(UI_MESSAGES.pipelines.pipelineWithCameraStarted);
      }, 1000);
    } catch (error) {
      snackbar.warning(UI_MESSAGES.pipelines.startFailed);
    } finally {
      setShowStopDialog(false);
    }
  };

  const handleRefresh = async () => {
    snackbar.info(UI_MESSAGES.cameras.refresh);
    await loadPipelines();
    await loadAlerts();
    snackbar.success(UI_MESSAGES.cameras.refreshSuccess);
  };

  // Handler to apply filters
  const handleApplyFilters = React.useCallback(async () => {
    const safeFilters = {
      useCase: Array.isArray(draftFilters.useCase) ? draftFilters.useCase : [],
      pipeline: Array.isArray(draftFilters.pipeline) ? draftFilters.pipeline : [],
      zone: Array.isArray(draftFilters.zone) ? draftFilters.zone : [],
      camera: Array.isArray(draftFilters.camera) ? draftFilters.camera : [],
      status: Array.isArray(draftFilters.status) ? draftFilters.status : [],
    };
    setAppliedFilters(safeFilters);
    setFilterSheetOpen(false);
    snackbar.info("Applying filters...");
    await loadPipelines();
    snackbar.success("Filters applied successfully");
  }, [draftFilters, snackbar]);

  // Handler to clear all filters
  const handleClearAllFilters = React.useCallback(() => {
    const cleared = {
      useCase: [],
      pipeline: [],
      zone: [],
      camera: [],
      status: [],
    };
    setDraftFilters(cleared);
    setAppliedFilters(cleared);
  }, []);

  const handleStartPipeline = async () => {
    snackbar.info(UI_MESSAGES.pipelines.pipelineStarting);

    setPipelines((prevPipelines) => {
      return prevPipelines.map((pipeline) => ({
        ...pipeline,
        InputSources: pipeline.InputSources?.map((source) => {
          if (pipeline.PipelineId.toString() === selectedPipeline) {
            return {
              ...source,
              InputSourceStatus: STATUS.ONLINE,
            };
          }
          return source;
        }),
      }));
    });
    pipelineFilteredCameras.forEach((camera) => {
      const videoPlayer = videoPlayerRefs.current.get(camera.id);
      if (videoPlayer && videoPlayer.startStream) {
        videoPlayer.startStream();
      }
    });

    setTimeout(() => {
      snackbar.success(UI_MESSAGES.pipelines.startSuccessGeneral);
    }, 1000);
  };

  const displayAlerts = React.useMemo(() => {
    return alerts.map((alert) => ({
      id: alert.DetectedObjectsId,
      title: `${alert.ClassName} Detected`,
      location: alert.LocationName,
      time: alert.Timestamp
        ? new Date(alert.Timestamp).toLocaleString()
        : "",
      severity: alert.SeverityLevel,
      icon:
        alert.SeverityLevel === SEVERITY_LEVELS.CRITICAL
          ? XCircle
          : alert.SeverityLevel === SEVERITY_LEVELS.HIGH
            ? AlertTriangle
            : AlertCircle,
    }));
  }, [alerts]);

  return (
    <div className="flex w-full items-stretch gap-4 p-6">
      <div className="w-full min-w-0 flex-shrink-0 space-y-6">
      {/* Route table (Monitor IA)
        - /monitor/live (primary) ← old /monitor/dashboard redirects here
        - /monitor/alerts (alerts/timeline) ← old alert routes redirect here
        - /monitor/incidents
        - /monitor/shift (shift overview) ← old /monitor/summary redirects here
      */}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {UI_MESSAGES.monitor.liveDashboardTitle}
          </h1>
          <p className="text-muted-foreground">
            {UI_MESSAGES.monitor.liveDashboardSubtitle}
          </p>
        </div>
      </div>

      {/* All Cameras drawer */}
      <Sheet open={cameraDrawerOpen} onOpenChange={setCameraDrawerOpen}>
        <SheetContent side="right" className="w-full max-w-xl gap-4">
          <SheetHeader>
            <SheetTitle>All Cameras</SheetTitle>
            <SheetDescription>
              Search, filter, and open a camera feed in the live view.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-3">
            <Input
              placeholder="Search by name or location"
              value={cameraSearch}
              onChangeText={setCameraSearch}
              className="w-full"
            />

            <div className="grid gap-2 sm:grid-cols-3">
              <MultiSelect value={filterArea} onValueChange={setFilterArea}>
                <MultiSelectTrigger className="w-full">
                  <MultiSelectValue placeholder="Area" />
                </MultiSelectTrigger>
                <MultiSelectContent>
                  {areaOptions.map((area) => (
                    <MultiSelectItem key={area} value={area}>
                      {area}
                    </MultiSelectItem>
                  ))}
                </MultiSelectContent>
              </MultiSelect>

              <MultiSelect value={filterLine} onValueChange={setFilterLine}>
                <MultiSelectTrigger className="w-full">
                  <MultiSelectValue placeholder="Line / Station" />
                </MultiSelectTrigger>
                <MultiSelectContent>
                  {lineOptions.map((line) => (
                    <MultiSelectItem key={line} value={line}>
                      {line}
                    </MultiSelectItem>
                  ))}
                </MultiSelectContent>
              </MultiSelect>

              <MultiSelect value={filterStatus} onValueChange={setFilterStatus}>
                <MultiSelectTrigger className="w-full">
                  <MultiSelectValue placeholder="Status" />
                </MultiSelectTrigger>
                <MultiSelectContent>
                  <MultiSelectItem value="live">Live</MultiSelectItem>
                  <MultiSelectItem value="alerting">Alerting</MultiSelectItem>
                  <MultiSelectItem value="offline">Offline</MultiSelectItem>
                </MultiSelectContent>
              </MultiSelect>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onPress={() => {
                  setCameraSearch("");
                  setFilterArea([]);
                  setFilterLine([]);
                  setFilterStatus([]);
                }}
              >
                Clear filters
              </Button>
              <Button variant="outline" size="sm" onPress={() => setCameraDrawerOpen(false)}>
                Close
              </Button>
            </div>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-1">
            {groupedCameras.size === 0 && (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                No cameras match your filters.
              </div>
            )}

            {Array.from(groupedCameras.entries()).map(([area, lines]) => (
              <div key={area} className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-foreground">{area}</div>
                  <Badge variant="outline">{Array.from(lines.values()).reduce((acc, cams) => acc + cams.length, 0)} cams</Badge>
                </div>

                <div className="space-y-2">
                  {Array.from(lines.entries()).map(([line, cameras]) => (
                    <div key={line} className="rounded-md border border-border/60 p-2">
                      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                        <span>{line}</span>
                        <span>{cameras.length} cams</span>
                      </div>
                      <div className="mt-2 space-y-2">
                        {cameras.map((camera) => {
                          const statusLabel = cameraStatusLabel(camera);
                          const statusClass =
                            statusLabel === "Live"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : statusLabel === "Alerting"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-gray-50 text-gray-700 border-gray-200";

                          return (
                            <Button
                              key={camera.id}
                              variant="ghost"
                              className="flex w-full flex-row items-center justify-between rounded-md border border-border/60 px-3 py-2 text-left"
                              onPress={() => handleSelectCamera(camera)}
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-foreground">
                                  {camera.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {camera.location}
                                </span>
                              </div>
                              <Badge variant="outline" className={statusClass}>
                                {statusLabel}
                              </Badge>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <SheetFooter />
        </SheetContent>
      </Sheet>

      {/* Active Alerts Section (moved up for better flow) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Active Alerts
            </h2>
            <p className="text-sm text-muted-foreground">
              Latest detection events requiring attention
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onPress={() => router.push("/monitor/alerts")}
          >
            View All Alerts
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {displayAlerts.length > 0 ? (
            displayAlerts.map((alert) => {
              const borderClass =
                alert.severity === "Critical"
                  ? "border-red-300 dark:border-red-700/60"
                  : alert.severity === "High"
                    ? "border-amber-300 dark:border-amber-700/60"
                    : "border-blue-300 dark:border-blue-700/60";

              return (
                <div
                  key={alert.id}
                  className={`relative overflow-hidden rounded-2xl border bg-card group transition-all duration-300 ease-out ${borderClass}`}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  {/* Gradient Background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${
                      alert.severity === SEVERITY_LEVELS.CRITICAL
                        ? "from-red-500/20 via-red-400/10 to-transparent dark:from-red-500/15 dark:via-red-400/5"
                        : alert.severity === "High"
                          ? "from-amber-500/20 via-amber-400/10 to-transparent dark:from-amber-500/15 dark:via-amber-400/5"
                          : "from-blue-500/20 via-blue-400/10 to-transparent dark:from-blue-500/15 dark:via-blue-400/5"
                    }`}
                  />

                  {/* Animated Gradient Sweep */}
                  <div
                    className={`absolute inset-0 w-[200%] bg-gradient-to-r ${
                      alert.severity === SEVERITY_LEVELS.CRITICAL
                        ? "from-transparent via-red-400/30 to-transparent"
                        : alert.severity === "High"
                          ? "from-transparent via-amber-400/30 to-transparent"
                          : "from-transparent via-blue-400/30 to-transparent"
                    } -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out`}
                  />

                  {/* Content */}
                  <div className="relative z-10 p-4">
                    <h3 className="text-base font-semibold text-foreground mb-1.5 line-clamp-2">
                      {alert.title}
                    </h3>

                    <p className="text-xs text-muted-foreground mb-2">
                      {alert.location} • {alert.time}
                    </p>

                    <div
                      className={`inline-flex px-2 py-0.5 rounded-full border text-xs font-medium ${
                        alert.severity === SEVERITY_LEVELS.CRITICAL
                          ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                          : alert.severity === SEVERITY_LEVELS.HIGH
                            ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                            : "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                      }`}
                    >
                      {alert.severity}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-3 text-center py-8 text-muted-foreground">
              {isLoadingAlerts ? "Loading alerts..." : "No active alerts"}
            </div>
          )}
        </div>
      </div>

      {/* Search + Filters entry points (filters consolidated in sheet) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:w-auto">
          <Icon
            icon={Search}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            placeholder="Search cameras..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="pl-10 w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onPress={() => setFilterSheetOpen(true)} className="flex-row gap-2">
            <Icon icon={Camera} className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Filters sheet with drill-down */}
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent side="right" className="w-full max-w-lg gap-4 overflow-visible">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>
              Select filters step by step to narrow down your view.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6">
            {/* Filter Mode Toggle */}
            <Tabs value={filterMode} onValueChange={(v) => setFilterMode(v as "usecase" | "zone")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="usecase">Use Cases</TabsTrigger>
                <TabsTrigger value="zone">Zones</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Use Case Mode */}
            {filterMode === "usecase" && (
              <div className="space-y-4">
                {/* Step 1: Use Case */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">Use Case</p>
                    {Array.isArray(draftFilters.useCase) && draftFilters.useCase.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {draftFilters.useCase.length} selected
                      </Badge>
                    )}
                  </div>
                  <MultiSelect
                    value={Array.isArray(draftFilters.useCase) ? draftFilters.useCase : []}
                    onValueChange={handleUseCaseChange}
                  >
                    <MultiSelectTrigger className="w-full">
                      <MultiSelectValue placeholder="Select use cases" />
                    </MultiSelectTrigger>
                    <MultiSelectContent>
                      {availableUseCases.map((uc) => (
                        <MultiSelectItem key={uc} value={uc}>
                          {uc}
                        </MultiSelectItem>
                      ))}
                    </MultiSelectContent>
                  </MultiSelect>
                  {(!Array.isArray(draftFilters.useCase) || draftFilters.useCase.length === 0) && (
                    <p className="text-xs text-muted-foreground">
                      Select one or more use cases to continue
                    </p>
                  )}
                </div>

                {/* Step 2: Pipeline (only if use case selected) */}
                {Array.isArray(draftFilters.useCase) && draftFilters.useCase.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">Pipeline</p>
                      {Array.isArray(draftFilters.pipeline) && draftFilters.pipeline.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {draftFilters.pipeline.length} selected
                        </Badge>
                      )}
                    </div>
                    {availablePipelines.length === 0 ? (
                      <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                        No pipelines available for selected use cases
                      </div>
                    ) : (
                      <>
                        <MultiSelect
                          value={Array.isArray(draftFilters.pipeline) ? draftFilters.pipeline : []}
                          onValueChange={handlePipelineChange}
                        >
                          <MultiSelectTrigger className="w-full">
                            <MultiSelectValue placeholder="Select pipelines" />
                          </MultiSelectTrigger>
                          <MultiSelectContent>
                            {availablePipelines.map((p) => (
                              <MultiSelectItem key={p.id} value={p.id}>
                                {p.name}
                              </MultiSelectItem>
                            ))}
                          </MultiSelectContent>
                        </MultiSelect>
                        {(!Array.isArray(draftFilters.pipeline) || draftFilters.pipeline.length === 0) && (
                          <p className="text-xs text-muted-foreground">
                            Optional: Select pipelines to filter further
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Step 3: Zone/Area (only if pipeline selected) */}
                {Array.isArray(draftFilters.useCase) && draftFilters.useCase.length > 0 &&
                  Array.isArray(draftFilters.pipeline) && draftFilters.pipeline.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">Zone / Area</p>
                      {Array.isArray(draftFilters.zone) && draftFilters.zone.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {draftFilters.zone.length} selected
                        </Badge>
                      )}
                    </div>
                    {availableZones.length === 0 ? (
                      <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                        No zones available for selected pipelines
                      </div>
                    ) : (
                      <>
                        <MultiSelect
                          value={Array.isArray(draftFilters.zone) ? draftFilters.zone : []}
                          onValueChange={handleZoneChange}
                        >
                          <MultiSelectTrigger className="w-full">
                            <MultiSelectValue placeholder="Select zones" />
                          </MultiSelectTrigger>
                          <MultiSelectContent>
                            {availableZones.map((zone) => (
                              <MultiSelectItem key={zone} value={zone}>
                                {zone}
                              </MultiSelectItem>
                            ))}
                          </MultiSelectContent>
                        </MultiSelect>
                        {(!Array.isArray(draftFilters.zone) || draftFilters.zone.length === 0) && (
                          <p className="text-xs text-muted-foreground">
                            Optional: Select zones to filter further
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Step 4: Camera (only if zone selected) */}
                {Array.isArray(draftFilters.useCase) && draftFilters.useCase.length > 0 &&
                  Array.isArray(draftFilters.pipeline) && draftFilters.pipeline.length > 0 &&
                  Array.isArray(draftFilters.zone) && draftFilters.zone.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">Camera</p>
                        {Array.isArray(draftFilters.camera) && draftFilters.camera.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {draftFilters.camera.length} selected
                          </Badge>
                        )}
                      </div>
                      {availableCameras.length === 0 ? (
                        <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                          No cameras available for selected zones
                        </div>
                      ) : (
                        <>
                          <MultiSelect
                            value={Array.isArray(draftFilters.camera) ? draftFilters.camera : []}
                            onValueChange={handleCameraChange}
                          >
                            <MultiSelectTrigger className="w-full">
                              <MultiSelectValue placeholder="Select cameras" />
                            </MultiSelectTrigger>
                            <MultiSelectContent>
                              {availableCameras.map((cam) => (
                                <MultiSelectItem key={cam.id} value={cam.name}>
                                  {cam.name}
                                </MultiSelectItem>
                              ))}
                            </MultiSelectContent>
                          </MultiSelect>
                          {(!Array.isArray(draftFilters.camera) || draftFilters.camera.length === 0) && (
                            <p className="text-xs text-muted-foreground">
                              Optional: Select specific cameras
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}
              </div>
            )}

            {/* Zone Mode (direct zone selection) */}
            {filterMode === "zone" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Zone / Area</p>
                  <MultiSelect
                    value={Array.isArray(draftFilters.zone) ? draftFilters.zone : []}
                    onValueChange={(values) => {
                      const safeValues = Array.isArray(values) ? values : [];
                      setDraftFilters((prev) => ({
                        ...prev,
                        zone: safeValues,
                        camera: [], // Reset cameras when zone changes
                      }));
                    }}
                  >
                    <MultiSelectTrigger className="w-full">
                      <MultiSelectValue placeholder="Select zones" />
                    </MultiSelectTrigger>
                    <MultiSelectContent>
                      {Array.from(
                        new Set(enrichedCameras.map((c) => c.area))
                      )
                        .sort()
                        .map((zone) => (
                          <MultiSelectItem key={zone} value={zone}>
                            {zone}
                          </MultiSelectItem>
                        ))}
                    </MultiSelectContent>
                  </MultiSelect>
                </div>

                {/* Camera (if zone selected) */}
                {Array.isArray(draftFilters.zone) && draftFilters.zone.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Camera</p>
                    <MultiSelect
                      value={Array.isArray(draftFilters.camera) ? draftFilters.camera : []}
                      onValueChange={handleCameraChange}
                    >
                      <MultiSelectTrigger className="w-full">
                        <MultiSelectValue placeholder="Select cameras" />
                      </MultiSelectTrigger>
                      <MultiSelectContent>
                        {enrichedCameras
                          .filter((c) => Array.isArray(draftFilters.zone) && draftFilters.zone.includes(c.area))
                          .map((camera) => (
                            <MultiSelectItem key={camera.id} value={camera.name}>
                              {camera.name}
                            </MultiSelectItem>
                          ))}
                      </MultiSelectContent>
                    </MultiSelect>
                  </div>
                )}
              </div>
            )}

            {/* Always Available: Status */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Status</p>
              <MultiSelect
                value={Array.isArray(draftFilters.status) ? draftFilters.status : []}
                onValueChange={handleStatusChange}
              >
                <MultiSelectTrigger className="w-full">
                  <MultiSelectValue placeholder="All Statuses" />
                </MultiSelectTrigger>
                <MultiSelectContent>
                  <MultiSelectItem value="live">Live</MultiSelectItem>
                  <MultiSelectItem value="alerting">Alerting</MultiSelectItem>
                  <MultiSelectItem value="offline">Offline</MultiSelectItem>
                </MultiSelectContent>
              </MultiSelect>
            </div>

            {/* Always Available: Layout */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Layout</p>
              <div className="flex items-center gap-2">
                {["2x2", "3x3", "4x4"].map((layoutOption) => (
                  <Button
                    key={layoutOption}
                    variant={layout === layoutOption ? "default" : "outline"}
                    size="sm"
                    onPress={() => setLayout(layoutOption)}
                    className="min-w-[60px]"
                  >
                    {layoutOption}
                  </Button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-4 border-t">
              <Button variant="default" size="sm" onPress={handleApplyFilters}>
                Apply Filters
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={handleClearAllFilters}
                  className="flex-1"
                >
                  Clear All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => setFilterSheetOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Defect Detection Pipeline Section */}
      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon={Camera} className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">
                {isLoading
                  ? "Loading..."
                  : `${currentPipeline?.PipelineName || "All Pipelines"} (${onlineCamerasCount}/${pipelineFilteredCameras.length} Online)`}
              </CardTitle>
              {currentPipeline?.PipelineName &&
                (onlineCamerasCount > 0 ? (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                  >
                    {PIPELINE_STATUSES.RUNNING}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800"
                  >
                    {PIPELINE_STATUSES.STOPPED}
                  </Badge>
                ))}
            </div>
            <div className="flex items-center gap-2">
              <Button
                disabled
                variant="outline"
                size="sm"
                onPress={handleFullscreen}
                className="h-9 flex-row items-center"
              >
                <Icon icon={Maximize2} className="h-4 w-4 mr-2" />
                <span>Fullscreen Grid</span>
              </Button>
              {onlineCamerasCount > 0 ? (
                // Stop Pipeline button hidden for now
                null
              ) : (
                <Button
                  disabled={!currentPipeline?.PipelineName}
                  variant="default"
                  size="sm"
                  onPress={() => handleStartPipeline()}
                  className="h-9 flex-row items-center"
                >
                  <Icon icon={Play} className="h-4 w-4 mr-2" />
                  <span>Start Pipeline</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onPress={handleRefresh}
                className="h-9 flex-row items-center"
              >
                <Icon icon={RefreshCw} className="h-4 w-4 mr-2" />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
          <CardDescription>
            Live camera feeds and detection statistics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Video Feeds Grid */}
          {filteredCameras.length > 0 ? (
            !isFullscreen && renderCameraGrid()
          ) : (
            <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {isLoading
                    ? "Loading camera feeds..."
                    : "No cameras found matching your search"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stop Pipeline Confirmation Dialog */}
      <AlertDialog open={showStopDialog} onOpenChange={setShowStopDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop Pipeline</AlertDialogTitle>
            <AlertDialogDescription>
              This will halt all camera feeds and detection processing. You can
              restart it at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onPress={handleConfirmStop}>
                Stop Pipeline
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Fullscreen Grid Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="flex h-full w-full flex-col">
            {/* Fullscreen Header */}
            <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
              <div className="flex items-center gap-2">
                <Icon icon={Camera} className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">
                  Camera Grid - Fullscreen
                </h2>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                >
                  {layout}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onPress={handleCloseFullscreen}
              >
                <Icon icon={X} className="h-5 w-5" />
              </Button>
            </div>

            {/* Fullscreen Grid Content */}
            <div className="flex-1 overflow-auto p-6">
              {filteredCameras.length > 0 ? (
                renderCameraGrid()
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      No camera feeds available
                    </p>
                  </div>
                </div>
              )}
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
    </div>
  );
}
