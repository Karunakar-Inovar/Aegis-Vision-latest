"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, Separator } from "ui";
import {
  Building2,
  Camera as CameraIcon,
  GitBranch,
  Bell,
  Users,
} from "ui/utils/icons";
import { ROUTES } from "app/constants";

const SETUP_STEPS = [
  {
    title: "Organization Setup",
    description: "Configure your company details and preferences.",
    icon: Building2,
  },
  {
    title: "Camera Configuration",
    description: "Add and configure your production cameras with RTSP streams.",
    icon: CameraIcon,
  },
  {
    title: "Pipeline Configuration",
    description: "Create AI pipelines by assigning models to cameras.",
    icon: GitBranch,
  },
  {
    title: "Notification Setup",
    description: "Configure global and pipeline-specific alert channels.",
    icon: Bell,
  },
  {
    title: "User Management",
    description: "Add stakeholders and operational users.",
    icon: Users,
  },
];

export default function SetupOverviewPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasResetPassword = localStorage.getItem("passwordReset") === "true";
    const hasAcknowledged = localStorage.getItem("setupOverviewAcknowledged") === "true";

    if (!hasResetPassword || hasAcknowledged) {
      router.replace(ROUTES.ADMIN.SETUP);
      return;
    }

    setIsReady(true);
  }, [router]);

  const handleStartConfiguration = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("setupOverviewAcknowledged", "true");
    }
    router.push(ROUTES.ADMIN.SETUP);
  };

  const handleViewDocs = () => {
    if (typeof window !== "undefined") {
      window.open("https://docs.aegis-vision.example.com/setup", "_blank", "noopener,noreferrer");
    }
  };

  if (!isReady) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-muted-foreground">Preparing your workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">Welcome to Aegis Vision</h1>
        <p className="text-lg text-muted-foreground">
          Let’s set up your Vision AI platform. Here’s what we’ll cover:
        </p>
      </div>

      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {SETUP_STEPS.map((step, index) => (
              <div key={step.title}>
                <div className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition hover:border-primary/50">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {index + 1}. {step.title}
                      </p>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </div>
                {index < SETUP_STEPS.length - 1 && (
                  <Separator className="mx-auto my-2 w-3/4 bg-border/70" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button size="lg" className="w-full sm:w-auto" onPress={handleStartConfiguration}>
          Start Configuration
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="w-full sm:w-auto"
          onPress={handleViewDocs}
        >
          View Documentation
        </Button>
      </div>
    </div>
  );
}

