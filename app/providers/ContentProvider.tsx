"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  HomepageContent,
  AppSettings,
  LoadingScreenContent,
  VehicleConfiguration,
  BrakeConfiguration,
  HotspotConfiguration,
  ExtendedContentContextValue,
} from "../_types/content";
import { useAxios } from "../hooks/useAxios";
import axios from "axios";

function isAbortError(error: unknown): boolean {
  if (axios.isCancel(error)) return true;
  if (error instanceof Error && (error.name === "AbortError" || error.name === "CanceledError")) return true;
  return false;
}

// ============================================================================
// Context Creation
// ============================================================================

const ContentContext = createContext<ExtendedContentContextValue | undefined>(undefined);

// ============================================================================
// Content Provider Component
// ============================================================================

interface ContentProviderProps {
  children: React.ReactNode;
}

export const ContentProvider: React.FC<ContentProviderProps> = ({ children }) => {
  const [homepage, setHomepage] = useState<HomepageContent | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [loadingScreen, setLoadingScreen] = useState<LoadingScreenContent | null>(null);
  const [vehicleConfigs, setVehicleConfigs] = useState<
    Record<string, VehicleConfiguration | null>
  >({});
  const [brakeConfigs, setBrakeConfigs] = useState<
    Record<string, BrakeConfiguration | null>
  >({});
  const [hotspotConfigs, setHotspotConfigs] = useState<
    Record<string, HotspotConfiguration | null>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get axios methods
  const {
    getHomepageContent,
    getAppSettings,
    getLoadingScreenContent,
    getVehicleConfiguration,
    getBrakeConfiguration,
    getHotspotConfiguration,
  } = useAxios();

  // Check if CMS is enabled
  const isCmsEnabled =
    process.env.NEXT_PUBLIC_ENABLE_CMS === "true" ||
    process.env.NEXT_PUBLIC_ENABLE_CMS === undefined;

  /**
   * Fetch all content from CMS
   */
  const fetchAllContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isCmsEnabled) {
        setIsLoading(false);
        return;
      }

      // Phase 1: Fetch homepage, app settings, and loading screen
      const [homepageResult, appSettingsResult, loadingScreenResult] = await Promise.allSettled([
        getHomepageContent(),
        getAppSettings(),
        getLoadingScreenContent(),
      ]);

      // Check for any real failures in Phase 1 (ignore aborted requests)
      const phase1Failures = [
        { result: homepageResult, name: "homepage content" },
        { result: appSettingsResult, name: "app settings" },
        { result: loadingScreenResult, name: "loading screen" },
      ].filter(
        ({ result }) => result.status === "rejected" && !isAbortError((result as PromiseRejectedResult).reason)
      );

      if (phase1Failures.length > 0) {
        setError(`Failed to load ${phase1Failures[0].name} from the server.`);
        setIsLoading(false);
        return;
      }

      // If all were aborted, just return silently
      if ([homepageResult, appSettingsResult, loadingScreenResult].every(r => r.status === "rejected")) {
        setIsLoading(false);
        return;
      }

      const homepageData = homepageResult.status === "fulfilled" ? homepageResult.value : null;
      const appSettingsData = appSettingsResult.status === "fulfilled" ? appSettingsResult.value : null;
      const loadingScreenData = loadingScreenResult.status === "fulfilled" ? loadingScreenResult.value : null;

      if (!homepageData || !appSettingsData || !loadingScreenData) {
        setIsLoading(false);
        return;
      }

      setHomepage(homepageData);
      setAppSettings(appSettingsData);
      setLoadingScreen(loadingScreenData);

      // Phase 2: Discover vehicle type slugs from homepage categories
      const vehicleSlugs = Array.from(
        new Set(
          (homepageData.vehicleCategories || [])
            .filter((cat) => cat.isEnabled)
            .map((cat) => cat.vehicleType)
        )
      );

      if (vehicleSlugs.length === 0) {
        setIsLoading(false);
        return;
      }

      // Phase 3: Dynamically fetch configs for each discovered vehicle type
      const vehiclePromises = vehicleSlugs.map((slug) => getVehicleConfiguration(slug));
      const brakePromises = vehicleSlugs.map((slug) => getBrakeConfiguration(slug));
      const hotspotPromises = vehicleSlugs.map((slug) => getHotspotConfiguration(slug));

      const [vehicleResults, brakeResults, hotspotResults] = await Promise.all([
        Promise.allSettled(vehiclePromises),
        Promise.allSettled(brakePromises),
        Promise.allSettled(hotspotPromises),
      ]);

      // Check for any real failures in Phase 3 (ignore aborted requests)
      const anyVehicleFailed = vehicleResults.some(
        (r) => r.status === "rejected" && !isAbortError((r as PromiseRejectedResult).reason)
      );
      const anyBrakeFailed = brakeResults.some(
        (r) => r.status === "rejected" && !isAbortError((r as PromiseRejectedResult).reason)
      );
      const anyHotspotFailed = hotspotResults.some(
        (r) => r.status === "rejected" && !isAbortError((r as PromiseRejectedResult).reason)
      );

      if (anyVehicleFailed || anyBrakeFailed || anyHotspotFailed) {
        const failedType =
          anyVehicleFailed ? "vehicle configuration" :
          anyBrakeFailed ? "brake configuration" :
          "hotspot configuration";
        setError(`Failed to load ${failedType} from the server.`);
        setIsLoading(false);
        return;
      }

      // Build dynamic config records
      const newVehicleConfigs: Record<string, VehicleConfiguration | null> = {};
      const newBrakeConfigs: Record<string, BrakeConfiguration | null> = {};
      const newHotspotConfigs: Record<string, HotspotConfiguration | null> = {};

      vehicleSlugs.forEach((slug, i) => {
        newVehicleConfigs[slug] = vehicleResults[i].status === "fulfilled" ? vehicleResults[i].value : null;
        newBrakeConfigs[slug] = brakeResults[i].status === "fulfilled" ? brakeResults[i].value : null;
        newHotspotConfigs[slug] = hotspotResults[i].status === "fulfilled" ? hotspotResults[i].value : null;
      });

      setVehicleConfigs(newVehicleConfigs);
      setBrakeConfigs(newBrakeConfigs);
      setHotspotConfigs(newHotspotConfigs);
    } catch (err) {
      if (!isAbortError(err)) {
        setError(err instanceof Error ? err.message : "Failed to fetch content");
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    isCmsEnabled,
    getHomepageContent,
    getAppSettings,
    getLoadingScreenContent,
    getVehicleConfiguration,
    getBrakeConfiguration,
    getHotspotConfiguration,
  ]);

  // Fetch content on mount
  useEffect(() => {
    fetchAllContent();
  }, [fetchAllContent]);

  // Show error UI if something went wrong
  if (error && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white gap-4">
        <p className="text-xl font-semibold">Something went wrong</p>
        <p className="text-slate-400 text-sm">Could not load content from the server.</p>
        <button
          onClick={fetchAllContent}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  const contextValue: ExtendedContentContextValue = {
    homepage,
    appSettings,
    loadingScreen,
    vehicleConfigs,
    brakeConfigs,
    hotspotConfigs,
    isLoading,
    error,
    refetch: fetchAllContent,
  };

  return <ContentContext.Provider value={contextValue}>{children}</ContentContext.Provider>;
};

// ============================================================================
// Custom Hook
// ============================================================================

/**
 * Hook to access content from ContentProvider
 * @throws Error if used outside ContentProvider
 */
export const useContent = (): ExtendedContentContextValue => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useContent must be used within ContentProvider");
  }
  return context;
};
