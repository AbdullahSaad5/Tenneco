"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import * as THREE from "three";
import Scene from "../_components/Scene";
import ViewControls from "../_components/ViewControls";
import Navbar from "../_components/Navbar";
import ModelInfo from "../_components/ModelInfo";
import BrakeOverallInfo from "../_components/BrakeOverallInfo";
import ModelSelector from "../_components/ModelSelector";
import { useContent } from "../providers/ContentProvider";
import { VehicleType, HotspotItem } from "../_types/content";
import { useInactivityRedirect } from "../hooks/useInactivityRedirect";

/** @author SAS */
function ViewerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const vehicleType = (searchParams.get("vehicle") as VehicleType) || "light";
  const shouldAnimate = searchParams.get("animate") === "true";

  // Get configs from content provider
  const { vehicleConfigs, brakeConfigs, hotspotConfigs, isLoading } = useContent();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sceneRef = useRef<any>(null);
  const [showAnimation, setShowAnimation] = useState(shouldAnimate);
  const [animationComplete, setAnimationComplete] = useState(!shouldAnimate);
  useInactivityRedirect("/", animationComplete);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotItem | null>(null);
  const [isBrakeCollapsed, setIsBrakeCollapsed] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [prevVehicleType, setPrevVehicleType] = useState(vehicleType);

  // Get the current configs for the selected vehicle type
  const vehicleConfig = vehicleConfigs[vehicleType];
  const brakeConfig = brakeConfigs[vehicleType];
  const hotspotConfig = hotspotConfigs[vehicleType];

  // Reset states synchronously during render when vehicle type changes
  // (React recommended pattern for adjusting state based on props)
  // This ensures Scene remounts with the correct isAnimating value
  if (prevVehicleType !== vehicleType) {
    setShowAnimation(shouldAnimate);
    setAnimationComplete(!shouldAnimate);
    setSelectedHotspot(null);
    setPrevVehicleType(vehicleType);
  }

  const handleAnimationComplete = () => {
    setShowAnimation(false);
    setAnimationComplete(true);

    // Remove the animate parameter from URL without reloading
    const params = new URLSearchParams(searchParams.toString());
    params.delete("animate");
    router.replace(`/viewer?${params.toString()}`, { scroll: false });
  };

  const handleResetCamera = () => {
    window.dispatchEvent(new CustomEvent("resetCamera"));
  };

  const handleZoomIn = () => {
    window.dispatchEvent(new CustomEvent("zoomIn"));
  };

  const handleZoomOut = () => {
    window.dispatchEvent(new CustomEvent("zoomOut"));
  };

  const handlePlayExplosion = () => {
    window.dispatchEvent(new CustomEvent("playExplosion"));
  };

  const handleHotspotClick = (hotspot: HotspotItem | null) => {
    setSelectedHotspot(hotspot);
  };

  // Wait for content to be ready (should already be loaded from preloading)
  if (isLoading || !vehicleConfig || !brakeConfig) {
    return null;
  }

  return (
    <div className="h-screen bg-white relative overflow-hidden">
      {/* Navbar - only show after animation complete */}
      {animationComplete && (
        <Navbar
          showBackButton={true}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
      )}

      {/* Model Selector Sidebar */}
      <ModelSelector
        activeVehicle={vehicleType}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* View Controls - only show after animation complete */}
      {animationComplete && (
        <ViewControls
          onResetCamera={handleResetCamera}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onPlayExplosion={handlePlayExplosion}
          showExplosionButton={false}
        />
      )}

      {/* 3D Canvas - always visible, handles animation internally */}
      <div className={`absolute inset-0 ${animationComplete ? 'top-[56px] sm:top-[72px]' : 'top-0'}`}>
        <Canvas
          shadows
          gl={{
            antialias: true,
            powerPreference: "high-performance",
            alpha: true,
            preserveDrawingBuffer: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 0.8,
          }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <Scene
              key={vehicleType}
              vehicleType={vehicleType}
              vehicleConfig={vehicleConfig}
              brakeConfig={brakeConfig}
              hotspotConfig={hotspotConfig}
              ref={sceneRef}
              onHotspotClick={handleHotspotClick}
              onBrakeCollapsedChange={setIsBrakeCollapsed}
              isAnimating={showAnimation}
              onAnimationComplete={handleAnimationComplete}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Model Info - show when brake is exploded, or when a collapsed hotspot is selected */}
      {animationComplete && (!isBrakeCollapsed || selectedHotspot !== null) && <ModelInfo hotspot={selectedHotspot} brakeMedia={brakeConfig?.media} />}

      {/* Overall Brake Info - show when brake is collapsed, no hotspot selected, and overallInfo is configured */}
      {animationComplete && brakeConfig?.overallInfo && selectedHotspot === null && (
        <BrakeOverallInfo info={brakeConfig.overallInfo} isCollapsed={isBrakeCollapsed} />
      )}

      {/* Vehicle type label during animation */}
      {showAnimation && (
        <motion.div
          className="absolute bottom-6 md:bottom-8 inset-x-0 z-20 flex justify-center px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: animationComplete ? 0 : 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-blue-600/90 to-cyan-500/90 backdrop-blur-md px-6 py-3 md:px-8 md:py-4 rounded-full border border-white/20">
            <p className="text-white font-bold text-base md:text-xl tracking-wide text-center whitespace-nowrap">
              {vehicleConfig.name}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function ViewerPage() {
  return (
    <Suspense fallback={null}>
      <ViewerContent />
    </Suspense>
  );
}
