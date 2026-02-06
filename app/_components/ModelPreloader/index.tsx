"use client";

import { useEffect, useState, createContext, useContext, ReactNode, useCallback, useRef } from "react";
import Image from "next/image";
import axios from "axios";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { useGLTF } from "@react-three/drei";
import { VEHICLE_CONFIGS, BRAKE_CONFIGS } from "../../config";
import { getMediaUrl } from "../../utils/mediaUrl";
import { VehicleType } from "../../_types/content";

// Enable Three.js cache globally
THREE.Cache.enabled = true;

interface PreloadContextType {
  isPreloaded: boolean;
  progress: number;
  status: string;
  resolvedUrls: {
    vehicles: Record<VehicleType, string>;
    brakes: Record<VehicleType, string>;
  };
}

const PreloadContext = createContext<PreloadContextType>({
  isPreloaded: false,
  progress: 0,
  status: "Initializing...",
  resolvedUrls: {
    vehicles: { light: "", commercial: "", rail: "" },
    brakes: { light: "", commercial: "", rail: "" },
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
        // Model loaded successfully!
        console.log(`[ModelPreloader] ✓ Loaded: ${url}`);
        // Also call useGLTF.preload to populate drei's cache
        useGLTF.preload(url);
        resolve({ url, success: true });
      },
      (progress) => {
        // Progress callback - we could use this for more granular progress
        if (progress.total > 0) {
          const percent = Math.round((progress.loaded / progress.total) * 100);
          console.log(`[ModelPreloader] Loading ${url}: ${percent}%`);
        }
      },
      (error) => {
        console.error(`[ModelPreloader] ✗ Failed to load: ${url}`, error);
        resolve({ url, success: false });
      }
    );
  });
}

// Fetch configurations from API
async function fetchConfigsFromAPI(): Promise<{
  vehicleConfigs: Array<{ vehicleType: VehicleType; modelUrl: string | null }>;
  brakeConfigs: Array<{ vehicleType: VehicleType; modelUrl: string | null }>;
}> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const vehicleTypes: VehicleType[] = ["light", "commercial", "rail"];

  // Fetch vehicle configurations
  const vehiclePromises = vehicleTypes.map(async (vehicleType) => {
    try {
      const response = await axios.get(`${apiBaseUrl}/vehicle-configurations`, {
        params: { where: { vehicleType: { equals: vehicleType } } },
        timeout: 5000,
      });
      const data = Array.isArray(response.data?.docs) ? response.data.docs[0] : response.data;
      return { vehicleType, modelUrl: data?.modelFile?.media?.url || null };
    } catch {
      console.warn(`[ModelPreloader] Failed to fetch vehicle config for ${vehicleType}`);
      return { vehicleType, modelUrl: null };
    }
  });

  // Fetch brake configurations
  const brakePromises = vehicleTypes.map(async (vehicleType) => {
    try {
      const response = await axios.get(`${apiBaseUrl}/brake-configurations`, {
        params: { where: { vehicleType: { equals: vehicleType } } },
        timeout: 5000,
      });
      const data = Array.isArray(response.data?.docs) ? response.data.docs[0] : response.data;
      return { vehicleType, modelUrl: data?.modelFile?.media?.url || null };
    } catch {
      console.warn(`[ModelPreloader] Failed to fetch brake config for ${vehicleType}`);
      return { vehicleType, modelUrl: null };
    }
  });

  const [vehicleResults, brakeResults] = await Promise.all([
    Promise.all(vehiclePromises),
    Promise.all(brakePromises),
  ]);

  return { vehicleConfigs: vehicleResults, brakeConfigs: brakeResults };
}

export function ModelPreloaderProvider({ children }: ModelPreloaderProps) {
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing...");
  const [resolvedUrls, setResolvedUrls] = useState<PreloadContextType['resolvedUrls']>({
    vehicles: { light: "", commercial: "", rail: "" },
    brakes: { light: "", commercial: "", rail: "" },
  });
  const hasStarted = useRef(false);

  const preloadAllModels = useCallback(async () => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const vehicleTypes: VehicleType[] = ["light", "commercial", "rail"];

    // Step 1: Fetch configurations from API
    setStatus("Fetching configurations...");
    setProgress(5);

    let apiConfigs;
    try {
      apiConfigs = await fetchConfigsFromAPI();
      console.log("[ModelPreloader] API configs received");
    } catch {
      console.warn("[ModelPreloader] API fetch failed, using fallbacks");
      apiConfigs = {
        vehicleConfigs: vehicleTypes.map(vt => ({ vehicleType: vt, modelUrl: null })),
        brakeConfigs: vehicleTypes.map(vt => ({ vehicleType: vt, modelUrl: null })),
      };
    }

    setProgress(10);

    // Step 2: Resolve final URLs (API or fallback)
    const urls: PreloadContextType['resolvedUrls'] = {
      vehicles: { light: "", commercial: "", rail: "" },
      brakes: { light: "", commercial: "", rail: "" },
    };

    vehicleTypes.forEach((vt) => {
      const vehicleApi = apiConfigs.vehicleConfigs.find(c => c.vehicleType === vt);
      const brakeApi = apiConfigs.brakeConfigs.find(c => c.vehicleType === vt);

      urls.vehicles[vt] = getMediaUrl(vehicleApi?.modelUrl ?? undefined) || VEHICLE_CONFIGS[vt]?.modelFile?.fallbackPath || "";
      urls.brakes[vt] = getMediaUrl(brakeApi?.modelUrl ?? undefined) || BRAKE_CONFIGS[vt]?.modelFile?.fallbackPath || "";
    });

    setResolvedUrls(urls);
    console.log("[ModelPreloader] Resolved URLs:", urls);

    // Step 3: Build list of all URLs to preload
    const allUrls = [
      ...Object.values(urls.vehicles),
      ...Object.values(urls.brakes),
    ].filter(Boolean);

    const totalModels = allUrls.length;
    console.log(`[ModelPreloader] Starting to load ${totalModels} models...`);

    // Step 4: Create loader and load models ONE BY ONE with real progress tracking
    const loader = createGLTFLoader();
    let loadedCount = 0;

    setStatus("Loading 3D models...");
    setProgress(15);

    // Load models sequentially for accurate progress, or in parallel for speed
    // Using parallel loading but tracking individual completion
    const loadPromises = allUrls.map(async (url, index) => {
      const modelType = index < 3 ? "vehicle" : "brake";
      const vehicleType = vehicleTypes[index % 3];

      setStatus(`Loading ${modelType} (${vehicleType})...`);

      const result = await loadGLBModel(url, loader);

      loadedCount++;
      // Progress: 15% for config, 85% for models
      const modelProgress = 15 + Math.round((loadedCount / totalModels) * 80);
      setProgress(modelProgress);
      setStatus(`Loaded ${loadedCount}/${totalModels} models...`);

      return result;
    });

    // Wait for ALL models to actually finish loading
    const results = await Promise.all(loadPromises);

    const successCount = results.filter(r => r.success).length;
    console.log(`[ModelPreloader] Loading complete: ${successCount}/${totalModels} models loaded successfully`);

    setProgress(98);
    setStatus("Finalizing...");

    // Small delay to ensure everything is settled
    await new Promise(resolve => setTimeout(resolve, 200));

    setProgress(100);
    setIsPreloaded(true);
    setStatus("Complete!");
    console.log("[ModelPreloader] All models ready!");
  }, []);

  useEffect(() => {
    preloadAllModels();
  }, [preloadAllModels]);

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
