"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MousePointer2, Move, ZoomIn, Maximize2, Search } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const tips = [
    {
      Icon: MousePointer2,
      title: "Rotate Model",
      description: "Click and drag on the model to rotate the camera view around it.",
      bgColor: "bg-blue-600",
    },
    {
      Icon: Search,
      title: "Zoom",
      description: "Use your mouse scroll wheel or pinch gesture to zoom in and out of the model.",
      bgColor: "bg-purple-600",
    },
    {
      Icon: Move,
      title: "Pan View",
      description: "Right-click and drag (or two-finger drag on trackpad) to pan the camera.",
      bgColor: "bg-green-600",
    },
    {
      Icon: ZoomIn,
      title: "Zoom Controls",
      description: "Use the zoom in/out buttons on the right side for precise zoom control.",
      bgColor: "bg-orange-600",
    },
    {
      Icon: Maximize2,
      title: "Fullscreen Mode",
      description: "Click the fullscreen button for an immersive viewing experience.",
      bgColor: "bg-pink-600",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-white rounded-lg border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-blue-600 px-6 py-5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Help & Tips</h2>
                  <p className="text-blue-100 text-sm mt-1">Learn how to use the 3D viewer</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="space-y-4">
                  {tips.map((tip, index) => {
                    const IconComponent = tip.Icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${tip.bgColor} flex items-center justify-center text-white`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-1">{tip.title}</h3>
                          <p className="text-sm text-slate-600">{tip.description}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Additional Info */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Need More Help?</h4>
                  <p className="text-sm text-blue-700">
                    If you encounter any issues or have questions, please contact our support team.
                    You can also reset the camera view using the reset button in the controls panel.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Got it!
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default HelpModal;
