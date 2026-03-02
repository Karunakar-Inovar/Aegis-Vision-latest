"use client";

import * as React from "react";

interface TrimmedVideoPlayerProps {
  videoUrl: string;
  startTime: number;
  endTime: number;
  className?: string;
  onClose?: () => void;
}

export const TrimmedVideoPlayer: React.FC<TrimmedVideoPlayerProps> = ({
  videoUrl,
  startTime,
  endTime,
  className = "",
  onClose,
}) => {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(1); // 0 to 1
  const [isMuted, setIsMuted] = React.useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = React.useState(false);

  // Calculate trimmed segment duration
  React.useEffect(() => {
    const segmentDuration = endTime - startTime;
    setDuration(segmentDuration);
  }, [startTime, endTime]);

  // Enforce video time boundaries and track playback
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const segmentDuration = endTime - startTime;

    const handleLoadedMetadata = () => {
      console.log("Video loaded, setting start time to", startTime);
      video.currentTime = startTime;
      setDuration(segmentDuration);
    };

    const handleTimeUpdate = () => {
      // Calculate relative time within the trimmed segment
      const relativeTime = video.currentTime - startTime;
      setCurrentTime(Math.max(0, Math.min(relativeTime, segmentDuration)));

      // If video reaches end time, loop back to start
      if (video.currentTime >= endTime) {
        video.currentTime = startTime;
      }
      // If somehow before start time, reset to start
      if (video.currentTime < startTime) {
        video.currentTime = startTime;
      }
    };

    const handleSeeking = () => {
      // Prevent seeking outside the trimmed range
      if (video.currentTime < startTime) {
        video.currentTime = startTime;
      } else if (video.currentTime > endTime) {
        video.currentTime = startTime;
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    const handleVolumeChange = () => {
      if (video) {
        setVolume(video.volume);
        setIsMuted(video.muted);
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("seeking", handleSeeking);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("volumechange", handleVolumeChange);

    // Set initial time if metadata already loaded
    if (video.readyState >= 1) {
      video.currentTime = startTime;
      setDuration(segmentDuration);
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("seeking", handleSeeking);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("volumechange", handleVolumeChange);
    };
  }, [startTime, endTime]);

  // Custom video control handlers
  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const segmentDuration = endTime - startTime;
    const newTime = startTime + pos * segmentDuration;

    video.currentTime = newTime;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVolumeClick = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isMuted || volume === 0) {
      video.muted = false;
      video.volume = volume === 0 ? 0.5 : volume;
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume > 0) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  // Generate trimmed video URL with Media Fragments
  const trimmedVideoUrl = `${videoUrl}#t=${startTime},${endTime}`;

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      {/* Video Element - No default controls */}
      <video
        ref={videoRef}
        src={trimmedVideoUrl}
        className="w-full h-auto max-h-[70vh] object-contain"
        onClick={handlePlayPause}
      >
        Your browser does not support the video tag.
      </video>

      {/* Custom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
        {/* Progress Bar - Shows only trimmed segment duration */}
        <div
          className="w-full h-1.5 bg-gray-600 rounded-full cursor-pointer mb-3 hover:h-2 transition-all"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{
              width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
            }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between text-white text-sm">
          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
              onClick={handlePlayPause}
              className="hover:text-primary transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Time Display - Relative to trimmed segment */}
            <span className="font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Volume Control */}
          <div 
            className="flex items-center gap-2"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            {/* Volume Slider */}
            {showVolumeSlider && (
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #fff 0%, #fff ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%, #4b5563 100%)`
                }}
              />
            )}
            
            {/* Volume Icon Button */}
            <button
              onClick={handleVolumeClick}
              className="hover:text-primary transition-colors"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                </svg>
              ) : volume > 0.5 ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 9v6h4l5 5V4l-5 5H7z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
