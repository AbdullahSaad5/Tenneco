import axios, { AxiosInstance } from "axios";
import { useCallback } from "react";
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

const instance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const useAxios = () => {
  // ============================================================================
  // Dynamic Content CMS Methods
  // ============================================================================

  /**
   * Fetch homepage content from CMS
   */
  const getHomepageContent = useCallback(async (signal?: AbortSignal): Promise<HomepageContent> => {
    const response = await instance.get("/homepage", {
      signal,
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
        title: data.hero?.title || "",
        titleTranslations: data.hero?.titleTranslations || [],
        subtitle: data.hero?.subtitle || "",
        subtitleTranslations: data.hero?.subtitleTranslations || [],
        description: data.hero?.description || "",
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
  }, []);

  /**
   * Fetch app settings from CMS
   */
  const getAppSettings = useCallback(async (signal?: AbortSignal): Promise<AppSettings> => {
    const response = await instance.get("/app-settings", {
      signal,
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
          mediaUrl: data.branding.favicon.media?.url || "",
          fallbackPath: "/favicon.ico",
        } : undefined,
        colorPalette: data.branding?.colorPalette || {
          primary: "#012e87",
          secondary: "#0ea5e9",
          accent: "#012e87",
          background: "#0f172a",
          text: "#ffffff",
        },
      },
      features: data.features || {
        enableHomepage: true,
        enableAnimations: true,
        enableModelInfo: true,
        enableHotspots: true,
        enableVideoModal: true,
        enablePdfModal: true,
      },
      defaults: data.defaults || {},
      environment: data.environment,
    };

    return appSettings;
  }, []);

  /**
   * Fetch loading screen content from CMS
   */
  const getLoadingScreenContent = useCallback(async (signal?: AbortSignal): Promise<LoadingScreenContent | null> => {
    try {
      const response = await instance.get("/loading-screens", {
        signal,
        timeout: 5000,
      });

      const data = Array.isArray(response.data?.docs) ? response.data.docs[0] : response.data;

      if (!data) {
        return null;
      }

      const loadingScreen: LoadingScreenContent = {
        id: data.id,
        logoType: data.logoType || "svg",
        svgPath: data.svgPath,
        logoMediaId: data.logoMedia?.id,
        title: data.title || "",
        titleTranslations: data.titleTranslations || [],
        subtitle: data.subtitle,
        subtitleTranslations: data.subtitleTranslations || [],
        animation: data.animation || {
          colors: { primary: "#012e87", secondary: "#0ea5e9" },
          duration: 2000,
        },
      };

      return loadingScreen;
    } catch {
      return null;
    }
  }, []);

  /**
   * Fetch media item by ID
   */
  const getMediaById = useCallback(async (id: string, signal?: AbortSignal): Promise<MediaItem | null> => {
    try {
      const response = await instance.get<MediaResponse>(`/media/${id}`, {
        signal,
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
    }
  }, []);

  /**
   * Fetch available languages
   */
  const getLanguages = useCallback(async (signal?: AbortSignal): Promise<Array<{
    id: string;
    code: string;
    name: string;
    nativeName: string;
    isDefault: boolean;
    isEnabled: boolean;
    order: number;
  }>> => {
    const response = await instance.get("/languages", {
      signal,
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
  }, []);

  /**
   * Fetch vehicle configuration from CMS by vehicle type slug
   */
  const getVehicleConfiguration = useCallback(async (vehicleType: string, signal?: AbortSignal): Promise<VehicleConfiguration> => {
    const response = await instance.get("/vehicle-configurations", {
      signal,
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

    const vehicleConfig: VehicleConfiguration = {
      id: data.id,
      vehicleType: resolvedSlug,
      name: data.name,
      modelFile: {
        mediaId: data.modelFile?.media?.id || "",
        mediaUrl: data.modelFile?.media?.url || "",
        fallbackPath: data.modelFile?.fallbackPath || "",
      },
      scale: data.scale || { x: 1, y: 1, z: 1 },
      rotation: data.rotation || { x: 0, y: 0, z: 0 },
      cameraStart: data.cameraStart || { x: 8, y: 4, z: 12 },
      cameraZoomTarget: data.cameraZoomTarget || { x: 0, y: 0, z: 2 },
      zoomConfig: data.zoomConfig || { initialScale: 1, initialLookAtTarget: { x: 0, y: 0, z: 0 }, zoomLookAtTarget: { x: 0, y: 0, z: 0 }, zoomIntensity: 1 },
      showcaseEnabled: data.showcaseEnabled !== false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      showcaseWaypoints: (data.showcaseWaypoints || []).map((wp: any) => ({
        position: wp.position || { x: 0, y: 3, z: 10 },
        duration: wp.duration || 2,
        pause: wp.pause || 0,
      })),
      showcaseReturnDuration: data.showcaseReturnDuration || 2,
      isActive: data.isActive !== false,
    };

    return vehicleConfig;
  }, []);

  /**
   * Fetch brake configuration from CMS by vehicle type slug
   */
  const getBrakeConfiguration = useCallback(async (vehicleType: string, signal?: AbortSignal): Promise<BrakeConfiguration> => {
    const response = await instance.get("/brake-configurations", {
      signal,
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

    const brakeConfig: BrakeConfiguration = {
      id: data.id,
      vehicleType: resolvedSlug,
      name: data.name,
      modelFile: {
        mediaId: data.modelFile?.media?.id || "",
        mediaUrl: data.modelFile?.media?.url || "",
        fallbackPath: data.modelFile?.fallbackPath || "",
      },
      scale: data.scale || { x: 1, y: 1, z: 1 },
      rotation: data.rotation || { x: 0, y: 0, z: 0 },
      scaleConfig: data.scaleConfig || { transitionScale: 0.2, viewerScale: 0.2 },
      explosionHotspot: {
        position: data.explosionHotspot?.position || { x: 0, y: 0.5, z: 0 },
        color: data.explosionHotspot?.color || "#012e87",
        label: data.explosionHotspot?.label || "View Exploded",
        labelTranslations: data.explosionHotspot?.labelTranslations || [],
      },
      collapseHotspot: {
        position: data.collapseHotspot?.position || { x: 0, y: 0.8, z: 0 },
        color: data.collapseHotspot?.color || "#ef4444",
        label: data.collapseHotspot?.label || "Collapse View",
        labelTranslations: data.collapseHotspot?.labelTranslations || [],
      },
      media: {
        pdfMediaId: data.media?.pdf?.id || "",
        videoMediaId: data.media?.video?.id || "",
        pdfUrl: data.media?.pdf?.url || "",
        videoUrl: data.media?.video?.url || "",
        fallbackPdfPath: data.media?.fallbackPdfPath,
        fallbackVideoUrl: data.media?.fallbackVideoUrl,
      },
      overallInfo: (data.overallInfo?.title || data.overallInfo?.description) ? {
        title: data.overallInfo.title,
        titleTranslations: data.overallInfo.titleTranslations || [],
        description: data.overallInfo.description,
        descriptionTranslations: data.overallInfo.descriptionTranslations || [],
      } : undefined,
      isActive: data.isActive !== false,
    };

    return brakeConfig;
  }, []);

  /**
   * Fetch hotspot configuration from CMS by vehicle type slug
   */
  const getHotspotConfiguration = useCallback(async (vehicleType: string, signal?: AbortSignal): Promise<HotspotConfiguration> => {
    const response = await instance.get("/hotspot-configurations", {
      signal,
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

    const hotspotConfig: HotspotConfiguration = {
      id: data.id,
      vehicleType: resolvedSlug,
      defaults: data.defaults,
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
  }, []);

  /**
   * Fetch all active vehicle types from CMS
   */
  const getVehicleTypes = useCallback(async (signal?: AbortSignal): Promise<Array<{
    id: string;
    name: string;
    slug: string;
    description?: string;
    order: number;
    isActive: boolean;
  }>> => {
    try {
      const response = await instance.get("/vehicle-types", {
        signal,
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
