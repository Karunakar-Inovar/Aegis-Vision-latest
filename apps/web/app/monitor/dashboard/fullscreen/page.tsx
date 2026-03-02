"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge, Button, Card, CardContent, Icon, VideoPlayer } from "ui";
import { STATUS } from "app/constants";
import {
  Minimize2,
  RefreshCw,
  Square,
  Play,
} from "ui/src/utils/icons";

export default function MonitorFullscreenView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const cameraId = Number(searchParams.get("cameraId"));
  const pipelineId = Number(searchParams.get("pipelineId"));
  const cameraName = searchParams.get("cameraName") || "Camera";
  const location = searchParams.get("location") || "";
  const pipeline = searchParams.get("pipeline") || "";
  const inputStatus = searchParams.get("status") || STATUS.OFFLINE;
  const isActive = searchParams.get("isActive") === "true";

  const videoPlayerRef = React.useRef<{
    videoElement?: HTMLVideoElement | null;
    startStream?: () => void;
    stopStream?: () => void;
    isConnected?: boolean;
  } | null>(null);

  const handleStop = React.useCallback(() => {
    videoPlayerRef.current?.stopStream?.();
  }, []);

  const handleStart = React.useCallback(() => {
    videoPlayerRef.current?.startStream?.();
  }, []);

  const handleRestart = React.useCallback(() => {
    videoPlayerRef.current?.stopStream?.();
    setTimeout(() => {
      videoPlayerRef.current?.startStream?.();
    }, 200);
  }, []);

  const validIds = !Number.isNaN(cameraId) && !Number.isNaN(pipelineId);

  if (!validIds) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-xl font-semibold">Missing camera details</h1>
          <p className="text-sm text-muted-foreground">
            We could not find the camera information needed to open the fullscreen view.
          </p>
          <Button onPress={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">
            {cameraName} - Live Video Playback
          </h1>
          <p className="text-sm text-muted-foreground">
            {location || "Live camera view"}
          </p>
        </div>
        <Button variant="outline" onPress={() => router.back()} className="flex-row gap-2">
          <Icon icon={Minimize2} className="h-4 w-4" />
          <span>Exit Fullscreen</span>
        </Button>
      </div>

      <div className="px-4 pb-8 pt-4 sm:px-6">
        <Card className="border bg-card shadow-sm">
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {cameraName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {location || "Live view"} {pipeline ? `• ${pipeline}` : ""}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    inputStatus === STATUS.ONLINE
                      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800"
                      : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800"
                  }
                >
                  {inputStatus === STATUS.ONLINE ? "Live" : "Offline"}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onPress={handleStop}
                  className="flex-row items-center gap-2"
                >
                  <Icon icon={Square} className="h-4 w-4" />
                  <span>Stop</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={handleRestart}
                  className="flex-row items-center gap-2"
                >
                  <Icon icon={RefreshCw} className="h-4 w-4" />
                  <span>Restart</span>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onPress={handleStart}
                  className="flex-row items-center gap-2"
                >
                  <Icon icon={Play} className="h-4 w-4" />
                  <span>Start</span>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-[#0c111a] p-2 sm:p-3">
              <VideoPlayer
                ref={videoPlayerRef}
                cameraId={cameraId}
                pipelineId={pipelineId}
                cameraName={cameraName}
                location={location}
                pipeline={pipeline}
                InputSourceStatus={inputStatus}
                autoStart
                isActive={!isActive}
                showControls
                showFullscreenButton={false}
                className="aspect-video w-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
