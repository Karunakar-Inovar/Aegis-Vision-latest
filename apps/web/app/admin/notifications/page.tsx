"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  fetchNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
  fetchNotificationChannels,
  fetchSeverityLevels,
  type MetaData,
} from "app/utils/notification";
import { fetchInputSources } from "app/utils/inputsource";
import { useDebounce } from "app";
import {
  validateRecipients,
  getRecipientPlaceholder,
  getRecipientHelperText,
} from "app/utils/notificationValidation";
import {
  Card,
  CardContent,
  Button,
  Icon,
  Badge,
  Input,
  ToggleSwitch,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
  useSnackbar,
  Snackbar,
} from "ui";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MessageSquare,
  AlertTriangle,
} from "ui/utils/icons";
import { UI_MESSAGES } from "app/constants";

// Notification rule type
interface NotificationRule {
  id: number;
  name: string;
  channel: number;
  channelName: string;
  status: boolean;
  alertSeverityId: number;
  severityLevel: string;
  recipients: string;
  isGlobal: boolean;
  inputSources: number[];
  inputSourceNames?: string[];
  createdOn?: string;
}

const getChannelIcon = (channelName: string) => {
  const lowerChannel = channelName.toLowerCase();
  if (lowerChannel.includes("email")) return Mail;
  if (lowerChannel.includes("sms")) return Phone;
  if (lowerChannel.includes("whatsapp")) return MessageSquare;
  return Mail;
};

const getChannelLabel = (channelName: string) => {
  return channelName || "Unknown";
};

export default function NotificationsPage() {
  const snackbar = useSnackbar();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery);
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [metaData, setMetaData] = useState<MetaData | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState({
    notifications: true,
    submitting: false,
    deleting: false,
  });
  const [modal, setModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [isEnableDialogOpen, setIsEnableDialogOpen] = useState(false);
  const [isDisableDialogOpen, setIsDisableDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<NotificationRule | null>(
    null,
  );
  const [ruleToToggle, setRuleToToggle] = useState<NotificationRule | null>(null);
  const [toggle, setToggle] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    channel: "",
    alertSeverityId: "",
    appliesTo: "specific" as "all" | "specific",
    selectedCameras: [] as number[],
    recipients: "",
    template: "",
  });
  const [cameras, setCameras] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [channels, setChannels] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [severityLevels, setSeverityLevels] = useState<
    { value: string; label: string }[]
  >([]);
  const [validationErrors, setValidationErrors] = useState({
    recipients: "",
  });

  // Load notifications
  const loadNotifications = async (append = false, cursor: any = null) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setLoading((l) => ({ ...l, notifications: true }));
      }

      const filters: any = {
        limit: 10,
      };

      if (debouncedSearchQuery) {
        filters.notificationName = debouncedSearchQuery;
      }

      // Add cursor for pagination
      if (cursor) {
        filters.cursorNotificationId = cursor.cursor_id;
        filters.cursorDatetime = cursor.cursor_datetime;
      }

      const response = await fetchNotifications({ filters });

      const notifications: NotificationRule[] = response.data.map((notif) => ({
        id: notif.NotificationId,
        name: notif.NotificationName,
        channel: notif.NotificationChannelId,
        channelName: notif.NotificationChannelName,
        status: notif.IsActive,
        alertSeverityId: notif.AlertSeverityId,
        severityLevel: notif.SeverityLevelName,
        recipients:
          notif.Recipients.map((r) => r.Address || r.address)
            .filter(Boolean)
            .join(", ") || "No recipients",
        isGlobal: notif.IsGlobal,
        inputSources: Array.isArray(notif.InputSources)
          ? notif.InputSources.map((is: any) => is.InputSourceId).filter(
              (id: number) => id > 0,
            )
          : [],
        inputSourceNames: Array.isArray(notif.InputSources)
          ? notif.InputSources.map((is: any) => is.InputSourceName).filter(
              Boolean,
            )
          : [],
        createdOn: notif.CreatedOn,
      }));

      // Append or replace notifications
      if (append) {
        setRules((prev) => [...prev, ...notifications]);
      } else {
        setRules(notifications);
      }

      // Update pagination metadata
      const metadata = response?.metadata || null;
      setMetaData(metadata);
    } catch (error) {
      snackbar.error(UI_MESSAGES.notifications.loadFailed);
      if (!append) {
        setRules([]);
      }
    } finally {
      if (append) {
        setIsLoadingMore(false);
      } else {
        setLoading((l) => ({ ...l, notifications: false }));
      }
    }
  };

  useEffect(() => {
    // Reset pagination when search changes
    setMetaData(null);
    loadNotifications(false, null);
  }, [debouncedSearchQuery]);

  // Infinite scroll observer
  useEffect(() => {
    const triggerElement = loadMoreTriggerRef.current;
    if (!triggerElement || !metaData?.has_more) return;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (
        entry &&
        entry.isIntersecting &&
        !isLoadingMore &&
        !loading.notifications
      ) {
        loadNotifications(true, metaData.next_cursor);
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
  }, [metaData?.has_more, isLoadingMore, loading.notifications]);

  // Load cameras for dropdown
  useEffect(() => {
    const loadCameras = async () => {
      try {
        const response = await fetchInputSources({
          filters: { isActive: true },
        });
        const cameraOptions = response.inputSource.map((cam) => ({
          value: cam.SourceId.toString(),
          label: cam.SourceName,
        }));
        setCameras(cameraOptions);
      } catch (error) {
        setCameras([]);
      }
    };
    loadCameras();
  }, []);

  // Load notification channels
  useEffect(() => {
    const loadChannels = async () => {
      try {
        const response = await fetchNotificationChannels();
        const channelOptions = response.data.map((channel) => ({
          value: channel.NotificationChannelId.toString(),
          label: channel.NotificationChannelName,
        }));
        setChannels(channelOptions);
      } catch (error) {
        setChannels([]);
      }
    };
    loadChannels();
  }, []);

  // Load severity levels
  useEffect(() => {
    const loadSeverityLevels = async () => {
      try {
        const response = await fetchSeverityLevels();
        const severityOptions = response.data.map(
          (severity: {
            SeverityLevelId: number;
            SeverityLevelName: string;
          }) => ({
            value: severity.SeverityLevelId.toString(),
            label: severity.SeverityLevelName,
          }),
        );
        setSeverityLevels(severityOptions);
      } catch (error) {
        setSeverityLevels([]);
      }
    };
    loadSeverityLevels();
  }, []);

  // Filter handled by API via debounced search
  const filteredRules = rules;

  const handleToggleStatus = (rule: NotificationRule) => {
    setRuleToToggle(rule);
    if (rule.status) {
      // If currently active, show disable confirmation
      setIsDisableDialogOpen(true);
    } else {
      // If currently inactive, show enable confirmation
      setIsEnableDialogOpen(true);
    }
  };

  const handleConfirmToggleStatus = async (newStatus: boolean) => {
    if (!ruleToToggle) return;

    try {
      setToggle(ruleToToggle.id);
      if (newStatus) {
        setIsEnableDialogOpen(false);
      } else {
        setIsDisableDialogOpen(false);
      }

      await updateNotification({
        notificationId: ruleToToggle.id,
        isActive: newStatus,
      });

      setRules((prevRules) =>
        prevRules.map((r) =>
          r.id === ruleToToggle.id ? { ...r, status: newStatus } : r,
        ),
      );

      snackbar.success(UI_MESSAGES.notifications.updateSuccessStatus(ruleToToggle.name, newStatus));
    } catch (error) {
      snackbar.error(
        error instanceof Error
          ? error.message
          : UI_MESSAGES.notifications.deleteFailed,
      );
    } finally {
      setToggle(null);
      setRuleToToggle(null);
    }
  };

  const openModal = (
    type: "add" | "edit" | "delete",
    rule?: NotificationRule,
  ) => {
    setModal(type);
    setSelectedRule(rule || null);
    setValidationErrors({ recipients: "" });
    setFormData(
      type === "edit" && rule
        ? {
            name: rule.name || "",
            channel: rule.channel.toString(),
            alertSeverityId: rule.alertSeverityId.toString(),
            appliesTo: rule.isGlobal ? "all" : "specific",
            selectedCameras: rule.inputSources,
            recipients: rule.recipients || "",
            template: "",
          }
        : {
            name: "",
            channel: "",
            alertSeverityId: "",
            appliesTo: "specific",
            selectedCameras: [],
            recipients: "",
            template: "",
          },
    );
  };

  const handleConfirmDelete = async () => {
    if (!selectedRule || loading.deleting) return;

    try {
      setLoading((l) => ({ ...l, deleting: true }));
      await deleteNotification(selectedRule.id);
      setModal(null);
      snackbar.success(
        UI_MESSAGES.notifications.deleteSuccess(selectedRule.name),
      );
      setSelectedRule(null);
      loadNotifications();
    } catch (error) {
      setModal(null);
      snackbar.error(
        `${error instanceof Error ? error.message : UI_MESSAGES.notifications.deleteFailed}`,
      );
    } finally {
      setLoading((l) => ({ ...l, deleting: false }));
    }
  };

  const handleSubmitRule = async () => {
    // Validate required fields
    if (!formData.name || !formData.recipients) {
      snackbar.error(UI_MESSAGES.notifications.requiredFields);
      return;
    }

    // Validate recipients based on channel
    const recipientError = validateRecipients(
      formData.recipients,
      formData.channel,
    );
    if (recipientError) {
      setValidationErrors({ recipients: recipientError });
      snackbar.error(UI_MESSAGES.notifications.recipientError(recipientError));
      return;
    }

    // Validate camera selection
    if (
      formData.appliesTo === "specific" &&
      formData.selectedCameras.length === 0
    ) {
      snackbar.error(UI_MESSAGES.notifications.cameraRequired);
      return;
    }

    setValidationErrors({ recipients: "" });

    if (loading.submitting) return;
    setLoading((l) => ({ ...l, submitting: true }));

    try {
      const recipientsList = formData.recipients
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);
      const recipients = recipientsList.map((addr) => ({
        notificationChannelId: parseInt(formData.channel),
        address: addr,
        template: formData.template || "",
      }));

      const requestData = {
        notificationName: formData.name,
        notificationChannelId: parseInt(formData.channel),
        alertSeverityId: parseInt(formData.alertSeverityId),
        isActive: true,
        isGlobal: formData.appliesTo === "all",
        recipients,
        inputSources:
          formData.appliesTo === "all" ? [] : formData.selectedCameras,
      };

      if (modal === "edit" && selectedRule) {
        await updateNotification({
          ...requestData,
          notificationId: selectedRule.id,
        });
        snackbar.success(
          UI_MESSAGES.notifications.updateSuccess(formData.name)
        );
        // after editing, update the state to reflect changes
        setRules((prevRules) =>
          prevRules.map((r) =>
            r.id === selectedRule.id
              ? {
                  ...r,
                  name: formData.name,
                  channel: parseInt(formData.channel),
                  channelName:
                    channels.find((ch) => ch.value === formData.channel)
                      ?.label || r.channelName,
                  alertSeverityId: parseInt(formData.alertSeverityId),
                  inputSources: formData.selectedCameras,
                  inputSourceNames: cameras
                    .filter((cam) =>
                      formData.selectedCameras.includes(parseInt(cam.value)),
                    )
                    .map((cam) => cam.label),
                  recipients: formData.recipients,
                }
              : r,
          ),
        );
      } else {
        await createNotification(requestData);
        snackbar.success(
          UI_MESSAGES.notifications.createSuccess(formData.name),
        );
        loadNotifications();
      }

      setModal(null);
      setFormData({
        name: "",
        channel: "",
        alertSeverityId: "",
        appliesTo: "all",
        selectedCameras: [],
        recipients: "",
        template: "",
      });
      setValidationErrors({ recipients: "" });
    } catch (error) {
      snackbar.error(
        error instanceof Error
          ? error.message
          : UI_MESSAGES.notifications.sendFailed,
      );
    } finally {
      setLoading((l) => ({ ...l, submitting: false }));
    }
  };

  // Apply to options
  const appliesToOptions = [
    { value: "all", label: "All Camera (Default)", disabled: true },
    { value: "specific", label: "Specific Camera", disabled: false },
  ];

  // Toggle camera selection
  const handleCameraToggle = (cameraId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedCameras: prev.selectedCameras.includes(parseInt(cameraId))
        ? prev.selectedCameras.filter((id) => id !== parseInt(cameraId))
        : [...prev.selectedCameras, parseInt(cameraId)],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Notification Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure alert channels and routing rules
          </p>
        </div>
        <Button onPress={() => openModal("add")} className="w-full sm:w-auto">
          <Icon icon={Plus} className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full">
        <Icon
          icon={Search}
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <Input
          placeholder="Search notification rules..."
          value={searchQuery}
          onChangeText={(value) => setSearchQuery(value)}
          className="pl-10 w-full"
        />
      </div>

      {/* Notification Rule Cards */}
      <div className="space-y-4">
        {loading.notifications ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Loading notifications...
            </CardContent>
          </Card>
        ) : filteredRules.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              {searchQuery
                ? "No notifications found matching your search"
                : "No notifications available"}
            </CardContent>
          </Card>
        ) : (
          <>
            {filteredRules.map((rule) => (
              <Card key={rule.id} className="overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    {/* Left side - Rule info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Icon */}
                      <div className="p-3 rounded-lg bg-muted">
                        <Icon
                          icon={getChannelIcon(rule.channelName)}
                          className="h-5 w-5 text-muted-foreground"
                        />
                      </div>

                      {/* Rule Details */}
                      <div className="flex-1 space-y-3">
                        {/* Title */}
                        <h3 className="text-lg font-semibold text-foreground">
                          {rule.name}
                        </h3>

                        {/* Channel and Status badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className="bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                          >
                            {getChannelLabel(rule.channelName)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              rule.status
                                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                                : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700"
                            }
                          >
                            {rule.status ? "Active" : "Inactive"}
                          </Badge>
                        </div>

                        {/* Severity Level */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-muted-foreground">
                            Severity:
                          </span>
                          <Badge
                            variant="outline"
                            className="bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                          >
                            <Icon
                              icon={AlertTriangle}
                              className="h-3 w-3 mr-1"
                            />
                            {rule.severityLevel}
                          </Badge>
                        </div>

                        {/* Recipients */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Recipients:
                          </span>
                          <span className="text-sm text-foreground font-medium">
                            {rule.recipients}
                          </span>
                        </div>

                        {/* Applies To */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-muted-foreground">
                            Applies To:
                          </span>
                          {rule.isGlobal ? (
                            <Badge
                              variant="outline"
                              className="bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                            >
                              All Cameras
                            </Badge>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {rule.inputSourceNames &&
                              rule.inputSourceNames.length > 0 ? (
                                rule.inputSourceNames.map(
                                  (cameraName, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                                    >
                                      {cameraName}
                                    </Badge>
                                  ),
                                )
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                                >
                                  {rule.inputSources.length} Camera(s)
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex items-center gap-3 flex-shrink-0 flex-wrap sm:flex-nowrap">
                      {/* Toggle Switch with Label */}
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={`rule-toggle-${rule.id}`}
                          className="text-sm text-muted-foreground cursor-pointer"
                        >
                          {rule.status ? "Enabled" : "Disabled"}
                        </Label>
                        <ToggleSwitch
                          id={`rule-toggle-${rule.id}`}
                          checked={rule.status}
                          onCheckedChange={() => handleToggleStatus(rule)}
                          size="md"
                          disabled={toggle === rule.id}
                        />
                      </div>
                      <div className="h-6 w-px bg-border" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onPress={() => openModal("edit", rule)}
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
                        onPress={() => openModal("delete", rule)}
                      >
                        <Icon icon={Trash2} className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Infinite scroll trigger */}
            {metaData?.has_more && (
              <div ref={loadMoreTriggerRef} className="py-4 text-center">
                {isLoadingMore && (
                  <p className="text-sm text-muted-foreground">
                    Loading more notifications...
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Notification Rule Modal */}
      <Dialog
        open={modal === "add" || modal === "edit"}
        onOpenChange={(open) => !open && setModal(null)}
      >
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] flex flex-col p-0">
          {/* Sticky Header */}
          <DialogHeader className="sticky top-0 border-b border-border bg-background px-6 py-4 z-10">
            <DialogTitle>
              {modal === "edit" ? "Edit" : "Add"} Notification Rule
            </DialogTitle>
            <DialogDescription>
              Configure alert routing and recipients
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {/* Rule Name */}
              <div className="space-y-2">
                <Label htmlFor="rule-name">Rule Name</Label>
                <Input
                  id="rule-name"
                  placeholder="e.g., Critical Alerts to Admin"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              {/* Notification Channel */}
              <div className="space-y-2">
                <Label>Notification Channel</Label>
                <Select
                  value={formData.channel}
                  onValueChange={(value) =>
                    setFormData({ ...formData, channel: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {channels.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Alert Severity */}
              <div className="space-y-2">
                <Label>Alert Severity Level</Label>
                <Select
                  value={formData.alertSeverityId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, alertSeverityId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity level" />
                  </SelectTrigger>
                  <SelectContent>
                    {severityLevels.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Apply Rule To */}
              <div className="space-y-2">
                <Label>Apply Rule To</Label>
                <Select
                  value={formData.appliesTo}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      appliesTo: value as "all" | "specific",
                      selectedCameras:
                        value === "all" ? [] : formData.selectedCameras,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    {appliesToOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Camera Selection - Show when "Specific Camera" is selected */}
                {formData.appliesTo === "specific" && (
                  <div className="border border-border rounded-md p-4 space-y-3 bg-background mt-2 max-h-48 overflow-y-auto">
                    {cameras.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No active cameras available
                      </p>
                    ) : (
                      cameras.map((camera) => (
                        <div
                          key={camera.value}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`camera-${camera.value}`}
                            checked={formData.selectedCameras.includes(
                              parseInt(camera.value),
                            )}
                            onCheckedChange={() =>
                              handleCameraToggle(camera.value)
                            }
                          />
                          <Label
                            htmlFor={`camera-${camera.value}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {camera.label}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Recipients */}
              <div className="space-y-2">
                <Label htmlFor="recipients">Recipients</Label>
                <Input
                  id="recipients"
                  placeholder={getRecipientPlaceholder(
                    parseInt(formData.channel) || 0,
                  )}
                  value={formData.recipients}
                  onChange={(e) => {
                    setFormData({ ...formData, recipients: e.target.value });
                    // Clear validation error when user types
                    if (validationErrors.recipients) {
                      setValidationErrors({ recipients: "" });
                    }
                  }}
                  className={
                    validationErrors.recipients ? "border-red-500" : ""
                  }
                  disabled={!formData.channel}
                />
                {validationErrors.recipients && (
                  <p className="text-xs text-red-600">
                    {validationErrors.recipients}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {getRecipientHelperText(parseInt(formData.channel) || 0)}
                </p>
              </div>

              {/* Informational Box */}
              <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  Notification rules control how and where alerts are sent when
                  triggered by your sources.
                </p>
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <DialogFooter className="sticky bottom-0 border-t border-border bg-background px-6 py-4">
            <Button
              variant="outline"
              onPress={() => setModal(null)}
              disabled={loading.submitting}
            >
              Cancel
            </Button>
            <Button
              onPress={handleSubmitRule}
              disabled={
                !formData.name ||
                !formData.recipients ||
                (formData.appliesTo === "specific" &&
                  formData.selectedCameras.length === 0) ||
                loading.submitting
              }
            >
              {loading.submitting
                ? "Saving..."
                : modal === "edit"
                  ? "Save Changes"
                  : "Add Rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enable Notification Confirmation Dialog */}
      <AlertDialog
        open={isEnableDialogOpen}
        onOpenChange={setIsEnableDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enable Notification Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to enable &quot;{ruleToToggle?.name}&quot;?
              <br /><br />
              <span className="font-medium">This will:</span>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Start sending alerts through {ruleToToggle?.channelName}</li>
                <li>Notify recipients: {ruleToToggle?.recipients}</li>
                <li>Apply to {ruleToToggle?.isGlobal ? "all cameras" : `${ruleToToggle?.inputSources.length} selected camera(s)`}</li>
                <li>Trigger on {ruleToToggle?.severityLevel} severity alerts</li>
              </ul>
              <br />
              Recipients will start receiving notifications immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <Button
              variant="outline"
              onPress={() => {
                setIsEnableDialogOpen(false);
                setRuleToToggle(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onPress={() => handleConfirmToggleStatus(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Enable Notifications
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Disable Notification Confirmation Dialog */}
      <AlertDialog
        open={isDisableDialogOpen}
        onOpenChange={setIsDisableDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable Notification Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disable &quot;{ruleToToggle?.name}&quot;?
              <br /><br />
              <span className="font-medium">This will:</span>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Stop sending alerts through {ruleToToggle?.channelName}</li>
                <li>Pause notifications to: {ruleToToggle?.recipients}</li>
                <li>No alerts will be sent for {ruleToToggle?.isGlobal ? "any cameras" : "the selected cameras"}</li>
                <li>Rule configuration will be preserved</li>
              </ul>
              <br />
              You can re-enable this rule anytime to resume notifications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <Button
              variant="outline"
              onPress={() => {
                setIsDisableDialogOpen(false);
                setRuleToToggle(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onPress={() => handleConfirmToggleStatus(false)}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Disable Notifications
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
            <AlertDialogTitle>Delete Notification Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedRule?.name}"? This
              action cannot be undone. All alert routing configured for this
              rule will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <Button variant="outline" onPress={() => setModal(null)} disabled={loading.deleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onPress={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={loading.deleting}
            >
              <Icon icon={Trash2} className="h-4 w-4 mr-2" />
              {loading.deleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Snackbar
        visible={snackbar.state.visible}
        message={snackbar.state.message}
        variant={snackbar.state.variant}
        onClose={snackbar.hide}
      />
    </div>
  );
}
