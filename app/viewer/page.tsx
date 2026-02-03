"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import * as THREE from "three";
import Scene from "../_components/Scene";
import LoadingScreen from "../_components/LoadingScreen";
import ViewControls from "../_components/ViewControls";
import Navbar from "../_components/Navbar";
import ModelInfo from "../_components/ModelInfo";
import ModelSelector from "../_components/ModelSelector";
import { VehicleType, HotspotConfig, vehicles } from "../config";

function ViewerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const vehicleType = (searchParams.get("vehicle") as VehicleType) || "light";
  const shouldAnimate = searchParams.get("animate") === "true";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sceneRef = useRef<any>(null);
  const [showAnimation, setShowAnimation] = useState(shouldAnimate);
  const [animationComplete, setAnimationComplete] = useState(!shouldAnimate);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotConfig | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const prevVehicleType = useRef(vehicleType);

  // Reset states when vehicle type changes
  useEffect(() => {
    const shouldAnim = searchParams.get("animate") === "true";

    // Only reset animation state if vehicle type actually changed or it's the initial load
    if (prevVehicleType.current !== vehicleType) {
      setShowAnimation(shouldAnim);
      setAnimationComplete(!shouldAnim);
      setSelectedHotspot(null);
      prevVehicleType.current = vehicleType;
    }
  }, [vehicleType, searchParams]);

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

  const handleHotspotClick = (hotspot: HotspotConfig) => {
    setSelectedHotspot(hotspot);
  };

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
      <div className={`absolute inset-0 ${animationComplete ? 'top-[72px]' : 'top-0'}`}>
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
              ref={sceneRef}
              onHotspotClick={handleHotspotClick}
              isAnimating={showAnimation}
              onAnimationComplete={handleAnimationComplete}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Model Info - show when hotspot is selected */}
      {animationComplete && <ModelInfo hotspot={selectedHotspot} />}

      {/* Watermark - only show after animation complete */}
      {animationComplete && (
        <div className="fixed bottom-6 right-6 z-10 text-slate-400 text-xs font-medium">
          Tenneco 3D Viewer
        </div>
      )}

      {/* Vehicle type label during animation */}
      {showAnimation && (
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: animationComplete ? 0 : 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-blue-600/90 to-cyan-500/90 backdrop-blur-md px-8 py-4 rounded-full border border-white/20">
            <p className="text-white font-bold text-xl tracking-wide text-center">
              {vehicles[vehicleType].name}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function ViewerPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ViewerContent />
    </Suspense>
  );
}
