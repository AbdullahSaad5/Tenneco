"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type ModelType = "lv" | "asm" | "j4444" | "pad";

interface ModelInfo {
  id: ModelType;
  label: string;
  description: string;
  icon: string;
}

interface ModelSelectorProps {
  activeModel: ModelType;
  setActiveModel: (model: ModelType) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const models: ModelInfo[] = [
  {
    id: "lv",
    label: "LV File",
    description: "LV component assembly",
    icon: "📦",
  },
  {
    id: "asm",
    label: "ASM",
    description: "Assembly module",
    icon: "⚙️",
  },
  {
    id: "j4444",
    label: "J-4444",
    description: "J-4444 component",
    icon: "🔧",
  },
  {
    id: "pad",
    label: "Pad",
    description: "Pad assembly",
    icon: "📋",
  },
];

const ModelSelector: React.FC<ModelSelectorProps> = ({
  activeModel,
  setActiveModel,
  isOpen,
  setIsOpen,
}) => {
  return (
    <>
      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-[72px] h-[calc(100vh-72px)] w-80 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-700/50">
                {/* Logo and Close Button */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-28 bg-white rounded-lg p-2">
                      <Image
                        src="/tenneco-logo.png"
                        alt="Tenneco Logo"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors group"
                    title="Close sidebar"
                  >
                    <svg
                      className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors"
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
                  </button>
                </div>
                {/* Subtitle */}
                <div className="mb-4">
                  <p className="text-slate-400 text-sm">3D Model Viewer</p>
                </div>
                {/* Section Title */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Models</h2>
                  <p className="text-slate-400 text-sm">Select a 3D model to view</p>
                </div>
              </div>

              {/* Model Cards */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {models.map((model, index) => (
                  <motion.button
                    key={model.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      setActiveModel(model.id);
                      if (window.innerWidth < 1024) setIsOpen(false);
                    }}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                      activeModel === model.id
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/50 scale-[1.02]"
                        : "bg-slate-800/50 hover:bg-slate-700/50 hover:scale-[1.01]"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`text-4xl ${
                          activeModel === model.id ? "animate-pulse" : ""
                        }`}
                      >
                        {model.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-semibold text-lg mb-1 ${
                            activeModel === model.id ? "text-white" : "text-slate-200"
                          }`}
                        >
                          {model.label}
                        </h3>
                        <p
                          className={`text-sm ${
                            activeModel === model.id
                              ? "text-blue-100"
                              : "text-slate-400"
                          }`}
                        >
                          {model.description}
                        </p>
                      </div>
                      {activeModel === model.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-3 h-3 bg-white rounded-full mt-2"
                        />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
                <div className="text-xs text-slate-500 text-center">
                  Use mouse to rotate • Scroll to zoom
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </>
  );
};

export default ModelSelector;
