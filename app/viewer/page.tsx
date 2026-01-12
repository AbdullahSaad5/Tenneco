"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Scene from "../_components/Scene";
import LoadingScreen from "../_components/LoadingScreen";
import ModelSelector from "../_components/ModelSelector";
import ViewControls from "../_components/ViewControls";
import ModelInfo from "../_components/ModelInfo";
import Navbar from "../_components/Navbar";
import TransitionOverlay from "../_components/TransitionOverlay";
import HelpModal from "../_components/HelpModal";
import ShareModal from "../_components/ShareModal";
import { MousePointer2, ZoomIn } from "lucide-react";

type ModelType = "lv" | "asm" | "j4444" | "pad";

function ViewerContent() {
  const searchParams = useSearchParams();
  const modelFromUrl = searchParams.get("model") as ModelType | null;
  const [activeModel, setActiveModel] = useState<ModelType>(modelFromUrl || "lv");

  useEffect(() => {
    if (modelFromUrl && ["lv", "asm", "j4444", "pad"].includes(modelFromUrl)) {
      setActiveModel(modelFromUrl);
    }
  }, [modelFromUrl]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sceneRef = useRef<any>(null);

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

      {/* Bottom Info Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 bg-white px-6 py-3 rounded-full border border-slate-200">
        <div className="flex items-center gap-6 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-medium">3D Viewer Active</span>
          </div>
          <div className="h-4 w-px bg-slate-300" />
          <div className="flex items-center gap-1.5">
            <MousePointer2 className="w-4 h-4" />
            <span>Drag to rotate</span>
          </div>
          <div className="h-4 w-px bg-slate-300" />
          <div className="flex items-center gap-1.5">
            <ZoomIn className="w-4 h-4" />
            <span>Scroll to zoom</span>
          </div>
        </div>
      </div>

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
            <Scene activeModel={activeModel} ref={sceneRef} />
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
