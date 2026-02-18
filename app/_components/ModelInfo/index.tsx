"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Video } from "lucide-react";
import PDFModal from "../PDFModal";
import VideoModal from "../VideoModal";
import { HotspotItem, BrakeMedia } from "../../_types/content";
import { getMediaUrl } from "../../utils/mediaUrl";
import { useLanguage } from "../../providers/LanguageProvider";

interface ModelInfoProps {
  hotspot: HotspotItem | null;
  brakeMedia?: BrakeMedia | null; // Fallback media from brake config
}

const ModelInfo: React.FC<ModelInfoProps> = ({ hotspot, brakeMedia }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isPDFOpen, setIsPDFOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const { getTranslation } = useLanguage();

  // Get PDF URL: hotspot → brake → null (hidden)
  const pdfUrl = useMemo(() => {
    // First check hotspot
    const hotspotPdf = hotspot?.info?.pdf;
    if (hotspotPdf) {
      return getMediaUrl(hotspotPdf);
    }

    // Fallback to brake media
    const brakePdf = brakeMedia?.pdfUrl || brakeMedia?.fallbackPdfPath;
    if (brakePdf) {
      return getMediaUrl(brakePdf);
    }

    // Neither has PDF - return null to hide button
    return null;
  }, [hotspot, brakeMedia]);

  // Get Video URL: hotspot → brake → null (hidden)
  const videoUrl = useMemo(() => {
    // First check hotspot
    const hotspotVideo = hotspot?.info?.video;
    if (hotspotVideo) {
      return getMediaUrl(hotspotVideo);
    }

    // Fallback to brake media
    const brakeVideo = brakeMedia?.videoUrl || brakeMedia?.fallbackVideoUrl;
    if (brakeVideo) {
      return getMediaUrl(brakeVideo);
    }

    // Neither has video - return null to hide button
    return null;
  }, [hotspot, brakeMedia]);

  // Determine which buttons to show
  const showPdfButton = !!pdfUrl;
  const showVideoButton = !!videoUrl;

  if (!hotspot) return null;

  const details = {
    name: getTranslation(
      hotspot.info?.title || hotspot.label,
      hotspot.info?.titleTranslations || hotspot.labelTranslations
    ),
    description: getTranslation(
      hotspot.info?.description || "",
      hotspot.info?.descriptionTranslations
    ),
    color: hotspot.color,
  };

  return (
    <>
      {/* Action Buttons Group */}
      <div className="fixed bottom-3 inset-x-0 sm:inset-x-auto sm:bottom-8 sm:right-6 z-20 flex flex-row gap-2 sm:gap-3 justify-center sm:justify-end">
        {/* Info Toggle Button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 sm:p-3 rounded-lg border border-white/20 transition-colors shadow-lg bg-white hover:bg-slate-50"
          title={isOpen ? "Hide Info" : "Show Info"}
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700 transition-colors"
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

        {/* PDF Button - only show if PDF exists */}
        {showPdfButton && (
          <motion.button
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            onClick={() => setIsPDFOpen(true)}
            className="p-2.5 sm:p-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors shadow-lg group"
            title="View Documentation"
          >
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform" />
          </motion.button>
        )}

        {/* Video Button - only show if video exists */}
        {showVideoButton && (
          <motion.button
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setIsVideoOpen(true)}
            className="p-2.5 sm:p-3 rounded-lg bg-primary hover:opacity-90 transition-all shadow-lg group"
            title="Watch Video"
          >
            <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform" />
          </motion.button>
        )}
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
            className="fixed bottom-16 left-3 right-3 sm:bottom-24 sm:left-auto sm:right-6 z-20 w-auto sm:w-96 bg-white/95 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-3 sm:p-5 flex items-center gap-2 sm:gap-3 border-b border-slate-200">
              <div
                className="w-3 h-3 rounded-full shadow-lg"
                style={{ backgroundColor: details.color }}
              />
              <h3 className="text-slate-800 font-bold text-lg sm:text-xl">{details.name}</h3>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-5">
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{details.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals - only render if URL exists */}
      {pdfUrl && (
        <PDFModal isOpen={isPDFOpen} onClose={() => setIsPDFOpen(false)} pdfUrl={pdfUrl} />
      )}
      {videoUrl && (
        <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} videoUrl={videoUrl} />
      )}
    </>
  );
};

export default ModelInfo;
