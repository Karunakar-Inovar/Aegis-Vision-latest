/**
 * VideoPlayer Component
 * WebRTC-based video player with streaming controls
 */
import * as React from "react";
import { useWebRTCStream } from "app/hooks/useWebRTCStream";
import { Play, Square, RefreshCw, Maximize2 } from "../utils/icons";
import { Icon } from "../atoms/icon";
import { Badge } from "../atoms/badge";

export interface VideoPlayerProps {
  cameraId: number;
  cameraName: string;
  pipelineId: number;
  location?: string;
  autoStart?: boolean;
  showControls?: boolean;
  onError?: (error: string) => void;
  onStatusChange?: (status: string) => void;
  className?: string;
  InputSourceStatus?: string;
  pipeline?: string;
  isActive?: boolean;
  onFullscreen?: () => void;
  showFullscreenButton?: boolean;
}

export const VideoPlayer = React.forwardRef<HTMLVideoElement, VideoPlayerProps>(
  (
    {
      cameraId,
      cameraName,
      pipelineId,
      location,
      autoStart = false,
      showControls = true,
      onError,
      onStatusChange,
      className = "",
      isActive,
      InputSourceStatus,
      pipeline,
      onFullscreen,
      showFullscreenButton = true,
    },
    forwardedRef,
  ) => {
    const {
      videoRef,
      isConnected,
      status,
      uptime,
      instanceId,
      startStream,
      stopStream,
    } = useWebRTCStream({
      cameraId,
      pipelineId,
      autoStart: autoStart && InputSourceStatus === 'Online',
      onError,
      InputSourceStatus,
      onStatusChange,
    });

    // Merge refs if forwardedRef is provided
    React.useImperativeHandle(
      forwardedRef,
      () => ({
        videoElement: videoRef.current,
        startStream,
        stopStream,
        isConnected,
      }),
      [startStream, stopStream, isConnected],
    );

    return (
      <div
        className={`group relative rounded-lg overflow-hidden bg-black ${className} ${isActive ? 'pointer-events-none' : ''}`}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          controls={false}
          className="w-full h-full object-cover"
          style={{ minHeight: "240px", maxWidth: "100%" }}
        />

        {/* Offline Placeholder */}
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90">
            <div className="text-center">
              <Icon
                icon={Square}
                className="h-16 w-16 text-red-500/50 mx-auto mb-2"
              />
              <p className="text-white/50 text-xs mt-1">
                This camera is currently inactive.
              </p>
            </div>
          </div>
        )}

        {/* Placeholder when not streaming (only if online) */}
        {!isActive && !isConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <Icon
                icon={Play}
                onClick={startStream}
                className="h-16 w-16 text-white/50 mx-auto mb-2 cursor-pointer hover:text-white/70 transition-colors"
              />
              <p className="text-white/70 text-sm">
                Click Start to begin streaming
              </p>
            </div>
          </div>
        )}

        {!isActive && isConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 opacity-0 hover:opacity-100 transition-opacity">
            <div className="text-center">
              {/* replace icon to stop */}
              <Icon
                icon={Square}
                onClick={stopStream}
                className="h-16 w-16 text-white/50 mx-auto mb-2 cursor-pointer hover:text-white/70 transition-colors"
              />
              <p className="text-white/70 text-sm">
                Click Stop to end streaming
              </p>
            </div>
          </div>
        )}

        {/* Camera Info Overlay - Removed as info is shown in card header above */}

        {/* Status and Uptime */}
        {!isActive && status && status !== 'Session established' && (
          <div className="absolute bottom-2 left-2 right-2">
            <div className="bg-black/60 backdrop-blur-sm rounded px-2 py-1">
              <p className="text-white/90 text-xs">
                {status}
              </p>
            </div>
          </div>
        )}

        {/* Controls */}
        {/* {showControls && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-2 opacity-0 hover:opacity-100 transition-opacity">
            {!isConnected ? (
              <Button
                size="sm"
                onPress={startStream}
                className="bg-green-600 hover:bg-green-700"
              >
                <Icon icon={Play} className="h-4 w-4 mr-1" />
                Start
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="destructive"
                  onPress={stopStream}
                >
                  <Icon icon={Square} className="h-4 w-4 mr-1" />
                  Stop
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={restartStream}
                >
                  <Icon icon={RefreshCw} className="h-4 w-4 mr-1" />
                  Restart
                </Button>
              </>
            )}
          </div>
        )} */}

        {/* Fullscreen button */}
        {onFullscreen && showFullscreenButton && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              onClick={onFullscreen}
              className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-md transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/70 opacity-0 group-hover:opacity-100"
              aria-label="Open fullscreen view"
            >
              <Icon icon={Maximize2} className="h-4 w-4" />
              <span>Fullscreen</span>
            </button>
          </div>
        )}
      </div>
    );
  },
);

VideoPlayer.displayName = "VideoPlayer";
