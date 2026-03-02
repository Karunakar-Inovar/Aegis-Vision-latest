"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Icon,
  Badge,
  StatsCard,
} from "ui";
import {
  AlertCircle,
  ArrowRight,
  Video,
  Activity,
  AlertTriangle,
  CheckCircle,
  X,
  Camera,
  Clock,
  Cpu,
  Bell,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Zap,
} from "ui/utils/icons";
import {
  getIncompleteSteps,
  isSetupComplete,
  getSetupProgress,
} from "app/utils/setup";
import { Alert, AlertItem, fetchAllAlerts } from "app/utils/alert";
import {
  fetchOnlineInputSources,
  type OnlineInputSourceDetail,
} from "app/utils/inputsource";
import {
  fetchUseCases,
  type UseCase,
  fetchUseCaseAccuracies,
  type UseCaseAccuracy,
} from "app/utils/usecase";
import { STATUS } from "app/constants";
import {Pipeline, fetchPipelines} from "app/utils/pipeline";

export default function AdminDashboard() {
  const router = useRouter();
  const [setupComplete, setSetupComplete] = useState(false);
  const [setupData, setSetupData] = useState<any>(null);
  const [showSetupBanner, setShowSetupBanner] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState("");
  const [cameraFeeds, setCameraFeeds] = useState<OnlineInputSourceDetail[]>([]);
  const [cameraCount, setCameraCount] = useState(0);
  const [onlineCameraCount, setOnlineCameraCount] = useState(0);
  const [camerasLoading, setCamerasLoading] = useState(true);
  const [aiModels, setAiModels] = useState<UseCaseAccuracy[]>([]);
  const [aiModelCount, setAiModelCount] = useState(0);
  const [aiModelsLoading, setAiModelsLoading] = useState(true);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [pipelinesLoading, setPipelinesLoading] = useState(true);

  useEffect(() => {
    const complete = isSetupComplete();
    const progress = getSetupProgress();
    setSetupComplete(complete);
    setSetupData(progress);
  }, []);

  //pipeline count
  useEffect(() => {
    let mounted = true;
    async function loadPipelines() {
      try {
        setPipelinesLoading(true);
        const runningPipelines = await fetchPipelines();
        if (mounted) {
          setPipelines(runningPipelines.pipeline);
        }
      }catch (err: any) {
        if (mounted) {
          setPipelines([]);
        }
      } finally {
        if (mounted) {
          setPipelinesLoading(false);
        }
      }
    }
    loadPipelines();
    return () => {
      mounted = false;
    };
  }, []);

  //fetch alerts on mount, refresh every 5 minutes, and listen for events
  useEffect(() => {
    let mounted = true;

    async function loadAlerts() {
      try {
        setAlertsLoading(true);
        setAlertsError("");
        const alertData = await fetchAllAlerts({
          filters: {
            limit: 3,
            timestamp: new Date().toISOString(),
          },
        });

        if (mounted) {
          setAlerts(alertData.alerts);
        }
      } catch (err: any) {
        if (mounted) {
          setAlertsError(err.message);
        }
      } finally {
        if (mounted) {
          setAlertsLoading(false);
        }
      }
    }
    loadAlerts();

    const interval = setInterval(loadAlerts, 5 * 60 * 1000); // 5 minutes

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Fetch camera feeds on mount and refresh every 5 minutes
  useEffect(() => {
    let mounted = true;
    async function loadCameras() {
      try {
        setCamerasLoading(true);
        const response = await fetchOnlineInputSources();
        if (mounted) {
          setCameraFeeds(response.inputSourceDetails.inputSourceDetails);
          setCameraCount(response.inputSourceDetails.cameraCount);
          setOnlineCameraCount(response.inputSourceDetails.onlineCameraCount);
        }
      } catch (err: any) {
        if (mounted) {
          setCameraFeeds([]);
        }
      } finally {
        if (mounted) {
          setCamerasLoading(false);
        }
      }
    }
    loadCameras();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch AI model accuracies on mount
  useEffect(() => {
    let mounted = true;
    async function loadAiModels() {
      try {
        setAiModelsLoading(true);
        const response = await fetchUseCaseAccuracies();
        if (mounted) {
          setAiModels(response.useCaseAccuracies);

        }
      } catch (err: any) {
        if (mounted) {
          setAiModels([]);
        }
      } finally {
        if (mounted) {
          setAiModelsLoading(false);
        }
      }
    }
    loadAiModels();

    return () => {
      mounted = false;
    };
  }, []);

  //model count
  useEffect(() => {
    let mounted = true;
    async function loadAiModels() {
      try {
        setAiModelsLoading(true);
        const response = await fetchUseCases();
        if (mounted) {
          setAiModelCount(response.useCases.length);
        }
      }catch (err: any) {
        if (mounted) {
          setAiModelCount(0);
        }
      }finally {
        if (mounted) {
          setAiModelsLoading(false);
        }
      }
    }
    loadAiModels();
    return () => {
      mounted = false;
    };
  }, []);

  // Feature carousel items
  const featureSlides = [
    {
      icon: UserPlus,
      title: "Bulk User Upload",
      badge: "Coming Soon",
      description:
        "Import multiple users via CSV - Bulk role assignment and auto-send invitations",
    },
    {
      icon: Cpu,
      title: "Custom AI Models",
      badge: "Coming Soon",
      description:
        "Import your own YOLO, TensorFlow, or PyTorch models for specialized detection",
    },
    {
      icon: Activity,
      title: "Advanced Analytics",
      badge: "Coming Soon",
      description:
        "Deep insights into detection patterns, trends, and performance metrics",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featureSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + featureSlides.length) % featureSlides.length,
    );
  };

  const currentFeature = featureSlides[currentSlide] ?? featureSlides[0];
  if (!currentFeature) {
    return null;
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          System Health Dashboard
        </h1>
        <p className="text-muted-foreground">
          Real-time monitoring and operational status
        </p>
      </div>

      {/* Setup Complete Banner */}
      {setupComplete && showSetupBanner && (
        <div className="flex items-center justify-between rounded-xl border border-green-300 dark:border-green-700/70 bg-green-100 dark:bg-green-900/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-200 dark:bg-green-800/70">
              <Icon
                icon={CheckCircle}
                className="h-4 w-4 text-green-700 dark:text-green-300"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Setup Complete!
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                Your Aegis Vision system is configured and operational.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSetupBanner(false)}
            className="text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/50"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Feature Carousel */}
      <Card className="rounded-2xl border-2 border-dashed border-border bg-muted/20 shadow-none text-[#060b13]">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevSlide}
              className="shrink-0"
            >
              <Icon icon={ChevronLeft} className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-4 flex-1">
              <div className="p-2.5 rounded-lg border bg-background/80 shrink-0">
                <Icon
                  icon={currentFeature.icon}
                  className="h-5 w-5 text-muted-foreground"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-foreground">
                    {currentFeature.title}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {currentFeature.badge}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentFeature.description}
                </p>
              </div>
              <Button size="sm" variant="outline" className="shrink-0">
                Request Access
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={nextSlide}
              className="shrink-0"
            >
              <Icon icon={ChevronRight} className="h-4 w-4" />
            </Button>
          </div>

          {/* Slide indicators */}
          <div className="flex justify-center gap-1.5 mt-3">
            {featureSlides.map((_, index) => (
              <Button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "w-6 bg-foreground"
                    : "w-2 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Camera Status"
          value={`${onlineCameraCount}/${cameraCount}`}
          badge="Online"
          color="green"
        />
        <StatsCard
          label="Use Case"
          value={aiModelCount.toString()}
          suffix=""
          color="blue"
        />
        <StatsCard
          label="Running Pipeline"
          value={pipelines.length.toString()}
          badge=""
          color="purple"
        />
        <StatsCard
          label="Alerts Today"
          value={alerts.length.toString()}
          suffix="events"
          color="orange"
        />
      </div>

      {/* Camera Feeds & AI Model Performance */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Camera Feeds */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon icon={Camera} className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Camera Feeds</CardTitle>
            </div>
            <CardDescription>Live feed status and performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {camerasLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading camera feeds...
              </p>
            ) : cameraFeeds.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No camera feeds available
              </p>
            ) : (
              cameraFeeds.map((feed) => (
                <div
                  key={feed.sourceId}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div>
                    <p className="font-medium">{feed.sourceName}</p>
                    <p className="text-sm text-muted-foreground">
                      {feed.location} • {feed.targetFps} FPS • {feed.resolution}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      feed.status === STATUS.ONLINE
                        ? "text-green-600 border-green-600"
                        : "text-gray-600 border-gray-600"
                    }
                  >
                    {feed.status || STATUS.OFFLINE}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* AI Model Performance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon icon={Cpu} className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">AI Model Performance</CardTitle>
            </div>
            <CardDescription>Detection accuracy and processing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiModelsLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading AI models...
              </p>
            ) : aiModels.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No AI models available
              </p>
            ) : (
              aiModels.map((model) => (
                <div key={model.UseCaseId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {model.UseCaseName}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {(Number(model.accuracy) * 100).toFixed(2)}% accuracy
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Number(model.accuracy) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon icon={Clock} className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Recent Alerts</CardTitle>
          </div>
          <CardDescription>
            Latest detection events and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {alertsLoading && (
            <p className="text-sm text-muted-foreground">Loading alerts...</p>
          )}

          {alertsError && (
            <div className="p-3 rounded-lg border border-red-400 bg-red-100 dark:bg-red-900 text-red-700">
              {alertsError}
            </div>
          )}

          {!alertsLoading &&
            !alertsError &&
            alerts.length > 0 &&
            alerts.map((alert, index) => (
              <div
                key={
                  alert.DetectedObjectsId ??
                  `${String(alert.CreatedBy ?? "")}-${index}`
                }
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      alert.SeverityLevel === "Critical"
                        ? "bg-red-500"
                        : alert.SeverityLevel === "High"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                  />
                  <div>
                    <p className="font-medium">
                      {`${alert.ClassName} Detected`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {alert.LocationName ??
                        alert.SourceName ??
                        "Unknown Location"}{" "}
                      •{" "}
                      {alert.Timestamp
                        ? new Date(alert.Timestamp).toLocaleTimeString()
                        : "Just now"}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    alert.SeverityLevel === "Critical"
                      ? "text-red-600 border-red-600"
                      : alert.SeverityLevel === "High"
                        ? "text-yellow-600 border-yellow-600"
                        : "text-blue-600 border-blue-600"
                  }
                >
                  {alert.SeverityLevel === "Critical"
                    ? "Critical"
                    : alert.SeverityLevel === "High"
                      ? "High"
                      : "Info"}
                </Badge>
              </div>
            ))}
        </CardContent>
      </Card>

      {/* System Uptime Footer */}
      {/* <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <Icon icon={Zap} className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">System Uptime: 99.8%</p>
              <p className="text-sm text-muted-foreground">
                All components operational. Auto-refresh every 5 minutes. Last updated: Just now
              </p>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
