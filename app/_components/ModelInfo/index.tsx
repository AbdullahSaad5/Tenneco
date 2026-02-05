"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Video } from "lucide-react";
import PDFModal from "../PDFModal";
import VideoModal from "../VideoModal";
import { HotspotItem } from "../../_types/content";
import { getMediaUrl } from "../../utils/mediaUrl";

// Default paths if not specified in hotspot
const DEFAULT_PDF = "./documents/default-brake-info.pdf";
const DEFAULT_VIDEO = "./videos/default-brake-overview.mp4";

interface ModelInfoProps {
  hotspot: HotspotItem | null;
}

const ModelInfo: React.FC<ModelInfoProps> = ({ hotspot }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isPDFOpen, setIsPDFOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Get PDF and Video URLs (use hotspot's or defaults)
  const pdfUrl = useMemo(() => {
    const url = hotspot?.info?.pdf;
    return getMediaUrl(url) || DEFAULT_PDF;
  }, [hotspot]);

  const videoUrl = useMemo(() => {
    const url = hotspot?.info?.video;
    return getMediaUrl(url) || DEFAULT_VIDEO;
  }, [hotspot]);

  if (!hotspot) return null;

  const details = {
    name: hotspot.info?.title || hotspot.label,
    description: hotspot.info?.description || "",
    color: hotspot.color,
  };

  return (
    <>
      {/* Action Buttons Group */}
      <div className="fixed bottom-8 right-6 z-20 flex flex-row gap-3">
        {/* Info Toggle Button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 rounded-lg border border-white/20 transition-colors shadow-lg bg-white hover:bg-slate-50"
          title={isOpen ? "Hide Info" : "Show Info"}
        >
          <svg
            className="w-6 h-6 text-slate-700 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </motion.button>

        {/* PDF Button */}
        <motion.button
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          onClick={() => setIsPDFOpen(true)}
          className="p-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors shadow-lg group"
          title="View Documentation"
        >
          <FileText className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </motion.button>

        {/* Video Button */}
        <motion.button
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => setIsVideoOpen(true)}
          className="p-3 rounded-lg bg-primary hover:opacity-90 transition-all shadow-lg group"
          title="Watch Video"
        >
          <Video className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </motion.button>
      </div>

      {/* Info Panel */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key={hotspot.hotspotId}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.3, type: "spring" }}
            className="fixed bottom-24 right-6 z-20 w-80 bg-white/95 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 flex items-center gap-3 border-b border-slate-200">
              <div
                className="w-3 h-3 rounded-full shadow-lg"
                style={{ backgroundColor: details.color }}
              />
              <h3 className="text-slate-800 font-bold text-lg">{details.name}</h3>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-sm text-slate-600 leading-relaxed">{details.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <PDFModal isOpen={isPDFOpen} onClose={() => setIsPDFOpen(false)} pdfUrl={pdfUrl} />
      <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} videoUrl={videoUrl} />
    </>
  );
};

export default ModelInfo;
