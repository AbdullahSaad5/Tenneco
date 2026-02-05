"use client";

import { useEffect, useState, createContext, useContext, ReactNode, useCallback } from "react";
import Image from "next/image";
import axios from "axios";
import { VEHICLE_CONFIGS, BRAKE_CONFIGS } from "../../config";
import { getMediaUrl } from "../../utils/mediaUrl";
import { VehicleType } from "../../_types/content";

interface PreloadContextType {
  isPreloaded: boolean;
  progress: number;
  loadedModels: string[];
  status: string;
}

const PreloadContext = createContext<PreloadContextType>({
  isPreloaded: false,
  progress: 0,
  loadedModels: [],
  status: "Initializing...",
});

export const usePreload = () => useContext(PreloadContext);

interface ModelPreloaderProps {
  children: ReactNode;
}

interface ModelConfig {
  vehicleType: VehicleType;
  apiUrl: string | null;
  fallbackUrl: string;
  type: "vehicle" | "brake";
}

// Preload a single GLB file and return a promise
function preloadGLB(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const loader = new XMLHttpRequest();
    loader.open('GET', url, true);
    loader.responseType = 'arraybuffer';

    loader.onload = () => {
      if (loader.status === 200) {
        resolve(url);
      } else {
        reject(new Error(`Failed to load ${url}: ${loader.status}`));
      }
    };

    loader.onerror = () => {
      reject(new Error(`Network error loading ${url}`));
    };

    loader.send();
  });
}

// Fetch configurations from API
async function fetchConfigsFromAPI(): Promise<{
  vehicleConfigs: Array<{ vehicleType: VehicleType; modelUrl: string | null }>;
  brakeConfigs: Array<{ vehicleType: VehicleType; modelUrl: string | null }>;
}> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const vehicleTypes: VehicleType[] = ["light", "commercial", "rail"];

  const results = {
    vehicleConfigs: [] as Array<{ vehicleType: VehicleType; modelUrl: string | null }>,
    brakeConfigs: [] as Array<{ vehicleType: VehicleType; modelUrl: string | null }>,
  };

  // Fetch vehicle configurations
  const vehiclePromises = vehicleTypes.map(async (vehicleType) => {
    try {
      const response = await axios.get(`${apiBaseUrl}/vehicle-configurations`, {
        params: {
          where: {
            vehicleType: { equals: vehicleType },
          },
        },
        timeout: 5000,
      });

      const data = Array.isArray(response.data?.docs) ? response.data.docs[0] : response.data;
      const modelUrl = data?.modelFile?.media?.url || null;

      return { vehicleType, modelUrl };
    } catch (error) {
      console.warn(`Failed to fetch vehicle config for ${vehicleType}:`, error);
      return { vehicleType, modelUrl: null };
    }
  });

  // Fetch brake configurations
  const brakePromises = vehicleTypes.map(async (vehicleType) => {
    try {
      const response = await axios.get(`${apiBaseUrl}/brake-configurations`, {
        params: {
          where: {
            vehicleType: { equals: vehicleType },
          },
        },
        timeout: 5000,
      });

      const data = Array.isArray(response.data?.docs) ? response.data.docs[0] : response.data;
      const modelUrl = data?.modelFile?.media?.url || null;

      return { vehicleType, modelUrl };
    } catch (error) {
      console.warn(`Failed to fetch brake config for ${vehicleType}:`, error);
      return { vehicleType, modelUrl: null };
    }
  });

  const [vehicleResults, brakeResults] = await Promise.all([
    Promise.all(vehiclePromises),
    Promise.all(brakePromises),
  ]);

  results.vehicleConfigs = vehicleResults;
  results.brakeConfigs = brakeResults;

  return results;
}

export function ModelPreloaderProvider({ children }: ModelPreloaderProps) {
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadedModels, setLoadedModels] = useState<string[]>([]);
  const [status, setStatus] = useState("Initializing...");

  const preloadAllModels = useCallback(async () => {
    const vehicleTypes: VehicleType[] = ["light", "commercial", "rail"];
    const modelConfigs: ModelConfig[] = [];
    let loadedCount = 0;
    const loaded: string[] = [];

    // Step 1: Fetch configurations from API
    setStatus("Fetching model configurations from server...");
    console.log("[ModelPreloader] Fetching configurations from API...");

    let apiConfigs: {
      vehicleConfigs: Array<{ vehicleType: VehicleType; modelUrl: string | null }>;
      brakeConfigs: Array<{ vehicleType: VehicleType; modelUrl: string | null }>;
    };

    try {
      apiConfigs = await fetchConfigsFromAPI();
      console.log("[ModelPreloader] API configs received:", apiConfigs);
    } catch (error) {
      console.warn("[ModelPreloader] Failed to fetch from API, using local configs:", error);
      apiConfigs = {
        vehicleConfigs: vehicleTypes.map(vt => ({ vehicleType: vt, modelUrl: null })),
        brakeConfigs: vehicleTypes.map(vt => ({ vehicleType: vt, modelUrl: null })),
      };
    }

    // Step 2: Build model configs with API URLs (if available) and fallbacks
    vehicleTypes.forEach((vehicleType) => {
      // Vehicle model
      const vehicleApiConfig = apiConfigs.vehicleConfigs.find(c => c.vehicleType === vehicleType);
      const vehicleFallback = VEHICLE_CONFIGS[vehicleType]?.modelFile?.fallbackPath || "";

      modelConfigs.push({
        vehicleType,
        apiUrl: vehicleApiConfig?.modelUrl ? getMediaUrl(vehicleApiConfig.modelUrl) || null : null,
        fallbackUrl: vehicleFallback,
        type: "vehicle",
      });

      // Brake model
      const brakeApiConfig = apiConfigs.brakeConfigs.find(c => c.vehicleType === vehicleType);
      const brakeFallback = BRAKE_CONFIGS[vehicleType]?.modelFile?.fallbackPath || "";

      modelConfigs.push({
        vehicleType,
        apiUrl: brakeApiConfig?.modelUrl ? getMediaUrl(brakeApiConfig.modelUrl) || null : null,
        fallbackUrl: brakeFallback,
        type: "brake",
      });
    });

    const totalModels = modelConfigs.length;
    console.log("[ModelPreloader] Model configs prepared:", modelConfigs);

    // Step 3: Preload models (try API URL first, then fallback)
    setStatus("Loading 3D models...");

    const preloadPromises = modelConfigs.map(async (config) => {
      const modelName = `${config.type}-${config.vehicleType}`;

      // Try API URL first if available
      if (config.apiUrl) {
        try {
          console.log(`[ModelPreloader] Trying API model for ${modelName}: ${config.apiUrl}`);
          setStatus(`Loading ${config.type} model (${config.vehicleType})...`);

          await preloadGLB(config.apiUrl);

          loadedCount++;
          loaded.push(config.apiUrl);
          setLoadedModels([...loaded]);
          setProgress(Math.round((loadedCount / totalModels) * 100));
          console.log(`[ModelPreloader] ✓ Loaded ${modelName} from API`);
          return { success: true, url: config.apiUrl, source: "api" };
        } catch (error) {
          console.warn(`[ModelPreloader] Failed to load ${modelName} from API, trying fallback...`, error);
        }
      }

      // Fallback to local model
      if (config.fallbackUrl) {
        try {
          console.log(`[ModelPreloader] Trying fallback model for ${modelName}: ${config.fallbackUrl}`);
          setStatus(`Loading ${config.type} model (${config.vehicleType}) from local...`);

          await preloadGLB(config.fallbackUrl);

          loadedCount++;
          loaded.push(config.fallbackUrl);
          setLoadedModels([...loaded]);
          setProgress(Math.round((loadedCount / totalModels) * 100));
          console.log(`[ModelPreloader] ✓ Loaded ${modelName} from fallback`);
          return { success: true, url: config.fallbackUrl, source: "fallback" };
        } catch (error) {
          console.error(`[ModelPreloader] ✗ Failed to load ${modelName} from both API and fallback:`, error);
          loadedCount++;
          setProgress(Math.round((loadedCount / totalModels) * 100));
          return { success: false, url: null, source: "none" };
        }
      }

      // No URL available
      loadedCount++;
      setProgress(Math.round((loadedCount / totalModels) * 100));
      return { success: false, url: null, source: "none" };
    });

    const results = await Promise.all(preloadPromises);

    const successCount = results.filter(r => r.success).length;
    const apiCount = results.filter(r => r.source === "api").length;
    const fallbackCount = results.filter(r => r.source === "fallback").length;

    console.log(`[ModelPreloader] Preloading complete: ${successCount}/${totalModels} models loaded`);
    console.log(`[ModelPreloader] Sources - API: ${apiCount}, Fallback: ${fallbackCount}`);

    // Add a small buffer to ensure everything is ready
    setStatus("Finalizing...");
    await new Promise(resolve => setTimeout(resolve, 300));

    setIsPreloaded(true);
    setStatus("Complete!");
  }, []);

  useEffect(() => {
    preloadAllModels();
  }, [preloadAllModels]);

  return (
    <PreloadContext.Provider value={{ isPreloaded, progress, loadedModels, status }}>
      {children}
    </PreloadContext.Provider>
  );
}

// Loading screen shown while models are preloading
export function PreloadingScreen() {
  const { progress, loadedModels, status } = usePreload();

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
          <svg className="w-full h-full animate-spin" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
            />
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
            className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status text */}
        <p className="text-white/70 text-sm mb-2">
          {status}
        </p>
        <p className="text-white/50 text-xs">
          {loadedModels.length} of 6 models loaded
        </p>
      </div>
    </div>
  );
}

export default ModelPreloaderProvider;
