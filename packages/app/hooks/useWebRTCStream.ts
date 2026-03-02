/**
 * WebRTC Streaming Hook
 * Manages WebSocket connection and WebRTC peer connection for camera streaming
 */

import config from "app/config";
import { startInputSource, stopInputSource } from "app/utils/pipeline";
import { useEffect, useRef, useState, useCallback } from "react";

interface UseWebRTCStreamProps {
  cameraId: number;
  pipelineId: number;
  autoStart?: boolean;
  onError?: (error: string) => void;
  onStatusChange?: (status: string) => void;
  InputSourceStatus?: string;
}

export const useWebRTCStream = ({
  cameraId,
  pipelineId,
  autoStart = false,
  onError,
  onStatusChange,
}: UseWebRTCStreamProps) => {
  const WS_HOST = config.wsUrlStream;

  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState("");
  const [uptime, setUptime] = useState(0);
  const [instanceId, setInstanceId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const uptimeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const freezeCheckerRef = useRef<NodeJS.Timeout | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const isStoppingRef = useRef(false);

  /* ---------------- STATUS / ERROR ---------------- */

  const updateStatus = useCallback(
    (s: string) => {
      setStatus(s);
    },
    [onStatusChange],
  );

  const handleError = useCallback(
    (msg: string) => {
      console.error(`[Camera ${cameraId}]`, msg);
      onError?.(msg);
      updateStatus(`Error: ${msg}`);
    },
    [cameraId, onError, updateStatus],
  );

  /* ---------------- CLEANUP ---------------- */

  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (pcRef.current) {
      pcRef.current.getSenders().forEach((s) => s.track?.stop());
      pcRef.current.close();
      pcRef.current = null;
    }

    if (uptimeIntervalRef.current) {
      clearInterval(uptimeIntervalRef.current);
      uptimeIntervalRef.current = null;
    }

    if (freezeCheckerRef.current) {
      clearTimeout(freezeCheckerRef.current);
      freezeCheckerRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsConnected(false);
    setUptime(0);
  }, []);

  /* ---------------- TIMERS ---------------- */

  const startUptimeTimer = useCallback(() => {
    let seconds = 0;
    uptimeIntervalRef.current = setInterval(() => {
      seconds++;
      setUptime(seconds);
    }, 1000);
  }, []);

  const checkVideoFreeze = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.srcObject) return;

    if (video.currentTime > 0 && video.currentTime === lastVideoTimeRef.current) {
      handleError("Video freeze detected");
      return;
    }

    lastVideoTimeRef.current = video.currentTime;
    freezeCheckerRef.current = setTimeout(checkVideoFreeze, 10000);
  }, [handleError]);

  /* ---------------- START STREAM ---------------- */

  const startStream = useCallback(async () => {
    if (isConnected || pcRef.current) return;

    isStoppingRef.current = false;
    updateStatus("Starting stream...");

    try {
     const restartResponse = await startInputSource(cameraId, pipelineId);
     
     if (!restartResponse.instance_id) {
       throw new Error("No instance_id received from server");
     }
     
     setInstanceId(restartResponse.instance_id);

      /* ---------- WebSocket ---------- */
      const wsUrl = `${WS_HOST}/ws?camera_id=${cameraId}&pipeline_id=${pipelineId}&instance_id=${restartResponse.instance_id}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      /* ---------- PeerConnection ---------- */
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      let remoteDescSet = false;
      const iceQueue: RTCIceCandidate[] = [];

      ws.onopen = () => {
        console.log("[WebRTC] WS connected");
        updateStatus("");
        setIsConnected(true);
        startUptimeTimer();
      };

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "offer") {
          console.log("[WebRTC] Offer received");

          await pc.setRemoteDescription({
            type: "offer",
            sdp: data.sdp,
          });

          remoteDescSet = true;

          for (const c of iceQueue) await pc.addIceCandidate(c);

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          ws.send(JSON.stringify({ type: "answer", sdp: answer.sdp }));
          updateStatus("Session established");
        }

        if (data.type === "ice") {
          const candidate = new RTCIceCandidate({
            candidate: data.candidate,
            sdpMid: data.sdpMid,
            sdpMLineIndex: data.sdpMLineIndex,
          });

          remoteDescSet
            ? pc.addIceCandidate(candidate)
            : iceQueue.push(candidate);
        }
      };

      ws.onclose = (event) => {
        console.warn("[WebRTC] WebSocket closed", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });

        // Only cleanup if connection was not properly established
        // or if the peer connection is also closed
        if (!remoteDescSet || pcRef.current?.connectionState === 'failed' || pcRef.current?.connectionState === 'closed') {
          if (!isStoppingRef.current) {
            handleError(`WebSocket closed unexpectedly (${event.code}: ${event.reason || 'No reason'})`);
            cleanup();
          }
        } else {
          // WebRTC media continues without WebSocket
          console.log("[WebRTC] Media connection still active");
        }
      };


      ws.onerror = () => handleError("WebSocket error");

      pc.onicecandidate = (e) => {
        if (e.candidate && ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: "ice",
              candidate: e.candidate.candidate,
              sdpMid: e.candidate.sdpMid,
              sdpMLineIndex: e.candidate.sdpMLineIndex,
            }),
          );
        }
      };

      pc.ontrack = (event) => {
        console.log("[WebRTC] Track received");
        const stream = event.streams[0];
        if (!videoRef.current) return;

        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play().catch(() => { });
        lastVideoTimeRef.current = -1;
        updateStatus("Streaming");
      };

      pc.onconnectionstatechange = () => {
        console.log("[WebRTC] Connection state:", pc.connectionState);
        if (pc.connectionState === "connected") {
          updateStatus("");
          onStatusChange?.("Connected");
        } else if (pc.connectionState === "disconnected") {
          updateStatus("Disconnected");
          onStatusChange?.("Disconnected");
        } else if (pc.connectionState === "failed") {
          handleError("WebRTC connection failed");
          cleanup();
        }
      };

      freezeCheckerRef.current = setTimeout(checkVideoFreeze, 15000);
      updateStatus("Waiting for offer from server");
    } catch (e: any) {
      handleError(e.message || "Failed to start stream");
      cleanup();
    }
  }, [
    cameraId,
    pipelineId,
    isConnected,
    updateStatus,
    cleanup,
    startUptimeTimer,
    checkVideoFreeze,
    handleError,
  ]);

  /* ---------------- STOP STREAM ---------------- */

  const stopStream = useCallback(() => {
    isStoppingRef.current = true;
    cleanup();
    updateStatus("Stopped");
    setInstanceId(null);
    try {
      stopInputSource(cameraId, pipelineId);
    } catch (error) {
      console.error(`[Camera ${cameraId}] Failed to stop pipeline:`, error);
    }
  }, [cleanup, updateStatus, cameraId, pipelineId]);

  /* ---------------- AUTO START ---------------- */

  // useEffect(() => {
  //   if (autoStart) startStream();
  //   return cleanup;
  // }, [autoStart]);

  /* ---------------- UTILS ---------------- */

  const formatUptime = (s: number) =>
    `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(
      Math.floor((s % 3600) / 60),
    ).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return {
    videoRef,
    isConnected,
    status,
    uptime: formatUptime(uptime),
    instanceId,
    startStream,
    stopStream,
  };
};
