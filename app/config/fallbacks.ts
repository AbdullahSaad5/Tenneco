// ============================================================================
// Fallback Constants for Tenneco 3D Viewer
// These values serve as both fallbacks when CMS is unavailable and as seed data
// ============================================================================

import {
  AppSettings,
  LoadingScreenContent,
} from "../_types/content";

// Import from new CMS-structured config files
import { HOMEPAGE_CONFIG, CATEGORY_FALLBACK_IMAGES } from "./homepage.config";
import { VEHICLE_CONFIGS } from "./vehicles.config";
import { BRAKE_CONFIGS } from "./brakes.config";
import { HOTSPOT_CONFIGS } from "./hotspots.config";

// ----------------------------------------------------------------------------
// Re-export config files as fallbacks
// ----------------------------------------------------------------------------

export const FALLBACK_HOMEPAGE_CONTENT = HOMEPAGE_CONFIG;
export const FALLBACK_VEHICLE_CATEGORY_IMAGES = CATEGORY_FALLBACK_IMAGES;
export const FALLBACK_VEHICLE_CONFIGS = VEHICLE_CONFIGS;
export const FALLBACK_BRAKE_CONFIGS = BRAKE_CONFIGS;
export const FALLBACK_HOTSPOT_CONFIGS = HOTSPOT_CONFIGS;

// ----------------------------------------------------------------------------
// Loading Screen Fallback
// ----------------------------------------------------------------------------

export const FALLBACK_LOADING_SCREEN: LoadingScreenContent = {
  id: "loading-fallback",
  logoType: "svg",
  svgPath:
    "M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z",
  title: "Tenneco 3D Viewer",
  titleTranslations: [
    { language: "it", value: "Visualizzatore 3D Tenneco" },
  ],
  subtitle: "Loading 3D models...",
  subtitleTranslations: [
    { language: "it", value: "Caricamento modelli 3D..." },
  ],
  animation: {
    colors: {
      primary: "#012e87",
      secondary: "#0ea5e9",
    },
    duration: 2000,
  },
};

// ----------------------------------------------------------------------------
// App Settings Fallback
// ----------------------------------------------------------------------------

export const FALLBACK_APP_SETTINGS: AppSettings = {
  id: "settings-fallback",
  branding: {
    primaryLogo: {
      mediaId: "",
      alt: "Tenneco Logo",
      width: 180,
      height: 50,
      fallbackPath: "/tenneco-logo.png",
    },
    colorPalette: {
      primary: "#012e87",
      secondary: "#0ea5e9",
      accent: "#012e87",
      background: "#0f172a",
      text: "#ffffff",
    },
  },
  features: {
    enableHomepage: true,
    enableAnimations: true,
    enableModelInfo: true,
    enableHotspots: true,
    enableVideoModal: true,
    enablePdfModal: true,
  },
  defaults: {
    defaultModelType: "lv",
    fallbackVideoUrl: "",
    fallbackPdfPath: "./assets/pdfs/Pads.pdf",
  },
  environment: {
    version: "1.0.0",
    lastUpdated: new Date().toISOString(),
  },
};
