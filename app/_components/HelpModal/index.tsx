"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MousePointer2, MousePointerSquare, Move, ZoomIn, Maximize2 } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const tips = [
    {
      icon: <MousePointer2 className="w-6 h-6" />,
      title: "Rotate Model",
      description: "Click and drag on the model to rotate the camera view around it.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: <MousePointerSquare className="w-6 h-6" />,
      title: "Zoom",
      description: "Use your mouse scroll wheel or pinch gesture to zoom in and out of the model.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: <Move className="w-6 h-6" />,
      title: "Pan View",
      description: "Right-click and drag (or two-finger drag on trackpad) to pan the camera.",
      color: "from-green-500 to-green-600",
    },
    {
      icon: <ZoomIn className="w-6 h-6" />,
      title: "Zoom Controls",
      description: "Use the zoom in/out buttons on the right side for precise zoom control.",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: <Maximize2 className="w-6 h-6" />,
      title: "Fullscreen Mode",
      description: "Click the fullscreen button for an immersive viewing experience.",
      color: "from-pink-500 to-pink-600",
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5 flex items-center justify-between">
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
                  {tips.map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${tip.color} flex items-center justify-center text-white shadow-lg`}>
                        {tip.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{tip.title}</h3>
                        <p className="text-sm text-slate-600">{tip.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Additional Info */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
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
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all hover:scale-105"
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
