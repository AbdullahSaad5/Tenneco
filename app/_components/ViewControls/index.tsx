"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface ViewControlsProps {
  onResetCamera: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPlayExplosion?: () => void;
  showExplosionButton?: boolean;
}

const ViewControls: React.FC<ViewControlsProps> = ({
  onResetCamera,
  onZoomIn,
  onZoomOut,
  onPlayExplosion,
  showExplosionButton = false
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        });
      }
    }
  };

  // Listen for fullscreen changes
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <motion.div
      initial={{ x: 100 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", damping: 20 }}
      className="fixed right-4 top-20 z-20 flex flex-col gap-2"
    >
      {/* Reset Camera Button */}
      <button
        onClick={onResetCamera}
        className="group p-3 bg-white hover:bg-blue-600 rounded-lg border border-slate-200 transition-colors"
        title="Reset Camera"
      >
        <svg
          className="w-6 h-6 text-slate-700 group-hover:text-white transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>

      {/* Play Explosion Button - only show if available */}
      {showExplosionButton && onPlayExplosion && (
        <button
          onClick={onPlayExplosion}
          className="group p-3 bg-white hover:bg-orange-600 rounded-lg border border-slate-200 transition-colors"
          title="Play Explosion Animation"
        >
          <svg
            className="w-6 h-6 text-slate-700 group-hover:text-white transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </button>
      )}

      {/* Zoom In Button */}
      <button
        onClick={onZoomIn}
        className="group p-3 bg-white hover:bg-blue-600 rounded-lg border border-slate-200 transition-colors"
        title="Zoom In"
      >
        <svg
          className="w-6 h-6 text-slate-700 group-hover:text-white transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
          />
        </svg>
      </button>

      {/* Zoom Out Button */}
      <button
        onClick={onZoomOut}
        className="group p-3 bg-white hover:bg-blue-600 rounded-lg border border-slate-200 transition-colors"
        title="Zoom Out"
      >
        <svg
          className="w-6 h-6 text-slate-700 group-hover:text-white transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
          />
        </svg>
      </button>

      {/* Fullscreen Button */}
      <button
        onClick={toggleFullscreen}
        className="group p-3 bg-white hover:bg-blue-600 rounded-lg border border-slate-200 transition-colors"
        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      >
        {isFullscreen ? (
          <svg
            className="w-6 h-6 text-slate-700 group-hover:text-white transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6 text-slate-700 group-hover:text-white transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        )}
      </button>
    </motion.div>
  );
};

export default ViewControls;
