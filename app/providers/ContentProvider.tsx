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
import {
  FALLBACK_HOMEPAGE_CONTENT,
  FALLBACK_APP_SETTINGS,
  FALLBACK_LOADING_SCREEN,
  FALLBACK_VEHICLE_CONFIGS,
  FALLBACK_BRAKE_CONFIGS,
  FALLBACK_HOTSPOT_CONFIGS,
} from "../config/fallbacks";
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
   * Fetch all content from CMS or use fallbacks
   */
  const fetchAllContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isCmsEnabled) {
        console.log("CMS disabled - using fallback content");
        setHomepage(FALLBACK_HOMEPAGE_CONTENT);
        setAppSettings(FALLBACK_APP_SETTINGS);
        setLoadingScreen(FALLBACK_LOADING_SCREEN);
        setVehicleConfigs(FALLBACK_VEHICLE_CONFIGS);
        setBrakeConfigs(FALLBACK_BRAKE_CONFIGS);
        setHotspotConfigs(FALLBACK_HOTSPOT_CONFIGS);
        setIsLoading(false);
        return;
      }

      // Phase 1: Fetch homepage, app settings, and loading screen
      const [homepageResult, appSettingsResult, loadingScreenResult] = await Promise.allSettled([
        getHomepageContent(),
        getAppSettings(),
        getLoadingScreenContent(),
      ]);

      const homepageData = homepageResult.status === "fulfilled" ? homepageResult.value : null;
      const appSettingsData = appSettingsResult.status === "fulfilled" ? appSettingsResult.value : null;
      const loadingScreenData = loadingScreenResult.status === "fulfilled" ? loadingScreenResult.value : null;

      setHomepage(homepageData || FALLBACK_HOMEPAGE_CONTENT);
      setAppSettings(appSettingsData || FALLBACK_APP_SETTINGS);
      setLoadingScreen(loadingScreenData || FALLBACK_LOADING_SCREEN);

      // Phase 2: Discover vehicle type slugs from homepage categories
      const resolvedHomepage = homepageData || FALLBACK_HOMEPAGE_CONTENT;
      const vehicleSlugs = Array.from(
        new Set(
          resolvedHomepage.vehicleCategories
            .filter((cat) => cat.isEnabled)
            .map((cat) => cat.vehicleType)
        )
      );

      // Phase 3: Dynamically fetch configs for each discovered vehicle type
      const vehiclePromises = vehicleSlugs.map((slug) => getVehicleConfiguration(slug));
      const brakePromises = vehicleSlugs.map((slug) => getBrakeConfiguration(slug));
      const hotspotPromises = vehicleSlugs.map((slug) => getHotspotConfiguration(slug));

      const [vehicleResults, brakeResults, hotspotResults] = await Promise.all([
        Promise.allSettled(vehiclePromises),
        Promise.allSettled(brakePromises),
        Promise.allSettled(hotspotPromises),
      ]);

      // Build dynamic config records
      const newVehicleConfigs: Record<string, VehicleConfiguration | null> = {};
      const newBrakeConfigs: Record<string, BrakeConfiguration | null> = {};
      const newHotspotConfigs: Record<string, HotspotConfiguration | null> = {};

      vehicleSlugs.forEach((slug, i) => {
        newVehicleConfigs[slug] =
          vehicleResults[i].status === "fulfilled"
            ? vehicleResults[i].value
            : FALLBACK_VEHICLE_CONFIGS[slug] || null;

        newBrakeConfigs[slug] =
          brakeResults[i].status === "fulfilled"
            ? brakeResults[i].value
            : FALLBACK_BRAKE_CONFIGS[slug] || null;

        newHotspotConfigs[slug] =
          hotspotResults[i].status === "fulfilled"
            ? hotspotResults[i].value
            : FALLBACK_HOTSPOT_CONFIGS[slug] || null;
      });

      setVehicleConfigs(newVehicleConfigs);
      setBrakeConfigs(newBrakeConfigs);
      setHotspotConfigs(newHotspotConfigs);
    } catch (err) {
      console.error("Error fetching content:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch content");

      // Use fallbacks on error
      setHomepage(FALLBACK_HOMEPAGE_CONTENT);
      setAppSettings(FALLBACK_APP_SETTINGS);
      setLoadingScreen(FALLBACK_LOADING_SCREEN);
      setVehicleConfigs(FALLBACK_VEHICLE_CONFIGS);
      setBrakeConfigs(FALLBACK_BRAKE_CONFIGS);
      setHotspotConfigs(FALLBACK_HOTSPOT_CONFIGS);
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
