"use client";

import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { getAllModelPaths } from "../../config";

interface PreloadContextType {
  isPreloaded: boolean;
  progress: number;
  loadedModels: string[];
}

const PreloadContext = createContext<PreloadContextType>({
  isPreloaded: false,
  progress: 0,
  loadedModels: [],
});

export const usePreload = () => useContext(PreloadContext);

interface ModelPreloaderProps {
  children: ReactNode;
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

export function ModelPreloaderProvider({ children }: ModelPreloaderProps) {
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadedModels, setLoadedModels] = useState<string[]>([]);

  useEffect(() => {
    const modelPaths = getAllModelPaths();
    let loadedCount = 0;
    const loaded: string[] = [];

    const preloadAllModels = async () => {
      // Load all models in parallel
      const promises = modelPaths.map(async (path) => {
        try {
          await preloadGLB(path);
          loadedCount++;
          loaded.push(path);
          setLoadedModels([...loaded]);
          setProgress(Math.round((loadedCount / modelPaths.length) * 100));
          return path;
        } catch (err) {
          console.warn(`Failed to preload: ${path}`, err);
          loadedCount++;
          setProgress(Math.round((loadedCount / modelPaths.length) * 100));
          return null;
        }
      });

      await Promise.all(promises);

      // Add a small buffer to ensure everything is ready
      await new Promise(resolve => setTimeout(resolve, 300));

      setIsPreloaded(true);
    };

    preloadAllModels();
  }, []);

  return (
    <PreloadContext.Provider value={{ isPreloaded, progress, loadedModels }}>
      {children}
    </PreloadContext.Provider>
  );
}

// Loading screen shown while models are preloading
export function PreloadingScreen() {
  const { progress, loadedModels } = usePreload();

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-8">
          <img
            src="/tenneco-logo.png"
            alt="Tenneco"
            className="h-16 w-auto mx-auto brightness-0 invert"
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
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status text */}
        <p className="text-white/70 text-sm mb-2">
          Loading 3D models...
        </p>
        <p className="text-white/50 text-xs">
          {loadedModels.length} of 6 models loaded
        </p>
      </div>
    </div>
  );
}

export default ModelPreloaderProvider;
