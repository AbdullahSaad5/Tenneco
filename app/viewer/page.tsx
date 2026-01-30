"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Scene from "../_components/Scene";
import LoadingScreen from "../_components/LoadingScreen";
import ViewControls from "../_components/ViewControls";
import Navbar from "../_components/Navbar";
import VehicleZoomTransition from "../_components/VehicleZoomTransition";
import ModelInfo from "../_components/ModelInfo";
import { VehicleType, HotspotConfig } from "../config";

function ViewerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const vehicleType = (searchParams.get("vehicle") as VehicleType) || "light";
  const shouldAnimate = searchParams.get("animate") === "true";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sceneRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [showAnimation, setShowAnimation] = useState(shouldAnimate);
  const [animationComplete, setAnimationComplete] = useState(!shouldAnimate);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotConfig | null>(null);

  useEffect(() => {
    if (!shouldAnimate) {
      // Small delay to ensure smooth loading when no animation
      const timer = setTimeout(() => setIsReady(true), 100);
      return () => clearTimeout(timer);
    } else {
      // Ready immediately for animation
      setIsReady(false);
    }
  }, [shouldAnimate]);

  const handleAnimationComplete = () => {
    setShowAnimation(false);
    setAnimationComplete(true);
    setIsReady(true);

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
    <div className="h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Show animation if needed */}
      {showAnimation && (
        <VehicleZoomTransition
          vehicleType={vehicleType}
          onComplete={handleAnimationComplete}
        />
      )}

      {/* Navbar - only show after animation complete */}
      {animationComplete && <Navbar showBackButton={true} />}

      {/* View Controls - only show after animation complete */}
      {animationComplete && (
        <ViewControls
          onResetCamera={handleResetCamera}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onPlayExplosion={handlePlayExplosion}
          showExplosionButton={true}
        />
      )}

      {/* 3D Canvas - hidden during animation */}
      <div className={`absolute inset-0 ${animationComplete ? 'top-[72px]' : 'top-0'} ${showAnimation ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {isReady && (
          <Canvas
            shadows
            gl={{
              antialias: true,
              powerPreference: "high-performance",
              alpha: true,
              preserveDrawingBuffer: true,
            }}
            dpr={[1, 2]}
          >
            <Suspense fallback={null}>
              <Scene
                vehicleType={vehicleType}
                ref={sceneRef}
                onHotspotClick={handleHotspotClick}
              />
            </Suspense>
          </Canvas>
        )}
      </div>

      {/* Model Info - show when hotspot is selected */}
      {animationComplete && <ModelInfo hotspot={selectedHotspot} />}

      {/* Watermark - only show after animation complete */}
      {animationComplete && (
        <div className="fixed bottom-6 right-6 z-10 text-slate-400 text-xs font-medium">
          Tenneco 3D Viewer
        </div>
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
