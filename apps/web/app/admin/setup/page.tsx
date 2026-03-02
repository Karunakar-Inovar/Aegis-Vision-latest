"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  fetchIndustries,
  fetchCompanySizes,
  upsertOrganization,
  type OrganizationIndustry,
  type OrganizationSize,
} from "app/utils/organization";
import {
  createInputSource,
  fetchInputSourceDetails,
  type InputSourceDetails,
} from "app/utils/inputsource";
import { fetchLocations, type Location } from "app/utils/location";
import { fetchResolutions, type Resolution } from "app/utils/resolution";
import { fetchUseCases, type UseCase } from "app/utils/usecase";
import { fetchRoles, type Role } from "app/utils/roles";
import { createPipeline,  } from "app/utils/pipeline";
import {
  createNotification,
} from "app/utils/notification";
import { createUser, } from "app/utils/user";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  Label,
  Badge,
  Separator,
  Icon,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Snackbar,
  useSnackbar,
} from "ui";
import {
  Building2,
  Camera as CameraIcon,
  GitBranch,
  Bell,
  Users,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Save,
  Trash2,
  Plus,
  UploadCloud,
  WebcamIcon,
  Sparkles,
  Mail,
  Phone,
  MessageSquare,
  Link,
  Cpu,
  ChevronUp,
  ChevronDown,
  Upload,
  Check,
  UserPlus,
  AlertTriangle,
} from "ui/utils/icons";
import {
  getSetupProgress,
  setCurrentStep,
  completeStep,
  updateOrganization,
  saveCamera,
  removeCamera,
  savePipeline,
  removePipeline,
  saveNotificationChannel,
  addUserInvite,
  removeUserInvite,
  markSetupComplete,
  type OrganizationDetails,
  type Camera,
  type Pipeline,
  type NotificationChannel,
  type UserInvite,
} from "app/utils/setup";
import { ROUTES, UI_MESSAGES, UserRole } from "app/constants";

const TOTAL_STEPS = 6;

const STEP_CONFIG = [
  {
    number: 1,
    title: "Organization Details",
    icon: Building2,
    required: true,
    description:
      "Tell us about your organization. This information will be used across the platform.",
  },
  {
    number: 2,
    title: "Add Cameras",
    icon: CameraIcon,
    required: true,
    description:
      "Connect your IP cameras. You need at least one camera to proceed.",
  },
  {
    number: 3,
    title: "Create Pipelines",
    icon: GitBranch,
    required: true,
    description:
      "Set up monitoring pipelines by assigning cameras and AI models. At least one pipeline is required.",
  },
  {
    number: 4,
    title: "Notification & Alert Channels",
    icon: Bell,
    required: true,
    description:
      "Configure global notification channels and customize channels for specific pipelines.",
  },
  {
    number: 5,
    title: "User & Role Provisioning",
    icon: Users,
    required: true,
    description: "Invite team members and assign permissions",
  },
  {
    number: 6,
    title: "Review & Finalize",
    icon: CheckCircle2,
    required: true,
    description:
      "Review your configuration and launch your Aegis Vision system.",
  },
];

export default function SetupWizard() {
  const router = useRouter();
  const snackbar = useSnackbar();
  const [currentStep, setCurrentStepState] = useState(1);
  const [progress, setProgress] = useState(getSetupProgress());
  const [loading, setLoading] = useState(false);
  const currentStepMeta = STEP_CONFIG.find(
    (step) => step.number === currentStep,
  );

  useEffect(() => {
    const stored = getSetupProgress();
    setCurrentStepState(stored.currentStep);
    setProgress(stored);
  }, []);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      const nextStep = currentStep + 1;
      setCurrentStepState(nextStep);
      setCurrentStep(nextStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStepState(prevStep);
      setCurrentStep(prevStep);
    }
  };

  const handleSaveAndExit = () => {
    setCurrentStep(currentStep);
    router.push(ROUTES.ADMIN.DASHBOARD);
  };

  const refreshProgress = () => {
    setProgress(getSetupProgress());
  };

  const handleLaunch = async () => {
    try {
      if (loading) return;
      setLoading(true);
      // Step 1: Upsert Organization
      if (progress.organization) {
        await upsertOrganization({
          organizationName: progress.organization.name,
          industryId: parseInt(progress.organization.industry),
          companySizeId: parseInt(progress.organization.companySize),
          logo: progress.organization.logo || null,
          organizationDomain: progress.organization.domain || null,
        });
      }

      // Step 2: Create Input Sources (cameras) and collect their IDs
      const cameraIdMap: Record<string, number> = {};
      for (const camera of progress.cameras) {

        const inputSource = await createInputSource({
          sourceName: camera.name,
          sourceUrl: camera.rtspUrl,
          locationId: parseInt(camera?.location || "0"),
          inputSourceResolutionId: parseInt(camera?.resolution || "0"),
          targetFps: parseInt(camera?.fps || "0"),
          useCaseId: parseInt(camera?.useCase || "0"),
          sourceTypeId: 1,
          createdBy: 0,
          width: 1920,
          height: 1080,
          originalFps: camera.originalFps || undefined,
          webrtcUrl: camera.webrtcUrl || "",
          gstreamerUrl: camera.gstreamerUrl || "",
        });
        // Map local camera ID to server-generated ID
        cameraIdMap[camera.id] = inputSource.InputSourceId;
      }

      // Step 3: Create Pipelines with real camera IDs
      for (const pipeline of progress.pipelines) {
        const realCameraIds = pipeline.cameraIds
          .map((cameraId) => cameraIdMap[cameraId])
          .filter((id) => id !== undefined);

        if (realCameraIds.length > 0) {
          await createPipeline({
            pipelineName: pipeline.name,
            inputSourceId: realCameraIds,
            useCaseId: parseInt(pipeline.modelId),
          });
        }
      }

      // Step 4: Create Notification channels
      if (progress.notifications.email?.enabled) {
        const emails = progress.notifications.email.config.toEmails
          .split(",")
          .map((e) => e.trim())
          .filter((e) => e);

        if (emails.length > 0) {
          await createNotification({
            notificationName: "Email Alerts",
            notificationChannelId: 1,
            alertSeverityId: 1,
            isActive: true,
            isGlobal: true,
            recipients: [
              {
                address: progress.notifications.email.config.toEmails,
                template: "",
                notificationChannelId: 1,
              },
            ],
            inputSources: [],
          });
        }
      }

      if (progress.notifications.sms?.enabled) {
        const phones = progress.notifications.sms.config.phoneNumbers
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p);

        if (phones.length > 0) {
          await createNotification({
            notificationName: "SMS Alerts",
            notificationChannelId: 2,
            alertSeverityId: 1,
            isActive: true,
            isGlobal: true,
            recipients: [
              {
                address: progress.notifications.sms.config.phoneNumbers,
                template: "",
                notificationChannelId: 2,
              },
            ],
            inputSources: [],
          });
        }
      }

      if (progress.notifications.whatsapp?.enabled) {
        const phones = progress.notifications.whatsapp.config.phoneNumbers
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p);

        if (phones.length > 0) {
          await createNotification({
            notificationName: "WhatsApp Alerts",
            notificationChannelId: 3,
            alertSeverityId: 1,
            isActive: true,
            isGlobal: true,
            recipients: [
              {
                address: progress.notifications.whatsapp.config.phoneNumbers,
                template: "",
                notificationChannelId: 3,
              },
            ],
            inputSources: [],
          });
        }
      }

      if (
        progress.notifications.webhook?.enabled &&
        progress.notifications.webhook.config.url
      ) {
        await createNotification({
          notificationName: "Webhook Alerts",
          notificationChannelId: 4,
          alertSeverityId: 1,
          isActive: true,
          isGlobal: true,
          recipients: [
            {
              address: progress.notifications.webhook.config.url,
              template: "",
              notificationChannelId: 4,
            },
          ],
          inputSources: [],
        });
      }

      if (
        progress.notifications.plc?.enabled &&
        progress.notifications.plc.config.ipAddress
      ) {
        await createNotification({
          notificationName: "PLC Trigger",
          notificationChannelId: 5,
          alertSeverityId: 1,
          isActive: true,
          isGlobal: true,
          recipients: [
            {
              address: progress.notifications.plc.config.ipAddress,
              template: "",
              notificationChannelId: 5,
            },
          ],
          inputSources: [],
        });
      }

      // Step 5: Create Users (invites)
      for (const invite of progress.invites) {
        // Find role ID by role name
        const roleMap: Record<string, number> = {
          monitor: 1,
          stakeholder: 2,
        };

        await createUser({
          name: invite.name, // Use email prefix as name
          email: invite.email,
          roleId: roleMap[invite.role] || 1,
        });
      }

      // Mark setup as complete and redirect
      markSetupComplete();
      router.push(ROUTES.ADMIN.DASHBOARD);
    } catch (error) {
      snackbar.error(UI_MESSAGES.setup.launchFailed);
    } finally {
      // Any cleanup if necessary
      setLoading(false);
    }
  };

  return (
    <>
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {currentStepMeta?.title ?? "Setup"}
              </h1>
              {currentStepMeta && !currentStepMeta.required && (
                <Badge variant="secondary">Optional</Badge>
              )}
            </div>
            {currentStepMeta?.description && (
              <p className="text-base text-muted-foreground">
                {currentStepMeta.description}
              </p>
            )}
          </div>
          {currentStep !== 6 && (
            <Button variant="ghost" size="sm" onClick={handleSaveAndExit}>
              <Icon icon={Save} className="mr-2 h-4 w-4" />
              Save & Exit
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Step {currentStep} of {TOTAL_STEPS}
            </span>
            <span>
              {Math.round((currentStep / TOTAL_STEPS) * 100)}% Complete
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {/* Step list intentionally removed */}
      </div>

      {/* Step Content */}
      <Card>
        {currentStep === 1 && (
          <Step1OrganizationDetails
            onNext={handleNext}
            onComplete={() => completeStep(1)}
            initialData={progress.organization}
            refreshProgress={refreshProgress}
          />
        )}
        {currentStep === 2 && (
          <Step2AddCameras
            onNext={handleNext}
            onBack={handleBack}
            onComplete={() => completeStep(2)}
            cameras={progress.cameras}
            refreshProgress={refreshProgress}
          />
        )}
        {currentStep === 3 && (
          <Step3CreatePipelines
            onNext={handleNext}
            onBack={handleBack}
            onComplete={() => completeStep(3)}
            pipelines={progress.pipelines}
            cameras={progress.cameras}
            refreshProgress={refreshProgress}
          />
        )}
        {currentStep === 4 && (
          <Step4NotificationChannels
            onNext={() => {
              completeStep(4);
              handleNext();
            }}
            onBack={handleBack}
            notifications={progress.notifications}
            pipelines={progress.pipelines}
            refreshProgress={refreshProgress}
          />
        )}
        {currentStep === 5 && (
          <Step5InviteUsers
            onNext={() => {
              completeStep(5);
              handleNext();
            }}
            onBack={handleBack}
            invites={progress.invites}
            refreshProgress={refreshProgress}
          />
        )}
        {currentStep === 6 && (
          <Step6ReviewFinalize
            onBack={handleBack}
            progress={progress}
            onFinalize={handleLaunch}
            loading={loading}
          />
        )}
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        visible={snackbar.state.visible}
        message={snackbar.state.message}
        variant={snackbar.state.variant}
        actionText={snackbar.state.actionText}
        onAction={snackbar.state.onAction}
        onClose={snackbar.hide}
      />
    </>
  );
}

// ============================================================================
// STEP 1: Organization Details
// ============================================================================

interface Step1Props {
  onNext: () => void;
  onComplete: () => void;
  initialData?: OrganizationDetails;
  refreshProgress: () => void;
}

function Step1OrganizationDetails({
  onNext,
  onComplete,
  initialData,
  refreshProgress,
}: Step1Props) {
  const [logoPreview, setLogoPreview] = useState<string | undefined>(
    initialData?.logo,
  );
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [industries, setIndustries] = useState<OrganizationIndustry[]>([]);
  const [companySizes, setCompanySizes] = useState<OrganizationSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<OrganizationDetails>({
    defaultValues: initialData || {
      name: "",
      domain: "",
      industry: "",
      companySize: "",
      logo: "",
    },
  });

  useEffect(() => {
    loadOrganizationData();
  }, []);

  const loadOrganizationData = async () => {
    try {
      setLoading(true);
      const [industriesData, sizesData] = await Promise.all([
        fetchIndustries(),
        fetchCompanySizes(),
      ]);
      setIndustries(industriesData);
      setCompanySizes(sizesData);
    } catch (error) {
      console.error("Error loading organization data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processLogoFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setLogoPreview(base64String);
      form.setValue("logo", base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processLogoFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      processLogoFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(undefined);
    form.setValue("logo", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = (values: OrganizationDetails) => {
    updateOrganization(values);
    onComplete();
    refreshProgress();
    onNext();
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Organization name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Corporation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="domain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain</FormLabel>
                  <FormControl>
                    <Input placeholder="acme.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="industry"
                rules={{ required: "Industry is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              loading ? "Loading..." : "Select your industry"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem
                            key={industry.OrganizationIndustryId}
                            value={industry.OrganizationIndustryId.toString()}
                          >
                            {industry.OrganizationIndustryName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companySize"
                rules={{ required: "Company size is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Size *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              loading ? "Loading..." : "Select company size"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companySizes.map((size) => (
                          <SelectItem
                            key={size.OrganizationSizeId}
                            value={size.OrganizationSizeId.toString()}
                          >
                            {size.OrganizationSize}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Logo Upload */}
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Logo</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      {logoPreview ? (
                        <div className="flex items-center gap-4">
                          <div className="h-24 w-24 rounded-md border border-border bg-muted flex items-center justify-center overflow-hidden">
                            <img
                              src={logoPreview}
                              alt="Logo preview"
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Icon
                                icon={UploadCloud}
                                className="mr-2 h-4 w-4"
                              />
                              Replace
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveLogo}
                            >
                              <Icon icon={Trash2} className="mr-2 h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`flex flex-col items-center justify-center rounded-md border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${
                            isDragActive
                              ? "border-primary bg-primary/5"
                              : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          <Icon
                            icon={UploadCloud}
                            className="h-10 w-10 text-muted-foreground mb-3"
                          />
                          <p className="font-medium">Drag & drop your logo</p>
                          <p className="text-sm text-muted-foreground">
                            or click to browse files
                          </p>
                          <span className="mt-2 text-xs text-muted-foreground">
                            PNG, JPG up to 2MB
                          </span>
                        </div>
                      )}
                      <input
                        id="logo-upload"
                        type="file"
                        title="Logo Upload"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="sticky bottom-0 z-10 flex flex-col gap-3 border-t bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:flex-row sm:justify-end">
            <Button
              type="submit"
              className="w-full sm:w-auto"
              onClick={(e) => {
                e?.preventDefault?.();
                form.handleSubmit(onSubmit)();
              }}
            >
              Continue
              <Icon icon={ArrowRight} className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </form>
      </Form>
    </>
  );
}

// ============================================================================
// STEP 2: Add Cameras
// ============================================================================

interface Step2Props {
  onNext: () => void;
  onBack: () => void;
  onComplete: () => void;
  cameras: Camera[];
  refreshProgress: () => void;
}

const CAMERA_FORM_DEFAULTS = {
  name: "",
  rtspUrl: "",
  fps: "",
  resolution: "",
  location: "",
  useCase: "",
};

function Step2AddCameras({
  onNext,
  onBack,
  onComplete,
  cameras,
  refreshProgress,
}: Step2Props) {
  const snackbar = useSnackbar();
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [streamDetails, setStreamDetails] = useState<InputSourceDetails | null>(
    null,
  );
  const [isFetchingStream, setIsFetchingStream] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  const form = useForm<Omit<Camera, "id" | "status">>({
    defaultValues: CAMERA_FORM_DEFAULTS,
  });

  useEffect(() => {
    const loadCameraData = async () => {
      try {
        setLoading(true);
        const [locationsData, resolutionsData, useCasesData] =
          await Promise.all([
            fetchLocations(),
            fetchResolutions(),
            fetchUseCases(),
          ]);
        setLocations(locationsData);
        setResolutions(resolutionsData);
        setUseCases(useCasesData.useCases || []);
      } catch (error) {
        console.error("Error loading camera data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCameraData();
  }, []); // Only run once on mount

  useEffect(() => {
    if (editingCamera) {
      form.reset({ ...CAMERA_FORM_DEFAULTS, ...editingCamera });
    } else {
      form.reset(CAMERA_FORM_DEFAULTS);
    }
  }, [editingCamera, form]);

  const validateRtspUrl = (url: string): boolean => {
    // RTSP URL pattern validation
    const rtspPattern = /^rtsp:\/\/.+/i;
    return rtspPattern.test(url);
  };

  const handleFetchStreamDetails = async (rtspUrl: string) => {
    if (!rtspUrl || !validateRtspUrl(rtspUrl)) {
      setStreamDetails(null);
      setStreamError(null);
      return;
    }

    setIsFetchingStream(true);
    setStreamDetails(null);
    setStreamError(null);

    try {
      const details = await fetchInputSourceDetails(rtspUrl);
      setStreamDetails(details);
      setStreamError(null);

      // Auto-populate FPS if available
      if (details.fps) {
        form.setValue("fps", details.fps.toString());
      }

      // Auto-select resolution if it matches
      if (details.width && details.height) {
        const matchingResolution = resolutions.find(
          (r) =>
            r.ResolutionWidth === details.width &&
            r.ResolutionHeight === details.height,
        );
        if (matchingResolution) {
          form.setValue(
            "resolution",
            matchingResolution.InputSourceResolutionId.toString(),
          );
        }
      }
    } catch (error: any) {
      setStreamError(error.message);
      setStreamDetails(null);
    } finally {
      setIsFetchingStream(false);
    }
  };

  const handleSaveCamera = (values: Omit<Camera, "id" | "status">) => {
    const newCamera: Camera = {
      ...values,
      id: editingCamera?.id || `cam-${Date.now()}`,
      status: editingCamera?.status || "offline",
      originalFps: streamDetails?.fps,
      gstreamerUrl: streamDetails?.gstPipeline,
      webrtcUrl: streamDetails?.webrtcPipeline,
    };

    saveCamera(newCamera);
    refreshProgress();
    setEditingCamera(null);
    form.reset(CAMERA_FORM_DEFAULTS);
  };

  const handleEditCamera = (camera: Camera) => {
    setEditingCamera(camera);
  };

  const handleDeleteCamera = (cameraId: string) => {
    removeCamera(cameraId);
    refreshProgress();
    if (editingCamera?.id === cameraId) {
      setEditingCamera(null);
      form.reset(CAMERA_FORM_DEFAULTS);
    }
  };

  const handleAddAnother = () => {
    setEditingCamera(null);
    setStreamError(null);
    setStreamDetails(null);
    form.reset(CAMERA_FORM_DEFAULTS);
  };

  const handleContinue = () => {
    if (cameras.length === 0) {
      snackbar.error("Please add at least one camera to continue.");
      return;
    }
    onComplete();
    onNext();
  };

  return (
    <>
      <CardContent className="space-y-6">
        <div className="rounded-2xl border-2 border-dashed border-muted-foreground/40 bg-muted/20 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <Icon icon={WebcamIcon} className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-lg">Bulk Camera Upload</p>
                  <Badge variant="secondary" className="text-xs">
                    Coming Soon
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Import multiple cameras at once via CSV for faster deployment.
                </p>
              </div>
            </div>
            <Button variant="outline" className="self-start md:self-auto">
              Request Early Access
            </Button>
          </div>
        </div>

        {cameras.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Configured Cameras ({cameras.length})
            </h3>
            <div className="space-y-3">
              {cameras.map((camera, index) =>
                editingCamera && editingCamera.id === camera.id ? null : (
                  <div
                    key={camera.id}
                    className="rounded-2xl border bg-card p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold flex items-center gap-2">
                          <Icon icon={CameraIcon} className="h-4 w-4" />
                          Camera {index + 1}: {camera.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {camera.rtspUrl}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCamera(camera)}
                        >
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Icon
                                icon={Trash2}
                                className="h-4 w-4 text-destructive"
                              />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete camera?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove{" "}
                                <span className="font-medium">
                                  {camera.name || "this camera"}
                                </span>{" "}
                                from the setup. Any pipelines using this camera
                                will need to be updated.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel asChild>
                                <Button variant="outline">Cancel</Button>
                              </AlertDialogCancel>
                              <AlertDialogAction asChild>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDeleteCamera(camera.id)}
                                >
                                  Delete
                                </Button>
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>
                        Location:{" "}
                        {camera.location
                          ? (locations.find(
                              (l) =>
                                l.LocationId.toString() === camera.location,
                            )?.LocationName ?? camera.location)
                          : "Not set"}
                      </span>
                      <span>
                        Use Case:{" "}
                        {camera.useCase
                          ? (useCases.find(
                              (uc) =>
                                uc.UseCaseId.toString() === camera.useCase,
                            )?.UseCaseName ?? camera.useCase)
                          : "Not set"}
                      </span>
                      <span>Frame Rate: {camera.fps ?? "—"}</span>
                      <span>
                        Resolution:{" "}
                        {camera.resolution
                          ? (resolutions.find(
                              (r) =>
                                r.InputSourceResolutionId.toString() ===
                                camera.resolution,
                            )?.ResolutionName ?? "—")
                          : ""}
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSaveCamera)}
            className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">
                  {editingCamera
                    ? `Editing ${editingCamera.name}`
                    : `Camera ${cameras.length + 1}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  Define the stream details and deployment zone.
                </p>
              </div>
              {editingCamera && (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleAddAnother}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isFetchingStream || !!streamError}
                  >
                    {isFetchingStream ? "Validating..." : "Update Camera"}
                  </Button>
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Camera name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Camera Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Production Line 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                rules={{ required: "Location is required" }}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              loading ? "Loading..." : "Select location"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem
                            key={location.LocationId}
                            value={location.LocationId.toString()}
                          >
                            {location.LocationName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="rtspUrl"
                rules={{
                  required: "RTSP URL is required",
                  validate: (value) =>
                    validateRtspUrl(value) ||
                    "Invalid RTSP URL format. Must start with rtsp://",
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RTSP URL *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="rtsp://username:password@192.168.1.100:554/stream"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleFetchStreamDetails(`${e.target.value}`);
                          }}
                        />
                        {isFetchingStream && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Icon
                              icon={Cpu}
                              className="h-4 w-4 animate-spin text-muted-foreground"
                            />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                    {streamError && (
                      <p className="text-sm text-destructive mt-1 flex items-start gap-2">
                        <Icon
                          icon={AlertTriangle}
                          className="h-4 w-4 mt-0.5 shrink-0"
                        />
                        <span>{streamError}</span>
                      </p>
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                rules={{ required: "Use case is required" }}
                name="useCase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Use Case*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              loading ? "Loading..." : "Select use case"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {useCases.map((useCase) => (
                          <SelectItem
                            key={useCase.UseCaseId}
                            value={useCase.UseCaseId.toString()}
                          >
                            {useCase.UseCaseName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                disabled={
                  isFetchingStream || (streamDetails && !streamError)
                    ? true
                    : false
                }
                rules={{
                  required: "FPS is required",
                  validate: (value) => {
                    const num = parseInt(value || '0');
                    if (isNaN(num) || num > streamDetails?.originalFps!) {
                      return `FPS cannot exceed ${streamDetails?.originalFps}`;
                    }
                    return true;
                  },
                }}
                name="fps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frame Rate (FPS)*</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={
                          isFetchingStream
                            ? "Loading..."
                            : streamDetails
                              ? `Max ${streamDetails.originalFps}`
                              : "e.g., 30"
                        }
                        min="1"
                        max={streamDetails?.originalFps || 120}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="resolution"
                rules={{ required: "Resolution is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resolution*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              loading ? "Loading..." : "Select resolution"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {resolutions.length > 0 &&
                          resolutions.map((resolution) => (
                            <SelectItem
                              key={resolution.InputSourceResolutionId}
                              value={`${resolution.InputSourceResolutionId}`}
                            >
                              {resolution.ResolutionName ||
                                `${resolution.ResolutionWidth}x${resolution.ResolutionHeight}`}
                            </SelectItem>
                          ))}
                      </SelectContent>
                      <FormMessage />
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {!editingCamera && (
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleAddAnother}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isFetchingStream || !!streamError}
                >
                  {isFetchingStream ? "Validating..." : "Save Camera"}
                </Button>
              </div>
            )}
          </form>
        </Form>

        <Button
          type="button"
          variant="ghost"
          className="w-full justify-center border border-dashed border-border py-6 text-base"
          onClick={handleAddAnother}
        >
          <Icon icon={Plus} className="mr-2 h-4 w-4" />
          Add Another Camera
        </Button>
      </CardContent>
      <CardFooter className="sticky bottom-0 z-10 flex flex-col gap-3 border-t bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
          <Icon icon={ArrowLeft} className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={cameras.length === 0}
          className="w-full sm:w-auto"
        >
          Continue
          <Icon icon={ArrowRight} className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </>
  );
}

// ============================================================================
// STEP 3: Create Pipelines
// ============================================================================

interface Step3Props {
  onNext: () => void;
  onBack: () => void;
  onComplete: () => void;
  pipelines: Pipeline[];
  cameras: Camera[];
  refreshProgress: () => void;
}

function Step3CreatePipelines({
  onNext,
  onBack,
  onComplete,
  pipelines,
  cameras,
  refreshProgress,
}: Step3Props) {
  const [selectedCameras, setSelectedCameras] = useState<string[]>([]);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [cameraSelectionError, setCameraSelectionError] = useState<
    string | null
  >(null);
  const [continueError, setContinueError] = useState<string | null>(null);

  const form = useForm<Omit<Pipeline, "id" | "cameraIds" | "status">>({
    defaultValues: {
      name: "",
      modelId: "",
      alertRules: {
        confidenceThreshold: 0.7,
        alertTypes: [],
      },
    },
  });

  useEffect(() => {
    loadUseCases();
  }, []);

  const loadUseCases = async () => {
    try {
      setLoading(true);
      const data = await fetchUseCases();
      setUseCases(data.useCases || []);
    } catch (error) {
      console.error("Error loading use cases:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedModelId = form.watch("modelId");

  const MODEL_DETAILS: Record<
    string,
    { description: string; type: string; accuracy: string; tech: string }
  > = {
    "yolov8-intrusion": {
      description: "Alerts on unauthorized access to restricted areas.",
      type: "Security",
      accuracy: "98.2%",
      tech: "YOLOv8",
    },
    "yolov8-ppe": {
      description: "Detects missing or incorrect safety equipment.",
      type: "Safety",
      accuracy: "98.5%",
      tech: "YOLOv8",
    },
    "yolov8-fire": {
      description: "Detects early signs of fire and visible smoke.",
      type: "Safety",
      accuracy: "97.1%",
      tech: "YOLOv8",
    },
    "openvino-counting": {
      description: "Counts products, people, or vehicles across zones.",
      type: "Analytics",
      accuracy: "96.4%",
      tech: "OpenVINO",
    },
    custom: {
      description:
        "Use your own trained model via the Bring Your Own Model workflow.",
      type: "Custom",
      accuracy: "Depends on your model",
      tech: "BYOM",
    },
  };

  const handleAddPipeline = (
    values: Omit<Pipeline, "id" | "cameraIds" | "status">,
  ) => {
    if (selectedCameras.length === 0) {
      setCameraSelectionError(
        "Please select at least one camera for this pipeline.",
      );
      return;
    }

    setCameraSelectionError(null);
    const newPipeline: Pipeline = {
      ...values,
      name: values.name || "Pipeline " + (pipelines.length + 1),
      id: editingPipeline?.id ?? `pipeline-${Date.now()}`,
      cameraIds: selectedCameras,
      status: editingPipeline?.status ?? "inactive",
    };

    savePipeline(newPipeline);
    refreshProgress();
    setEditingPipeline(null);
    setSelectedCameras([]);
    form.reset({
      name: "",
      modelId: "",
      alertRules: {
        confidenceThreshold: 0.7,
        alertTypes: [],
      },
    });
    form.reset();
    form.resetField("modelId");
  };

  const handleDeletePipeline = (pipelineId: string) => {
    removePipeline(pipelineId);
    refreshProgress();
  };

  const handleEditPipeline = (pipeline: Pipeline) => {
    setEditingPipeline(pipeline);
    setSelectedCameras(pipeline.cameraIds);
    form.reset({
      name: pipeline.name,
      modelId: pipeline.modelId,
      alertRules: pipeline.alertRules,
    });
  };

  const handleContinue = () => {
    setContinueError(null);

    if (pipelines.length === 0) {
      setContinueError("Please create at least one pipeline to continue.");
      return;
    }

    // Check if any pipeline has zero cameras
    const pipelinesWithoutCameras = pipelines.filter(
      (p) => p.cameraIds.length === 0,
    );
    if (pipelinesWithoutCameras.length > 0) {
      const pipelineNames = pipelinesWithoutCameras
        .map((p) => `"${p.name || "Untitled"}"`)
        .join(", ");
      setContinueError(
        `Cannot continue. The following pipeline(s) need at least one camera: ${pipelineNames}`,
      );
      return;
    }

    onComplete();
    onNext();
  };

  const handleCancelEdit = () => {
    setEditingPipeline(null);
    setSelectedCameras([]);
    setCameraSelectionError(null);
    form.reset({
      name: "",
      modelId: "",
      alertRules: {
        confidenceThreshold: 0.7,
        alertTypes: [],
      },
    });
  };

  return (
    <>
      <CardContent className="space-y-6">
        {/* Bring Your Own Model - Coming Soon */}
        <div className="rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-lg border bg-background shrink-0">
              <Icon icon={Sparkles} className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-semibold text-foreground">
                  Bring Your Own Model
                </h3>
                <Badge variant="outline" className="text-xs">
                  Coming Soon
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Import your custom YOLO, TensorFlow, PyTorch, ONNX, or OpenVINO
                models.
              </p>
            </div>
            <Button size="sm" variant="default" className="shrink-0">
              Import Model
            </Button>
          </div>
        </div>

        {/* Pipeline List */}
        {pipelines.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Configured Pipelines ({pipelines.length})
            </h3>
            <div className="space-y-3">
              {pipelines.map((pipeline, index) =>
                editingPipeline && editingPipeline.id === pipeline.id ? null : (
                  <div
                    key={pipeline.id}
                    className={`rounded-2xl border p-4 shadow-sm ${
                      pipeline.cameraIds.length === 0
                        ? "border-destructive bg-destructive/5"
                        : "border bg-card"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold">
                          Pipeline {index + 1}: {pipeline.name || "Untitled"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Model: {pipeline.modelId || "Not set"} · Cameras:{" "}
                          {pipeline.cameraIds.length}
                        </p>
                        {pipeline.cameraIds.length === 0 && (
                          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                            <Icon icon={AlertTriangle} className="h-4 w-4" />
                            This pipeline needs at least one camera
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPipeline(pipeline)}
                        >
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Icon
                                icon={Trash2}
                                className="h-4 w-4 text-destructive"
                              />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete pipeline?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove{" "}
                                <span className="font-medium">
                                  {pipeline.name || "this pipeline"}
                                </span>{" "}
                                and its camera assignments from the setup. You
                                can recreate it later if needed.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel asChild>
                                <Button variant="outline">Cancel</Button>
                              </AlertDialogCancel>
                              <AlertDialogAction asChild>
                                <Button
                                  variant="destructive"
                                  onClick={() =>
                                    handleDeletePipeline(pipeline.id)
                                  }
                                >
                                  Delete
                                </Button>
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {/* Pipeline Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleAddPipeline)}
            className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">
                  {editingPipeline
                    ? `Editing ${editingPipeline.name || "Pipeline"}`
                    : `Pipeline ${pipelines.length + 1}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  Configure an AI model and assign cameras for this pipeline.
                </p>
              </div>
              {editingPipeline && (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Update Pipeline</Button>
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pipeline Name (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Auto-generated if left blank"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="modelId"
              rules={{ required: "AI model is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select AI Model / Use Case *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    key={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loading ? "Loading..." : "Choose a model"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {useCases.map((useCase) => (
                        <SelectItem
                          key={useCase.UseCaseId}
                          value={useCase.UseCaseId.toString()}
                        >
                          {useCase.UseCaseName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedModelId && MODEL_DETAILS[selectedModelId] && (
              <div className="rounded-2xl border border-muted bg-muted/70 p-4">
                <dl className="grid gap-4 text-sm text-muted-foreground md:grid-cols-4">
                  <div>
                    <dt className="text-[11px] font-semibold tracking-wide text-muted-foreground/80">
                      DESCRIPTION
                    </dt>
                    <dd className="mt-1 text-foreground">
                      {MODEL_DETAILS[selectedModelId].description}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold tracking-wide text-muted-foreground/80">
                      TYPE
                    </dt>
                    <dd className="mt-1 text-foreground">
                      {MODEL_DETAILS[selectedModelId].type}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold tracking-wide text-muted-foreground/80">
                      ACCURACY
                    </dt>
                    <dd className="mt-1 text-foreground">
                      {MODEL_DETAILS[selectedModelId].accuracy}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold tracking-wide text-muted-foreground/80">
                      MODEL TECH
                    </dt>
                    <dd className="mt-1 text-foreground">
                      {MODEL_DETAILS[selectedModelId].tech}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            <div className="space-y-2">
              <Label>Assign Cameras *</Label>
              <div
                className={`space-y-1 rounded-md border border-dashed p-3 ${
                  cameraSelectionError
                    ? "border-destructive bg-destructive/5"
                    : "border-border bg-muted/40"
                }`}
              >
                {cameras.map((camera) => (
                  <div
                    key={camera.id}
                    className="flex items-start gap-3 rounded-lg bg-background/60 px-3 py-2"
                  >
                    <Checkbox
                      id={camera.id}
                      checked={selectedCameras.includes(camera.id)}
                      onCheckedChange={(checked) => {
                        setCameraSelectionError(null);
                        setSelectedCameras((prev) =>
                          checked
                            ? [...prev, camera.id]
                            : prev.filter((id) => id !== camera.id),
                        );
                      }}
                      className="mt-1"
                    />
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Icon
                          icon={WebcamIcon}
                          className="h-4 w-4 text-muted-foreground"
                        />
                        <span className="text-sm font-medium text-foreground">
                          {camera.name}
                        </span>
                      </div>
                      {(camera.location || camera.rtspUrl) && (
                        <p className="text-xs text-muted-foreground">
                          {camera.location && `Zone: ${camera.location}`}
                          {camera.location && camera.rtspUrl && " · "}
                          {camera.rtspUrl && "Streaming configured"}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {cameraSelectionError && (
                  <p className="text-sm text-destructive mt-1 flex items-start gap-2">
                    <Icon
                      icon={AlertTriangle}
                      className="h-4 w-4 mt-0.5 shrink-0"
                    />
                    {cameraSelectionError}
                  </p>
                )}
              </div>
            </div>

            {!editingPipeline && (
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Pipeline</Button>
              </div>
            )}
          </form>
        </Form>

        <Button
          type="button"
          variant="ghost"
          className="w-full justify-center border border-dashed border-border py-6 text-base"
          onClick={() => {
            handleCancelEdit();
          }}
        >
          <Icon icon={Plus} className="mr-2 h-4 w-4" />
          Add Another Pipeline
        </Button>
      </CardContent>
      <CardFooter className="sticky bottom-0 z-10 flex flex-col gap-3 border-t bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:flex-row sm:items-center sm:justify-between">
        {continueError && (
          <div className="w-full rounded-lg border border-destructive bg-destructive/10 p-3 sm:p-4">
            <p className="text-sm text-destructive flex items-start gap-2">
              <Icon icon={AlertTriangle} className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{continueError}</span>
            </p>
          </div>
        )}
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
          <Icon icon={ArrowLeft} className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={pipelines.length === 0}
          className="w-full sm:w-auto"
        >
          Continue
          <Icon icon={ArrowRight} className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </>
  );
}

// ============================================================================
// STEP 4: Notification & Alert Channels
// ============================================================================

interface Step4Props {
  onNext: () => void;
  onBack: () => void;
  notifications?: ChannelState;
  pipelines: Pipeline[];
  refreshProgress: () => void;
}

// Channel configuration types
interface EmailConfig {
  smtpServer: string;
  fromEmail: string;
  toEmails: string;
}

interface SmsConfig {
  provider: string;
  apiKey: string;
  phoneNumbers: string;
}

interface WhatsAppConfig {
  apiKey: string;
  phoneNumbers: string;
}

interface WebhookConfig {
  url: string;
  authToken: string;
}

interface PlcConfig {
  ipAddress: string;
  port: string;
  commandSequence: string;
}

interface ChannelState {
  email: { enabled: boolean; config: EmailConfig };
  sms: { enabled: boolean; config: SmsConfig };
  whatsapp: { enabled: boolean; config: WhatsAppConfig };
  webhook: { enabled: boolean; config: WebhookConfig };
  plc: { enabled: boolean; config: PlcConfig };
}

interface PipelineChannelState {
  [pipelineId: string]: {
    expanded: boolean;
    channels: {
      email: boolean;
      sms: boolean;
      whatsapp: boolean;
      webhook: boolean;
      plc: boolean;
    };
  };
}

// Channel card component
const ChannelCard = React.memo(
  ({
    type,
    icon,
    title,
    description,
    enabled,
    onToggle,
    children,
  }: {
    type: string;
    icon: any;
    title: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
    children?: React.ReactNode;
  }) => (
    <div className="rounded-2xl border bg-card shadow-sm">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id={`channel-${type}`}
            checked={enabled}
            onCheckedChange={onToggle}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Icon icon={icon} className="h-5 w-5 text-muted-foreground" />
              <label
                htmlFor={`channel-${type}`}
                className="font-semibold text-foreground cursor-pointer"
              >
                {title}
              </label>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {description}
            </p>
          </div>
        </div>
      </div>
      {enabled && children && (
        <>
          <Separator />
          <div className="p-4 space-y-4">{children}</div>
        </>
      )}
    </div>
  ),
);

// Pipeline channel row component
const PipelineChannelRow = React.memo(
  ({
    icon,
    title,
    description,
    checked,
    onToggle,
  }: {
    icon: any;
    title: string;
    description: string;
    checked: boolean;
    onToggle: () => void;
  }) => (
    <div className="flex items-start gap-3 py-2 border-l-2 border-muted pl-4">
      <Checkbox checked={checked} onCheckedChange={onToggle} className="mt-1" />
      <div>
        <div className="flex items-center gap-2">
          <Icon icon={icon} className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">{title}</span>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  ),
);

function Step4NotificationChannels({
  onNext,
  onBack,
  notifications,
  pipelines,
  refreshProgress,
}: Step4Props) {
  // Global channel states
  const [channels, setChannels] = useState<ChannelState>({
    email: {
      enabled: false,
      config: { smtpServer: "", fromEmail: "", toEmails: "" },
    },
    sms: {
      enabled: false,
      config: { provider: "", apiKey: "", phoneNumbers: "" },
    },
    whatsapp: {
      enabled: false,
      config: { apiKey: "", phoneNumbers: "" },
    },
    webhook: {
      enabled: false,
      config: { url: "", authToken: "" },
    },
    plc: {
      enabled: false,
      config: { ipAddress: "", port: "", commandSequence: "" },
    },
    ...notifications,
  });

  // Pipeline-specific channel states
  const [pipelineChannels, setPipelineChannels] =
    useState<PipelineChannelState>(() => {
      const initial: PipelineChannelState = {};
      pipelines.forEach((pipeline) => {
        initial[pipeline.id] = {
          expanded: false,
          channels: {
            email: false,
            sms: false,
            whatsapp: false,
            webhook: false,
            plc: false,
          },
        };
      });
      return initial;
    });

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    sms?: string;
    whatsapp?: string;
    webhook?: string;
    plc?: string;
  }>({});

  const toggleChannel = (channelType: keyof ChannelState) => {
    setChannels((prev) => ({
      ...prev,
      [channelType]: {
        ...prev[channelType],
        enabled: !prev[channelType].enabled,
      },
    }));
  };

  const updateChannelConfig = <T extends keyof ChannelState>(
    channelType: T,
    field: keyof ChannelState[T]["config"],
    value: string,
  ) => {
    // Clear error for this channel when user types
    setValidationErrors((prev) => ({
      ...prev,
      [channelType]: undefined,
    }));

    setChannels((prev) => ({
      ...prev,
      [channelType]: {
        ...prev[channelType],
        config: {
          ...prev[channelType].config,
          [field]: value,
        },
      },
    }));
  };

  const DEFAULT_PIPELINE_CHANNELS: PipelineChannelState[string]["channels"] = {
    email: false,
    sms: false,
    whatsapp: false,
    webhook: false,
    plc: false,
  };

  const ensurePipelineState = (
    pipelineId: string,
    prev: PipelineChannelState,
  ): PipelineChannelState[string] => {
    if (prev[pipelineId]) {
      return prev[pipelineId];
    }

    return {
      expanded: false,
      channels: { ...DEFAULT_PIPELINE_CHANNELS },
    };
  };

  const togglePipelineExpanded = (pipelineId: string) => {
    setPipelineChannels((prev) => {
      const pipelineState = ensurePipelineState(pipelineId, prev);

      return {
        ...prev,
        [pipelineId]: {
          ...pipelineState,
          expanded: !pipelineState.expanded,
          channels: pipelineState.channels,
        },
      };
    });
  };

  const togglePipelineChannel = (
    pipelineId: string,
    channelType: keyof PipelineChannelState[string]["channels"],
  ) => {
    setPipelineChannels((prev) => {
      const pipelineState = ensurePipelineState(pipelineId, prev);

      return {
        ...prev,
        [pipelineId]: {
          ...pipelineState,
          channels: {
            ...pipelineState.channels,
            [channelType]: !pipelineState.channels[channelType],
          },
        },
      };
    });
  };

  const getEnabledChannelCount = (pipelineId: string) => {
    const pipelineState = pipelineChannels[pipelineId];
    if (!pipelineState) return 0;
    return Object.values(pipelineState.channels).filter(Boolean).length;
  };

  const handleSaveAndContinue = () => {
    // Validation helper functions
    const validateEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    const validatePhoneNumber = (phone: string): boolean => {
      // Allow formats: +1234567890, +1 234 567 8901, etc.
      const phoneRegex = /^\+?[\d\s()-]+$/;
      return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
    };

    const validateUrl = (url: string): boolean => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    const validateIpAddress = (ip: string): boolean => {
      // IPv4 pattern with optional port
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/;
      if (!ipRegex.test(ip)) return false;

      const parts = ip.split(":")[0].split(".");
      return parts.every((part) => {
        const num = parseInt(part);
        return num >= 0 && num <= 255;
      });
    };

    // Validate enabled channels
    const errors: Record<string, string> = {};

    if (channels.email.enabled) {
      const emailInput = channels.email.config.toEmails.trim();
      if (!emailInput) {
        errors.email = "At least one recipient email is required";
      } else {
        const emails = emailInput
          .split(",")
          .map((e) => e.trim())
          .filter((e) => e);
        const invalidEmails = emails.filter((email) => !validateEmail(email));
        if (invalidEmails.length > 0) {
          errors.email = `Invalid email(s): ${invalidEmails.join(", ")}. Use comma-separated format: email1@example.com, email2@example.com`;
        }
      }
    }

    if (channels.sms.enabled) {
      const phoneInput = channels.sms.config.phoneNumbers.trim();
      if (!phoneInput) {
        errors.sms = "At least one phone number is required";
      } else {
        const phones = phoneInput
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p);
        const invalidPhones = phones.filter(
          (phone) => !validatePhoneNumber(phone),
        );
        if (invalidPhones.length > 0) {
          errors.sms = `Invalid phone number(s): ${invalidPhones.join(", ")}. Use comma-separated format: +1234567890, +0987654321`;
        }
      }
    }

    if (channels.whatsapp.enabled) {
      const phoneInput = channels.whatsapp.config.phoneNumbers.trim();
      if (!phoneInput) {
        errors.whatsapp = "At least one phone number is required";
      } else {
        const phones = phoneInput
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p);
        const invalidPhones = phones.filter(
          (phone) => !validatePhoneNumber(phone),
        );
        if (invalidPhones.length > 0) {
          errors.whatsapp = `Invalid phone number(s): ${invalidPhones.join(", ")}. Use comma-separated format: +1234567890, +0987654321`;
        }
      }
    }

    if (channels.webhook.enabled) {
      if (!channels.webhook.config.url) {
        errors.webhook = "URL is required";
      } else if (!validateUrl(channels.webhook.config.url)) {
        errors.webhook = "Invalid URL format";
      }
    }

    if (channels.plc.enabled) {
      if (!channels.plc.config.ipAddress) {
        errors.plc = "IP address is required";
      } else if (!validateIpAddress(channels.plc.config.ipAddress)) {
        errors.plc =
          "Invalid IP address format (use format: 192.168.1.50 or 192.168.1.50:502)";
      }
    }

    // Show errors if any
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Save if validation passes
    setValidationErrors({});
    saveNotificationChannel(channels);
    refreshProgress();
    onNext();
  };

  return (
    <>
      <CardContent className="space-y-6">
        {/* Tabs */}
        <Tabs defaultValue="global" variant="underline">
          <TabsList>
            <TabsTrigger value="global">
              Global Notification Channels
            </TabsTrigger>
            {/* <TabsTrigger value="pipeline">Pipeline-Specific Channels</TabsTrigger> */}
          </TabsList>

          {/* Global Notification Channels Tab */}
          <TabsContent value="global">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">
                  Global Notification Channels
                </h3>
                <p className="text-sm text-muted-foreground">
                  These channels apply to all pipelines by default
                </p>
              </div>

              {/* Email Channel */}
              <ChannelCard
                type="email"
                icon={Mail}
                title="Email"
                description="Send alerts via email"
                enabled={channels.email.enabled}
                onToggle={() => toggleChannel("email")}
              >
                <div className="space-y-3">
                  {/* <div>
                  <Label className="text-sm font-medium">SMTP Server</Label>
                  <Input
                    placeholder="smtp.gmail.com:587"
                    value={channels.email.config.smtpServer}
                    onChangeText={(e) => updateChannelConfig("email", "smtpServer", e)}
                    className="mt-1"
                  />
                </div> */}
                  {/* <div>
                  <Label className="text-sm font-medium">From Email</Label>
                  <Input
                    placeholder="alerts@aegisvision.com"
                    value={channels.email.config.fromEmail}
                    onChangeText={(e) => updateChannelConfig("email", "fromEmail", e)}
                    className="mt-1"
                  />
                </div> */}
                  <div>
                    <Label className="text-sm font-medium">To Email(s)</Label>
                    <Input
                      placeholder="admin@company.com, ops@company.com"
                      value={channels.email.config.toEmails}
                      onChange={(e) =>
                        updateChannelConfig("email", "toEmails", e.target.value)
                      }
                      className="mt-1"
                    />
                    {validationErrors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {validationErrors.email}
                      </p>
                    )}
                  </div>
                </div>
              </ChannelCard>

              {/* SMS Channel */}
              <ChannelCard
                type="sms"
                icon={Phone}
                title="SMS"
                description="Send text message alerts"
                enabled={channels.sms.enabled}
                onToggle={() => toggleChannel("sms")}
              >
                <div className="space-y-3">
                  {/* <div>
                  <Label className="text-sm font-medium">SMS Provider</Label>
                  <Input
                    placeholder="Twilio, AWS SNS, etc."
                    value={channels.sms.config.provider}
                    onChange={(e) => updateChannelConfig("sms", "provider", e.target.value)}
                    className="mt-1"
                  />
                </div> */}
                  {/* <div>
                  <Label className="text-sm font-medium">API Key</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={channels.sms.config.apiKey}
                    onChangeText={(e) => updateChannelConfig("sms", "apiKey", e)}
                    className="mt-1"
                  />
                </div> */}
                  <div>
                    <Label className="text-sm font-medium">
                      Phone Number(s)
                    </Label>
                    <Input
                      placeholder="+1 555 123 4567, +1 555 987 6543"
                      value={channels.sms.config.phoneNumbers}
                      onChange={(e) =>
                        updateChannelConfig(
                          "sms",
                          "phoneNumbers",
                          e.target.value,
                        )
                      }
                      className="mt-1"
                    />
                    {validationErrors.sms && (
                      <p className="text-sm text-destructive mt-1">
                        {validationErrors.sms}
                      </p>
                    )}
                  </div>
                </div>
              </ChannelCard>

              {/* WhatsApp Channel */}
              <ChannelCard
                type="whatsapp"
                icon={MessageSquare}
                title="WhatsApp"
                description="Send WhatsApp messages"
                enabled={channels.whatsapp.enabled}
                onToggle={() => toggleChannel("whatsapp")}
              >
                <div className="space-y-3">
                  {/* <div>
                  <Label className="text-sm font-medium">WhatsApp Business API Key</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={channels.whatsapp.config.apiKey}
                    onChangeText={(e) => updateChannelConfig("whatsapp", "apiKey", e)}
                    className="mt-1"
                  />
                </div> */}
                  <div>
                    <Label className="text-sm font-medium">
                      Phone Number(s)
                    </Label>
                    <Input
                      placeholder="+1 555 123 4567"
                      value={channels.whatsapp.config.phoneNumbers}
                      onChange={(e) =>
                        updateChannelConfig(
                          "whatsapp",
                          "phoneNumbers",
                          e.target.value,
                        )
                      }
                      className="mt-1"
                    />
                    {validationErrors.whatsapp && (
                      <p className="text-sm text-destructive mt-1">
                        {validationErrors.whatsapp}
                      </p>
                    )}
                  </div>
                </div>
              </ChannelCard>

              {/* Webhook Channel */}
              <ChannelCard
                type="webhook"
                icon={Link}
                title="Webhook"
                description="POST alerts to custom endpoint"
                enabled={channels.webhook.enabled}
                onToggle={() => toggleChannel("webhook")}
              >
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Webhook URL</Label>
                    <Input
                      placeholder="https://api.example.com/alerts"
                      value={channels.webhook.config.url}
                      onChange={(e) =>
                        updateChannelConfig("webhook", "url", e.target.value)
                      }
                      className="mt-1"
                    />
                    {validationErrors.webhook && (
                      <p className="text-sm text-destructive mt-1">
                        {validationErrors.webhook}
                      </p>
                    )}
                  </div>
                  {/* <div>
                  <Label className="text-sm font-medium">Auth Token (Optional)</Label>
                  <Input
                    placeholder="Bearer token"
                    value={channels.webhook.config.authToken}
                    onChangeText={(e) => updateChannelConfig("webhook", "authToken", e)}
                    className="mt-1"
                  />
                </div> */}
                </div>
              </ChannelCard>

              {/* PLC Trigger Channel */}
              <ChannelCard
                type="plc"
                icon={Cpu}
                title="PLC Trigger"
                description="Trigger PLC actions"
                enabled={channels.plc.enabled}
                onToggle={() => toggleChannel("plc")}
              >
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">
                      PLC IP Address & Port
                    </Label>
                    <Input
                      placeholder="192.168.1.50"
                      value={channels.plc.config.ipAddress}
                      onChange={(e) =>
                        updateChannelConfig("plc", "ipAddress", e.target.value)
                      }
                      className="mt-1"
                    />
                    {validationErrors.plc && (
                      <p className="text-sm text-destructive mt-1">
                        {validationErrors.plc}
                      </p>
                    )}
                  </div>
                  {/* <div>
                  <Label className="text-sm font-medium">Port</Label>
                  <Input
                    placeholder="502"
                    value={channels.plc.config.port}
                    onChange={(e) => updateChannelConfig("plc", "port", e.target.value)}
                    className="mt-1"
                  />
                </div> */}
                  {/* <div>
                  <Label className="text-sm font-medium">Command Sequence</Label>
                  <Input
                    placeholder="STOP_LINE_1"
                    value={channels.plc.config.commandSequence}
                    onChangeText={(e) => updateChannelConfig("plc", "commandSequence", e)}
                    className="mt-1"
                  />
                </div> */}
                </div>
              </ChannelCard>
            </div>
          </TabsContent>

          {/* Pipeline-Specific Channels Tab */}
          <TabsContent value="pipeline">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Icon icon={GitBranch} className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">
                    Pipeline-Specific Notification Channels
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Customize notification channels for each pipeline. By
                    default, pipelines inherit global channels.
                  </p>
                </div>
              </div>

              {pipelines.length === 0 ? (
                <div className="rounded-2xl border border-dashed bg-muted/30 p-8 text-center">
                  <p className="text-muted-foreground">
                    No pipelines configured yet. Add pipelines in the previous
                    step to customize their notification channels.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pipelines.map((pipeline) => {
                    const pipelineState = pipelineChannels[pipeline.id];
                    const enabledCount = getEnabledChannelCount(pipeline.id);
                    const cameraCount = pipeline.cameraIds?.length || 0;

                    return (
                      <div
                        key={pipeline.id}
                        className="rounded-2xl border bg-card shadow-sm"
                      >
                        <button
                          type="button"
                          onClick={() => togglePipelineExpanded(pipeline.id)}
                          className="w-full p-4 flex items-center justify-between text-left"
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              icon={GitBranch}
                              className="h-5 w-5 text-primary"
                            />
                            <div>
                              <p className="font-semibold">
                                {pipeline.name || "Untitled Pipeline"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {cameraCount} camera
                                {cameraCount !== 1 ? "s" : ""} • {enabledCount}{" "}
                                channel{enabledCount !== 1 ? "s" : ""} enabled
                              </p>
                            </div>
                          </div>
                          <Icon
                            icon={
                              pipelineState?.expanded ? ChevronUp : ChevronDown
                            }
                            className="h-5 w-5 text-muted-foreground"
                          />
                        </button>

                        {pipelineState?.expanded && (
                          <>
                            <Separator />
                            <div className="p-4 space-y-2">
                              <PipelineChannelRow
                                icon={Mail}
                                title="Email"
                                description="Send alerts via email"
                                checked={pipelineState.channels.email}
                                onToggle={() =>
                                  togglePipelineChannel(pipeline.id, "email")
                                }
                              />
                              <PipelineChannelRow
                                icon={Phone}
                                title="SMS"
                                description="Send text message alerts"
                                checked={pipelineState.channels.sms}
                                onToggle={() =>
                                  togglePipelineChannel(pipeline.id, "sms")
                                }
                              />
                              <PipelineChannelRow
                                icon={MessageSquare}
                                title="WhatsApp"
                                description="Send WhatsApp messages"
                                checked={pipelineState.channels.whatsapp}
                                onToggle={() =>
                                  togglePipelineChannel(pipeline.id, "whatsapp")
                                }
                              />
                              <PipelineChannelRow
                                icon={Link}
                                title="Webhook"
                                description="POST alerts to custom endpoint"
                                checked={pipelineState.channels.webhook}
                                onToggle={() =>
                                  togglePipelineChannel(pipeline.id, "webhook")
                                }
                              />
                              <PipelineChannelRow
                                icon={Cpu}
                                title="PLC Trigger"
                                description="Trigger PLC actions"
                                checked={pipelineState.channels.plc}
                                onToggle={() =>
                                  togglePipelineChannel(pipeline.id, "plc")
                                }
                              />
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="sticky bottom-0 z-10 flex flex-col gap-3 border-t bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
          <Icon icon={ArrowLeft} className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleSaveAndContinue} className="w-full sm:w-auto">
          Next
          <Icon icon={ArrowRight} className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </>
  );
}

// ============================================================================
// STEP 5: User & Role Provisioning
// ============================================================================

interface Step5Props {
  onNext: () => void;
  onBack: () => void;
  invites: UserInvite[];
  refreshProgress: () => void;
}

interface UserFormData {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

function Step5InviteUsers({
  onNext,
  onBack,
  invites,
  refreshProgress,
}: Step5Props) {
  const snackbar = useSnackbar();
  const [users, setUsers] = useState<UserFormData[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, { fullName?: string; email?: string }>
  >({});

  useEffect(() => {
    const loadRoles = async () => {
      try {
        setLoading(true);
        const rolesData = await fetchRoles();
        if (rolesData.length) {
          // If no roles exist, create default roles
          setRoles(rolesData);
        }
      } catch (error) {
        console.error("Error loading roles:", error);
        // Set default user even if roles fail to load
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    loadRoles();
  }, []); // Empty dependency array - only run once on mount

  const addUser = () => {
    const defaultRole = roles.length > 0 ? roles[0]?.value : "Executive";
    setUsers((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        fullName: "",
        email: "",
        role: defaultRole as any,
      },
    ]);
  };

  const removeUser = (userId: string) => {
    if (users.length === 0) return; // Keep at least one user form
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const updateUser = (
    userId: string,
    field: keyof UserFormData,
    value: string,
  ) => {
    // Clear error for this field when user types
    setValidationErrors((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: undefined,
      },
    }));

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, [field]: value } : u)),
    );
  };

  const handleSaveAndContinue = () => {
    // Validate all users
    const validateEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    const errors: Record<string, { fullName?: string; email?: string }> = {};
    let hasErrors = false;

    users.forEach((user) => {
      const userErrors: { fullName?: string; email?: string } = {};

      // Validate full name
      if (!user.fullName || user.fullName.trim().length === 0) {
        userErrors.fullName = "Full name is required";
        hasErrors = true;
      }

      // Validate email
      if (!user.email || user.email.trim().length === 0) {
        userErrors.email = "Email address is required";
        hasErrors = true;
      } else if (!validateEmail(user.email)) {
        userErrors.email = "Invalid email address format";
        hasErrors = true;
      }

      if (Object.keys(userErrors).length > 0) {
        errors[user.id] = userErrors;
      }
    });

    if (hasErrors) {
      setValidationErrors(errors);
      return;
    }

    // Clear errors and save all users with valid email addresses
    setValidationErrors({});
    users.forEach((user) => {
      if (user.email) {
        const newInvite: UserInvite = {
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: user.role,
          status: "pending",
        };
        addUserInvite(newInvite);
      }
    });
    refreshProgress();
    onNext();
  };

  return (
    <>
      <CardContent className="space-y-6">
        {/* Bulk User Upload - Coming Soon */}
        <div className="rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-lg border bg-background shrink-0">
              <Icon icon={Upload} className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-semibold text-foreground">
                  Bulk User Upload
                </h3>
                <Badge variant="outline" className="text-xs">
                  Coming Soon
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Import users at scale via CSV. Bulk assign roles and permissions
                in a single operation.
              </p>
            </div>
            <Button size="sm" variant="default" className="shrink-0">
              Request Early Access
            </Button>
          </div>
        </div>

        {/* Individual User Forms */}
        <div className="space-y-4">
          {users.map((user, index) => (
            <div
              key={user.id}
              className="rounded-2xl border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon
                    icon={UserPlus}
                    className="h-5 w-5 text-muted-foreground"
                  />
                  <span className="font-semibold">User {index + 1}</span>
                </div>
                {users.length > 0&& (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUser(user.id)}
                  >
                    <Icon icon={Trash2} className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Full Name</Label>
                  <Input
                    placeholder="John Doe"
                    value={user.fullName}
                    onChange={(e) =>
                      updateUser(user.id, "fullName", e.target.value)
                    }
                  />
                  {validationErrors[user.id]?.fullName && (
                    <p className="text-sm text-destructive mt-1">
                      {validationErrors[user.id]?.fullName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="john@company.com"
                    value={user.email}
                    onChange={(e) =>
                      updateUser(user.id, "email", e.target.value)
                    }
                  />
                  {validationErrors[user.id]?.email && (
                    <p className="text-sm text-destructive mt-1">
                      {validationErrors[user.id]?.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Role</Label>
                {loading || roles.length === 0 ? (
                  <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                    {loading ? "Loading roles..." : "No roles available"}
                  </div>
                ) : (
                  <Select
                    value={user.role}
                    onValueChange={(val: any) =>
                      updateUser(user.id, "role", val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.value}>
                          {role.displayName || role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          ))}

          {/* Add Another User Button */}
          <Button
            variant="outline"
            onClick={addUser}
            className="w-full border-dashed"
          >
            <Icon icon={Plus} className="mr-2 h-4 w-4" />
            Add Another User
          </Button>
        </div>

        {/* Existing Invites */}
        {invites.length > 0 && (
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-semibold mb-3">
              Pending Invites ({invites.length})
            </h3>
            <div className="space-y-2">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{invite.email}</span>
                    <Badge variant="outline" className="text-xs">
                      {invite.role}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      removeUserInvite(invite.id);
                      refreshProgress();
                    }}
                  >
                    <Icon icon={Trash2} className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="sticky bottom-0 z-10 flex flex-col gap-3 border-t bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
          <Icon icon={ArrowLeft} className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleSaveAndContinue} className="w-full sm:w-auto">
          Next
          <Icon icon={ArrowRight} className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </>
  );
}

// ============================================================================
// STEP 6: Review & Finalize
// ============================================================================

interface Step6Props {
  onBack: () => void;
  progress: any;
  onFinalize: () => void;
  loading: boolean;
}

function Step6ReviewFinalize({ onBack, progress, onFinalize, loading }: Step6Props) {
  return (
    <>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {/* Organization */}
          <div>
            <h3 className="font-semibold">Organization</h3>
            <p className="text-sm text-muted-foreground">
              {progress.organization?.name || "Not configured"}
            </p>
          </div>

          {/* Cameras */}
          <div>
            <h3 className="font-semibold">Cameras</h3>
            <p className="text-sm text-muted-foreground">
              {progress.cameras.length} camera(s) configured
            </p>
          </div>

          {/* Pipelines */}
          <div>
            <h3 className="font-semibold">Pipelines</h3>
            <p className="text-sm text-muted-foreground">
              {progress.pipelines.length} pipeline(s) configured
            </p>
          </div>

          {/* Notifications */}
          <div>
            <h3 className="font-semibold">Notification Channels</h3>
            <p className="text-sm text-muted-foreground">
              {progress.notifications.length} channel(s) configured
            </p>
          </div>

          {/* User Invites */}
          <div>
            <h3 className="font-semibold">User Invites</h3>
            <p className="text-sm text-muted-foreground">
              {progress.invites.length} invite(s) sent
            </p>
          </div>
        </div>

        <Separator />

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
          <p className="text-sm text-green-800 dark:text-green-300">
            ✅ Your system is ready to launch! Click &quot;Launch System&quot;
            below to complete setup.
          </p>
        </div>
      </CardContent>
      <CardFooter className="sticky bottom-0 z-10 flex flex-col gap-3 border-t bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
          <Icon icon={ArrowLeft} className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onFinalize} className="w-full sm:w-auto" disabled={loading}>
          {loading ? "Launching..." : "Launch System"}
        </Button>
      </CardFooter>
    </>
  );
}
