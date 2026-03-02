/**
 * Universal Setup Wizard Screen
 * 
 * Works on both Web (via React Native Web) and Native (via React Native)
 * Uses React Native primitives for cross-platform compatibility.
 */

import * as React from "react";
import { ScrollView, Pressable, Platform, Alert } from "react-native";
import { View, Text, TextInput, Button, Icon, ThemeToggle, Badge } from "ui";
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
  Sparkles,
} from "ui";
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
} from "../utils/setup";

const TOTAL_STEPS = 6;

const STEP_CONFIG = [
  {
    number: 1,
    title: "Organization Details",
    icon: Building2,
    required: true,
    description: "Tell us about your organization. This information will be used across the platform.",
  },
  {
    number: 2,
    title: "Add Cameras",
    icon: CameraIcon,
    required: true,
    description: "Connect your IP cameras. You need at least one camera to proceed.",
  },
  {
    number: 3,
    title: "Create Pipelines",
    icon: GitBranch,
    required: true,
    description: "Set up monitoring pipelines by assigning cameras and AI models. At least one pipeline is required.",
  },
  {
    number: 4,
    title: "Notification Channels",
    icon: Bell,
    required: false,
    description: "Configure how you want to receive alerts. You can skip this and set it up later.",
  },
  {
    number: 5,
    title: "Invite Users",
    icon: Users,
    required: false,
    description: "Invite team members to join your workspace. You can skip this and invite them later.",
  },
  {
    number: 6,
    title: "Review & Finalize",
    icon: CheckCircle2,
    required: true,
    description: "Review your configuration and launch your Aegis Vision system.",
  },
];

export interface SetupWizardProps {
  onComplete?: () => void;
  onSaveAndExit?: () => void;
}

export function SetupWizard({ onComplete, onSaveAndExit }: SetupWizardProps) {
  const [currentStep, setCurrentStepState] = React.useState(1);
  const [progress, setProgress] = React.useState(getSetupProgress());
  const currentStepMeta = STEP_CONFIG.find((step) => step.number === currentStep);

  React.useEffect(() => {
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
    onSaveAndExit?.();
  };

  const refreshProgress = () => {
    setProgress(getSetupProgress());
  };

  // Platform-specific container
  const Container = Platform.OS === "web" ? View : ScrollView;
  const containerProps = Platform.OS === "web" 
    ? { className: "flex-1" }
    : { className: "flex-1 bg-background", contentContainerClassName: "flex-grow" };

  return (
    <Container {...containerProps}>
      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-foreground">
            Setup Wizard
          </Text>
          <ThemeToggle />
        </View>

        {/* Progress Indicator */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-2">
                <Text className="text-2xl font-bold text-foreground">
                  {currentStepMeta?.title ?? "Setup"}
                </Text>
                {currentStepMeta && !currentStepMeta.required && (
                  <Badge variant="secondary">Optional</Badge>
                )}
              </View>
              {currentStepMeta?.description && (
                <Text className="text-base text-muted-foreground">
                  {currentStepMeta.description}
                </Text>
              )}
            </View>
            <Button variant="ghost" size="sm" onPress={handleSaveAndExit}>
              <Icon icon={Save} className="h-4 w-4 mr-2" />
              <Text>Save & Exit</Text>
            </Button>
          </View>

          {/* Progress Bar */}
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted-foreground">
                Step {currentStep} of {TOTAL_STEPS}
              </Text>
              <Text className="text-sm text-muted-foreground">
                {Math.round((currentStep / TOTAL_STEPS) * 100)}% Complete
              </Text>
            </View>
            <View className="h-2 bg-muted rounded-full overflow-hidden">
              <View
                className="h-full bg-primary"
                style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
              />
            </View>
          </View>
        </View>

        {/* Step Content */}
        <View className="rounded-xl border border-border bg-card p-6 mb-6">
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
              onNext={handleNext}
              onBack={handleBack}
              onSkip={() => {
                completeStep(4);
                handleNext();
              }}
              notifications={progress.notifications}
              refreshProgress={refreshProgress}
            />
          )}
          {currentStep === 5 && (
            <Step5InviteUsers
              onNext={handleNext}
              onBack={handleBack}
              onSkip={() => {
                completeStep(5);
                handleNext();
              }}
              invites={progress.invites}
              refreshProgress={refreshProgress}
            />
          )}
          {currentStep === 6 && (
            <Step6ReviewFinalize
              onBack={handleBack}
              progress={progress}
              onFinalize={() => {
                markSetupComplete();
                onComplete?.();
              }}
            />
          )}
        </View>
      </View>
    </Container>
  );
}

// Step components will be implemented next...
// For now, let's create simplified versions

function Step1OrganizationDetails({ onNext, onComplete, initialData, refreshProgress }: any) {
  const [name, setName] = React.useState(initialData?.name || "");
  const [domain, setDomain] = React.useState(initialData?.domain || "");
  const [industry, setIndustry] = React.useState(initialData?.industry || "");
  const [companySize, setCompanySize] = React.useState(initialData?.companySize || "");

  const handleSubmit = () => {
    if (!name || !industry || !companySize) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    updateOrganization({ name, domain, industry, companySize });
    onComplete();
    refreshProgress();
    onNext();
  };

  return (
    <View className="gap-4">
      <Text className="text-lg font-semibold mb-4">Organization Details</Text>
      
      <View>
        <Text className="text-sm font-medium mb-2">Organization Name *</Text>
        <TextInput
          placeholder="Acme Corporation"
          value={name}
          onChangeText={setName}
          className="w-full rounded-lg border bg-background px-4 py-3"
        />
      </View>

      <View>
        <Text className="text-sm font-medium mb-2">Domain</Text>
        <TextInput
          placeholder="acme.com"
          value={domain}
          onChangeText={setDomain}
          className="w-full rounded-lg border bg-background px-4 py-3"
        />
      </View>

      <View>
        <Text className="text-sm font-medium mb-2">Industry *</Text>
        <TextInput
          placeholder="Technology, Finance, Healthcare, etc."
          value={industry}
          onChangeText={setIndustry}
          className="w-full rounded-lg border bg-background px-4 py-3"
        />
      </View>

      <View>
        <Text className="text-sm font-medium mb-2">Company Size *</Text>
        <TextInput
          placeholder="1-10, 11-50, 51-200, etc."
          value={companySize}
          onChangeText={setCompanySize}
          className="w-full rounded-lg border bg-background px-4 py-3"
        />
      </View>

      <Button onPress={handleSubmit} className="mt-4">
        <Text>Continue</Text>
        <Icon icon={ArrowRight} className="h-4 w-4 ml-2" />
      </Button>
    </View>
  );
}

function Step2AddCameras({ onNext, onBack, onComplete, cameras, refreshProgress }: any) {
  const [name, setName] = React.useState("");
  const [rtspUrl, setRtspUrl] = React.useState("");
  const [zone, setZone] = React.useState("Zone A");

  const handleAddCamera = () => {
    if (!name || !rtspUrl) {
      Alert.alert("Error", "Please fill in camera name and RTSP URL");
      return;
    }
    const newCamera: Camera = {
      id: `cam-${Date.now()}`,
      name,
      rtspUrl,
      zone,
      status: "offline",
    };
    saveCamera(newCamera);
    refreshProgress();
    setName("");
    setRtspUrl("");
  };

  const handleContinue = () => {
    if (cameras.length === 0) {
      Alert.alert("Error", "Please add at least one camera to continue");
      return;
    }
    onComplete();
    onNext();
  };

  return (
    <View className="gap-4">
      <Text className="text-lg font-semibold mb-4">Add Cameras</Text>

      {cameras.length > 0 && (
        <View className="gap-2 mb-4">
          <Text className="text-sm font-medium">Configured Cameras ({cameras.length})</Text>
          {cameras.map((camera: Camera) => (
            <View key={camera.id} className="rounded-lg border border-border bg-card p-3">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="font-medium">{camera.name}</Text>
                  <Text className="text-sm text-muted-foreground">{camera.rtspUrl}</Text>
                </View>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => {
                    removeCamera(camera.id);
                    refreshProgress();
                  }}
                >
                  <Icon icon={Trash2} className="h-4 w-4 text-destructive" />
                </Button>
              </View>
            </View>
          ))}
        </View>
      )}

      <View>
        <Text className="text-sm font-medium mb-2">Camera Name *</Text>
        <TextInput
          placeholder="e.g., Production Line 1"
          value={name}
          onChangeText={setName}
          className="w-full rounded-lg border bg-background px-4 py-3"
        />
      </View>

      <View>
        <Text className="text-sm font-medium mb-2">RTSP URL *</Text>
        <TextInput
          placeholder="rtsp://192.168.1.100:554/stream"
          value={rtspUrl}
          onChangeText={setRtspUrl}
          className="w-full rounded-lg border bg-background px-4 py-3"
        />
      </View>

      <View>
        <Text className="text-sm font-medium mb-2">Zone</Text>
        <TextInput
          placeholder="Zone A"
          value={zone}
          onChangeText={setZone}
          className="w-full rounded-lg border bg-background px-4 py-3"
        />
      </View>

      <Button onPress={handleAddCamera} variant="outline" className="mb-4">
        <Icon icon={Plus} className="h-4 w-4 mr-2" />
        <Text>Add Camera</Text>
      </Button>

      <View className="flex-row gap-3 mt-4">
        <Button variant="outline" onPress={onBack} className="flex-1">
          <Icon icon={ArrowLeft} className="h-4 w-4 mr-2" />
          <Text>Back</Text>
        </Button>
        <Button onPress={handleContinue} className="flex-1" disabled={cameras.length === 0}>
          <Text>Continue</Text>
          <Icon icon={ArrowRight} className="h-4 w-4 ml-2" />
        </Button>
      </View>
    </View>
  );
}

function Step3CreatePipelines({ onNext, onBack, onComplete, pipelines, cameras, refreshProgress }: any) {
  const [name, setName] = React.useState("");
  const [modelId, setModelId] = React.useState("");
  const [selectedCameras, setSelectedCameras] = React.useState<string[]>([]);

  const handleAddPipeline = () => {
    if (!modelId || selectedCameras.length === 0) {
      Alert.alert("Error", "Please select a model and at least one camera");
      return;
    }
    const newPipeline: Pipeline = {
      id: `pipeline-${Date.now()}`,
      name: name || `Pipeline ${pipelines.length + 1}`,
      cameraIds: selectedCameras,
      modelId,
      alertRules: {
        confidenceThreshold: 0.7,
        alertTypes: [],
      },
      status: "inactive",
    };
    savePipeline(newPipeline);
    refreshProgress();
    setName("");
    setModelId("");
    setSelectedCameras([]);
  };

  const handleContinue = () => {
    if (pipelines.length === 0) {
      Alert.alert("Error", "Please create at least one pipeline to continue");
      return;
    }
    onComplete();
    onNext();
  };

  const toggleCamera = (cameraId: string) => {
    setSelectedCameras((prev) =>
      prev.includes(cameraId)
        ? prev.filter((id) => id !== cameraId)
        : [...prev, cameraId]
    );
  };

  return (
    <View className="gap-4">
      <Text className="text-lg font-semibold mb-4">Create Pipelines</Text>

      {pipelines.length > 0 && (
        <View className="gap-2 mb-4">
          <Text className="text-sm font-medium">Configured Pipelines ({pipelines.length})</Text>
          {pipelines.map((pipeline: Pipeline) => (
            <View key={pipeline.id} className="rounded-lg border border-border bg-card p-3">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="font-medium">{pipeline.name}</Text>
                  <Text className="text-sm text-muted-foreground">
                    Model: {pipeline.modelId} · Cameras: {pipeline.cameraIds.length}
                  </Text>
                </View>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => {
                    removePipeline(pipeline.id);
                    refreshProgress();
                  }}
                >
                  <Icon icon={Trash2} className="h-4 w-4 text-destructive" />
                </Button>
              </View>
            </View>
          ))}
        </View>
      )}

      <View>
        <Text className="text-sm font-medium mb-2">Pipeline Name (Optional)</Text>
        <TextInput
          placeholder="Auto-generated if left blank"
          value={name}
          onChangeText={setName}
          className="w-full rounded-lg border bg-background px-4 py-3"
        />
      </View>

      <View>
        <Text className="text-sm font-medium mb-2">AI Model *</Text>
        <TextInput
          placeholder="yolov8-intrusion, yolov8-ppe, etc."
          value={modelId}
          onChangeText={setModelId}
          className="w-full rounded-lg border bg-background px-4 py-3"
        />
      </View>

      <View>
        <Text className="text-sm font-medium mb-2">Assign Cameras *</Text>
        <View className="gap-2">
          {cameras.map((camera: Camera) => (
            <Pressable
              key={camera.id}
              onPress={() => toggleCamera(camera.id)}
              className={`rounded-lg border p-3 ${
                selectedCameras.includes(camera.id)
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <Text>{camera.name}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Button onPress={handleAddPipeline} variant="outline" className="mb-4">
        <Icon icon={Plus} className="h-4 w-4 mr-2" />
        <Text>Add Pipeline</Text>
      </Button>

      <View className="flex-row gap-3 mt-4">
        <Button variant="outline" onPress={onBack} className="flex-1">
          <Icon icon={ArrowLeft} className="h-4 w-4 mr-2" />
          <Text>Back</Text>
        </Button>
        <Button onPress={handleContinue} className="flex-1" disabled={pipelines.length === 0}>
          <Text>Continue</Text>
          <Icon icon={ArrowRight} className="h-4 w-4 ml-2" />
        </Button>
      </View>
    </View>
  );
}

function Step4NotificationChannels({ onNext, onBack, onSkip, notifications, refreshProgress }: any) {
  const [email, setEmail] = React.useState("");

  const handleAddEmail = () => {
    if (!email) return;
    const newChannel: NotificationChannel = {
      id: `email-${Date.now()}`,
      type: "email",
      config: { email },
      enabled: true,
    };
    saveNotificationChannel(newChannel);
    refreshProgress();
    setEmail("");
  };

  return (
    <View className="gap-4">
      <Text className="text-lg font-semibold mb-4">Notification Channels</Text>

      <View>
        <Text className="text-sm font-medium mb-2">Email Address</Text>
        <TextInput
          placeholder="alerts@example.com"
          value={email}
          onChangeText={setEmail}
          className="w-full rounded-lg border bg-background px-4 py-3"
        />
      </View>

      <Button onPress={handleAddEmail} variant="outline" className="mb-4">
        <Icon icon={Plus} className="h-4 w-4 mr-2" />
        <Text>Add Email</Text>
      </Button>

      {notifications.length > 0 && (
        <View className="gap-2 mb-4">
          <Text className="text-sm font-medium">Configured Channels ({notifications.length})</Text>
          {notifications.map((channel: NotificationChannel) => (
            <View key={channel.id} className="rounded-lg border border-border bg-card p-3">
              <Text>{channel.type}: {JSON.stringify(channel.config)}</Text>
            </View>
          ))}
        </View>
      )}

      <View className="flex-row gap-3 mt-4">
        <Button variant="outline" onPress={onBack} className="flex-1">
          <Icon icon={ArrowLeft} className="h-4 w-4 mr-2" />
          <Text>Back</Text>
        </Button>
        <View className="flex-row gap-2 flex-1">
          <Button variant="ghost" onPress={onSkip} className="flex-1">
            <Text>Skip</Text>
          </Button>
          <Button onPress={onNext} className="flex-1">
            <Text>Continue</Text>
            <Icon icon={ArrowRight} className="h-4 w-4 ml-2" />
          </Button>
        </View>
      </View>
    </View>
  );
}

function Step5InviteUsers({ onNext, onBack, onSkip, invites, refreshProgress }: any) {
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<"monitor" | "stakeholder">("monitor");

  const handleAddInvite = () => {
    if (!email) return;
    const newInvite: UserInvite = {
      id: `invite-${Date.now()}`,
      email,
      role,
      status: "pending",
    };
    addUserInvite(newInvite);
    refreshProgress();
    setEmail("");
  };

  return (
    <View className="gap-4">
      <Text className="text-lg font-semibold mb-4">Invite Users</Text>

      <View>
        <Text className="text-sm font-medium mb-2">Email Address</Text>
        <TextInput
          placeholder="colleague@example.com"
          value={email}
          onChangeText={setEmail}
          className="w-full rounded-lg border bg-background px-4 py-3"
        />
      </View>

      <View>
        <Text className="text-sm font-medium mb-2">Role</Text>
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => setRole("monitor")}
            className={`flex-1 rounded-lg border p-3 ${
              role === "monitor" ? "border-primary bg-primary/5" : "border-border bg-card"
            }`}
          >
            <Text className="text-center">Monitor</Text>
          </Pressable>
          <Pressable
            onPress={() => setRole("stakeholder")}
            className={`flex-1 rounded-lg border p-3 ${
              role === "stakeholder" ? "border-primary bg-primary/5" : "border-border bg-card"
            }`}
          >
            <Text className="text-center">Stakeholder</Text>
          </Pressable>
        </View>
      </View>

      <Button onPress={handleAddInvite} variant="outline" className="mb-4">
        <Icon icon={Plus} className="h-4 w-4 mr-2" />
        <Text>Send Invite</Text>
      </Button>

      {invites.length > 0 && (
        <View className="gap-2 mb-4">
          <Text className="text-sm font-medium">Pending Invites ({invites.length})</Text>
          {invites.map((invite: UserInvite) => (
            <View key={invite.id} className="rounded-lg border border-border bg-card p-3">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="font-medium">{invite.email}</Text>
                  <Text className="text-sm text-muted-foreground">{invite.role}</Text>
                </View>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => {
                    removeUserInvite(invite.id);
                    refreshProgress();
                  }}
                >
                  <Icon icon={Trash2} className="h-4 w-4 text-destructive" />
                </Button>
              </View>
            </View>
          ))}
        </View>
      )}

      <View className="flex-row gap-3 mt-4">
        <Button variant="outline" onPress={onBack} className="flex-1">
          <Icon icon={ArrowLeft} className="h-4 w-4 mr-2" />
          <Text>Back</Text>
        </Button>
        <View className="flex-row gap-2 flex-1">
          <Button variant="ghost" onPress={onSkip} className="flex-1">
            <Text>Skip</Text>
          </Button>
          <Button onPress={onNext} className="flex-1">
            <Text>Continue</Text>
            <Icon icon={ArrowRight} className="h-4 w-4 ml-2" />
          </Button>
        </View>
      </View>
    </View>
  );
}

function Step6ReviewFinalize({ onBack, progress, onFinalize }: any) {
  return (
    <View className="gap-4">
      <Text className="text-lg font-semibold mb-4">Review & Finalize</Text>

      <View className="gap-4">
        <View>
          <Text className="font-semibold mb-1">Organization</Text>
          <Text className="text-sm text-muted-foreground">
            {progress.organization?.name || "Not configured"}
          </Text>
        </View>

        <View>
          <Text className="font-semibold mb-1">Cameras</Text>
          <Text className="text-sm text-muted-foreground">
            {progress.cameras.length} camera(s) configured
          </Text>
        </View>

        <View>
          <Text className="font-semibold mb-1">Pipelines</Text>
          <Text className="text-sm text-muted-foreground">
            {progress.pipelines.length} pipeline(s) configured
          </Text>
        </View>

        <View>
          <Text className="font-semibold mb-1">Notification Channels</Text>
          <Text className="text-sm text-muted-foreground">
            {progress.notifications.length} channel(s) configured
          </Text>
        </View>

        <View>
          <Text className="font-semibold mb-1">User Invites</Text>
          <Text className="text-sm text-muted-foreground">
            {progress.invites.length} invite(s) sent
          </Text>
        </View>
      </View>

      <View className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 mt-4">
        <Text className="text-sm text-green-800 dark:text-green-300">
          ✅ Your system is ready to launch! Click "Launch System" below to complete setup.
        </Text>
      </View>

      <View className="flex-row gap-3 mt-4">
        <Button variant="outline" onPress={onBack} className="flex-1">
          <Icon icon={ArrowLeft} className="h-4 w-4 mr-2" />
          <Text>Back</Text>
        </Button>
        <Button onPress={onFinalize} className="flex-1 bg-green-600">
          <Icon icon={CheckCircle2} className="h-5 w-5 mr-2" />
          <Text>Launch System</Text>
        </Button>
      </View>
    </View>
  );
}

