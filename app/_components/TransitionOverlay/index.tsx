"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TransitionOverlayProps {
  isTransitioning: boolean;
}

const TransitionOverlay: React.FC<TransitionOverlayProps> = ({ isTransitioning }) => {
  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 bg-slate-100 flex items-center justify-center pointer-events-none"
        >
          <div className="flex flex-col items-center gap-6 relative z-10">
            {/* Loading Spinner */}
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              exit={{ scale: 0 }}
              transition={{
                scale: { duration: 0.3, type: "spring" },
                rotate: { duration: 1, repeat: Infinity, ease: "linear" },
              }}
              className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full"
            />

            {/* Loading Text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.1 }}
              className="bg-white px-6 py-3 rounded border border-slate-200"
            >
              <p className="text-base font-semibold text-slate-700">
                Loading model...
              </p>
            </motion.div>

            {/* Progress Dots */}
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransitionOverlay;
