"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, Volume2, VolumeX, Maximize, Video } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

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

            <div className="flex-1 bg-black relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                    <Video className="w-16 h-16 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Video Preview
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Product demonstration video will be displayed here
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer">
                      <Play className="w-4 h-4" />
                      <span className="text-sm font-medium">Play Video</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Duration: 3:45 • Resolution: 1920x1080
                  </div>
                </div>
              </div>

              {isPlaying && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              )}
            </div>

            <div className="bg-slate-800 px-6 py-4 border-t border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-white" />
                    ) : (
                      <Play className="w-5 h-5 text-white ml-0.5" />
                    )}
                  </button>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-white" />
                    )}
                  </button>
                  <span className="text-sm text-white font-medium">
                    0:00 / 3:45
                  </span>
                </div>
                <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                  <Maximize className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="relative h-1.5 bg-slate-700 rounded-full overflow-hidden cursor-pointer group">
                <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-blue-600 to-blue-500" />
                <div className="absolute top-1/2 left-1/3 w-3 h-3 bg-white rounded-full -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VideoModal;
