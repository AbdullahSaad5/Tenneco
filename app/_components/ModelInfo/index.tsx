"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ModelType = "lv" | "asm" | "j4444" | "pad";

interface ModelInfoProps {
  activeModel: ModelType;
}

const modelDetails = {
  lv: {
    name: "LV File Component",
    description: "High-precision LV assembly component with advanced engineering specifications.",
    specs: ["Material: Aluminum Alloy", "Weight: 2.5kg", "Dimensions: 150x100x80mm"],
    color: "from-blue-500 to-blue-600",
  },
  asm: {
    name: "ASM Assembly",
    description: "Complete assembly module designed for industrial applications.",
    specs: ["Material: Steel Composite", "Weight: 5.2kg", "Dimensions: 200x150x120mm"],
    color: "from-purple-500 to-purple-600",
  },
  j4444: {
    name: "J-4444 Component",
    description: "Precision-engineered J-4444 component for heavy-duty operations.",
    specs: ["Material: Titanium Alloy", "Weight: 3.8kg", "Dimensions: 180x120x95mm"],
    color: "from-green-500 to-green-600",
  },
  pad: {
    name: "Pad Assembly",
    description: "Specialized pad assembly with enhanced durability and performance.",
    specs: ["Material: Carbon Fiber", "Weight: 1.2kg", "Dimensions: 120x80x45mm"],
    color: "from-orange-500 to-orange-600",
  },
};

const getColorClass = (color: string): string => {
  if (color.includes('blue')) return 'bg-blue-600';
  if (color.includes('purple')) return 'bg-purple-600';
  if (color.includes('green')) return 'bg-green-600';
  if (color.includes('orange')) return 'bg-orange-600';
  return 'bg-blue-600';
};

const ModelInfo: React.FC<ModelInfoProps> = ({ activeModel }) => {
  const [isOpen, setIsOpen] = useState(true);
  const details = modelDetails[activeModel];

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-20 right-6 z-20 p-3 rounded-lg border border-slate-200 transition-colors ${
          isOpen ? "bg-white" : getColorClass(details.color)
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

      {/* Info Panel */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key={activeModel}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.3, type: "spring" }}
            className="fixed bottom-36 right-6 z-20 w-80 bg-white rounded-lg border border-slate-200 overflow-hidden"
          >
            {/* Header */}
            <div className={`${getColorClass(details.color)} p-4`}>
              <h3 className="text-white font-bold text-lg">{details.name}</h3>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <p className="text-sm text-slate-600">{details.description}</p>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Specifications
                </h4>
                {details.specs.map((spec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 text-sm text-slate-700"
                  >
                    <div className={`w-2 h-2 rounded-full ${getColorClass(details.color)}`} />
                    <span>{spec}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ModelInfo;
