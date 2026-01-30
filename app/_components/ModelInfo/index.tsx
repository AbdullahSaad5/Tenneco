"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Video } from "lucide-react";
import PDFModal from "../PDFModal";
import VideoModal from "../VideoModal";
import { useContent } from "../../providers/ContentProvider";

type ModelType = "lv" | "asm" | "j4444" | "pad";

interface ModelInfoProps {
  activeModel: ModelType;
}

const getColorClass = (color: string): string => {
  if (color.includes('blue')) return 'bg-blue-600';
  if (color.includes('purple')) return 'bg-purple-600';
  if (color.includes('green')) return 'bg-green-600';
  if (color.includes('orange')) return 'bg-orange-600';
  return 'bg-blue-600';
};

const ModelInfo: React.FC<ModelInfoProps> = ({ activeModel }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isPDFOpen, setIsPDFOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const { modelConfigs } = useContent();

  // Get the model configuration for the active model
  const modelConfig = useMemo(() => modelConfigs[activeModel], [modelConfigs, activeModel]);

  // Get model info details
  const details = useMemo(() => {
    if (!modelConfig?.info) return null;

    return {
      name: modelConfig.info.name,
      description: modelConfig.info.description,
      specs: modelConfig.info.specs,
      color: `from-${modelConfig.info.color.gradient?.from} to-${modelConfig.info.color.gradient?.to}`,
      solidColor: modelConfig.info.color.solid || 'blue-600',
    };
  }, [modelConfig]);

  if (!details) return null;

  return (
    <>
      {/* Action Buttons Group */}
      <div className="fixed bottom-8 right-6 z-20 flex flex-row gap-3">
        {/* Info Toggle Button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`p-3 rounded-lg border border-slate-200 transition-colors shadow-lg ${
            isOpen ? "bg-white" : getColorClass(details.solidColor)
          }`}
          title={isOpen ? "Hide Info" : "Show Info"}
        >
          <svg
            className={`w-6 h-6 transition-colors ${isOpen ? "text-slate-700" : "text-white"}`}
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
          className="p-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg group"
          title="Watch Video"
        >
          <Video className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </motion.button>
      </div>

      {/* Info Panel */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key={activeModel}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.3, type: "spring" }}
            className="fixed bottom-24 right-6 z-20 w-80 bg-white rounded-lg border border-slate-200 overflow-hidden"
          >
            {/* Header */}
            <div className={`${getColorClass(details.solidColor)} p-4`}>
              <h3 className="text-white font-bold text-lg">{details.name}</h3>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <p className="text-sm text-slate-600">{details.description}</p>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Key Features
                </h4>
                {details.specs.map((spec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 text-sm text-slate-700"
                  >
                    <div className={`w-2 h-2 rounded-full ${getColorClass(details.solidColor)}`} />
                    <span>{spec}</span>
                  </motion.div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-500 italic">
                  Tap on parts to discover how the braking system works, from friction to comfort!
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <PDFModal isOpen={isPDFOpen} onClose={() => setIsPDFOpen(false)} />
      <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
    </>
  );
};

export default ModelInfo;
