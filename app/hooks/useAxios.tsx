import axios, { AxiosInstance } from "axios";
import { useCallback, useRef, useEffect } from "react";
import { MediaResponse } from "../_types/axios";
import {
  HomepageContent,
  AppSettings,
  LoadingScreenContent,
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
        params: { depth: 1 },
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
          altTranslations: data.logo?.altTranslations || [],
          width: data.logo?.width || 180,
          height: data.logo?.height || 50,
          fallbackPath: "/tenneco-logo.png",
        },
        hero: {
          title: data.hero?.title || FALLBACK_HOMEPAGE_CONTENT.hero.title,
          titleTranslations: data.hero?.titleTranslations || [],
          subtitle: data.hero?.subtitle || FALLBACK_HOMEPAGE_CONTENT.hero.subtitle,
          subtitleTranslations: data.hero?.subtitleTranslations || [],
          description: data.hero?.description || FALLBACK_HOMEPAGE_CONTENT.hero.description,
          descriptionTranslations: data.hero?.descriptionTranslations || [],
        },
        section: data.sectionTitle ? {
          sectionTitle: data.sectionTitle,
          sectionTitleTranslations: data.sectionTitleTranslations || [],
          sectionSubtitle: data.sectionSubtitle,
          sectionSubtitleTranslations: data.sectionSubtitleTranslations || [],
        } : undefined,
        vehicleCategories: (data.vehicleCategories || []).map((cat: {
          id: string;
          vehicleType: string | { id: string; slug: string; name: string };
          order?: number;
          title: string;
          titleTranslations?: Array<{ language: string; value: string }>;
          subtitle: string;
          subtitleTranslations?: Array<{ language: string; value: string }>;
          image?: { id: string; url: string };
          gradient?: { from: string; to: string };
          targetRoute?: string;
          isEnabled?: boolean;
        }) => ({
          id: cat.id,
          vehicleType: typeof cat.vehicleType === 'object' ? cat.vehicleType.slug : cat.vehicleType,
          order: cat.order || 1,
          title: cat.title,
          titleTranslations: cat.titleTranslations || [],
          subtitle: cat.subtitle,
          subtitleTranslations: cat.subtitleTranslations || [],
          imageMediaId: cat.image?.id || "",
          imageUrl: cat.image?.url || "",
          gradient: {
            from: cat.gradient?.from || "blue-600",
            to: cat.gradient?.to || "cyan-500",
          },
          targetRoute: cat.targetRoute || "/viewer",
          isEnabled: cat.isEnabled !== false,
        })),
      };

      return homepageContent;
    } catch {
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
    } catch {
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
        titleTranslations: data.titleTranslations || [],
        subtitle: data.subtitle,
        subtitleTranslations: data.subtitleTranslations || [],
        animation: data.animation || FALLBACK_LOADING_SCREEN.animation,
      };

      return loadingScreen;
    } catch {
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
    } catch {
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
    } catch {
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
   * Fetch vehicle configuration from CMS by vehicle type slug
   */
  const getVehicleConfiguration = useCallback(async (vehicleType: string): Promise<VehicleConfiguration> => {
    const controller = createAbortController(`getVehicleConfiguration-${vehicleType}`);
    try {
      const response = await instance.get("/vehicle-configurations", {
        signal: controller.signal,
        timeout: 5000,
        params: {
          depth: 1,
          where: {
            'vehicleType.slug': { equals: vehicleType },
          },
        },
      });

      const data = Array.isArray(response.data?.docs) ? response.data.docs[0] : response.data;

      if (!data) {
        throw new Error(`No vehicle configuration found for type: ${vehicleType}`);
      }

      const resolvedSlug = typeof data.vehicleType === 'object' ? data.vehicleType.slug : data.vehicleType;
      const fallback = FALLBACK_VEHICLE_CONFIGS[vehicleType];

      const vehicleConfig: VehicleConfiguration = {
        id: data.id,
        vehicleType: resolvedSlug,
        name: data.name,
        modelFile: {
          mediaId: data.modelFile?.media?.id || "",
          mediaUrl: data.modelFile?.media?.url || "",
          fallbackPath: data.modelFile?.fallbackPath || fallback?.modelFile.fallbackPath || "",
        },
        scale: data.scale || fallback?.scale || { x: 1, y: 1, z: 1 },
        rotation: data.rotation || fallback?.rotation || { x: 0, y: 0, z: 0 },
        cameraStart: data.cameraStart || fallback?.cameraStart || { x: 8, y: 4, z: 12 },
        cameraZoomTarget: data.cameraZoomTarget || fallback?.cameraZoomTarget || { x: 0, y: 0, z: 2 },
        zoomConfig: data.zoomConfig || fallback?.zoomConfig || { initialScale: 1, initialLookAtTarget: { x: 0, y: 0, z: 0 }, zoomLookAtTarget: { x: 0, y: 0, z: 0 }, zoomIntensity: 1 },
        isActive: data.isActive !== false,
      };

      return vehicleConfig;
    } catch {
      const fallback = FALLBACK_VEHICLE_CONFIGS[vehicleType];
      if (fallback) return fallback;
      throw error;
    } finally {
      delete abortControllersRef.current[`getVehicleConfiguration-${vehicleType}`];
    }
  }, []);

  /**
   * Fetch brake configuration from CMS by vehicle type slug
   */
  const getBrakeConfiguration = useCallback(async (vehicleType: string): Promise<BrakeConfiguration> => {
    const controller = createAbortController(`getBrakeConfiguration-${vehicleType}`);
    try {
      const response = await instance.get("/brake-configurations", {
        signal: controller.signal,
        timeout: 5000,
        params: {
          depth: 1,
          where: {
            'vehicleType.slug': { equals: vehicleType },
          },
        },
      });

      const data = Array.isArray(response.data?.docs) ? response.data.docs[0] : response.data;

      if (!data) {
        throw new Error(`No brake configuration found for type: ${vehicleType}`);
      }

      const resolvedSlug = typeof data.vehicleType === 'object' ? data.vehicleType.slug : data.vehicleType;
      const fallback = FALLBACK_BRAKE_CONFIGS[vehicleType];

      const brakeConfig: BrakeConfiguration = {
        id: data.id,
        vehicleType: resolvedSlug,
        name: data.name,
        modelFile: {
          mediaId: data.modelFile?.media?.id || "",
          mediaUrl: data.modelFile?.media?.url || "",
          fallbackPath: data.modelFile?.fallbackPath || fallback?.modelFile.fallbackPath || "",
        },
        scale: data.scale || fallback?.scale || { x: 1, y: 1, z: 1 },
        rotation: data.rotation || fallback?.rotation || { x: 0, y: 0, z: 0 },
        scaleConfig: data.scaleConfig || fallback?.scaleConfig || { transitionScale: 0.2, viewerScale: 0.2 },
        explosionHotspot: {
          position: data.explosionHotspot?.position || fallback?.explosionHotspot.position || { x: 0, y: 0.5, z: 0 },
          color: data.explosionHotspot?.color || fallback?.explosionHotspot.color || "#012e87",
          label: data.explosionHotspot?.label || fallback?.explosionHotspot.label || "View Exploded",
          labelTranslations: data.explosionHotspot?.labelTranslations || [],
        },
        media: {
          pdfMediaId: data.media?.pdf?.id || "",
          videoMediaId: data.media?.video?.id || "",
          pdfUrl: data.media?.pdf?.url || "",
          videoUrl: data.media?.video?.url || "",
          fallbackPdfPath: data.media?.fallbackPdfPath || fallback?.media?.fallbackPdfPath,
          fallbackVideoUrl: data.media?.fallbackVideoUrl,
        },
        isActive: data.isActive !== false,
      };

      return brakeConfig;
    } catch {
      const fallback = FALLBACK_BRAKE_CONFIGS[vehicleType];
      if (fallback) return fallback;
      throw error;
    } finally {
      delete abortControllersRef.current[`getBrakeConfiguration-${vehicleType}`];
    }
  }, []);

  /**
   * Fetch hotspot configuration from CMS by vehicle type slug
   */
  const getHotspotConfiguration = useCallback(async (vehicleType: string): Promise<HotspotConfiguration> => {
    const controller = createAbortController(`getHotspotConfiguration-${vehicleType}`);
    try {
      const response = await instance.get("/hotspot-configurations", {
        signal: controller.signal,
        timeout: 5000,
        params: {
          depth: 1,
          where: {
            'vehicleType.slug': { equals: vehicleType },
          },
        },
      });

      const data = Array.isArray(response.data?.docs) ? response.data.docs[0] : response.data;

      if (!data) {
        throw new Error(`No hotspot configuration found for type: ${vehicleType}`);
      }

      const resolvedSlug = typeof data.vehicleType === 'object' ? data.vehicleType.slug : data.vehicleType;
      const fallback = FALLBACK_HOTSPOT_CONFIGS[vehicleType];

      const hotspotConfig: HotspotConfiguration = {
        id: data.id,
        vehicleType: resolvedSlug,
        defaults: data.defaults || fallback?.defaults,
        hotspots: (data.hotspots || []).map((hs: {
          id?: string;
          hotspotId: string;
          label: string;
          labelTranslations?: Array<{ language: string; value: string }>;
          position?: { x: number; y: number; z: number };
          color?: string;
          isEnabled?: boolean;
          info?: {
            title?: string;
            titleTranslations?: Array<{ language: string; value: string }>;
            description?: string;
            descriptionTranslations?: Array<{ language: string; value: string }>;
            pdf?: string;
            pdfMedia?: { id: string; url: string };
            video?: string;
            videoMedia?: { id: string; url: string };
          };
        }) => ({
          hotspotId: hs.hotspotId || hs.id || "",
          label: hs.label || "",
          labelTranslations: hs.labelTranslations,
          position: hs.position || { x: 0, y: 0, z: 0 },
          color: hs.color || "#3b82f6",
          isEnabled: hs.isEnabled !== false,
          info: hs.info ? {
            title: hs.info.title,
            titleTranslations: hs.info.titleTranslations,
            description: hs.info.description,
            descriptionTranslations: hs.info.descriptionTranslations,
            pdf: hs.info.pdfMedia?.url || hs.info.pdf,
            pdfMediaId: hs.info.pdfMedia?.id,
            video: hs.info.videoMedia?.url || hs.info.video,
            videoMediaId: hs.info.videoMedia?.id,
          } : undefined,
        })),
      };

      return hotspotConfig;
    } catch {
      const fallback = FALLBACK_HOTSPOT_CONFIGS[vehicleType];
      if (fallback) return fallback;
      throw error;
    } finally {
      delete abortControllersRef.current[`getHotspotConfiguration-${vehicleType}`];
    }
  }, []);

  /**
   * Fetch all active vehicle types from CMS
   */
  const getVehicleTypes = useCallback(async (): Promise<Array<{
    id: string;
    name: string;
    slug: string;
    description?: string;
    order: number;
    isActive: boolean;
  }>> => {
    const controller = createAbortController("getVehicleTypes");
    try {
      const response = await instance.get("/vehicle-types", {
        signal: controller.signal,
        timeout: 5000,
        params: {
          where: {
            isActive: { equals: true },
          },
          sort: 'order',
        },
      });

      const data = Array.isArray(response.data?.docs) ? response.data.docs : [];

      return data.map((vt: {
        id: string;
        name: string;
        slug: string;
        description?: string;
        order?: number;
        isActive?: boolean;
      }) => ({
        id: vt.id,
        name: vt.name,
        slug: vt.slug,
        description: vt.description,
        order: vt.order || 1,
        isActive: vt.isActive !== false,
      }));
    } catch {
      return [];
    } finally {
      delete abortControllersRef.current["getVehicleTypes"];
    }
  }, []);

  return {
    getHomepageContent,
    getAppSettings,
    getLoadingScreenContent,
    getVehicleConfiguration,
    getBrakeConfiguration,
    getHotspotConfiguration,
    getVehicleTypes,
    getMediaById,
    getLanguages,
  };
};

export default useAxios;
