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
      console.log("[ContentProvider] fetchAllContent started. isCmsEnabled:", isCmsEnabled);

      if (!isCmsEnabled) {
        console.log("[ContentProvider] CMS disabled, skipping fetch.");
        setIsLoading(false);
        return;
      }

      // Phase 1: Fetch homepage, app settings, and loading screen
      console.log("[ContentProvider] Phase 1: fetching homepage, appSettings, loadingScreen...");
      const [homepageResult, appSettingsResult, loadingScreenResult] = await Promise.allSettled([
        getHomepageContent(),
        getAppSettings(),
        getLoadingScreenContent(),
      ]);

      console.log("[ContentProvider] Phase 1 results:", {
        homepage: homepageResult.status,
        appSettings: appSettingsResult.status,
        loadingScreen: loadingScreenResult.status,
        homepageReason: homepageResult.status === "rejected" ? homepageResult.reason : undefined,
        appSettingsReason: appSettingsResult.status === "rejected" ? appSettingsResult.reason : undefined,
        loadingScreenReason: loadingScreenResult.status === "rejected" ? loadingScreenResult.reason : undefined,
      });

      // Check for any real failures in Phase 1 (ignore aborted requests; loading screen is non-critical)
      const phase1Failures = [
        { result: homepageResult, name: "homepage content" },
        { result: appSettingsResult, name: "app settings" },
      ].filter(
        ({ result }) => result.status === "rejected" && !isAbortError((result as PromiseRejectedResult).reason)
      );

      if (phase1Failures.length > 0) {
        console.error("[ContentProvider] Phase 1 real failures:", phase1Failures.map(f => f.name));
        setError(`Failed to load ${phase1Failures[0].name} from the server.`);
        setIsLoading(false);
        return;
      }

      // If critical requests were aborted, just return silently
      if ([homepageResult, appSettingsResult].every(r => r.status === "rejected")) {
        console.log("[ContentProvider] All Phase 1 requests aborted, returning silently.");
        setIsLoading(false);
        return;
      }

      const homepageData = homepageResult.status === "fulfilled" ? homepageResult.value : null;
      const appSettingsData = appSettingsResult.status === "fulfilled" ? appSettingsResult.value : null;
      const loadingScreenData = loadingScreenResult.status === "fulfilled" ? loadingScreenResult.value : null;

      console.log("[ContentProvider] Phase 1 data:", {
        hasHomepage: !!homepageData,
        hasAppSettings: !!appSettingsData,
        hasLoadingScreen: !!loadingScreenData,
      });

      if (!homepageData || !appSettingsData) {
        console.warn("[ContentProvider] Homepage or appSettings null (partial abort?), returning silently.");
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

      console.log("[ContentProvider] Phase 2 vehicle slugs discovered:", vehicleSlugs);

      if (vehicleSlugs.length === 0) {
        console.log("[ContentProvider] No vehicle slugs found, done.");
        setIsLoading(false);
        return;
      }

      // Phase 3: Dynamically fetch configs for each discovered vehicle type
      console.log("[ContentProvider] Phase 3: fetching vehicle/brake/hotspot configs...");
      const vehiclePromises = vehicleSlugs.map((slug) => getVehicleConfiguration(slug));
      const brakePromises = vehicleSlugs.map((slug) => getBrakeConfiguration(slug));
      const hotspotPromises = vehicleSlugs.map((slug) => getHotspotConfiguration(slug));

      const [vehicleResults, brakeResults, hotspotResults] = await Promise.all([
        Promise.allSettled(vehiclePromises),
        Promise.allSettled(brakePromises),
        Promise.allSettled(hotspotPromises),
      ]);

      console.log("[ContentProvider] Phase 3 results:", {
        vehicles: vehicleResults.map(r => ({ status: r.status, reason: r.status === "rejected" ? r.reason : undefined })),
        brakes: brakeResults.map(r => ({ status: r.status, reason: r.status === "rejected" ? r.reason : undefined })),
        hotspots: hotspotResults.map(r => ({ status: r.status, reason: r.status === "rejected" ? r.reason : undefined })),
      });

      // Build dynamic config records (Phase 3 failures are non-critical — just set null)
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

      console.log("[ContentProvider] Done. All content loaded successfully.");
    } catch (err) {
      if (!isAbortError(err)) {
        console.error("[ContentProvider] Unexpected error in fetchAllContent:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch content");
      } else {
        console.log("[ContentProvider] Fetch aborted (outer catch), ignoring.");
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
