import axios, { AxiosInstance } from "axios";
import { useCallback, useRef, useEffect } from "react";
import { MediaResponse } from "../_types/axios";
import {
  HomepageContent,
  AppSettings,
  ModelConfiguration,
  LoadingScreenContent,
  ZoomAnimationContent,
  ModelType,
  VehicleType,
  MediaItem,
} from "../_types/content";
import {
  FALLBACK_HOMEPAGE_CONTENT,
  FALLBACK_APP_SETTINGS,
  FALLBACK_MODEL_CONFIGS,
  FALLBACK_LOADING_SCREEN,
  FALLBACK_ZOOM_ANIMATIONS,
} from "../config/fallbacks";

const instance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const useAxios = () => {
  const abortControllersRef = useRef<Record<string, AbortController>>({});

  // Cleanup function to abort all pending requests
  useEffect(() => {
    const controllerRef = abortControllersRef.current;
    return () => {
      Object.values(controllerRef).forEach((controller) => {
        controller.abort();
      });
    };
  }, []);

  const createAbortController = (requestId: string): AbortController => {
    // Abort any existing request with the same ID
    if (abortControllersRef.current[requestId]) {
      abortControllersRef.current[requestId].abort();
    }

    const controller = new AbortController();
    abortControllersRef.current[requestId] = controller;
    return controller;
  };

  // ============================================================================
  // Dynamic Content CMS Methods
  // ============================================================================

  /**
   * Fetch homepage content from CMS
   */
  const getHomepageContent = useCallback(async (): Promise<HomepageContent> => {
    const controller = createAbortController("getHomepageContent");
    try {
      const response = await instance.get("/homepage", {
        signal: controller.signal,
        timeout: 5000,
      });

      // Get the first document (homepage is a singleton)
      const data = Array.isArray(response.data?.docs) ? response.data.docs[0] : response.data;

      if (!data) {
        throw new Error("No homepage data found");
      }

      // Transform Payload response to our HomepageContent type
      const homepageContent: HomepageContent = {
        id: data.id,
        logo: {
          mediaId: data.logo?.media?.id || "",
          alt: data.logo?.alt || "Tenneco Logo",
          width: data.logo?.width || 180,
          height: data.logo?.height || 50,
          fallbackPath: "/tenneco-logo.png",
        },
        hero: {
          title: data.hero?.title || FALLBACK_HOMEPAGE_CONTENT.hero.title,
          subtitle: data.hero?.subtitle || FALLBACK_HOMEPAGE_CONTENT.hero.subtitle,
          description: data.hero?.description || FALLBACK_HOMEPAGE_CONTENT.hero.description,
        },
        vehicleCategories: (data.vehicleCategories || []).map((cat: any) => ({
          id: cat.id,
          order: cat.order || 1,
          title: cat.title,
          subtitle: cat.subtitle,
          imageMediaId: cat.image?.id || "",
          gradient: {
            from: cat.gradient?.from || "blue-600",
            to: cat.gradient?.to || "cyan-500",
          },
          targetRoute: cat.targetRoute || "/viewer?model=lv",
          isEnabled: cat.isEnabled !== false,
        })),
      };

      return homepageContent;
    } catch (error) {
      console.warn("Failed to fetch homepage content, using fallback:", error);
      return FALLBACK_HOMEPAGE_CONTENT;
    } finally {
      delete abortControllersRef.current["getHomepageContent"];
    }
  }, []);

  /**
   * Fetch app settings from CMS
   */
  const getAppSettings = useCallback(async (): Promise<AppSettings> => {
    const controller = createAbortController("getAppSettings");
    try {
      const response = await instance.get("/app-settings", {
        signal: controller.signal,
        timeout: 5000,
      });

      const data = Array.isArray(response.data?.docs) ? response.data.docs[0] : response.data;

      if (!data) {
        throw new Error("No app settings found");
      }

      // Transform response
      const appSettings: AppSettings = {
        id: data.id,
        branding: {
          primaryLogo: {
            mediaId: data.branding?.primaryLogo?.media?.id || "",
            alt: data.branding?.primaryLogo?.alt || "Tenneco Logo",
            width: data.branding?.primaryLogo?.width || 180,
            height: data.branding?.primaryLogo?.height || 50,
            fallbackPath: "/tenneco-logo.png",
          },
          favicon: data.branding?.favicon ? {
            mediaId: data.branding.favicon.media?.id || "",
            fallbackPath: "/favicon.ico",
          } : undefined,
          colorPalette: data.branding?.colorPalette || FALLBACK_APP_SETTINGS.branding.colorPalette,
        },
        features: data.features || FALLBACK_APP_SETTINGS.features,
        defaults: data.defaults || FALLBACK_APP_SETTINGS.defaults,
        environment: data.environment,
      };

      return appSettings;
    } catch (error) {
      console.warn("Failed to fetch app settings, using fallback:", error);
      return FALLBACK_APP_SETTINGS;
    } finally {
      delete abortControllersRef.current["getAppSettings"];
    }
  }, []);

  /**
   * Fetch model configuration from CMS by model type
   */
  const getModelConfiguration = useCallback(async (modelType: ModelType): Promise<ModelConfiguration> => {
    const controller = createAbortController(`getModelConfiguration-${modelType}`);
    try {
      const response = await instance.get("/model-configurations", {
        signal: controller.signal,
        timeout: 5000,
        params: {
          where: {
            modelType: { equals: modelType },
          },
        },
      });

      const data = Array.isArray(response.data?.docs) ? response.data.docs[0] : response.data;

      if (!data) {
        throw new Error(`No configuration found for model type: ${modelType}`);
      }

      // Transform response
      const modelConfig: ModelConfiguration = {
        id: data.id,
        modelType: data.modelType,
        modelFile: {
          mediaId: data.modelFile?.media?.id || "",
          fallbackPath: data.modelFile?.fallbackPath || FALLBACK_MODEL_CONFIGS[modelType].modelFile.fallbackPath,
        },
        transform: data.transform || FALLBACK_MODEL_CONFIGS[modelType].transform,
        hotspots: (data.hotspots || []).map((hs: any) => ({
          id: hs.id,
          order: hs.order || 1,
          position: hs.position || { x: 0, y: 0, z: 0 },
          label: hs.label || "",
          color: hs.color || "#3b82f6",
          targetModel: hs.targetModel,
          action: hs.action || { type: "navigate", payload: hs.targetModel },
          isEnabled: hs.isEnabled !== false,
        })),
        info: data.info || FALLBACK_MODEL_CONFIGS[modelType].info,
        media: {
          pdfMediaId: data.media?.pdf?.id || "",
          videoMediaId: data.media?.video?.id || "",
          fallbackPdfPath: data.media?.fallbackPdfPath || FALLBACK_MODEL_CONFIGS[modelType].media.fallbackPdfPath,
          fallbackVideoUrl: data.media?.fallbackVideoUrl,
        },
        version: data.version || "1.0.0",
        isActive: data.isActive !== false,
      };

      return modelConfig;
    } catch (error) {
      console.warn(`Failed to fetch model configuration for ${modelType}, using fallback:`, error);
      return FALLBACK_MODEL_CONFIGS[modelType];
    } finally {
      delete abortControllersRef.current[`getModelConfiguration-${modelType}`];
    }
  }, []);

  /**
   * Fetch loading screen content from CMS
   */
  const getLoadingScreenContent = useCallback(async (): Promise<LoadingScreenContent> => {
    const controller = createAbortController("getLoadingScreenContent");
    try {
      const response = await instance.get("/loading-screens", {
        signal: controller.signal,
        timeout: 5000,
      });

      const data = Array.isArray(response.data?.docs) ? response.data.docs[0] : response.data;

      if (!data) {
        throw new Error("No loading screen content found");
      }

      const loadingScreen: LoadingScreenContent = {
        id: data.id,
        logoType: data.logoType || "svg",
        svgPath: data.svgPath,
        logoMediaId: data.logoMedia?.id,
        title: data.title || FALLBACK_LOADING_SCREEN.title,
        subtitle: data.subtitle,
        animation: data.animation || FALLBACK_LOADING_SCREEN.animation,
      };

      return loadingScreen;
    } catch (error) {
      console.warn("Failed to fetch loading screen content, using fallback:", error);
      return FALLBACK_LOADING_SCREEN;
    } finally {
      delete abortControllersRef.current["getLoadingScreenContent"];
    }
  }, []);

  /**
   * Fetch zoom animation content from CMS by vehicle type
   */
  const getZoomAnimationContent = useCallback(async (vehicleType: VehicleType): Promise<ZoomAnimationContent> => {
    const controller = createAbortController(`getZoomAnimationContent-${vehicleType}`);
    try {
      const response = await instance.get("/zoom-animations", {
        signal: controller.signal,
        timeout: 5000,
        params: {
          where: {
            vehicleType: { equals: vehicleType },
          },
        },
      });

      const data = Array.isArray(response.data?.docs) ? response.data.docs[0] : response.data;

      if (!data) {
        throw new Error(`No zoom animation found for vehicle type: ${vehicleType}`);
      }

      const zoomAnimation: ZoomAnimationContent = {
        id: data.id,
        vehicleType: data.vehicleType,
        stages: (data.stages || []).map((stage: any) => ({
          order: stage.order || 1,
          name: stage.name,
          imageMediaId: stage.image?.id || "",
          title: stage.title,
          label: stage.label,
          duration: stage.duration || 2000,
          effects: stage.effects || { scale: { from: 1, to: 1 }, blur: { from: 0, to: 0 } },
        })),
      };

      return zoomAnimation;
    } catch (error) {
      console.warn(`Failed to fetch zoom animation for ${vehicleType}, using fallback:`, error);
      return FALLBACK_ZOOM_ANIMATIONS[vehicleType];
    } finally {
      delete abortControllersRef.current[`getZoomAnimationContent-${vehicleType}`];
    }
  }, []);

  /**
   * Fetch media item by ID
   */
  const getMediaById = useCallback(async (id: string): Promise<MediaItem | null> => {
    const controller = createAbortController(`getMediaById-${id}`);
    try {
      const response = await instance.get<MediaResponse>(`/media/${id}`, {
        signal: controller.signal,
        timeout: 5000,
      });

      const data = response.data;

      const mediaItem: MediaItem = {
        id: data.id,
        filename: data.filename,
        mimeType: data.mimeType,
        filesize: data.filesize,
        width: data.width,
        height: data.height,
        url: data.url,
        category: data.category || "image",
        alt: data.alt,
        title: data.title,
        description: data.description,
        tags: data.tags,
        product: data.product,
        section: data.section,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };

      return mediaItem;
    } catch (error) {
      console.warn(`Failed to fetch media item ${id}:`, error);
      return null;
    } finally {
      delete abortControllersRef.current[`getMediaById-${id}`];
    }
  }, []);

  /**
   * Fetch available languages
   */
  const getLanguages = useCallback(async (): Promise<any[]> => {
    const controller = createAbortController("getLanguages");
    try {
      const response = await instance.get("/languages", {
        signal: controller.signal,
        timeout: 5000,
      });

      const data = Array.isArray(response.data?.docs) ? response.data.docs : [];

      return data.map((lang: any) => ({
        id: lang.id,
        code: lang.code,
        name: lang.name,
        nativeName: lang.nativeName,
        isDefault: lang.isDefault || false,
        isEnabled: lang.isEnabled !== false,
        order: lang.order || 1,
      }));
    } catch (error) {
      console.warn("Failed to fetch languages, using default:", error);
      // Return default English language as fallback
      return [
        {
          id: "fallback-en",
          code: "en",
          name: "English",
          nativeName: "English",
          isDefault: true,
          isEnabled: true,
          order: 1,
        },
      ];
    } finally {
      delete abortControllersRef.current["getLanguages"];
    }
  }, []);

  return {
    getHomepageContent,
    getAppSettings,
    getModelConfiguration,
    getLoadingScreenContent,
    getZoomAnimationContent,
    getMediaById,
    getLanguages,
  };
};

export default useAxios;
