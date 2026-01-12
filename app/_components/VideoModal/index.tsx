"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, Volume2, VolumeX, Maximize, Video, Minimize } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);

  const videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setCurrentTime(0);
      setProgress(0);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isOpen]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressBar = progressBarRef.current;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
  };

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = progressBarRef.current;
    if (!progressBar || !duration) return;

    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const time = pos * duration;

    setHoverPosition((e.clientX - rect.left) / rect.width * 100);
    setHoverTime(time);
  };

  const handleProgressLeave = () => {
    setHoverTime(null);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!document.fullscreenElement) {
      video.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    if (isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const handleMouseLeaveVideo = () => {
    if (isPlaying) {
      setShowControls(false);
    }
  };

  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    }
  }, [isPlaying]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-4 md:inset-10 lg:inset-20 bg-slate-900 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Product Video</h2>
                  <p className="text-sm text-white/80">Learn more about this component</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div
              className="flex-1 bg-black relative flex items-center justify-center"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeaveVideo}
            >
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain"
                onClick={togglePlayPause}
              />

              {!isPlaying && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  onClick={togglePlayPause}
                  className="absolute inset-0 m-auto w-20 h-20 bg-blue-600/90 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
                >
                  <Play className="w-10 h-10 text-white ml-1" />
                </motion.button>
              )}

              {isPlaying && showControls && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              )}
            </div>

            <AnimatePresence>
              {showControls && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-800 px-6 py-4 border-t border-slate-700"
                  onMouseEnter={() => setShowControls(true)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={togglePlayPause}
                        className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5 text-white" />
                        ) : (
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        )}
                      </button>
                      <button
                        onClick={toggleMute}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        {isMuted ? (
                          <VolumeX className="w-5 h-5 text-white" />
                        ) : (
                          <Volume2 className="w-5 h-5 text-white" />
                        )}
                      </button>
                      <span className="text-sm text-white font-medium">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                      title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                      {isFullscreen ? (
                        <Minimize className="w-5 h-5 text-white" />
                      ) : (
                        <Maximize className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    {hoverTime !== null && (
                      <div
                        className="absolute bottom-full mb-2 px-3 py-1.5 bg-white text-slate-900 text-sm font-medium rounded-md shadow-xl z-50"
                        style={{
                          left: `${hoverPosition}%`,
                          transform: 'translateX(-50%)',
                          pointerEvents: 'none'
                        }}
                      >
                        {formatTime(hoverTime)}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-white rotate-45" />
                      </div>
                    )}
                    <div
                      ref={progressBarRef}
                      onClick={handleProgressClick}
                      onMouseMove={handleProgressHover}
                      onMouseLeave={handleProgressLeave}
                      className="relative h-2 bg-slate-700 rounded-full cursor-pointer group py-1 -my-1"
                    >
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                      <div
                        className="absolute top-1/2 w-3 h-3 bg-white rounded-full -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                        style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VideoModal;
