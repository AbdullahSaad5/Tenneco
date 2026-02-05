import axios, { AxiosInstance } from "axios";
import { useCallback, useRef, useEffect } from "react";
import { MediaResponse } from "../_types/axios";
import {
  HomepageContent,
  AppSettings,
  LoadingScreenContent,
  VehicleType,
  MediaItem,
  VehicleConfiguration,
  BrakeConfiguration,
  HotspotConfiguration,
} from "../_types/content";
import {
  FALLBACK_HOMEPAGE_CONTENT,
  FALLBACK_APP_SETTINGS,
  FALLBACK_LOADING_SCREEN,
  FALLBACK_VEHICLE_CONFIGS,
  FALLBACK_BRAKE_CONFIGS,
  FALLBACK_HOTSPOT_CONFIGS,
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
          mediaUrl: data.logo?.media?.url || "",
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
        vehicleCategories: (data.vehicleCategories || []).map((cat: {
          id: string;
          vehicleType: string;
          order?: number;
          title: string;
          subtitle: string;
          image?: { id: string; url: string };
          gradient?: { from: string; to: string };
          targetRoute?: string;
          isEnabled?: boolean;
        }) => ({
          id: cat.id,
          vehicleType: cat.vehicleType as VehicleType,
          order: cat.order || 1,
          title: cat.title,
          subtitle: cat.subtitle,
          imageMediaId: cat.image?.id || "",
          imageUrl: cat.image?.url || "",
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
  const getLanguages = useCallback(async (): Promise<Array<{
    id: string;
    code: string;
    name: string;
    nativeName: string;
    isDefault: boolean;
    isEnabled: boolean;
    order: number;
  }>> => {
    const controller = createAbortController("getLanguages");
    try {
      const response = await instance.get("/languages", {
        signal: controller.signal,
        timeout: 5000,
      });

      const data = Array.isArray(response.data?.docs) ? response.data.docs : [];

      return data.map((lang: {
        id: string;
        code: string;
        name: string;
        nativeName: string;
        isDefault?: boolean;
        isEnabled?: boolean;
        order?: number;
      }) => ({
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

  /**
   * Fetch vehicle configuration from CMS by vehicle type
   */
  const getVehicleConfiguration = useCallback(async (vehicleType: VehicleType): Promise<VehicleConfiguration> => {
    const controller = createAbortController(`getVehicleConfiguration-${vehicleType}`);
    try {
      const response = await instance.get("/vehicle-configurations", {
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
        throw new Error(`No vehicle configuration found for type: ${vehicleType}`);
      }

      const vehicleConfig: VehicleConfiguration = {
        id: data.id,
        vehicleType: data.vehicleType,
        name: data.name,
        modelFile: {
          mediaId: data.modelFile?.media?.id || "",
          fallbackPath: data.modelFile?.fallbackPath || FALLBACK_VEHICLE_CONFIGS[vehicleType].modelFile.fallbackPath,
        },
        scale: data.scale || FALLBACK_VEHICLE_CONFIGS[vehicleType].scale,
        rotation: data.rotation || FALLBACK_VEHICLE_CONFIGS[vehicleType].rotation,
        position: data.position || FALLBACK_VEHICLE_CONFIGS[vehicleType].position,
        tirePosition: data.tirePosition || FALLBACK_VEHICLE_CONFIGS[vehicleType].tirePosition,
        cameraStart: data.cameraStart || FALLBACK_VEHICLE_CONFIGS[vehicleType].cameraStart,
        cameraZoomTarget: data.cameraZoomTarget || FALLBACK_VEHICLE_CONFIGS[vehicleType].cameraZoomTarget,
        zoomConfig: data.zoomConfig || FALLBACK_VEHICLE_CONFIGS[vehicleType].zoomConfig,
        isActive: data.isActive !== false,
      };

      return vehicleConfig;
    } catch (error) {
      console.warn(`Failed to fetch vehicle configuration for ${vehicleType}, using fallback:`, error);
      return FALLBACK_VEHICLE_CONFIGS[vehicleType];
    } finally {
      delete abortControllersRef.current[`getVehicleConfiguration-${vehicleType}`];
    }
  }, []);

  /**
   * Fetch brake configuration from CMS by vehicle type
   */
  const getBrakeConfiguration = useCallback(async (vehicleType: VehicleType): Promise<BrakeConfiguration> => {
    const controller = createAbortController(`getBrakeConfiguration-${vehicleType}`);
    try {
      const response = await instance.get("/brake-configurations", {
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
        throw new Error(`No brake configuration found for type: ${vehicleType}`);
      }

      const brakeConfig: BrakeConfiguration = {
        id: data.id,
        vehicleType: data.vehicleType,
        name: data.name,
        modelFile: {
          mediaId: data.modelFile?.media?.id || "",
          fallbackPath: data.modelFile?.fallbackPath || FALLBACK_BRAKE_CONFIGS[vehicleType].modelFile.fallbackPath,
        },
        scale: data.scale || FALLBACK_BRAKE_CONFIGS[vehicleType].scale,
        rotation: data.rotation || FALLBACK_BRAKE_CONFIGS[vehicleType].rotation,
        position: data.position || FALLBACK_BRAKE_CONFIGS[vehicleType].position,
        centerModel: data.centerModel !== false,
        scaleConfig: data.scaleConfig || FALLBACK_BRAKE_CONFIGS[vehicleType].scaleConfig,
        explosionHotspot: data.explosionHotspot || FALLBACK_BRAKE_CONFIGS[vehicleType].explosionHotspot,
        media: {
          pdfMediaId: data.media?.pdf?.id || "",
          videoMediaId: data.media?.video?.id || "",
          fallbackPdfPath: data.media?.fallbackPdfPath || FALLBACK_BRAKE_CONFIGS[vehicleType].media?.fallbackPdfPath,
          fallbackVideoUrl: data.media?.fallbackVideoUrl,
        },
        isActive: data.isActive !== false,
      };

      return brakeConfig;
    } catch (error) {
      console.warn(`Failed to fetch brake configuration for ${vehicleType}, using fallback:`, error);
      return FALLBACK_BRAKE_CONFIGS[vehicleType];
    } finally {
      delete abortControllersRef.current[`getBrakeConfiguration-${vehicleType}`];
    }
  }, []);

  /**
   * Fetch hotspot configuration from CMS by vehicle type
   */
  const getHotspotConfiguration = useCallback(async (vehicleType: VehicleType): Promise<HotspotConfiguration> => {
    const controller = createAbortController(`getHotspotConfiguration-${vehicleType}`);
    try {
      const response = await instance.get("/hotspot-configurations", {
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
        throw new Error(`No hotspot configuration found for type: ${vehicleType}`);
      }

      const hotspotConfig: HotspotConfiguration = {
        id: data.id,
        vehicleType: data.vehicleType,
        defaults: data.defaults || FALLBACK_HOTSPOT_CONFIGS[vehicleType].defaults,
        hotspots: (data.hotspots || []).map((hs: {
          id?: string;
          hotspotId: string;
          label: string;
          labelTranslations?: Array<{ language: string; value: string }>;
          position?: { x: number; y: number; z: number };
          color?: string;
          targetModel?: string;
          isEnabled?: boolean;
          info?: {
            title?: string;
            titleTranslations?: Array<{ language: string; value: string }>;
            description?: string;
            descriptionTranslations?: Array<{ language: string; value: string }>;
            pdf?: string;
            pdfMedia?: { id: string };
            video?: string;
            videoMedia?: { id: string };
          };
        }) => ({
          hotspotId: hs.hotspotId || hs.id || "",
          label: hs.label || "",
          labelTranslations: hs.labelTranslations,
          position: hs.position || { x: 0, y: 0, z: 0 },
          color: hs.color || "#3b82f6",
          targetModel: hs.targetModel,
          isEnabled: hs.isEnabled !== false,
          info: hs.info ? {
            title: hs.info.title,
            titleTranslations: hs.info.titleTranslations,
            description: hs.info.description,
            descriptionTranslations: hs.info.descriptionTranslations,
            pdf: hs.info.pdf,
            pdfMediaId: hs.info.pdfMedia?.id,
            video: hs.info.video,
            videoMediaId: hs.info.videoMedia?.id,
          } : undefined,
        })),
      };

      return hotspotConfig;
    } catch (error) {
      console.warn(`Failed to fetch hotspot configuration for ${vehicleType}, using fallback:`, error);
      return FALLBACK_HOTSPOT_CONFIGS[vehicleType];
    } finally {
      delete abortControllersRef.current[`getHotspotConfiguration-${vehicleType}`];
    }
  }, []);

  return {
    getHomepageContent,
    getAppSettings,
    getLoadingScreenContent,
    getVehicleConfiguration,
    getBrakeConfiguration,
    getHotspotConfiguration,
    getMediaById,
    getLanguages,
  };
};

export default useAxios;
