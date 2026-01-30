"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Scene from "../_components/Scene";
import LoadingScreen from "../_components/LoadingScreen";
import ViewControls from "../_components/ViewControls";
import Navbar from "../_components/Navbar";
import { VehicleType } from "../config";

function ViewerContent() {
  const searchParams = useSearchParams();
  const vehicleType = (searchParams.get("vehicle") as VehicleType) || "light";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sceneRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure smooth transition from the zoom animation
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleResetCamera = () => {
    window.dispatchEvent(new CustomEvent("resetCamera"));
  };

  const handleZoomIn = () => {
    window.dispatchEvent(new CustomEvent("zoomIn"));
  };

  const handleZoomOut = () => {
    window.dispatchEvent(new CustomEvent("zoomOut"));
  };

  return (
    <div className="h-screen bg-slate-50 relative overflow-hidden">
      {/* Navbar */}
      <Navbar showBackButton={true} />

      {/* View Controls */}
      <ViewControls
        onResetCamera={handleResetCamera}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />

      {/* 3D Canvas */}
      <div className="absolute inset-0 top-[72px]">
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
              <Scene vehicleType={vehicleType} ref={sceneRef} />
            </Suspense>
          </Canvas>
        )}
      </div>

      {/* Watermark */}
      <div className="fixed bottom-6 right-6 z-10 text-slate-400 text-xs font-medium">
        Tenneco 3D Viewer
      </div>
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
