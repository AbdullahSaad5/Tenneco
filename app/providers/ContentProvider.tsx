"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
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
  const {
    getHomepageContent,
    getAppSettings,
    getLoadingScreenContent,
    getVehicleConfiguration,
    getBrakeConfiguration,
    getHotspotConfiguration,
  } = useAxios();

  const queryClient = useQueryClient();

  const isCmsEnabled =
    process.env.NEXT_PUBLIC_ENABLE_CMS === "true" ||
    process.env.NEXT_PUBLIC_ENABLE_CMS === undefined;

  // ========================================================================
  // Phase 1: Fetch homepage, app settings, and loading screen (parallel)
  // ========================================================================

  const homepageQuery = useQuery({
    queryKey: ["homepage"],
    queryFn: ({ signal }) => getHomepageContent(signal),
    enabled: isCmsEnabled,
  });

  const appSettingsQuery = useQuery({
    queryKey: ["appSettings"],
    queryFn: ({ signal }) => getAppSettings(signal),
    enabled: isCmsEnabled,
  });

  const loadingScreenQuery = useQuery({
    queryKey: ["loadingScreen"],
    queryFn: ({ signal }) => getLoadingScreenContent(signal),
    enabled: isCmsEnabled,
  });

  // ========================================================================
  // Phase 2: Discover vehicle slugs from homepage data
  // ========================================================================

  const vehicleSlugs = useMemo(() => {
    if (!homepageQuery.data) return [];
    return Array.from(
      new Set(
        (homepageQuery.data.vehicleCategories || [])
          .filter((cat) => cat.isEnabled)
          .map((cat) => cat.vehicleType)
      )
    );
  }, [homepageQuery.data]);

  // ========================================================================
  // Phase 3: Fetch configs for each vehicle type (parallel, enabled after homepage)
  // ========================================================================

  const vehicleConfigQueries = useQueries({
    queries: vehicleSlugs.map((slug) => ({
      queryKey: ["vehicleConfig", slug],
      queryFn: ({ signal }: { signal: AbortSignal }) => getVehicleConfiguration(slug, signal),
      enabled: isCmsEnabled && vehicleSlugs.length > 0,
    })),
  });

  const brakeConfigQueries = useQueries({
    queries: vehicleSlugs.map((slug) => ({
      queryKey: ["brakeConfig", slug],
      queryFn: ({ signal }: { signal: AbortSignal }) => getBrakeConfiguration(slug, signal),
      enabled: isCmsEnabled && vehicleSlugs.length > 0,
    })),
  });

  const hotspotConfigQueries = useQueries({
    queries: vehicleSlugs.map((slug) => ({
      queryKey: ["hotspotConfig", slug],
      queryFn: ({ signal }: { signal: AbortSignal }) => getHotspotConfiguration(slug, signal),
      enabled: isCmsEnabled && vehicleSlugs.length > 0,
    })),
  });

  // ========================================================================
  // Derive state from queries
  // ========================================================================

  const homepage: HomepageContent | null = homepageQuery.data ?? null;
  const appSettings: AppSettings | null = appSettingsQuery.data ?? null;
  const loadingScreen: LoadingScreenContent | null = loadingScreenQuery.data ?? null;

  const vehicleConfigs = useMemo(() => {
    const configs: Record<string, VehicleConfiguration | null> = {};
    vehicleSlugs.forEach((slug, i) => {
      configs[slug] = vehicleConfigQueries[i]?.data ?? null;
    });
    return configs;
  }, [vehicleSlugs, vehicleConfigQueries]);

  const brakeConfigs = useMemo(() => {
    const configs: Record<string, BrakeConfiguration | null> = {};
    vehicleSlugs.forEach((slug, i) => {
      configs[slug] = brakeConfigQueries[i]?.data ?? null;
    });
    return configs;
  }, [vehicleSlugs, brakeConfigQueries]);

  const hotspotConfigs = useMemo(() => {
    const configs: Record<string, HotspotConfiguration | null> = {};
    vehicleSlugs.forEach((slug, i) => {
      configs[slug] = hotspotConfigQueries[i]?.data ?? null;
    });
    return configs;
  }, [vehicleSlugs, hotspotConfigQueries]);

  // isLoading: true only on initial load (React Query's isLoading = isPending && isFetching)
  // After first successful load, isLoading stays false even during background refetches
  const phase1Loading = homepageQuery.isLoading || appSettingsQuery.isLoading;
  const phase3Loading =
    vehicleSlugs.length > 0 &&
    (vehicleConfigQueries.some((q) => q.isLoading) ||
      brakeConfigQueries.some((q) => q.isLoading) ||
      hotspotConfigQueries.some((q) => q.isLoading));
  const isLoading = isCmsEnabled ? phase1Loading || phase3Loading : false;

  // First critical error (homepage or appSettings)
  const error = homepageQuery.error
    ? (homepageQuery.error as Error).message
    : appSettingsQuery.error
      ? (appSettingsQuery.error as Error).message
      : null;

  const refetch = async () => {
    await queryClient.invalidateQueries();
  };

  // ========================================================================
  // Context value
  // ========================================================================

  const contextValue = useMemo<ExtendedContentContextValue>(
    () => ({
      homepage,
      appSettings,
      loadingScreen,
      vehicleConfigs,
      brakeConfigs,
      hotspotConfigs,
      isLoading,
      error,
      refetch,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [homepage, appSettings, loadingScreen, vehicleConfigs, brakeConfigs, hotspotConfigs, isLoading, error]
  );

  // Show error UI if something went wrong
  if (error && !isLoading) {
    return (
      <ContentContext.Provider value={contextValue}>
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white gap-4">
          <p className="text-xl font-semibold">Something went wrong</p>
          <p className="text-slate-400 text-sm">Could not load content from the server.</p>
          <button
            onClick={refetch}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </ContentContext.Provider>
    );
  }

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
