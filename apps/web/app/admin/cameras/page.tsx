"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { fetchLocations } from "app/utils/location";
import { fetchResolutions } from "app/utils/resolution";
import { fetchUseCases } from "app/utils/usecase";
import {
  fetchInputSources,
  fetchInputSourceDetails,
  createInputSource,
  deleteInputSource,
  updateInputSource,
  MetaData,
  InputSourceDetails,
} from "app/utils/inputsource";
import {
  Card,
  Button,
  Icon,
  Badge,
  StatsCard,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Snackbar,
  useSnackbar,
  ToggleSwitch,
} from "ui";
import {
  Plus,
  Search,
  Upload,
  Check,
  Pencil,
  Trash2,
  Cpu,
} from "ui/utils/icons";
import { useDebounce } from "app";
import { STATUS, UI_MESSAGES } from "app/constants";

const getUseCaseBadge = (useCase: string | null) => {
  if (!useCase) {
    return (
      <Badge
        variant="outline"
        className="bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700"
      >
        Not Assigned
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
    >
      {useCase}
    </Badge>
  );
};

// Camera type
interface Camera {
  id: number;
  name: string;
  location: string;
  streamUrl: string;
  useCase: string | null;
  status: string;
  fps: number;
  originalFps?: number;
  locationId?: number;
  useCaseId?: number;
  resolutionHeight?: number;
  resolutionWidth?: number;
  inputSourceResolutionId?: number;
  resolution?: string;
}

const initialState = {
  name: false,
  location: false,
  streamUrl: false,
  fps: false,
  resolution: false,
  useCase: false,
};

const initialCameraState = {
  name: "",
  location: "",
  streamUrl: "",
  fps: "",
  resolution: "",
  useCase: "",
};

export default function CamerasPage() {
  const snackbar = useSnackbar();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [metaData, setMetaData] = useState<MetaData | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreTriggerRef = useRef<HTMLTableRowElement | null>(null);

  // Modal states - unified
  const [modal, setModal] = useState<"add" | "edit" | "delete" | "statusConfirm" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toggle, setToggle] = useState<number | null>(null);

  const [camerasData, setCamerasData] = useState<Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [inputSourceDetails, setInputSourceDetails] =
    useState<InputSourceDetails | null>(null);
  const [fpsError, setFpsError] = useState<string>("");

  // Unified form state for both Add and Edit
  const [form, setForm] = useState(initialCameraState);
  const [touched, setTouched] = useState(initialState);

  // Unified options state
  const [options, setOptions] = useState({
    locations: [] as { value: string; label: string }[],
    resolutions: [] as { value: string; label: string, ResolutionWidth: number,
            ResolutionHeight: number, }[],
    useCases: [] as { value: string; label: string }[],
  });

  // Unified loading state
  const [loading, setLoading] = useState({
    cameras: true,
    options: true,
    fps: false,
    inputSourceDetails: false,
    toggling: false,
  });

  // Unified validation using useMemo
  const errors = useMemo(
    () => ({
      name:
        touched.name && !form.name
          ? UI_MESSAGES.cameras.nameRequired
          : touched.name && form.name.length < 3
            ? UI_MESSAGES.cameras.nameTooShort
            : "",
      location:
        touched.location && !form.location ? UI_MESSAGES.cameras.locationRequired : "",
      streamUrl:
        touched.streamUrl && !form.streamUrl
          ? UI_MESSAGES.cameras.urlRequired
          : touched.streamUrl && !/^rtsp:\/\/.+/.test(form.streamUrl)
            ? UI_MESSAGES.cameras.urlInvalid
            : "",
      useCase: touched.useCase && !form.useCase ? UI_MESSAGES.form.requiredField : "",
      fps: touched.fps && !form.fps ? UI_MESSAGES.form.requiredField : "",
      resolution:
        touched.resolution && !form.resolution ? UI_MESSAGES.form.requiredField : "",
    }),
    [form, touched],
  );

  const isFormValid = useMemo(
    () =>
      Object.values(errors).every((err) => !err) &&
      Object.values(form).every((val) => !!val),
    [errors, form],
  );

  const loadCameras = async (append = false, cursor: any = null) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setLoading((l) => ({ ...l, cameras: true }));
      }

      const filters: any = {
        limit: 10,
      };

      if (debouncedSearchQuery) {
        Object.assign(filters, { sourceName: debouncedSearchQuery });
      }

      // Add cursor for pagination
      if (cursor) {
        Object.assign(filters, {
          lastSourceId: cursor.cursor_id,
          lastDatetime: cursor.cursor_datetime,
        });
      }

      const inputSources = await fetchInputSources({ filters });

      const cameras: Camera[] = inputSources.inputSource.map((source) => ({
        id: source.SourceId,
        name: source.SourceName,
        location: `${source.LocationName}`,
        streamUrl: source.SourceUrl || "",
        useCase: source.UseCaseName || null,
        status: source.IsActive ? STATUS.ACTIVE : STATUS.INACTIVE,
        fps: source.TargetFPS || 30,
        locationId: source.LocationId || 0,
        resolutionHeight: source.ResolutionHeight || 0,
        resolutionWidth: source.ResolutionWidth || 0,
        useCaseId: source.UseCaseId || 0,
        inputSourceResolutionId: source.InputSourceResolutionId || 0,
        resolution: source.InputSourceResolutionId?.toString() || "",
        originalFps: source.OriginalFPS || 30,
      }));

      // Append or replace cameras
      if (append) {
        setCamerasData((prev) => [...prev, ...cameras]);
      } else {
        setCamerasData(cameras);
      }

      // Update pagination metadata
      const metadata = inputSources?.metaData || null;
      setMetaData(metadata);
    } catch (error) {
      snackbar.error(UI_MESSAGES.cameras.loadFailed);
      if (!append) {
        setCamerasData([]);
      }
    } finally {
      if (append) {
        setIsLoadingMore(false);
      } else {
        setLoading((l) => ({ ...l, cameras: false }));
      }
    }
  };
  // Optimized: Fetch cameras with unified loading state
  useEffect(() => {
    // Reset pagination when search changes
    setMetaData(null);
    loadCameras(false, null);
  }, [debouncedSearchQuery]);

  // Infinite scroll observer
  useEffect(() => {
    const triggerElement = loadMoreTriggerRef.current;
    if (!triggerElement || !metaData?.has_more) return;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry && entry.isIntersecting && !isLoadingMore && !loading.cameras) {
        loadCameras(true, metaData.next_cursor);
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
  }, [metaData?.has_more, isLoadingMore, loading.cameras]);

  // Optimized: Load all options in parallel
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading((l) => ({ ...l, options: true }));
        const [locations, resolutions, useCasesRes] = await Promise.all([
          fetchLocations(),
          fetchResolutions(),
          fetchUseCases(),
        ]);

        setOptions({
          locations: locations.map((l) => ({
            value: l.LocationId.toString(),
            label: l.LocationName,
          })),
          resolutions: resolutions.map((r) => ({
            value: r.InputSourceResolutionId.toString(),
            label: r.ResolutionName,
            ResolutionWidth: r.ResolutionWidth,
            ResolutionHeight: r.ResolutionHeight,
          })),
          useCases: [
            { value: "", label: "Not Assigned" },
            ...useCasesRes.useCases.map((u) => ({
              value: u.UseCaseId.toString(),
              label: u.UseCaseName,
            })),
          ],
        });
      } catch (error) {
        snackbar.error(UI_MESSAGES.setup.loadFormOptionsFailed);
      } finally {
        setLoading((l) => ({ ...l, options: false }));
      }
    };

    loadOptions();
  }, []);

  // Optimized FPS fetcher
  const fetchFPSFromStreamUrl = async (streamUrl: string) => {
    if (
      !streamUrl ||
      streamUrl.trim() === "" ||
      !/^rtsp:\/\/.+/.test(streamUrl)
    )
      return;

    try {
      setLoading((l) => ({ ...l, fps: true, inputSourceDetails: false }));
      const inputSources = await fetchInputSourceDetails(streamUrl);

      if (inputSources) {
        setForm((f) => ({ ...f, fps: inputSources.fps?.toString() || "" }));
        setInputSourceDetails(inputSources);
      }
    } catch (error) {
      // Silent fail
      setInputSourceDetails(null);
      setLoading((l) => ({ ...l, inputSourceDetails: true }));
    } finally {
      setLoading((l) => ({ ...l, fps: false }));
    }
  };

  // Calculate stats
  const totalCameras = metaData?.total_count || 0;
  const activeCameras = camerasData.filter((c) => c.status === STATUS.ACTIVE).length;
  const inactiveCameras = totalCameras - activeCameras;

  //location count
  const locationCount = useMemo(() => {
    return options.locations.length || 0;
  }, [options.locations, camerasData]);

  // Unified modal opener
  const openModal = (type: "add" | "edit" | "delete", camera?: Camera) => {
    setModal(type);
    setSelectedCamera(camera || null);
    setForm(
      type === "edit" && camera
        ? {
            name: camera.name || "",
            location: camera.locationId?.toString() || "",
            streamUrl: camera.streamUrl || "",
            fps: camera.fps?.toString() || "30",
            resolution: camera.inputSourceResolutionId?.toString() || "",
            useCase: camera.useCaseId?.toString() || "",
          }
        : initialCameraState,
    );
    setTouched(initialState);
  };

  // Unified Add/Edit handler
  const handleSubmitCamera = async () => {
    setTouched({
      name: true,
      location: true,
      streamUrl: true,
      fps: true,
      resolution: true,
      useCase: true,
    });

    if (!isFormValid) {
      snackbar.error(UI_MESSAGES.form.requiredField);
      return;
    }
    if (submitting) return; // Prevent multiple submissions
    setSubmitting(true);

    try {
      const requestData: any = {
        sourceName: form.name,
        useCaseId: parseInt(form.useCase),
        inputSourceResolutionId: parseInt(form.resolution),
        targetFps: parseInt(form.fps),
      };

      if (modal === "edit" && selectedCamera) {
        requestData.sourceId = selectedCamera.id;
        requestData.updatedBy = 0;
        await updateInputSource(requestData);
        snackbar.success(UI_MESSAGES.cameras.updateSuccess(form.name));
        // after editing, update state the camera list
        setCamerasData((prevCameras) =>
          prevCameras.map((c) =>
            c.id === selectedCamera.id
              ? {
                  ...c,
                  ...requestData,
                  name: form.name,
                  useCaseId: parseInt(form.useCase),
                  inputSourceResolutionId: parseInt(form.resolution),
                  fps: parseInt(form.fps),
                  useCase:
                    options.useCases.find((uc) => uc.value === form.useCase)
                      ?.label || null,
                  resolution: form.resolution,
                }
              : c,
          ),
        );
      } else {
        requestData.sourceTypeId = 1;
        requestData.createdBy = 0;
        requestData.width = inputSourceDetails?.width;
        requestData.height = inputSourceDetails?.height;
        requestData.gstreamerUrl = inputSourceDetails?.gstPipeline;
        requestData.webrtcUrl = inputSourceDetails?.webrtcPipeline;
        requestData.originalFps = inputSourceDetails?.fps;
        requestData.sourceUrl = form.streamUrl;
        requestData.locationId = parseInt(form.location);
        await createInputSource(requestData);
        snackbar.success(UI_MESSAGES.cameras.addSuccess(form.name));
        await loadCameras();
      }
      setModal(null);
      setForm(initialCameraState);
      setTouched(initialState);
    } catch (error) {
      snackbar.error(
        error instanceof Error ? error.message : modal === "edit" ? UI_MESSAGES.cameras.updateFailed : UI_MESSAGES.cameras.addFailed,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = (camera: Camera) => {
    setSelectedCamera(camera);
    setModal("statusConfirm");
  };

  const handleConfirmToggleStatus = async () => {
    if (!selectedCamera || loading.toggling) return;

    try {
      const newStatus = selectedCamera.status === STATUS.ACTIVE ? false : true;
      setToggle(selectedCamera.id);
      setLoading((l) => ({ ...l, toggling: true }));

      await updateInputSource({
        sourceId: selectedCamera.id,
        updatedBy: 0,
        isActive: newStatus,
      });

      // Update local state immediately for better UX
      await setCamerasData((prevCameras) =>
        prevCameras.map((c) =>
          c.id === selectedCamera.id
            ? { ...c, status: newStatus ? STATUS.ACTIVE : STATUS.STOPPED }
            : c,
        ),
      );

      snackbar.success(
        UI_MESSAGES.cameras.toggleSuccess(selectedCamera.name, newStatus),
      );
      setModal(null);
    } catch (error) {
      snackbar.error(
        error instanceof Error
          ? error.message
          : UI_MESSAGES.cameras.updateFailed,
      );
    } finally {
      setLoading((l) => ({ ...l, toggling: false }));
      setToggle(null);
      setSelectedCamera(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCamera) return;

    try {
      await deleteInputSource(selectedCamera.id);
      setModal(null);
      snackbar.success(UI_MESSAGES.cameras.deleteSuccess(selectedCamera.name));
      setSelectedCamera(null);
      await loadCameras();
    } catch (error) {
      setModal(null);
      snackbar.error(
        `${error instanceof Error ? error.message : UI_MESSAGES.cameras.deleteFailed}`,
      );
    }
  };

  const handleFps = (value: string) => {
    if (
      inputSourceDetails &&
      inputSourceDetails.fps &&
      parseInt(value) > inputSourceDetails.fps
    ) {
      setFpsError(UI_MESSAGES.cameras.fpsExceedsSource(value, inputSourceDetails.fps));
    } else if (
      selectedCamera &&
      selectedCamera.fps &&
      selectedCamera.originalFps &&
      parseInt(value) > selectedCamera.originalFps
    ) {
      setFpsError(UI_MESSAGES.cameras.fpsExceedsSource(value, selectedCamera.originalFps));
    } else {
      setFpsError("");
    }
    setForm({ ...form, fps: value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Source Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and configure video and image input sources
          </p>
        </div>
        <Button onPress={() => openModal("add")} className="w-full sm:w-auto">
          <Icon icon={Plus} className="h-4 w-4 mr-2" />
          Add Camera
        </Button>
      </div>

      {/* Bulk Upload Promo Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-4">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg border bg-background">
            <Icon icon={Upload} className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">
                Bulk Camera Upload
              </h3>
              <Badge variant="outline" className="text-xs">
                Coming Soon
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Import multiple cameras at once using CSV file upload
            </p>
            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Icon icon={Check} className="h-3 w-3 text-green-600" />
                Upload hundreds of cameras in seconds
              </span>
              <span className="flex items-center gap-1">
                <Icon icon={Check} className="h-3 w-3 text-green-600" />
                Pre-configured templates for easy setup
              </span>
            </div>
          </div>
        </div>
        <Button variant="outline" className="h-9 px-4 w-full sm:w-auto">
          Request Access
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Cameras" value={totalCameras} color="default" />
        <StatsCard label="Active" value={activeCameras} color="green" />
        <StatsCard
          label="Inactive"
          value={inactiveCameras}
          color="amber"
        />
        <StatsCard
          label="Location Count"
          value={loading.options ? 0 : locationCount}
          color="red"
        />
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <Icon
          icon={Search}
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <Input
          placeholder="Search cameras..."
          value={searchQuery}
          onChangeText={(value) => setSearchQuery(value)}
          className="pl-10 w-full"
        />
      </div>

      {/* Cameras Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="h-12 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Camera
                </th>
                <th className="h-12 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Location
                </th>
                <th className="h-12 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Stream URL
                </th>
                <th className="h-12 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  useCase
                </th>
                <th className="h-12 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="h-12 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  FPS
                </th>
                <th className="h-12 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading.cameras ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Loading cameras...
                  </td>
                </tr>
              ) : camerasData.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    {searchQuery
                      ? "No cameras found matching your search"
                      : "No cameras available"}
                  </td>
                </tr>
              ) : (
                camerasData.map((camera) => (
                  <tr
                    key={camera.id}
                    className="border-b border-border transition-colors hover:bg-muted/50"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">
                        {camera.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {camera.location}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-sm text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                        {camera.streamUrl}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      {getUseCaseBadge(camera.useCase)}
                    </td>
                    <td className="px-4 py-3">
                      <ToggleSwitch
                        id={`model-toggle-${camera.id}`}
                        checked={camera.status === STATUS.ACTIVE}
                        onCheckedChange={() => handleToggleStatus(camera)}
                        size="md"
                        disabled={toggle === camera.id ? true : false}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-foreground">
                        {camera.fps} fps
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onPress={() => openModal("edit", camera)}
                        >
                          <Icon
                            icon={Pencil}
                            className="h-4 w-4 text-muted-foreground"
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onPress={() => openModal("delete", camera)}
                        >
                          <Icon icon={Trash2} className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {/* Load More Trigger for Infinite Scroll */}
              {metaData?.has_more && (
                <tr ref={loadMoreTriggerRef}>
                  <td colSpan={7} className="px-4 py-4 text-center">
                    {isLoadingMore ? (
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span className="text-sm">Loading more cameras...</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Scroll to load more...
                      </span>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Camera Modal */}
      <Dialog
        open={modal === "add"}
        onOpenChange={(open) => !open && setModal(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Camera</DialogTitle>
            <DialogDescription>
              Configure a new camera feed for monitoring
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Camera Name */}
            <div className="space-y-2">
              <Label htmlFor="camera-name">
                Camera Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="camera-name"
                placeholder="e.g., Camera 7"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onBlur={() => setTouched({ ...touched, name: true })}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>
                Location <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.location}
                onValueChange={(value) => {
                  setForm({ ...form, location: value });
                  setTouched({ ...touched, location: true });
                }}
                disabled={loading.options}
              >
                <SelectTrigger
                  className={errors.location ? "border-red-500" : ""}
                >
                  <SelectValue
                    placeholder={
                      loading.options
                        ? "Loading locations..."
                        : "Select Location"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {options.locations.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.location && (
                <p className="text-xs text-red-500">{errors.location}</p>
              )}
            </div>

            {/* Stream URL */}
            <div className="space-y-2">
              <Label htmlFor="stream-url">
                Stream URL <span className="text-red-500">*</span>
              </Label>

              <div className="relative">
                <Input
                  id="stream-url"
                  placeholder="rtsp://192.168.1.107"
                  value={form.streamUrl}
                  onChange={(e) =>
                    setForm({ ...form, streamUrl: e.target.value })
                  }
                  onBlur={(e) => {
                    setTouched({ ...touched, streamUrl: true });
                    fetchFPSFromStreamUrl(e.target.value);
                  }}
                  className={errors.streamUrl ? "border-red-500" : ""}
                />
                {loading.fps && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Icon
                      icon={Cpu}
                      className="h-4 w-4 animate-spin text-muted-foreground"
                    />
                  </div>
                )}
              </div>

              {errors.streamUrl && (
                <p className="text-xs text-red-500">{errors.streamUrl}</p>
              )}
              {/* {loading.fps && (
                <p className="text-xs text-muted-foreground">Fetching FPS...</p>
              )} */}

              {!loading.fps &&
                form.streamUrl &&
                loading.inputSourceDetails &&
                !errors.streamUrl && (
                  <p className="text-xs text-red-500">
                    Unable to fetch FPS from the provided Stream URL.
                  </p>
                )}
            </div>

            {/* FPS and Resolution Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  FPS <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fps"
                  placeholder="30"
                  disabled={loading.fps || !inputSourceDetails}
                  value={form.fps}
                  onChange={(e) => handleFps(e.target.value)}
                  onBlur={(e) => {
                    setTouched({ ...touched, fps: true });
                  }}
                  className={errors.fps ? "border-red-500" : ""}
                />
                {errors.fps && (
                  <p className="text-xs text-red-500">{errors.fps}</p>
                )}
                {fpsError && <p className="text-xs text-red-500">{fpsError}</p>}
              </div>

              <div className="space-y-2">
                <Label>
                  Resolution <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.resolution}
                  onValueChange={(value) => {
                    setForm({ ...form, resolution: value });
                    setTouched({ ...touched, resolution: true });
                  }}
                  disabled={loading.options || !inputSourceDetails}
                >
                  <SelectTrigger
                    className={errors.resolution ? "border-red-500" : ""}
                  >
                    <SelectValue
                      placeholder={
                        loading.options
                          ? "Loading resolutions..."
                          : "Select Resolution"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {options.resolutions.filter((r) => inputSourceDetails?.width && r.ResolutionWidth <= inputSourceDetails?.width && r.ResolutionHeight <= inputSourceDetails?.height).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.resolution && (
                  <p className="text-xs text-red-500">{errors.resolution}</p>
                )}
              </div>
            </div>

            {/* useCase */}
            <div className="space-y-2">
              <Label>
                Use Case <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.useCase}
                onValueChange={(value) => {
                  setForm({ ...form, useCase: value });
                  setTouched({ ...touched, useCase: true });
                }}
                disabled={loading.options}
              >
                <SelectTrigger
                  className={errors.useCase ? "border-red-500" : ""}
                >
                  <SelectValue
                    placeholder={
                      loading.options
                        ? "Loading use cases..."
                        : "Select Use Case"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {options.useCases.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.useCase && (
                <p className="text-xs text-red-500">{errors.useCase}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onPress={() => setModal(null)}>
              Cancel
            </Button>
            <Button
              onPress={handleSubmitCamera}
              disabled={
                !isFormValid ||
                (fpsError !== "" && inputSourceDetails?.fps !== undefined) ||
                submitting ||
                inputSourceDetails === null
              }
            >
              {submitting
                ? "Adding..."
                : loading.fps
                  ? "Validating..."
                  : "Add Camera"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Camera Modal */}
      <Dialog
        open={modal === "edit"}
        onOpenChange={(open) => !open && setModal(null)}
      >
        <DialogContent
          key={`edit-modal-${selectedCamera?.id || "new"}`}
          className="sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>Edit Camera</DialogTitle>
            <DialogDescription>Update camera configuration</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Camera Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-camera-name">
                Camera Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-camera-name"
                placeholder="e.g., Camera 7"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onBlur={() => setTouched({ ...touched, name: true })}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Location */}
            {/* <div className="space-y-2">
              <Label>Location <span className="text-red-500">*</span></Label>
              <Select 
                value={form.location}
                onValueChange={(value) => {
                  setForm({ ...form, location: value });
                  setTouched({ ...touched, location: true });
                }}
                disabled={loading.options}
              >
                <SelectTrigger className={errors.location ? "border-red-500" : ""}>
                  <SelectValue placeholder={loading.options ? "Loading locations..." : "Select Location"} />
                </SelectTrigger>
                <SelectContent>
                  {options.locations.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.location && (
                <p className="text-xs text-red-500">{errors.location}</p>
              )}
            </div> */}

            {/* Stream URL */}
            {/* <div className="space-y-2">
              <Label htmlFor="edit-stream-url">Stream URL <span className="text-red-500">*</span></Label>
              <Input
                id="edit-stream-url"
                placeholder="rtsp://192.168.1.107"
                value={form.streamUrl}
                onChange={(e) => setForm({ ...form, streamUrl: e.target.value })}
                onBlur={(e) => {
                  setTouched({ ...touched, streamUrl: true });
                  fetchFPSFromStreamUrl(e.target.value);
                }}
                className={errors.streamUrl ? "border-red-500" : ""}
              />
              {errors.streamUrl && (
                <p className="text-xs text-red-500">{errors.streamUrl}</p>
              )}
              {loading.fps && (
                <p className="text-xs text-muted-foreground">Fetching FPS...</p>
              )}
              {!loading.fps && form.streamUrl && loading.inputSourceDetails && !errors.streamUrl  && (
                <p className="text-xs text-red-500">Unable to fetch FPS from the provided Stream URL.</p>
              )}
            </div> */}

            {/* FPS and Resolution Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  FPS <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fps"
                  placeholder="30"
                  value={form.fps}
                  onChange={(e) => handleFps(e.target.value)}
                  onBlur={(e) => {
                    setTouched({ ...touched, fps: true });
                  }}
                  className={errors.fps ? "border-red-500" : ""}
                />
                {errors.fps && (
                  <p className="text-xs text-red-500">{errors.fps}</p>
                )}
                {fpsError && <p className="text-xs text-red-500">{fpsError}</p>}
              </div>

              <div className="space-y-2">
                <Label>
                  Resolution <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.resolution}
                  onValueChange={(value) => {
                    setForm({ ...form, resolution: value });
                    setTouched({ ...touched, resolution: true });
                  }}
                  disabled={loading.options}
                >
                  <SelectTrigger
                    className={errors.resolution ? "border-red-500" : ""}
                  >
                    <SelectValue
                      placeholder={
                        loading.options
                          ? "Loading resolutions..."
                          : "Select Resolution"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {options.resolutions.filter((r) => selectedCamera && r.ResolutionHeight <= selectedCamera?.resolutionHeight &&  r.ResolutionWidth <= selectedCamera?.resolutionWidth).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.resolution && (
                  <p className="text-xs text-red-500">{errors.resolution}</p>
                )}
              </div>
            </div>

            {/* useCase */}
            <div className="space-y-2">
              <Label>
                Use Case <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.useCase}
                onValueChange={(value) => {
                  setForm({ ...form, useCase: value });
                  setTouched({ ...touched, useCase: true });
                }}
                disabled={loading.options}
              >
                <SelectTrigger
                  className={errors.useCase ? "border-red-500" : ""}
                >
                  <SelectValue
                    placeholder={
                      loading.options
                        ? "Loading use cases..."
                        : "Select Use Case"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {options.useCases.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.useCase && (
                <p className="text-xs text-red-500">{errors.useCase}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onPress={() => setModal(null)}>
              Cancel
            </Button>
            <Button
              onPress={handleSubmitCamera}
              disabled={!isFormValid || fpsError !== "" || submitting}
            >
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Toggle Confirmation Dialog */}
      <AlertDialog
        open={modal === "statusConfirm"}
        onOpenChange={(open) => !open && setModal(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCamera?.status === STATUS.ACTIVE ? (
                <>
                  You are about to <span className="font-semibold text-amber-600 dark:text-amber-500">deactivate</span> the camera &quot;{selectedCamera?.name}&quot;.
                  <br /><br />
                  <span className="font-medium">This will:</span>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Stop the video stream processing</li>
                    <li>Pause all monitoring and alerts</li>
                    <li>Disable AI model inference for this camera</li>
                  </ul>
                  <br />
                  You can reactivate the camera anytime to resume monitoring.
                </>
              ) : (
                <>
                  You are about to <span className="font-semibold text-green-600 dark:text-green-500">activate</span> the camera &quot;{selectedCamera?.name}&quot;.
                  <br /><br />
                  <span className="font-medium">This will:</span>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Start the video stream processing</li>
                    <li>Enable monitoring and alerts</li>
                    <li>Begin AI model inference for this camera</li>
                  </ul>
                  <br />
                  The camera will start streaming and processing immediately.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onPress={() => setModal(null)} disabled={loading.toggling}>
              Cancel
            </Button>
            <Button
              onPress={handleConfirmToggleStatus}
              disabled={loading.toggling}
              className={selectedCamera?.status === STATUS.ACTIVE 
                ? "bg-amber-600 hover:bg-amber-700 text-white" 
                : "bg-green-600 hover:bg-green-700 text-white"}
            >
              {loading.toggling 
                ? (selectedCamera?.status === STATUS.ACTIVE ? "Deactivating..." : "Activating...") 
                : (selectedCamera?.status === STATUS.ACTIVE ? "Deactivate Camera" : "Activate Camera")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={modal === "delete"}
        onOpenChange={(open) => !open && setModal(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Camera</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedCamera?.name}
              &quot;? This action cannot be undone.
              {"\n"}
              All associated recordings and configurations will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onPress={() => setModal(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onPress={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Icon icon={Trash2} className="h-4 w-4 mr-2" />
              Delete Camera
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
