"use client";

import { fetchInputSources } from "app/utils/inputsource";
import { fetchUseCases } from "app/utils/usecase";
import {
  fetchPipelines,
  createPipeline,
  updatePipeline,
  deletePipeline,
  startPipeline,
  stopPipeline,
  restartPipeline,
  type MetaData,
} from "app/utils/pipeline";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Button,
  Icon,
  Badge,
  Input,
  StatsCard,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Checkbox,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  Snackbar,
  useSnackbar,
} from "ui";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Pause,
  RefreshCw,
  Bell,
  Brain,
  Camera,
} from "ui/utils/icons";
import { getCurrentUser, MomentUtils, useDebounce } from "app";
import { PIPELINE_STATUSES, STATUS, UI_MESSAGES } from "app/constants";

// Pipeline type (extended from API)
interface Pipeline {
  id: number;
  name: string;
  useCase: string;
  useCaseId?: number;
  cameras: {
    total: number;
    online: number;
    cameraIds?: string[]; // Array of selected camera IDs
  };
  inputSourceId?: number;
  inputSourceName?: string;
  useCaseName: string;
  channels: number;
  status: string;
  isActive?: boolean;
  createdAt: string;
  description?: string;
}

// Get status badge
const getStatusBadge = (status: string) => {
  switch (status) {
    case PIPELINE_STATUSES.RUNNING:
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
        >
          {status}
        </Badge>
      );
    case PIPELINE_STATUSES.STOPPED:
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700"
        >
          {status}
        </Badge>
      );
    case PIPELINE_STATUSES.ERROR:
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
        >
          {status}
        </Badge>
      );
    default:
      return null;
  }
};

export default function PipelinesPage() {
  const snackbar = useSnackbar();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStopDialogOpen, setIsStopDialogOpen] = useState(false);
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [isRestartDialogOpen, setIsRestartDialogOpen] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
  const [pipelineToDelete, setPipelineToDelete] = useState<Pipeline | null>(
    null,
  );
  const [pipelineToStop, setPipelineToStop] = useState<Pipeline | null>(null);
  const [pipelineToStart, setPipelineToStart] = useState<Pipeline | null>(null);
  const [pipelineToRestart, setPipelineToRestart] = useState<Pipeline | null>(null);

  // Pipeline data state
  const [pipelinesData, setPipelinesData] = useState<Pipeline[]>([]);
  const [metaData, setMetaData] = useState<MetaData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<{
    [key: number]: "start" | "stop" | "restart" | undefined;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    useCase: "",
    cameras: [] as string[],
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    useCase: "",
    cameras: [] as string[],
  });

  // Unified loading state
  const [loading, setLoading] = useState({
    pipelines: true,
    options: true,
  });

  // Unified options state
  const [options, setOptions] = useState({
    cameras: [] as { value: string; label: string; status: string }[],
    useCases: [] as { value: string; label: string }[],
  });

  // Calculate stats
  const totalPipelines = metaData?.total_count || 0;
  const runningPipelines = pipelinesData.filter(
    (p) => p.cameras.online > 0,
  ).length;
  const errorPipelines = pipelinesData.filter(
    (p) => p.status === PIPELINE_STATUSES.ERROR,
  ).length;
  const stoppedPipelines = pipelinesData.filter(
    (p) => p.cameras.online === 0,
  ).length;

  const loadPipelines = async () => {
    try {
      setLoading((l) => ({ ...l, pipelines: true }));
      const response = await fetchPipelines(
        debouncedSearchQuery
          ? { filters: { pipelineName: debouncedSearchQuery } }
          : {},
      );

      const pipelines: Pipeline[] = response.pipeline.map((p) => ({
        id: p.PipelineId,
        name: p.PipelineName,
        useCase: `${p.UseCaseName}`,
        cameras: p.InputSources.reduce(
          (acc, c) => {
            return {
              total: p?.TotalInputSourceCount || 0,
              online: p?.ActiveInputSourceCount || 0,
              cameraIds: [...(acc.cameraIds || []), c.SourceId.toString()],
            };
          },
          {
            total: 0,
            online: 0,
            cameraIds: [] as string[],
          },
        ),
        inputSourceId: p.InputSourceId,
        inputSourceName: p.InputSourceName,
        useCaseId: p.UseCaseId,
        useCaseName: p.UseCaseName,
        channels: 1,
        status: p.IsActive ? PIPELINE_STATUSES.RUNNING : PIPELINE_STATUSES.STOPPED,
        isActive: p.IsActive,
        createdAt: `${p.CreatedDateTime}`,
      }));

      setPipelinesData(pipelines);
      setMetaData(response.metaData || null);
    } catch (error) {
      snackbar.error(UI_MESSAGES.pipelines.loadFailed);
      setPipelinesData([]);
    } finally {
      setLoading((l) => ({ ...l, pipelines: false }));
    }
  };

  // Fetch pipelines
  useEffect(() => {
    loadPipelines();
  }, [debouncedSearchQuery]);

  // Optimized: Load all options in parallel
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading((l) => ({ ...l, options: true }));
        const [inputSourcesRes, useCasesRes] = await Promise.all([
          fetchInputSources({
            filters: {
              isActive: true,
            },
          }),
          fetchUseCases({
            filters: {
              isActive: true,
            },
          }),
        ]);

        setOptions({
          cameras: [
            ...inputSourcesRes.inputSource.map((c) => ({
              value: c.SourceId.toString(),
              label: c.SourceName,
              status: `${c.InputSourceStatus}`,
            })),
          ],
          useCases: [
            ...useCasesRes.useCases.map((u) => ({
              value: u.UseCaseId.toString(),
              label: u.UseCaseName,
            })),
          ],
        });
      } catch (error) {
        snackbar.error(UI_MESSAGES.pipelines.loadOptionsFailed);
      } finally {
        setLoading((l) => ({ ...l, options: false }));
      }
    };

    loadOptions();
  }, []);

  const handleStop = (pipeline: Pipeline) => {
    setPipelineToStop(pipeline);
    setIsStopDialogOpen(true);
  };

  const handleConfirmStop = async () => {
    if (!pipelineToStop || actionLoading?.[pipelineToStop.id] === "stop") return;

    try {
      setActionLoading((prev) => {
        return { ...prev, [pipelineToStop.id]: "stop" };
      });
      setIsStopDialogOpen(false);

      if (pipelineToStop?.cameras?.cameraIds) {
          try {
            await stopPipeline(pipelineToStop?.id);
          } catch (error) {}
      }
      snackbar.success(UI_MESSAGES.pipelines.stopSuccess(pipelineToStop.name));

      // Refresh pipeline list
      await loadPipelines();
    } catch (error) {
      snackbar.error(
        error instanceof Error ? error.message : UI_MESSAGES.pipelines.stopFailed,
      );
    } finally {
      setActionLoading((prev) => {
        return {
          ...prev,
          [pipelineToStop.id]: undefined,
        };
      });
      setPipelineToStop(null);
    }
  };

  const handleStartAndRestart = (pipeline: Pipeline) => {
    if (pipeline.cameras.online === 0) {
      // Show confirmation for start
      setPipelineToStart(pipeline);
      setIsStartDialogOpen(true);
    } else {
      // Show confirmation for restart
      setPipelineToRestart(pipeline);
      setIsRestartDialogOpen(true);
    }
  };

  const handleConfirmStart = async () => {
    if (!pipelineToStart || actionLoading?.[pipelineToStart.id] === "start") return;
    if (pipelineToStart?.cameras?.cameraIds?.length === 0) return;

    try {
      setActionLoading((prev) => {
        return { ...prev, [pipelineToStart.id]: "start" };
      });
      setIsStartDialogOpen(false);

      if (pipelineToStart.cameras.online === 0) {
        if (pipelineToStart?.cameras?.cameraIds) {
            try {
              await startPipeline(pipelineToStart?.id);
            } catch (error) {
              // Log error but continue starting other cameras
            }
        }
        // after starting all cameras update the state pipeline online camera count
        setPipelinesData((prevPipelines) =>
          prevPipelines.map((p) =>
            p.id === pipelineToStart.id
              ? {
                  ...p,
                  cameras: {
                    ...p.cameras,
                    online: p.cameras?.cameraIds?.length || 0,
                  },
                }
              : p,
          ),
        );
        snackbar.success(UI_MESSAGES.pipelines.startSuccess(pipelineToStart.name));
      } else {
        if (pipelineToStart?.cameras?.cameraIds) {
            try {
              await restartPipeline(pipelineToStart?.id);
            } catch (error) {
             // Log error but continue restarting other cameras
            }
        }
        // after restarting all cameras update the state pipeline online camera count
        setPipelinesData((prevPipelines) =>
          prevPipelines.map((p) =>
            p.id === pipelineToStart.id
              ? {
                  ...p,
                  cameras: {
                    ...p.cameras,
                    online: p.cameras?.cameraIds?.length || 0,
                  },
                }
              : p,
          ),
        );
        snackbar.success(UI_MESSAGES.pipelines.restartSuccess(pipeline.name));
      }
      // after starting all cameras update the state pipeline online camera count
      setPipelinesData((prevPipelines) =>
        prevPipelines.map((p) =>
          p.id === pipelineToStart.id
            ? {
                ...p,
                cameras: {
                  ...p.cameras,
                  online: p.cameras?.cameraIds?.length || 0,
                },
              }
            : p,
        ),
      );
      snackbar.success(UI_MESSAGES.pipelines.startSuccess(pipelineToStart.name));
    } catch (error) {
      snackbar.error(
        error instanceof Error
          ? error.message
          : UI_MESSAGES.pipelines.startFailed,
      );
    } finally {
      setActionLoading((prev) => {
        return {
          ...prev,
          [pipelineToStart.id]: undefined,
        };
      });
      setPipelineToStart(null);
    }
  };

  const handleConfirmRestart = async () => {
    if (!pipelineToRestart || actionLoading?.[pipelineToRestart.id] === "restart") return;

    try {
      setActionLoading((prev) => {
        return { ...prev, [pipelineToRestart.id]: "restart" };
      });
      setIsRestartDialogOpen(false);

      if (pipelineToRestart?.cameras?.cameraIds) {
        for (const cameraId of pipelineToRestart?.cameras?.cameraIds) {
          try {
            await restartPipeline(parseInt(cameraId));
          } catch (error) {
           // Log error but continue restarting other cameras
          }
        }
      }
      // after restarting all cameras update the state pipeline online camera count
      setPipelinesData((prevPipelines) =>
        prevPipelines.map((p) =>
          p.id === pipelineToRestart.id
            ? {
                ...p,
                cameras: {
                  ...p.cameras,
                  online: p.cameras?.cameraIds?.length || 0,
                },
              }
            : p,
        ),
      );
      snackbar.success(UI_MESSAGES.pipelines.restartSuccess(pipelineToRestart.name));
    } catch (error) {
      snackbar.error(
        error instanceof Error
          ? error.message
          : UI_MESSAGES.pipelines.startFailed,
      );
    } finally {
      setActionLoading((prev) => {
        return {
          ...prev,
          [pipelineToRestart.id]: undefined,
        };
      });
      setPipelineToRestart(null);
    }
  };

  const handleEdit = (pipeline: Pipeline) => {
    setEditingPipeline(pipeline);
    setEditFormData({
      name: pipeline.name,
      useCase: pipeline.useCaseId ? pipeline.useCaseId.toString() : "",
      cameras: pipeline.cameras.cameraIds || [],
    });
    setIsEditModalOpen(true);
  };

  const handleNotify = (pipeline: Pipeline) => {
    console.log("Notify pipeline:", pipeline.id);
  };

  const handleDelete = (pipeline: Pipeline) => {
    setPipelineToDelete(pipeline);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pipelineToDelete) return;

    try {
      await deletePipeline(pipelineToDelete.id);
      snackbar.success(
        UI_MESSAGES.pipelines.deleteSuccess(pipelineToDelete.name),
      );
      setIsDeleteDialogOpen(false);
      setPipelineToDelete(null);

      // after deleting pipeline, update state pipeline list
      setPipelinesData((prevPipelines) =>
        prevPipelines.filter((p) => p.id !== pipelineToDelete.id),
      );
    } catch (error) {
      snackbar.error(
        error instanceof Error ? error.message : UI_MESSAGES.pipelines.deleteFailed,
      );
    }
  };

  const handleCreatePipeline = async () => {
    if (!formData.name || !formData.useCase || formData.cameras.length === 0) {
      snackbar.error(UI_MESSAGES.pipelines.requiredFields);
      return;
    }
    if (submitting) return;
    setSubmitting(true);

    try {
      await createPipeline({
        pipelineName: formData.name,
        inputSourceId: formData.cameras.map((id) => parseInt(id)),
        useCaseId: parseInt(formData.useCase),
        createdBy: `${getCurrentUser()?.id}`,
      });

      snackbar.success(UI_MESSAGES.pipelines.createSuccess(formData.name));
      setIsCreateModalOpen(false);
      setFormData({ name: "", useCase: "", cameras: [] });

      // Refresh pipeline list
      loadPipelines();
    } catch (error) {
      snackbar.error(
        error instanceof Error ? error.message : UI_MESSAGES.pipelines.createFailed,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCameraToggle = (cameraId: string) => {
    setFormData((prev) => ({
      ...prev,
      cameras: prev.cameras.includes(cameraId)
        ? prev.cameras.filter((id) => id !== cameraId)
        : [...prev.cameras, cameraId],
    }));
  };

  const handleEditCameraToggle = (cameraId: string) => {
    setEditFormData((prev) => ({
      ...prev,
      cameras: prev.cameras.includes(cameraId)
        ? prev.cameras.filter((id) => id !== cameraId)
        : [...prev.cameras, cameraId],
    }));
  };

  const handleSavePipeline = async () => {
    if (
      !editingPipeline ||
      !editFormData.name ||
      editFormData.cameras.length === 0
    ) {
      snackbar.error(UI_MESSAGES.pipelines.requiredFields);
      return;
    }
    if (submitting) return;
    setSubmitting(true);

    try {
      await updatePipeline({
        pipelineId: editingPipeline.id,
        pipelineName: editFormData.name,
        inputSourceId: editFormData.cameras.map((id) => parseInt(id)),
        useCaseId: editingPipeline.useCaseId || 0,
        updatedBy: `${getCurrentUser()?.id}`,
      });

      snackbar.success(UI_MESSAGES.pipelines.updateSuccess(editFormData.name));
     
      // after updating pipeline, update state the pipeline list
      setPipelinesData((prevPipelines) =>
        prevPipelines.map((p) =>
          p.id === editingPipeline.id
            ? {
                ...p,
                name: editFormData.name,
                cameras: {
                  total: editFormData.cameras.length,
                  online: options.cameras.filter(
                    (c) =>
                      editFormData.cameras.includes(c.value) &&
                      c.status === STATUS.ONLINE,
                  ).length,
                  cameraIds:
                    editFormData.cameras.length > 0 ? editFormData.cameras : [],
                },
              }
            : p,
        ),
      );   
      setIsEditModalOpen(false);
      setEditingPipeline(null);
      setEditFormData({ name: "", useCase: "", cameras: [] });
    } catch (error) {
      snackbar.error(
        error instanceof Error ? error.message : UI_MESSAGES.pipelines.updateFailed,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Pipeline Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure and manage AI processing pipelines
          </p>
        </div>
        <Button
          onPress={() => setIsCreateModalOpen(true)}
          className="w-full sm:w-auto"
        >
          <Icon icon={Plus} className="h-4 w-4 mr-2" />
          Create Pipeline
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Pipelines"
          value={totalPipelines}
          color="default"
        />
        <StatsCard label="Running" value={runningPipelines} color="green" />
        <StatsCard label="Errors" value={errorPipelines} color="red" />
        <StatsCard label="Stopped" value={stoppedPipelines} color="default" />
      </div>

      {/* Search */}
      <div className="relative w-full">
        <Icon
          icon={Search}
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <Input
          placeholder="Search pipelines..."
          value={searchQuery}
          onChangeText={(value) => setSearchQuery(value)}
          className="pl-10 w-full"
        />
      </div>

      {/* Pipeline Cards */}
      <div className="space-y-4">
        {loading.pipelines ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Loading pipelines...
            </CardContent>
          </Card>
        ) : pipelinesData.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              {searchQuery
                ? "No pipelines found matching your search"
                : "No pipelines available"}
            </CardContent>
          </Card>
        ) : (
          pipelinesData.map((pipeline) => (
            <Card key={pipeline.id} className="overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Left side - Pipeline info */}
                  <div className="flex-1 min-w-0">
                    {/* Name and Status */}
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <h3 className="text-base sm:text-lg font-semibold text-foreground">
                        {pipeline.name}
                      </h3>
                      {getStatusBadge(
                        pipeline.cameras.online > 0 ? "running" : "stopped",
                      )}
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon
                          icon={Brain}
                          className="h-4 w-4 text-muted-foreground flex-shrink-0"
                        />
                        <span className="text-sm text-foreground truncate">
                          Model: {pipeline.useCase}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon
                          icon={Camera}
                          className="h-4 w-4 text-muted-foreground flex-shrink-0"
                        />
                        <span className="text-sm text-foreground">
                          Cameras: {pipeline.cameras.online}/
                          {pipeline.cameras.total} online
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon
                          icon={Bell}
                          className="h-4 w-4 text-muted-foreground flex-shrink-0"
                        />
                        <span className="text-sm text-foreground">
                          Channels: {pipeline.channels} configured
                        </span>
                      </div>
                    </div>

                    {/* Created date */}
                    <p className="text-xs text-muted-foreground mt-4">
                      Created {MomentUtils.formatDateTime(pipeline.createdAt)}
                    </p>
                  </div>

                  {/* Right side - Action buttons (horizontal) */}
                  <div className="flex flex-row gap-2 sm:ml-6 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={
                        pipeline.cameras.online === 0 ||
                        actionLoading?.[pipeline.id] === "stop"
                      }
                      className="hover:bg-muted items-center justify-center"
                      onPress={() => handleStop(pipeline)}
                    >
                      <Icon
                        icon={Pause}
                        className="h-4 w-4 mr-2 text-muted-foreground"
                      />
                      {actionLoading?.[pipeline.id] === "stop" &&
                      pipeline.cameras.online > 0
                        ? "Stopping..."
                        : "Stop"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={
                        actionLoading?.[pipeline.id] === "start" ||
                        actionLoading?.[pipeline.id] === "restart"
                      }
                      className="hover:bg-muted items-center justify-center"
                      onPress={() => handleStartAndRestart(pipeline)}
                    >
                      <Icon
                        icon={RefreshCw}
                        className="h-4 w-4 mr-2 text-muted-foreground"
                      />
                      {actionLoading?.[pipeline.id] === "start" ||
                      actionLoading?.[pipeline.id] === "restart"
                        ? pipeline.cameras.online === 0
                          ? "Starting..."
                          : "Restarting..."
                        : pipeline.cameras.online === 0
                          ? "Start"
                          : "Restart"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-muted items-center justify-center"
                      onPress={() => handleEdit(pipeline)}
                    >
                      <Icon
                        icon={Pencil}
                        className="h-4 w-4 mr-2 text-muted-foreground"
                      />
                    </Button>
                    {/* <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-muted items-center justify-center"
                    onPress={() => handleNotify(pipeline)}
                  >
                    <Icon icon={Bell} className="h-4 w-4 mr-2 text-muted-foreground" />
                    Notify
                  </Button> */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 items-center justify-center"
                      onPress={() => handleDelete(pipeline)}
                    >
                      <Icon icon={Trash2} className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Pipeline Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="w-[95vw] max-w-md max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="sticky top-0 border-b border-border bg-background px-6 py-4 z-10">
            <DialogTitle>Create New Pipeline</DialogTitle>
            <DialogDescription>
              Set up a new AI processing pipeline
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {/* Pipeline Name */}
              <div className="space-y-2">
                <Label htmlFor="pipeline-name">
                  Pipeline Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pipeline-name"
                  placeholder="e.g., Defect Detection Pipeline"
                  value={formData.name}
                  onChangeText={(value) =>
                    setFormData({ ...formData, name: value })
                  }
                />
              </div>

              {/* Select AI useCase */}
              <div className="space-y-2">
                <Label>
                  Select AI Model <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.useCase}
                  onValueChange={(value) =>
                    setFormData({ ...formData, useCase: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a useCase" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.useCases.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Select Cameras */}
              <div className="space-y-2">
                <Label>
                  Select Cameras <span className="text-red-500">*</span>
                </Label>
                <div className="border border-border rounded-md p-4 space-y-3 bg-background">
                  {options.cameras.map((camera) => (
                    <div
                      key={camera.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={camera.value}
                        checked={formData.cameras.includes(camera.value)}
                        onCheckedChange={() => handleCameraToggle(camera.value)}
                      />
                      <Label
                        htmlFor={`${camera.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {camera.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 border-t border-border bg-background px-6 py-4">
            <Button
              variant="outline"
              onPress={() => {
                setIsCreateModalOpen(false);
                setFormData({ name: "", useCase: "", cameras: [] });
              }}
            >
              Cancel
            </Button>
            <Button
              onPress={handleCreatePipeline}
              disabled={
                !formData.name ||
                !formData.useCase ||
                formData.cameras.length === 0 ||
                submitting
              }
            >
              {submitting ? "Creating..." : "Create Pipeline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Pipeline Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="w-[95vw] max-w-md max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="sticky top-0 border-b border-border bg-background px-6 py-4 z-10">
            <DialogTitle>Edit Pipeline</DialogTitle>
            <DialogDescription>Modify pipeline configuration</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {/* Pipeline Name */}
              <div className="space-y-2">
                <Label htmlFor="edit-pipeline-name">Pipeline Name</Label>
                <Input
                  id="edit-pipeline-name"
                  value={editFormData.name}
                  onChangeText={(value) =>
                    setEditFormData({ ...editFormData, name: value })
                  }
                />
              </div>

              {/* Select AI useCase */}
              {/* <div className="space-y-2">
              <Label>
                Select AI Model <span className="text-red-500">*</span>
              </Label>
              <Select
                value={editFormData.useCase}
                key={`edit-usecase-select-${editingPipeline?.id}`} // Force remount when editingPipeline changes
                onValueChange={(value) => setEditFormData({ ...editFormData, useCase: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a useCase" />
                </SelectTrigger>
                <SelectContent>
                  {options.useCases.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}
              {/* Select Cameras */}
              <div className="space-y-2">
                <Label>Select Cameras</Label>
                <div className="border border-border rounded-md p-4 space-y-3 bg-background">
                  {options.cameras.map((camera) => (
                    <div
                      key={camera.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`edit-${camera.value}`}
                        checked={editFormData.cameras.includes(camera.value)}
                        onCheckedChange={() =>
                          handleEditCameraToggle(camera.value)
                        }
                      />
                      <Label
                        htmlFor={`edit-${camera.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {camera.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 border-t border-border bg-background px-6 py-4">
            <Button
              variant="outline"
              onPress={() => {
                setIsEditModalOpen(false);
                setEditingPipeline(null);
                setEditFormData({ name: "", cameras: [], useCase: "" });
              }}
            >
              Cancel
            </Button>
            <Button
              onPress={handleSavePipeline}
              disabled={
                !editFormData.name ||
                editFormData.cameras.length === 0 ||
                submitting
              }
            >
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Start Confirmation Dialog */}
      <AlertDialog
        open={isStartDialogOpen}
        onOpenChange={setIsStartDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Pipeline</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to start &quot;{pipelineToStart?.name}&quot;?
              <br /><br />
              <span className="font-medium">This will:</span>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Activate all {pipelineToStart?.cameras.total} configured camera stream(s)</li>
                <li>Initialize AI model connections and begin inference</li>
                <li>Start real-time monitoring and alert generation</li>
                <li>Consume system resources (CPU, GPU, memory)</li>
              </ul>
              <br />
              The pipeline will begin processing immediately once started.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <Button
              variant="outline"
              onPress={() => {
                setIsStartDialogOpen(false);
                setPipelineToStart(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onPress={handleConfirmStart}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Icon icon={RefreshCw} className="h-4 w-4 mr-2" />
              Start Pipeline
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stop Confirmation Dialog */}
      <AlertDialog
        open={isStopDialogOpen}
        onOpenChange={setIsStopDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop Pipeline</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to stop &quot;{pipelineToStop?.name}&quot;?
              <br /><br />
              <span className="font-medium">This will:</span>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Stop all {pipelineToStop?.cameras.online} active camera stream(s)</li>
                <li>Halt AI model processing and inference</li>
                <li>Pause all monitoring and alert generation</li>
                <li>Free up system resources</li>
              </ul>
              <br />
              You can restart the pipeline anytime to resume operations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <Button
              variant="outline"
              onPress={() => {
                setIsStopDialogOpen(false);
                setPipelineToStop(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onPress={handleConfirmStop}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Icon icon={Pause} className="h-4 w-4 mr-2" />
              Stop Pipeline
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restart Confirmation Dialog */}
      <AlertDialog
        open={isRestartDialogOpen}
        onOpenChange={setIsRestartDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restart Pipeline</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restart &quot;{pipelineToRestart?.name}&quot;?
              <br /><br />
              <span className="font-medium">This will:</span>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Temporarily stop all {pipelineToRestart?.cameras.online} active camera stream(s)</li>
                <li>Reinitialize AI model connections</li>
                <li>Clear processing buffers and caches</li>
                <li>Resume monitoring with fresh state</li>
              </ul>
              <br />
              There may be a brief interruption in monitoring during the restart process.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <Button
              variant="outline"
              onPress={() => {
                setIsRestartDialogOpen(false);
                setPipelineToRestart(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onPress={handleConfirmRestart}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Icon icon={RefreshCw} className="h-4 w-4 mr-2" />
              Restart Pipeline
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pipeline</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{pipelineToDelete?.name}
              &quot;? This action cannot be undone. All camera assignments and
              configurations for this pipeline will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <Button
              variant="outline"
              onPress={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onPress={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Icon icon={Trash2} className="h-4 w-4 mr-2" />
              Delete Pipeline
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Snackbar */}
      <Snackbar
        visible={snackbar.state.visible}
        message={snackbar.state.message}
        variant={snackbar.state.variant}
        onClose={snackbar.hide}
      />
    </div>
  );
}
