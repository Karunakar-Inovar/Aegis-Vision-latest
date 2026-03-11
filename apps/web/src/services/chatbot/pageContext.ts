/**
 * Contextual chatbot content per page.
 * Suggestions and smart tips change based on current route.
 */

export type PageContextConfig = {
  pageKey: string;
  pageLabel: string;
  suggestions: Array<{
    icon: string;
    text: string;
    action: "send-message" | "upload-image" | "upload-video";
    payload?: string;
  }>;
  smartTips: Array<{
    id: string;
    title: string;
    description: string;
    actionLabel: string;
    actionType: "send-message" | "navigate" | "upload-image";
    actionPayload?: string;
    variant: "info" | "warning" | "success" | "insight";
  }>;
};

export type SmartTip = PageContextConfig["smartTips"][number];
export type Suggestion = PageContextConfig["suggestions"][number];

const PAGE_CONTEXT_CONFIG: Record<string, PageContextConfig> = {
  dashboard: {
    pageKey: "dashboard",
    pageLabel: "Dashboard",
    suggestions: [
      {
        icon: "Activity",
        text: "Show cameras with issues",
        action: "send-message",
        payload: "Show cameras with issues",
      },
      {
        icon: "BarChart3",
        text: "What's today's defect rate?",
        action: "send-message",
        payload: "What's today's defect rate?",
      },
      {
        icon: "Upload",
        text: "Upload image for quick inspection",
        action: "upload-image",
      },
    ],
    smartTips: [
      {
        id: "dash-1",
        title: "Defect Spike Detected",
        description:
          "Line 3 has 40% more defects than usual in the last 2 hours.",
        actionLabel: "View Details",
        actionType: "send-message",
        actionPayload: "Show defect details for Line 3",
        variant: "warning",
      },
      {
        id: "dash-2",
        title: "Model Update Available",
        description:
          "Scratch Detector v2.2 shows 8% better accuracy in staging.",
        actionLabel: "Compare Versions",
        actionType: "send-message",
        actionPayload: "Compare Scratch Detector v2.1 vs v2.2",
        variant: "info",
      },
    ],
  },
  cameras: {
    pageKey: "cameras",
    pageLabel: "Cameras",
    suggestions: [
      {
        icon: "WifiOff",
        text: "Which cameras are offline?",
        action: "send-message",
        payload: "Which cameras are offline?",
      },
      {
        icon: "Video",
        text: "Show camera feed for Line 3",
        action: "send-message",
        payload: "Show camera feed for Line 3",
      },
      {
        icon: "Upload",
        text: "Upload image from a camera",
        action: "upload-image",
      },
    ],
    smartTips: [
      {
        id: "cam-1",
        title: "2 Cameras Need Attention",
        description:
          "PLANT_F_CAMERA2 and AOS_Camera_5 have high frame drop rates.",
        actionLabel: "Show Cameras",
        actionType: "send-message",
        actionPayload: "Show cameras with high frame drop",
        variant: "warning",
      },
      {
        id: "cam-2",
        title: "New Camera Onboarded",
        description:
          "LINE4_CAM_12 was added yesterday and is awaiting model assignment.",
        actionLabel: "Assign Model",
        actionType: "navigate",
        actionPayload: "/cameras/line4-cam-12",
        variant: "info",
      },
    ],
  },
  "ai-models": {
    pageKey: "ai-models",
    pageLabel: "AI Models",
    suggestions: [
      {
        icon: "Trophy",
        text: "Which model has the best accuracy?",
        action: "send-message",
        payload: "Which model has the best accuracy?",
      },
      {
        icon: "GitCompare",
        text: "Compare model versions",
        action: "send-message",
        payload: "Compare model versions",
      },
      {
        icon: "Upload",
        text: "Upload test image for a model",
        action: "upload-image",
      },
    ],
    smartTips: [
      {
        id: "model-1",
        title: "Accuracy Drop Alert",
        description:
          "Dent Classifier accuracy fell from 94% to 87% this week on Line 1.",
        actionLabel: "Investigate",
        actionType: "send-message",
        actionPayload: "Why did Dent Classifier accuracy drop on Line 1?",
        variant: "warning",
      },
      {
        id: "model-2",
        title: "Training Complete",
        description:
          "Crack Analyzer v3.1 finished training with 96.2% validation accuracy.",
        actionLabel: "Deploy Model",
        actionType: "navigate",
        actionPayload: "/models/crack-analyzer-v3-1",
        variant: "success",
      },
    ],
  },
  pipelines: {
    pageKey: "pipelines",
    pageLabel: "Pipelines",
    suggestions: [
      {
        icon: "Workflow",
        text: "Show running pipelines",
        action: "send-message",
        payload: "Show running pipelines",
      },
      {
        icon: "AlertCircle",
        text: "Any failed pipeline runs?",
        action: "send-message",
        payload: "Any failed pipeline runs?",
      },
      {
        icon: "Upload",
        text: "Upload video for pipeline test",
        action: "upload-video",
      },
    ],
    smartTips: [
      {
        id: "pipe-1",
        title: "Pipeline Failure",
        description:
          "Retraining pipeline for Surface Anomaly failed 2 hours ago — out of memory.",
        actionLabel: "View Logs",
        actionType: "send-message",
        actionPayload: "Show logs for failed Surface Anomaly pipeline",
        variant: "warning",
      },
      {
        id: "pipe-2",
        title: "Scheduled Run Tonight",
        description:
          "Nightly retraining for Scratch Detector runs at 11 PM with 2,400 new images.",
        actionLabel: "View Schedule",
        actionType: "navigate",
        actionPayload: "/pipelines/schedule",
        variant: "info",
      },
    ],
  },
  alerts: {
    pageKey: "alerts",
    pageLabel: "Alerts",
    suggestions: [
      {
        icon: "Bell",
        text: "Show unread critical alerts",
        action: "send-message",
        payload: "Show unread critical alerts",
      },
      {
        icon: "AlertCircle",
        text: "Alert volume summary",
        action: "send-message",
        payload: "Show alert volume summary",
      },
      {
        icon: "Filter",
        text: "Filter by alert type",
        action: "send-message",
        payload: "Show alerts filtered by type",
      },
    ],
    smartTips: [
      {
        id: "alert-1",
        title: "5 Unread Critical Alerts",
        description:
          "You have 5 critical alerts from the last 24 hours that need review.",
        actionLabel: "Review Now",
        actionType: "send-message",
        actionPayload: "Show all unread critical alerts",
        variant: "warning",
      },
      {
        id: "alert-2",
        title: "Alert Acknowledgment Rate Up",
        description:
          "Average acknowledgment time improved by 15% this week.",
        actionLabel: "View Trends",
        actionType: "send-message",
        actionPayload: "Show alert acknowledgment trends",
        variant: "success",
      },
    ],
  },
  insights: {
    pageKey: "insights",
    pageLabel: "Insights",
    suggestions: [
      {
        icon: "BarChart3",
        text: "Generate insights report",
        action: "send-message",
        payload: "Generate insights report",
      },
      {
        icon: "TrendingUp",
        text: "Compare periods",
        action: "send-message",
        payload: "Compare defect rates across periods",
      },
      {
        icon: "Lightbulb",
        text: "Identify improvement areas",
        action: "send-message",
        payload: "Identify improvement areas",
      },
    ],
    smartTips: [
      {
        id: "insight-1",
        title: "Weekly Trend Detected",
        description:
          "Line 2 defect rate increased 12% vs last week — AI suggests reviewing tooling calibration.",
        actionLabel: "View Analysis",
        actionType: "send-message",
        actionPayload: "Show weekly trend analysis for Line 2",
        variant: "insight",
      },
      {
        id: "insight-2",
        title: "Quality Improvement Opportunity",
        description:
          "Line 1 and Line 4 show similar defect patterns — consolidating models could improve accuracy.",
        actionLabel: "Explore",
        actionType: "send-message",
        actionPayload: "Compare defect patterns across Line 1 and Line 4",
        variant: "info",
      },
    ],
  },
  reports: {
    pageKey: "reports",
    pageLabel: "Reports",
    suggestions: [
      {
        icon: "FileText",
        text: "Generate weekly report",
        action: "send-message",
        payload: "Generate weekly quality report",
      },
      {
        icon: "Download",
        text: "Export report for date range",
        action: "send-message",
        payload: "Export report for date range",
      },
      {
        icon: "BarChart3",
        text: "Summary of key metrics",
        action: "send-message",
        payload: "Show summary of key quality metrics",
      },
    ],
    smartTips: [
      {
        id: "report-1",
        title: "Report Ready",
        description:
          "Your weekly quality report is ready. Export includes defect trends, KPIs, and compliance summary.",
        actionLabel: "Export",
        actionType: "send-message",
        actionPayload: "Export weekly quality report",
        variant: "success",
      },
      {
        id: "report-2",
        title: "Custom Report Available",
        description:
          "Create a custom report with filters for specific lines, defect types, or time periods.",
        actionLabel: "Create Report",
        actionType: "send-message",
        actionPayload: "Help me create a custom quality report",
        variant: "info",
      },
    ],
  },
  notifications: {
    pageKey: "notifications",
    pageLabel: "Notifications",
    suggestions: [
      {
        icon: "Bell",
        text: "Show unread critical alerts",
        action: "send-message",
        payload: "Show unread critical alerts",
      },
      {
        icon: "BellOff",
        text: "Mute non-critical notifications",
        action: "send-message",
        payload: "How do I mute non-critical notifications?",
      },
      {
        icon: "Filter",
        text: "Filter by alert type",
        action: "send-message",
        payload: "Show notifications filtered by type",
      },
    ],
    smartTips: [
      {
        id: "notif-1",
        title: "5 Unread Critical Alerts",
        description:
          "You have 5 critical alerts from the last 24 hours that need review.",
        actionLabel: "Review Now",
        actionType: "send-message",
        actionPayload: "Show all unread critical alerts",
        variant: "warning",
      },
    ],
  },
  users: {
    pageKey: "users",
    pageLabel: "Users",
    suggestions: [
      {
        icon: "Users",
        text: "How many active operators today?",
        action: "send-message",
        payload: "How many active operators today?",
      },
      {
        icon: "UserPlus",
        text: "Help me add a new user",
        action: "send-message",
        payload: "How do I add a new user?",
      },
      {
        icon: "Shield",
        text: "Show user role breakdown",
        action: "send-message",
        payload: "Show user role breakdown",
      },
    ],
    smartTips: [
      {
        id: "user-1",
        title: "3 Pending Invitations",
        description:
          "3 user invitations sent last week have not been accepted yet.",
        actionLabel: "Resend Invites",
        actionType: "send-message",
        actionPayload: "Resend pending user invitations",
        variant: "info",
      },
    ],
  },
  incidents: {
    pageKey: "incidents",
    pageLabel: "Incidents",
    suggestions: [
      {
        icon: "AlertTriangle",
        text: "Show critical incidents this week",
        action: "send-message",
        payload: "Show critical incidents this week",
      },
      {
        icon: "TrendingUp",
        text: "What's the most common defect?",
        action: "send-message",
        payload: "What's the most common defect type?",
      },
      {
        icon: "ClipboardCheck",
        text: "Unresolved incidents summary",
        action: "send-message",
        payload: "Show unresolved incidents summary",
      },
    ],
    smartTips: [
      {
        id: "inc-1",
        title: "Incident Cluster on Line 3",
        description:
          "8 scratch defects logged in the last 4 hours — possible tooling issue.",
        actionLabel: "View Cluster",
        actionType: "send-message",
        actionPayload: "Show scratch defect incidents on Line 3 today",
        variant: "warning",
      },
      {
        id: "inc-2",
        title: "Resolution Rate Improving",
        description:
          "Average incident resolution time dropped from 4.2h to 2.8h this month.",
        actionLabel: "View Trends",
        actionType: "send-message",
        actionPayload: "Show incident resolution time trends",
        variant: "success",
      },
    ],
  },
  settings: {
    pageKey: "settings",
    pageLabel: "Settings",
    suggestions: [
      {
        icon: "Camera",
        text: "How do I add a new camera?",
        action: "send-message",
        payload: "How do I add a new camera?",
      },
      {
        icon: "Users",
        text: "What roles are available?",
        action: "send-message",
        payload: "What roles are available in AegisVision?",
      },
      {
        icon: "Bell",
        text: "Help with notification settings",
        action: "send-message",
        payload: "Help me configure notification settings",
      },
    ],
    smartTips: [
      {
        id: "set-1",
        title: "System Update Available",
        description:
          "AegisVision v3.4 is available with improved detection algorithms.",
        actionLabel: "Learn More",
        actionType: "send-message",
        actionPayload: "What is new in AegisVision v3.4?",
        variant: "info",
      },
    ],
  },
  default: {
    pageKey: "default",
    pageLabel: "AegisVision",
    suggestions: [
      {
        icon: "Upload",
        text: "Upload an image for inspection",
        action: "upload-image",
      },
      {
        icon: "Film",
        text: "Analyze a video clip for defects",
        action: "upload-video",
      },
      {
        icon: "HelpCircle",
        text: "What can you help me with?",
        action: "send-message",
        payload: "What can you help me with?",
      },
    ],
    smartTips: [],
  },
};

/**
 * Match pathname against config keys using startsWith.
 * Order: more specific paths first.
 */
export function getPageContext(pathname: string): PageContextConfig {
  const path = (pathname ?? "").replace(/\/+$/, "") || "/";

  if (path.includes("/cameras")) return PAGE_CONTEXT_CONFIG.cameras;
  if (path.includes("/models") || path.includes("/ai-models"))
    return PAGE_CONTEXT_CONFIG["ai-models"];
  if (path.includes("/pipelines")) return PAGE_CONTEXT_CONFIG.pipelines;
  if (path.includes("/alerts")) return PAGE_CONTEXT_CONFIG.alerts;
  if (path.includes("/insights")) return PAGE_CONTEXT_CONFIG.insights;
  if (path.includes("/reports")) return PAGE_CONTEXT_CONFIG.reports;
  if (path.includes("/notifications")) return PAGE_CONTEXT_CONFIG.notifications;
  if (path.includes("/users")) return PAGE_CONTEXT_CONFIG.users;
  if (path.includes("/incidents")) return PAGE_CONTEXT_CONFIG.incidents;
  if (path.includes("/settings")) return PAGE_CONTEXT_CONFIG.settings;
  if (path.includes("/dashboard") || path === "/" || path === "")
    return PAGE_CONTEXT_CONFIG.dashboard;

  return PAGE_CONTEXT_CONFIG.default;
}
