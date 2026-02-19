"use client";

import { useEffect, useState, createContext, useContext, ReactNode, useCallback, useRef } from "react";
import Image from "next/image";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { useGLTF } from "@react-three/drei";
import { getMediaUrl } from "../../utils/mediaUrl";
import { useContent } from "../../providers/ContentProvider";

// Enable Three.js cache globally
THREE.Cache.enabled = true;

interface PreloadContextType {
  isPreloaded: boolean;
  progress: number;
  status: string;
  resolvedUrls: {
    vehicles: Record<string, string>;
    brakes: Record<string, string>;
  };
}

const PreloadContext = createContext<PreloadContextType>({
  isPreloaded: false,
  progress: 0,
  status: "Initializing...",
  resolvedUrls: {
    vehicles: {},
    brakes: {},
  },
});

export const usePreload = () => useContext(PreloadContext);

interface ModelPreloaderProps {
  children: ReactNode;
}

// Create a shared GLTF loader with Draco support
function createGLTFLoader(): GLTFLoader {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
  loader.setDRACOLoader(dracoLoader);
  return loader;
}

// Load a single GLB file and return a promise - this ACTUALLY waits for loading
function loadGLBModel(url: string, loader: GLTFLoader): Promise<{ url: string; success: boolean }> {
  return new Promise((resolve) => {
    loader.load(
      url,
      () => {
        useGLTF.preload(url);
        resolve({ url, success: true });
      },
      () => {
        // Progress callback available for future granular progress UI
      },
      () => {
        resolve({ url, success: false });
      }
    );
  });
}

// Detect mobile devices — touch support + small screen
function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;
  return hasTouch && isSmallScreen;
}

export function ModelPreloaderProvider({ children }: ModelPreloaderProps) {
  const { vehicleConfigs, brakeConfigs, isLoading: isContentLoading } = useContent();

  const [isPreloaded, setIsPreloaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing...");
  const [resolvedUrls, setResolvedUrls] = useState<PreloadContextType['resolvedUrls']>({
    vehicles: {},
    brakes: {},
  });
  const hasStarted = useRef(false);

  // Preload GLB models into Three.js cache (desktop only)
  const preloadGLBModels = useCallback(async (urls: PreloadContextType['resolvedUrls']) => {
    const mobile = isMobileDevice();

    if (mobile) {
      console.log("[ModelPreloader] Mobile detected — skipping GLB preloading, models will load on-demand");
      setProgress(100);
      setIsPreloaded(true);
      setStatus("Complete!");
      return;
    }

    const allUrls = [
      ...Object.values(urls.vehicles),
      ...Object.values(urls.brakes),
    ].filter(Boolean);

    const totalModels = allUrls.length;

    if (totalModels === 0) {
      setProgress(100);
      setIsPreloaded(true);
      setStatus("Complete!");
      return;
    }

    const loader = createGLTFLoader();
    let loadedCount = 0;

    setStatus("Loading 3D models...");
    setProgress(15);

    const vehicleTypes = Object.keys(urls.vehicles);

    const loadPromises = allUrls.map(async (url, index) => {
      const isVehicle = index < vehicleTypes.length;
      const modelType = isVehicle ? "vehicle" : "brake";
      const vtIndex = isVehicle ? index : index - vehicleTypes.length;
      const vehicleType = vehicleTypes[vtIndex] || "unknown";

      setStatus(`Loading ${modelType} (${vehicleType})...`);

      const result = await loadGLBModel(url, loader);

      loadedCount++;
      const modelProgress = 15 + Math.round((loadedCount / totalModels) * 80);
      setProgress(modelProgress);
      setStatus(`Loaded ${loadedCount}/${totalModels} models...`);

      return result;
    });

    await Promise.all(loadPromises);

    setProgress(98);
    setStatus("Finalizing...");

    await new Promise(resolve => setTimeout(resolve, 200));

    setProgress(100);
    setIsPreloaded(true);
    setStatus("Complete!");
  }, []);

  // Derive model URLs from ContentProvider data and trigger preloading
  useEffect(() => {
    if (isContentLoading || hasStarted.current) return;
    hasStarted.current = true;

    setStatus("Resolving model URLs...");
    setProgress(5);

    // Derive URLs from ContentProvider's already-loaded configs
    const urls: PreloadContextType['resolvedUrls'] = {
      vehicles: {},
      brakes: {},
    };

    for (const [vt, config] of Object.entries(vehicleConfigs)) {
      if (config?.modelFile?.mediaUrl) {
        urls.vehicles[vt] = getMediaUrl(config.modelFile.mediaUrl) || "";
      }
    }
    for (const [vt, config] of Object.entries(brakeConfigs)) {
      if (config?.modelFile?.mediaUrl) {
        urls.brakes[vt] = getMediaUrl(config.modelFile.mediaUrl) || "";
      }
    }

    setResolvedUrls(urls);
    setProgress(10);

    // Preload GLB models into cache
    preloadGLBModels(urls);
  }, [isContentLoading, vehicleConfigs, brakeConfigs, preloadGLBModels]);

  return (
    <PreloadContext.Provider value={{ isPreloaded, progress, status, resolvedUrls }}>
      {children}
    </PreloadContext.Provider>
  );
}

// Loading screen shown while models are preloading
export function PreloadingScreen() {
  const { progress, status } = usePreload();

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-8 relative w-48 h-16 mx-auto">
          <Image
            src="/tenneco-logo.png"
            alt="Tenneco"
            fill
            sizes="192px"
            className="object-contain brightness-0 invert"
            priority
          />
        </div>

        {/* Animated loading ring */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.83} 283`}
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dasharray 0.3s ease' }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{progress}%</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-80 h-2 bg-white/10 rounded-full overflow-hidden mb-4 mx-auto">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status text */}
        <p className="text-white/70 text-sm">
          {status}
        </p>
      </div>
    </div>
  );
}

export default ModelPreloaderProvider;
