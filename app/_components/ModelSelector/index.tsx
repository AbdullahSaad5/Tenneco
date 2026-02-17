"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Car, Truck, Train, Bike, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContent } from "../../providers/ContentProvider";

// Map known vehicle type slugs to icons; unknown types get Car as default
const VEHICLE_ICON_MAP: Record<string, LucideIcon> = {
  light: Car,
  commercial: Truck,
  rail: Train,
  motorcycle: Bike,
};

const getVehicleIcon = (slug: string): LucideIcon => {
  return VEHICLE_ICON_MAP[slug] || Car;
};

interface ModelSelectorProps {
  activeVehicle: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  activeVehicle,
  isOpen,
  setIsOpen,
}) => {
  const router = useRouter();
  const { homepage } = useContent();

  // Build vehicle list dynamically from homepage categories
  const vehicles = (homepage?.vehicleCategories || [])
    .filter((cat) => cat.isEnabled)
    .sort((a, b) => a.order - b.order)
    .map((cat) => ({
      id: cat.vehicleType,
      label: cat.title,
      description: cat.subtitle,
      Icon: getVehicleIcon(cat.vehicleType),
    }));

  const handleVehicleSelect = (vehicleType: string) => {
    setIsOpen(false);
    // Navigate to viewer with selected vehicle and animation
    router.push(`/viewer?vehicle=${vehicleType}&animate=true`);
  };

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
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-[72px] h-[calc(100vh-72px)] w-80 bg-gradient-to-br from-slate-900 to-slate-800 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                {/* Logo and Close Button */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-28 bg-white rounded-lg p-2">
                      <Image
                        src="/tenneco-logo.png"
                        alt="Tenneco Logo"
                        fill
                        sizes="112px"
                        className="object-contain"
                        priority
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
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
                {/* Section Title */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Vehicle Types</h2>
                  <p className="text-slate-400 text-sm">Select a brake system to explore</p>
                </div>
              </div>

              {/* Vehicle Cards */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {vehicles.map((vehicle, index) => {
                  const IconComponent = vehicle.Icon;
                  const isActive = activeVehicle === vehicle.id;
                  return (
                    <motion.button
                      key={vehicle.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleVehicleSelect(vehicle.id)}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        isActive
                          ? "bg-primary shadow-lg shadow-primary/30"
                          : "bg-white/5 hover:bg-white/10 border border-white/10"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`${
                            isActive ? "text-white" : "text-slate-400"
                          }`}
                        >
                          <IconComponent className="w-8 h-8" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-semibold text-lg mb-1 ${
                              isActive ? "text-white" : "text-slate-200"
                            }`}
                          >
                            {vehicle.label}
                          </h3>
                          <p
                            className={`text-sm ${
                              isActive
                                ? "text-blue-100"
                                : "text-slate-400"
                            }`}
                          >
                            {vehicle.description}
                          </p>
                        </div>
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-3 h-3 bg-white rounded-full mt-2 shadow-lg"
                          />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10">
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
