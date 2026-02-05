// ============================================================================
// Fallback Constants for Tenneco 3D Viewer
// These values serve as both fallbacks when CMS is unavailable and as seed data
// ============================================================================

import {
  HomepageContent,
  LoadingScreenContent,
  ZoomAnimationContent,
  ModelConfiguration,
  AppSettings,
  VehicleConfiguration,
  BrakeConfiguration,
  HotspotConfiguration,
  VehicleType,
} from "../_types/content";

// ----------------------------------------------------------------------------
// Homepage Fallback
// ----------------------------------------------------------------------------

export const FALLBACK_HOMEPAGE_CONTENT: HomepageContent = {
  id: "homepage-fallback",
  logo: {
    mediaId: "",
    alt: "Tenneco Logo",
    altTranslations: [
      { language: "it", value: "Logo Tenneco" },
    ],
    width: 180,
    height: 50,
    fallbackPath: "/tenneco-logo.png",
  },
  hero: {
    title: "Welcome to Tenneco Braking",
    titleTranslations: [
      { language: "it", value: "Benvenuti in Tenneco Braking" },
    ],
    subtitle: "Where advanced braking technology meets real world performance",
    subtitleTranslations: [
      { language: "it", value: "Dove la tecnologia avanzata dei freni incontra le prestazioni del mondo reale" },
    ],
    description:
      "We deliver one of the most comprehensive brake pad portfolios available, serving passenger cars, commercial vehicles and railway systems",
    descriptionTranslations: [
      { language: "it", value: "Offriamo uno dei portfolio più completi di pastiglie freno disponibili, al servizio di auto passeggeri, veicoli commerciali e sistemi ferroviari" },
    ],
  },
  section: {
    sectionTitle: "Select the mobility sector you want to explore",
    sectionTitleTranslations: [
      { language: "it", value: "Seleziona il settore di mobilità che vuoi esplorare" },
    ],
    sectionSubtitle: undefined,
  },
  vehicleCategories: [
    {
      id: "cat-light",
      vehicleType: "light",
      order: 1,
      title: "Light Vehicles",
      titleTranslations: [
        { language: "it", value: "Veicoli Leggeri" },
      ],
      subtitle: "Passenger Cars & Light-Duty Vehicles",
      subtitleTranslations: [
        { language: "it", value: "Auto Passeggeri e Veicoli Leggeri" },
      ],
      imageMediaId: "",
      gradient: {
        from: "blue-600",
        to: "cyan-500",
      },
      targetRoute: "/viewer?type=light",
      isEnabled: true,
    },
    {
      id: "cat-commercial",
      vehicleType: "commercial",
      order: 2,
      title: "Commercial Vehicles",
      titleTranslations: [
        { language: "it", value: "Veicoli Commerciali" },
      ],
      subtitle: "Trucks & Commercial Fleets",
      subtitleTranslations: [
        { language: "it", value: "Camion e Flotte Commerciali" },
      ],
      imageMediaId: "",
      gradient: {
        from: "orange-600",
        to: "red-500",
      },
      targetRoute: "/viewer?type=commercial",
      isEnabled: true,
    },
    {
      id: "cat-rail",
      vehicleType: "rail",
      order: 3,
      title: "Rail",
      titleTranslations: [
        { language: "it", value: "Ferroviario" },
      ],
      subtitle: "Railway & Mass Transit Systems",
      subtitleTranslations: [
        { language: "it", value: "Sistemi Ferroviari e di Trasporto di Massa" },
      ],
      imageMediaId: "",
      gradient: {
        from: "purple-600",
        to: "pink-500",
      },
      targetRoute: "/viewer?type=rail",
      isEnabled: true,
    },
  ],
};

// Fallback Unsplash images for vehicle categories
export const FALLBACK_VEHICLE_CATEGORY_IMAGES = {
  light: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&q=80",
  commercial: "https://images.unsplash.com/photo-1602721186896-1b21c7405c0b?w=800&q=80",
  rail: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&q=80",
};

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
// Zoom Animation Fallbacks
// ----------------------------------------------------------------------------

export const FALLBACK_ZOOM_ANIMATION_LIGHT: ZoomAnimationContent = {
  id: "zoom-light-fallback",
  vehicleType: "light",
  stages: [
    {
      order: 1,
      name: "vehicle",
      imageMediaId: "",
      title: "Light Vehicle Braking System",
      label: {
        text: "VEHICLE",
        subtext: "Initializing scan...",
        color: {
          primary: "#012e87",
          secondary: "#60a5fa",
        },
      },
      duration: 2000,
      effects: {
        scale: { from: 1.2, to: 1 },
        blur: { from: 0, to: 20 },
      },
    },
    {
      order: 2,
      name: "wheel",
      imageMediaId: "",
      title: "Light Vehicle Braking System",
      label: {
        text: "WHEEL SYSTEM",
        subtext: "Analyzing braking components...",
        color: {
          primary: "#012e87",
          secondary: "#22d3ee",
        },
      },
      duration: 2000,
      effects: {
        scale: { from: 4, to: 1 },
        blur: { from: 20, to: 0 },
      },
    },
    {
      order: 3,
      name: "brake",
      imageMediaId: "",
      title: "Light Vehicle Braking System",
      label: {
        text: "BRAKE DISC",
        subtext: "Friction surface analysis",
        color: {
          primary: "#012e87",
          secondary: "#fb923c",
        },
      },
      duration: 2000,
      effects: {
        scale: { from: 5, to: 1 },
        blur: { from: 30, to: 0 },
      },
    },
    {
      order: 4,
      name: "mechanism",
      imageMediaId: "",
      title: "Light Vehicle Braking System",
      label: {
        text: "BRAKE PAD",
        subtext: "Entering 3D Analysis Mode",
        color: {
          primary: "#012e87",
          secondary: "#a78bfa",
        },
      },
      duration: 2000,
      effects: {
        scale: { from: 8, to: 1 },
        blur: { from: 40, to: 0 },
      },
    },
  ],
};

export const FALLBACK_ZOOM_ANIMATION_COMMERCIAL: ZoomAnimationContent = {
  id: "zoom-commercial-fallback",
  vehicleType: "commercial",
  stages: [
    {
      order: 1,
      name: "vehicle",
      imageMediaId: "",
      title: "Commercial Vehicle Braking System",
      label: {
        text: "VEHICLE",
        subtext: "Initializing scan...",
        color: {
          primary: "#012e87",
          secondary: "#fb923c",
        },
      },
      duration: 2000,
      effects: {
        scale: { from: 1.2, to: 1 },
        blur: { from: 0, to: 20 },
      },
    },
    {
      order: 2,
      name: "wheel",
      imageMediaId: "",
      title: "Commercial Vehicle Braking System",
      label: {
        text: "WHEEL SYSTEM",
        subtext: "Analyzing braking components...",
        color: {
          primary: "#012e87",
          secondary: "#22d3ee",
        },
      },
      duration: 2000,
      effects: {
        scale: { from: 4, to: 1 },
        blur: { from: 20, to: 0 },
      },
    },
    {
      order: 3,
      name: "brake",
      imageMediaId: "",
      title: "Commercial Vehicle Braking System",
      label: {
        text: "BRAKE DISC",
        subtext: "Friction surface analysis",
        color: {
          primary: "#012e87",
          secondary: "#fb923c",
        },
      },
      duration: 2000,
      effects: {
        scale: { from: 5, to: 1 },
        blur: { from: 30, to: 0 },
      },
    },
    {
      order: 4,
      name: "mechanism",
      imageMediaId: "",
      title: "Commercial Vehicle Braking System",
      label: {
        text: "BRAKE PAD",
        subtext: "Entering 3D Analysis Mode",
        color: {
          primary: "#012e87",
          secondary: "#a78bfa",
        },
      },
      duration: 2000,
      effects: {
        scale: { from: 8, to: 1 },
        blur: { from: 40, to: 0 },
      },
    },
  ],
};

export const FALLBACK_ZOOM_ANIMATION_RAIL: ZoomAnimationContent = {
  id: "zoom-rail-fallback",
  vehicleType: "rail",
  stages: [
    {
      order: 1,
      name: "vehicle",
      imageMediaId: "",
      title: "Rail Braking System",
      label: {
        text: "VEHICLE",
        subtext: "Initializing scan...",
        color: {
          primary: "#012e87",
          secondary: "#c084fc",
        },
      },
      duration: 2000,
      effects: {
        scale: { from: 1.2, to: 1 },
        blur: { from: 0, to: 20 },
      },
    },
    {
      order: 2,
      name: "wheel",
      imageMediaId: "",
      title: "Rail Braking System",
      label: {
        text: "WHEEL SYSTEM",
        subtext: "Analyzing braking components...",
        color: {
          primary: "#012e87",
          secondary: "#22d3ee",
        },
      },
      duration: 2000,
      effects: {
        scale: { from: 4, to: 1 },
        blur: { from: 20, to: 0 },
      },
    },
    {
      order: 3,
      name: "brake",
      imageMediaId: "",
      title: "Rail Braking System",
      label: {
        text: "BRAKE DISC",
        subtext: "Friction surface analysis",
        color: {
          primary: "#012e87",
          secondary: "#fb923c",
        },
      },
      duration: 2000,
      effects: {
        scale: { from: 5, to: 1 },
        blur: { from: 30, to: 0 },
      },
    },
    {
      order: 4,
      name: "mechanism",
      imageMediaId: "",
      title: "Rail Braking System",
      label: {
        text: "BRAKE PAD",
        subtext: "Entering 3D Analysis Mode",
        color: {
          primary: "#012e87",
          secondary: "#a78bfa",
        },
      },
      duration: 2000,
      effects: {
        scale: { from: 8, to: 1 },
        blur: { from: 40, to: 0 },
      },
    },
  ],
};

// Fallback Unsplash images for zoom animations
export const FALLBACK_ZOOM_ANIMATION_IMAGES = {
  light: {
    vehicle: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=1920&q=90",
    wheel: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&q=90",
    brake: "https://images.unsplash.com/photo-1656232976683-7b688560e427?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    mechanism: "https://images.unsplash.com/photo-1656232976683-7b688560e427?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  commercial: {
    vehicle: "https://images.unsplash.com/photo-1602721186896-1b21c7405c0b?w=1920&q=90",
    wheel: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=90",
    brake: "https://images.unsplash.com/photo-1656232976683-7b688560e427?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    mechanism: "https://images.unsplash.com/photo-1656232976683-7b688560e427?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  rail: {
    vehicle: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1920&q=90",
    wheel: "https://images.unsplash.com/photo-1513363287815-e7a0eef0287c?w=1920&q=90",
    brake: "https://images.unsplash.com/photo-1656232976683-7b688560e427?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    mechanism: "https://images.unsplash.com/photo-1656232976683-7b688560e427?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
};

// ----------------------------------------------------------------------------
// Model Configuration Fallbacks
// ----------------------------------------------------------------------------

export const FALLBACK_MODEL_CONFIG_LV: ModelConfiguration = {
  id: "model-lv-fallback",
  modelType: "lv",
  modelFile: {
    mediaId: "",
    fallbackPath: "./models/lv_file.glb",
  },
  transform: {
    scale: 0.05,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    groundY: -2,
    groundOffset: 0.15,
  },
  hotspots: [
    {
      id: "hs-lv-pad",
      order: 1,
      position: { x: 0.75, y: 0, z: 7.5 },
      label: "Brake Pad Assembly",
      color: "#012e87",
      targetModel: "pad",
      action: {
        type: "navigate",
        payload: "pad",
      },
      isEnabled: true,
    },
    {
      id: "hs-lv-j4444",
      order: 2,
      position: { x: -0.85, y: 2.65, z: 8.5 },
      label: "J-4444 Component",
      color: "#012e87",
      targetModel: "j4444",
      action: {
        type: "navigate",
        payload: "j4444",
      },
      isEnabled: true,
    },
    {
      id: "hs-lv-asm",
      order: 3,
      position: { x: -0.85, y: -2.75, z: 5.75 },
      label: "ASM Assembly",
      color: "#012e87",
      targetModel: "asm",
      action: {
        type: "navigate",
        payload: "asm",
      },
      isEnabled: true,
    },
  ],
  info: {
    name: "Brake Pad System",
    description:
      "The brake pad is a key component of the braking system. When the driver presses the brake pedal, the brake pad is pushed against the brake disc. This contact creates friction, which slows down and stops the vehicle.",
    specs: [
      "Reliable in all driving conditions",
      "Critical for vehicle safety",
      "Optimized braking comfort",
      "Advanced noise control",
      "From everyday city traffic to emergency braking",
    ],
    color: {
      gradient: {
        from: "blue-500",
        to: "blue-600",
      },
      solid: "blue-600",
    },
  },
  media: {
    pdfMediaId: "",
    videoMediaId: "",
    fallbackPdfPath: "./assets/pdfs/Pads.pdf",
  },
  version: "1.0.0",
  isActive: true,
};

export const FALLBACK_MODEL_CONFIG_ASM: ModelConfiguration = {
  id: "model-asm-fallback",
  modelType: "asm",
  modelFile: {
    mediaId: "",
    fallbackPath: "./models/asm.glb",
  },
  transform: {
    scale: 0.01,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    groundY: -2,
    groundOffset: 0.15,
  },
  hotspots: [],
  info: {
    name: "Commercial Vehicle Braking",
    description:
      "Heavy-duty braking systems engineered for commercial vehicles and trucks. Designed to handle extreme loads and prolonged use in demanding conditions.",
    specs: [
      "High-performance materials",
      "Enhanced durability for heavy loads",
      "Extended service life",
      "Superior heat dissipation",
      "Optimized for fleet operations",
    ],
    color: {
      gradient: {
        from: "purple-500",
        to: "purple-600",
      },
      solid: "purple-600",
    },
  },
  media: {
    pdfMediaId: "",
    videoMediaId: "",
    fallbackPdfPath: "./assets/pdfs/Pads.pdf",
  },
  version: "1.0.0",
  isActive: true,
};

export const FALLBACK_MODEL_CONFIG_J4444: ModelConfiguration = {
  id: "model-j4444-fallback",
  modelType: "j4444",
  modelFile: {
    mediaId: "",
    fallbackPath: "./models/J-4444.glb",
  },
  transform: {
    scale: 0.025,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    groundY: -2,
    groundOffset: 0.15,
  },
  hotspots: [],
  info: {
    name: "J-4444 Brake Component",
    description:
      "Precision-engineered brake component designed for optimal performance in commercial applications.",
    specs: [
      "Advanced friction materials",
      "Consistent performance",
      "Reduced maintenance needs",
      "Heavy-duty construction",
      "Weather resistant design",
    ],
    color: {
      gradient: {
        from: "green-500",
        to: "green-600",
      },
      solid: "green-600",
    },
  },
  media: {
    pdfMediaId: "",
    videoMediaId: "",
    fallbackPdfPath: "./assets/pdfs/Pads.pdf",
  },
  version: "1.0.0",
  isActive: true,
};

export const FALLBACK_MODEL_CONFIG_PAD: ModelConfiguration = {
  id: "model-pad-fallback",
  modelType: "pad",
  modelFile: {
    mediaId: "",
    fallbackPath: "./models/pad.glb",
  },
  transform: {
    scale: 0.05,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    groundY: -2,
    groundOffset: 0.15,
  },
  hotspots: [],
  info: {
    name: "Rail Braking System",
    description:
      "Specialized braking pads designed for railway and mass transit applications. Engineered for maximum safety and reliability in high-speed rail operations.",
    specs: [
      "Maximum reliability standards",
      "Safety certified for rail systems",
      "All-weather performance",
      "Low noise operation",
      "Extended wear life",
    ],
    color: {
      gradient: {
        from: "orange-500",
        to: "orange-600",
      },
      solid: "orange-600",
    },
  },
  media: {
    pdfMediaId: "",
    videoMediaId: "",
    fallbackPdfPath: "./assets/pdfs/Pads.pdf",
  },
  version: "1.0.0",
  isActive: true,
};

// Consolidated model configs by type
export const FALLBACK_MODEL_CONFIGS = {
  lv: FALLBACK_MODEL_CONFIG_LV,
  asm: FALLBACK_MODEL_CONFIG_ASM,
  j4444: FALLBACK_MODEL_CONFIG_J4444,
  pad: FALLBACK_MODEL_CONFIG_PAD,
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

// ----------------------------------------------------------------------------
// Consolidated Exports
// ----------------------------------------------------------------------------

export const FALLBACK_ZOOM_ANIMATIONS = {
  light: FALLBACK_ZOOM_ANIMATION_LIGHT,
  commercial: FALLBACK_ZOOM_ANIMATION_COMMERCIAL,
  rail: FALLBACK_ZOOM_ANIMATION_RAIL,
};

// ----------------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------------

/**
 * Get fallback model configuration by type
 */
export function getFallbackModelConfig(
  modelType: "lv" | "asm" | "j4444" | "pad"
): ModelConfiguration {
  return FALLBACK_MODEL_CONFIGS[modelType];
}

/**
 * Get fallback zoom animation by vehicle type
 */
export function getFallbackZoomAnimation(
  vehicleType: "light" | "commercial" | "rail"
): ZoomAnimationContent {
  return FALLBACK_ZOOM_ANIMATIONS[vehicleType];
}

// ----------------------------------------------------------------------------
// Vehicle Configuration Fallbacks (keyed by vehicleType)
// ----------------------------------------------------------------------------

export const FALLBACK_VEHICLE_CONFIG_LIGHT: VehicleConfiguration = {
  id: "vehicle-light-fallback",
  vehicleType: "light",
  name: "Light Vehicle",
  modelFile: {
    mediaId: "",
    fallbackPath: "./models/lv_file.glb",
  },
  scale: { x: 0.05, y: 0.05, z: 0.05 },
  rotation: { x: 0, y: 0, z: 0 },
  position: { x: 0, y: 0, z: 0 },
  tirePosition: { x: 0.75, y: 0, z: 7.5 },
  cameraStart: { x: 0, y: 2, z: 10 },
  cameraZoomTarget: { x: 0.75, y: 0, z: 3 },
  zoomConfig: {
    initialScale: 1,
    initialLookAtTarget: { x: 0, y: 0, z: 0 },
    zoomLookAtTarget: { x: 0.75, y: 0, z: 7.5 },
    zoomIntensity: 1.5,
  },
  isActive: true,
};

export const FALLBACK_VEHICLE_CONFIG_COMMERCIAL: VehicleConfiguration = {
  id: "vehicle-commercial-fallback",
  vehicleType: "commercial",
  name: "Commercial Vehicle",
  modelFile: {
    mediaId: "",
    fallbackPath: "./models/commercial_vehicle.glb",
  },
  scale: { x: 0.03, y: 0.03, z: 0.03 },
  rotation: { x: 0, y: 0, z: 0 },
  position: { x: 0, y: 0, z: 0 },
  tirePosition: { x: 1.5, y: 0, z: 5 },
  cameraStart: { x: 0, y: 3, z: 12 },
  cameraZoomTarget: { x: 1.5, y: 0, z: 4 },
  zoomConfig: {
    initialScale: 1,
    initialLookAtTarget: { x: 0, y: 0, z: 0 },
    zoomLookAtTarget: { x: 1.5, y: 0, z: 5 },
    zoomIntensity: 1.2,
  },
  isActive: true,
};

export const FALLBACK_VEHICLE_CONFIG_RAIL: VehicleConfiguration = {
  id: "vehicle-rail-fallback",
  vehicleType: "rail",
  name: "Rail Vehicle",
  modelFile: {
    mediaId: "",
    fallbackPath: "./models/rail_vehicle.glb",
  },
  scale: { x: 0.02, y: 0.02, z: 0.02 },
  rotation: { x: 0, y: 0, z: 0 },
  position: { x: 0, y: 0, z: 0 },
  tirePosition: { x: 0, y: 0, z: 3 },
  cameraStart: { x: 0, y: 4, z: 15 },
  cameraZoomTarget: { x: 0, y: 0, z: 5 },
  zoomConfig: {
    initialScale: 1,
    initialLookAtTarget: { x: 0, y: 0, z: 0 },
    zoomLookAtTarget: { x: 0, y: 0, z: 3 },
    zoomIntensity: 1.0,
  },
  isActive: true,
};

export const FALLBACK_VEHICLE_CONFIGS: Record<VehicleType, VehicleConfiguration> = {
  light: FALLBACK_VEHICLE_CONFIG_LIGHT,
  commercial: FALLBACK_VEHICLE_CONFIG_COMMERCIAL,
  rail: FALLBACK_VEHICLE_CONFIG_RAIL,
};

// ----------------------------------------------------------------------------
// Brake Configuration Fallbacks (keyed by vehicleType)
// ----------------------------------------------------------------------------

export const FALLBACK_BRAKE_CONFIG_LIGHT: BrakeConfiguration = {
  id: "brake-light-fallback",
  vehicleType: "light",
  name: "Light Vehicle Brake Assembly",
  modelFile: {
    mediaId: "",
    fallbackPath: "./models/asm.glb",
  },
  scale: { x: 0.01, y: 0.01, z: 0.01 },
  rotation: { x: 0, y: 0, z: 0 },
  position: { x: 0, y: 0, z: 0 },
  centerModel: true,
  scaleConfig: {
    transitionScale: 0.8,
    viewerScale: 1,
  },
  explosionHotspot: {
    position: { x: 0, y: 0.5, z: 0 },
    color: "#3b82f6",
    label: "Explode View",
    labelTranslations: [
      { language: "it", value: "Vista Esplosa" },
    ],
  },
  media: {
    fallbackPdfPath: "./assets/pdfs/Pads.pdf",
  },
  isActive: true,
};

export const FALLBACK_BRAKE_CONFIG_COMMERCIAL: BrakeConfiguration = {
  id: "brake-commercial-fallback",
  vehicleType: "commercial",
  name: "Commercial Vehicle Brake Assembly",
  modelFile: {
    mediaId: "",
    fallbackPath: "./models/commercial_brake.glb",
  },
  scale: { x: 0.008, y: 0.008, z: 0.008 },
  rotation: { x: 0, y: 0, z: 0 },
  position: { x: 0, y: 0, z: 0 },
  centerModel: true,
  scaleConfig: {
    transitionScale: 0.7,
    viewerScale: 1,
  },
  explosionHotspot: {
    position: { x: 0, y: 0.6, z: 0 },
    color: "#f97316",
    label: "Explode View",
    labelTranslations: [
      { language: "it", value: "Vista Esplosa" },
    ],
  },
  media: {
    fallbackPdfPath: "./assets/pdfs/Pads.pdf",
  },
  isActive: true,
};

export const FALLBACK_BRAKE_CONFIG_RAIL: BrakeConfiguration = {
  id: "brake-rail-fallback",
  vehicleType: "rail",
  name: "Rail Brake Assembly",
  modelFile: {
    mediaId: "",
    fallbackPath: "./models/rail_brake.glb",
  },
  scale: { x: 0.015, y: 0.015, z: 0.015 },
  rotation: { x: 0, y: 0, z: 0 },
  position: { x: 0, y: 0, z: 0 },
  centerModel: true,
  scaleConfig: {
    transitionScale: 0.75,
    viewerScale: 1,
  },
  explosionHotspot: {
    position: { x: 0, y: 0.7, z: 0 },
    color: "#a855f7",
    label: "Explode View",
    labelTranslations: [
      { language: "it", value: "Vista Esplosa" },
    ],
  },
  media: {
    fallbackPdfPath: "./assets/pdfs/Pads.pdf",
  },
  isActive: true,
};

export const FALLBACK_BRAKE_CONFIGS: Record<VehicleType, BrakeConfiguration> = {
  light: FALLBACK_BRAKE_CONFIG_LIGHT,
  commercial: FALLBACK_BRAKE_CONFIG_COMMERCIAL,
  rail: FALLBACK_BRAKE_CONFIG_RAIL,
};

// ----------------------------------------------------------------------------
// Hotspot Configuration Fallbacks (keyed by vehicleType)
// ----------------------------------------------------------------------------

export const FALLBACK_HOTSPOT_CONFIG_LIGHT: HotspotConfiguration = {
  id: "hotspot-light-fallback",
  vehicleType: "light",
  defaults: {
    pdf: "./assets/pdfs/Pads.pdf",
  },
  hotspots: [
    {
      hotspotId: "brake-pad",
      label: "Brake Pad Assembly",
      labelTranslations: [
        { language: "it", value: "Assemblaggio Pastiglia Freno" },
      ],
      position: { x: 0.75, y: 0, z: 7.5 },
      color: "#012e87",
      targetModel: "pad",
      isEnabled: true,
      info: {
        title: "Brake Pad",
        titleTranslations: [
          { language: "it", value: "Pastiglia Freno" },
        ],
        description: "High-performance brake pad designed for optimal stopping power.",
        descriptionTranslations: [
          { language: "it", value: "Pastiglia freno ad alte prestazioni progettata per una potenza di arresto ottimale." },
        ],
      },
    },
    {
      hotspotId: "j4444-component",
      label: "J-4444 Component",
      labelTranslations: [
        { language: "it", value: "Componente J-4444" },
      ],
      position: { x: -0.85, y: 2.65, z: 8.5 },
      color: "#012e87",
      targetModel: "j4444",
      isEnabled: true,
      info: {
        title: "J-4444 Component",
        titleTranslations: [
          { language: "it", value: "Componente J-4444" },
        ],
        description: "Precision-engineered brake component for commercial applications.",
        descriptionTranslations: [
          { language: "it", value: "Componente freno di precisione per applicazioni commerciali." },
        ],
      },
    },
    {
      hotspotId: "asm-assembly",
      label: "ASM Assembly",
      labelTranslations: [
        { language: "it", value: "Assemblaggio ASM" },
      ],
      position: { x: -0.85, y: -2.75, z: 5.75 },
      color: "#012e87",
      targetModel: "asm",
      isEnabled: true,
      info: {
        title: "ASM Assembly",
        titleTranslations: [
          { language: "it", value: "Assemblaggio ASM" },
        ],
        description: "Complete brake assembly system for light vehicles.",
        descriptionTranslations: [
          { language: "it", value: "Sistema di assemblaggio freni completo per veicoli leggeri." },
        ],
      },
    },
  ],
};

export const FALLBACK_HOTSPOT_CONFIG_COMMERCIAL: HotspotConfiguration = {
  id: "hotspot-commercial-fallback",
  vehicleType: "commercial",
  defaults: {
    pdf: "./assets/pdfs/Pads.pdf",
  },
  hotspots: [
    {
      hotspotId: "brake-pad",
      label: "Commercial Brake Pad",
      labelTranslations: [
        { language: "it", value: "Pastiglia Freno Commerciale" },
      ],
      position: { x: 1.5, y: 0, z: 5 },
      color: "#f97316",
      targetModel: "pad",
      isEnabled: true,
      info: {
        title: "Commercial Brake Pad",
        titleTranslations: [
          { language: "it", value: "Pastiglia Freno Commerciale" },
        ],
        description: "Heavy-duty brake pad for commercial vehicles.",
        descriptionTranslations: [
          { language: "it", value: "Pastiglia freno per carichi pesanti per veicoli commerciali." },
        ],
      },
    },
  ],
};

export const FALLBACK_HOTSPOT_CONFIG_RAIL: HotspotConfiguration = {
  id: "hotspot-rail-fallback",
  vehicleType: "rail",
  defaults: {
    pdf: "./assets/pdfs/Pads.pdf",
  },
  hotspots: [
    {
      hotspotId: "brake-pad",
      label: "Rail Brake Pad",
      labelTranslations: [
        { language: "it", value: "Pastiglia Freno Ferroviario" },
      ],
      position: { x: 0, y: 0, z: 3 },
      color: "#a855f7",
      targetModel: "pad",
      isEnabled: true,
      info: {
        title: "Rail Brake Pad",
        titleTranslations: [
          { language: "it", value: "Pastiglia Freno Ferroviario" },
        ],
        description: "Specialized brake pad for railway systems.",
        descriptionTranslations: [
          { language: "it", value: "Pastiglia freno specializzata per sistemi ferroviari." },
        ],
      },
    },
  ],
};

export const FALLBACK_HOTSPOT_CONFIGS: Record<VehicleType, HotspotConfiguration> = {
  light: FALLBACK_HOTSPOT_CONFIG_LIGHT,
  commercial: FALLBACK_HOTSPOT_CONFIG_COMMERCIAL,
  rail: FALLBACK_HOTSPOT_CONFIG_RAIL,
};

// ----------------------------------------------------------------------------
// Helper Functions for New Configurations
// ----------------------------------------------------------------------------

/**
 * Get fallback vehicle configuration by vehicle type
 */
export function getFallbackVehicleConfig(vehicleType: VehicleType): VehicleConfiguration {
  return FALLBACK_VEHICLE_CONFIGS[vehicleType];
}

/**
 * Get fallback brake configuration by vehicle type
 */
export function getFallbackBrakeConfig(vehicleType: VehicleType): BrakeConfiguration {
  return FALLBACK_BRAKE_CONFIGS[vehicleType];
}

/**
 * Get fallback hotspot configuration by vehicle type
 */
export function getFallbackHotspotConfig(vehicleType: VehicleType): HotspotConfiguration {
  return FALLBACK_HOTSPOT_CONFIGS[vehicleType];
}
