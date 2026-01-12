"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useRef, useEffect } from "react";
import Scene from "../_components/Scene";
import LoadingScreen from "../_components/LoadingScreen";
import ModelSelector from "../_components/ModelSelector";
import ViewControls from "../_components/ViewControls";
import ModelInfo from "../_components/ModelInfo";
import Navbar from "../_components/Navbar";
import TransitionOverlay from "../_components/TransitionOverlay";
import HelpModal from "../_components/HelpModal";
import ShareModal from "../_components/ShareModal";
import { ArrowLeft } from "lucide-react";

type ModelType = "lv" | "asm" | "j4444" | "pad";

function ViewerContent() {
  // Always use LV model regardless of URL parameter
  const [activeModel, setActiveModel] = useState<ModelType>("lv");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sceneRef = useRef<any>(null);

  useEffect(() => {
    // Fade in the viewer after a brief moment
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleResetCamera = () => {
    // This will be handled by the Scene component
    window.dispatchEvent(new CustomEvent("resetCamera"));
  };

  const handleZoomIn = () => {
    window.dispatchEvent(new CustomEvent("zoomIn"));
  };

  const handleZoomOut = () => {
    window.dispatchEvent(new CustomEvent("zoomOut"));
  };

  // Track model changes for transition overlay
  const handleModelChange = (model: ModelType) => {
    setIsTransitioning(true);
    setActiveModel(model);

    // Hide transition overlay after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 600);
  };

  return (
    <div className="h-screen bg-slate-50 relative overflow-hidden">

      {/* Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        showBackButton={true}
      />

      {/* Model Selector Sidebar */}
      <ModelSelector
        activeModel={activeModel}
        setActiveModel={handleModelChange}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Transition Overlay */}
      <TransitionOverlay isTransitioning={isTransitioning} />

      {/* View Controls */}
      <ViewControls
        onResetCamera={handleResetCamera}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />

      {/* Model Info Panel */}
      <ModelInfo activeModel={activeModel} />

      {/* Modals */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />

      {/* Back Button - shown when viewing detail models */}
      {activeModel !== "lv" && (
        <button
          onClick={() => handleModelChange("lv")}
          className="fixed top-24 left-6 z-20 bg-white hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 group border border-gray-200"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="font-semibold">Back to Main Model</span>
        </button>
      )}

      {/* 3D Canvas - adjusted for navbar */}
      <div className="absolute inset-0 top-[72px]">
        <Suspense fallback={<LoadingScreen />} unstable_expectedLoadTime={3000}>
          <Canvas
            shadows
            gl={{
              antialias: true,
              powerPreference: "high-performance",
              alpha: true,
              preserveDrawingBuffer: true,
            }}
            dpr={[1, 2]}
            className="transition-all duration-500"
          >
            <Scene activeModel={activeModel} onModelChange={handleModelChange} ref={sceneRef} />
          </Canvas>
        </Suspense>
      </div>

      {/* Watermark */}
      <div className="fixed bottom-6 right-6 z-10 text-slate-400 text-xs font-medium">
        Tenneco 3D Viewer
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ViewerContent />
    </Suspense>
  );
}
