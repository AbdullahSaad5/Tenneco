"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  ContentContextValue,
  HomepageContent,
  AppSettings,
  ModelConfiguration,
  LoadingScreenContent,
  ZoomAnimationContent,
  ModelType,
  VehicleType,
  VehicleConfiguration,
  BrakeConfiguration,
  HotspotConfiguration,
  ExtendedContentContextValue,
} from "../_types/content";
import {
  FALLBACK_HOMEPAGE_CONTENT,
  FALLBACK_APP_SETTINGS,
  FALLBACK_MODEL_CONFIGS,
  FALLBACK_LOADING_SCREEN,
  FALLBACK_ZOOM_ANIMATIONS,
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
  const [modelConfigs, setModelConfigs] = useState<Record<ModelType, ModelConfiguration | null>>({
    lv: null,
    asm: null,
    j4444: null,
    pad: null,
  });
  const [loadingScreen, setLoadingScreen] = useState<LoadingScreenContent | null>(null);
  const [zoomAnimations, setZoomAnimations] = useState<
    Record<VehicleType, ZoomAnimationContent | null>
  >({
    light: null,
    commercial: null,
    rail: null,
  });
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
    getModelConfiguration,
    getLoadingScreenContent,
    getZoomAnimationContent,
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
        setModelConfigs(FALLBACK_MODEL_CONFIGS);
        setLoadingScreen(FALLBACK_LOADING_SCREEN);
        setZoomAnimations(FALLBACK_ZOOM_ANIMATIONS);
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
        getModelConfiguration("lv"),
        getModelConfiguration("asm"),
        getModelConfiguration("j4444"),
        getModelConfiguration("pad"),
        getLoadingScreenContent(),
        getZoomAnimationContent("light"),
        getZoomAnimationContent("commercial"),
        getZoomAnimationContent("rail"),
        // New vehicle-type-based configurations
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
      const lvConfigResult = resultsArray[2] as ModelConfiguration | null;
      const asmConfigResult = resultsArray[3] as ModelConfiguration | null;
      const j4444ConfigResult = resultsArray[4] as ModelConfiguration | null;
      const padConfigResult = resultsArray[5] as ModelConfiguration | null;
      const loadingScreenResult = resultsArray[6] as LoadingScreenContent | null;
      const lightAnimResult = resultsArray[7] as ZoomAnimationContent | null;
      const commercialAnimResult = resultsArray[8] as ZoomAnimationContent | null;
      const railAnimResult = resultsArray[9] as ZoomAnimationContent | null;
      // New vehicle-type-based results
      const lightVehicleResult = resultsArray[10] as VehicleConfiguration | null;
      const commercialVehicleResult = resultsArray[11] as VehicleConfiguration | null;
      const railVehicleResult = resultsArray[12] as VehicleConfiguration | null;
      const lightBrakeResult = resultsArray[13] as BrakeConfiguration | null;
      const commercialBrakeResult = resultsArray[14] as BrakeConfiguration | null;
      const railBrakeResult = resultsArray[15] as BrakeConfiguration | null;
      const lightHotspotResult = resultsArray[16] as HotspotConfiguration | null;
      const commercialHotspotResult = resultsArray[17] as HotspotConfiguration | null;
      const railHotspotResult = resultsArray[18] as HotspotConfiguration | null;

      setHomepage(homepageResult || FALLBACK_HOMEPAGE_CONTENT);
      setAppSettings(appSettingsResult || FALLBACK_APP_SETTINGS);
      setModelConfigs({
        lv: lvConfigResult || FALLBACK_MODEL_CONFIGS.lv,
        asm: asmConfigResult || FALLBACK_MODEL_CONFIGS.asm,
        j4444: j4444ConfigResult || FALLBACK_MODEL_CONFIGS.j4444,
        pad: padConfigResult || FALLBACK_MODEL_CONFIGS.pad,
      });
      setLoadingScreen(loadingScreenResult || FALLBACK_LOADING_SCREEN);
      setZoomAnimations({
        light: lightAnimResult || FALLBACK_ZOOM_ANIMATIONS.light,
        commercial: commercialAnimResult || FALLBACK_ZOOM_ANIMATIONS.commercial,
        rail: railAnimResult || FALLBACK_ZOOM_ANIMATIONS.rail,
      });
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
      setModelConfigs(FALLBACK_MODEL_CONFIGS);
      setLoadingScreen(FALLBACK_LOADING_SCREEN);
      setZoomAnimations(FALLBACK_ZOOM_ANIMATIONS);
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
    getModelConfiguration,
    getLoadingScreenContent,
    getZoomAnimationContent,
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
    modelConfigs,
    loadingScreen,
    zoomAnimations,
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

