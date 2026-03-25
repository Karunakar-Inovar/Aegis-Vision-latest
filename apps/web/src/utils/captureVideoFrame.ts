/**
 * Extracts a frame from a video (blob URL or other src) as a JPEG data URL via canvas.
 */
export function captureVideoFrame(
  videoSrc: string,
  timeInSeconds: number = 1
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    // Blob/object URLs from uploads are same-origin; crossOrigin can taint the canvas for toDataURL().
    if (!videoSrc.startsWith("blob:")) {
      video.crossOrigin = "anonymous";
    }
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    const cleanup = () => {
      try {
        video.pause();
        video.removeAttribute("src");
        video.load();
      } catch {
        /* ignore */
      }
    };

    video.onloadedmetadata = () => {
      const dur = video.duration;
      const t =
        Number.isFinite(dur) && dur > 0
          ? Math.min(timeInSeconds, Math.max(0, dur - 0.1))
          : Math.min(timeInSeconds, 0.1);
      video.currentTime = t;
    };

    video.onseeked = () => {
      try {
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (!w || !h) {
          cleanup();
          reject(new Error("Invalid video dimensions"));
          return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          cleanup();
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        cleanup();
        resolve(dataUrl);
      } catch (err) {
        cleanup();
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Failed to load video"));
    };

    video.src = videoSrc;
    video.load();
  });
}
