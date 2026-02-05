"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  HomepageContent,
  AppSettings,
  LoadingScreenContent,
  VehicleType,
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
    Record<VehicleType, VehicleConfiguration | null>
  >({
    light: null,
    commercial: null,
    rail: null,
  });
  const [brakeConfigs, setBrakeConfigs] = useState<
    Record<VehicleType, BrakeConfiguration | null>
  >({
    light: null,
    commercial: null,
    rail: null,
  });
  const [hotspotConfigs, setHotspotConfigs] = useState<
    Record<VehicleType, HotspotConfiguration | null>
  >({
    light: null,
    commercial: null,
    rail: null,
  });
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

      // Use Promise.allSettled to handle partial failures gracefully
      const results = await Promise.allSettled([
        getHomepageContent(),
        getAppSettings(),
        getLoadingScreenContent(),
        getVehicleConfiguration("light"),
        getVehicleConfiguration("commercial"),
        getVehicleConfiguration("rail"),
        getBrakeConfiguration("light"),
        getBrakeConfiguration("commercial"),
        getBrakeConfiguration("rail"),
        getHotspotConfiguration("light"),
        getHotspotConfiguration("commercial"),
        getHotspotConfiguration("rail"),
      ]);

      // Extract results (all should be fulfilled due to fallback wrapper)
      const resultsArray = results.map((r) => (r.status === "fulfilled" ? r.value : null));

      const homepageResult = resultsArray[0] as HomepageContent | null;
      const appSettingsResult = resultsArray[1] as AppSettings | null;
      const loadingScreenResult = resultsArray[2] as LoadingScreenContent | null;
      const lightVehicleResult = resultsArray[3] as VehicleConfiguration | null;
      const commercialVehicleResult = resultsArray[4] as VehicleConfiguration | null;
      const railVehicleResult = resultsArray[5] as VehicleConfiguration | null;
      const lightBrakeResult = resultsArray[6] as BrakeConfiguration | null;
      const commercialBrakeResult = resultsArray[7] as BrakeConfiguration | null;
      const railBrakeResult = resultsArray[8] as BrakeConfiguration | null;
      const lightHotspotResult = resultsArray[9] as HotspotConfiguration | null;
      const commercialHotspotResult = resultsArray[10] as HotspotConfiguration | null;
      const railHotspotResult = resultsArray[11] as HotspotConfiguration | null;

      setHomepage(homepageResult || FALLBACK_HOMEPAGE_CONTENT);
      setAppSettings(appSettingsResult || FALLBACK_APP_SETTINGS);
      setLoadingScreen(loadingScreenResult || FALLBACK_LOADING_SCREEN);
      setVehicleConfigs({
        light: lightVehicleResult || FALLBACK_VEHICLE_CONFIGS.light,
        commercial: commercialVehicleResult || FALLBACK_VEHICLE_CONFIGS.commercial,
        rail: railVehicleResult || FALLBACK_VEHICLE_CONFIGS.rail,
      });
      setBrakeConfigs({
        light: lightBrakeResult || FALLBACK_BRAKE_CONFIGS.light,
        commercial: commercialBrakeResult || FALLBACK_BRAKE_CONFIGS.commercial,
        rail: railBrakeResult || FALLBACK_BRAKE_CONFIGS.rail,
      });
      setHotspotConfigs({
        light: lightHotspotResult || FALLBACK_HOTSPOT_CONFIGS.light,
        commercial: commercialHotspotResult || FALLBACK_HOTSPOT_CONFIGS.commercial,
        rail: railHotspotResult || FALLBACK_HOTSPOT_CONFIGS.rail,
      });
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

