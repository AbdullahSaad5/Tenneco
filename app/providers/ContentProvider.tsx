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
} from "../_types/content";
import {
  FALLBACK_HOMEPAGE_CONTENT,
  FALLBACK_APP_SETTINGS,
  FALLBACK_MODEL_CONFIGS,
  FALLBACK_LOADING_SCREEN,
  FALLBACK_ZOOM_ANIMATIONS,
} from "../config/fallbacks";
import { useAxios } from "../hooks/useAxios";

// ============================================================================
// Context Creation
// ============================================================================

const ContentContext = createContext<ContentContextValue | undefined>(undefined);

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get axios methods
  const {
    getHomepageContent,
    getAppSettings,
    getModelConfiguration,
    getLoadingScreenContent,
    getZoomAnimationContent,
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
    } catch (err) {
      console.error("Error fetching content:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch content");

      // Use fallbacks on error
      setHomepage(FALLBACK_HOMEPAGE_CONTENT);
      setAppSettings(FALLBACK_APP_SETTINGS);
      setModelConfigs(FALLBACK_MODEL_CONFIGS);
      setLoadingScreen(FALLBACK_LOADING_SCREEN);
      setZoomAnimations(FALLBACK_ZOOM_ANIMATIONS);
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
  ]);

  // Fetch content on mount
  useEffect(() => {
    fetchAllContent();
  }, [fetchAllContent]);

  const contextValue: ContentContextValue = {
    homepage,
    appSettings,
    modelConfigs,
    loadingScreen,
    zoomAnimations,
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
export const useContent = (): ContentContextValue => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useContent must be used within ContentProvider");
  }
  return context;
};

