// ============================================================================
// Brake Configuration - Matches BrakeConfiguration interface from content.ts
// ============================================================================

import { BrakeConfiguration } from "../_types/content";

/**
 * Light vehicle brake configuration
 */
export const BRAKE_CONFIG_LIGHT: BrakeConfiguration = {
  id: "brake-light-static",
  vehicleType: "light",
  name: "Light Vehicle Brake",
  modelFile: {
    mediaId: "",
    fallbackPath: "./models/brakes/Light vehicles - Brake.glb",
  },
  scale: { x: 1, y: 1, z: 1 },
  rotation: { x: 0, y: 0, z: 0 },
  scaleConfig: {
    transitionScale: 0.2,
    viewerScale: 0.2,
  },
  explosionHotspot: {
    position: { x: 0, y: 0.5, z: 0 },
    color: "#012e87",
    label: "View Exploded",
    labelTranslations: [
      { language: "it", value: "Vista Esplosa" },
    ],
  },
  collapseHotspot: {
    position: { x: 0, y: 0.8, z: 0 },
    color: "#ef4444",
    label: "Collapse View",
    labelTranslations: [
      { language: "it", value: "Vista Compressa" },
    ],
  },
  media: {
    fallbackPdfPath: "./assets/pdfs/Pads.pdf",
  },
  isActive: true,
};

/**
 * Commercial vehicle brake configuration
 */
export const BRAKE_CONFIG_COMMERCIAL: BrakeConfiguration = {
  id: "brake-commercial-static",
  vehicleType: "commercial",
  name: "Commercial Vehicle Brake",
  modelFile: {
    mediaId: "",
    fallbackPath: "./models/brakes/Commercial vehicles - Brake.glb",
  },
  scale: { x: 1, y: 1, z: 1 },
  rotation: { x: 0, y: 0, z: 0 },
  scaleConfig: {
    transitionScale: 0.2,
    viewerScale: 0.2,
  },
  explosionHotspot: {
    position: { x: 0, y: 0.75, z: 0 },
    color: "#012e87",
    label: "View Exploded",
    labelTranslations: [
      { language: "it", value: "Vista Esplosa" },
    ],
  },
  collapseHotspot: {
    position: { x: 0, y: 1, z: 0 },
    color: "#ef4444",
    label: "Collapse View",
    labelTranslations: [
      { language: "it", value: "Vista Compressa" },
    ],
  },
  media: {
    fallbackPdfPath: "./assets/pdfs/Pads.pdf",
  },
  isActive: true,
};

/**
 * Rail brake configuration
 */
export const BRAKE_CONFIG_RAIL: BrakeConfiguration = {
  id: "brake-rail-static",
  vehicleType: "rail",
  name: "Rail Brake",
  modelFile: {
    mediaId: "",
    fallbackPath: "./models/brakes/Rails - Brake.glb",
  },
  scale: { x: 1, y: 1, z: 1 },
  rotation: { x: 0, y: 0, z: 0 },
  scaleConfig: {
    transitionScale: 0.2,
    viewerScale: 0.2,
  },
  explosionHotspot: {
    position: { x: 0, y: 1, z: 0 },
    color: "#012e87",
    label: "View Exploded",
    labelTranslations: [
      { language: "it", value: "Vista Esplosa" },
    ],
  },
  collapseHotspot: {
    position: { x: 0, y: 1.2, z: 0 },
    color: "#ef4444",
    label: "Collapse View",
    labelTranslations: [
      { language: "it", value: "Vista Compressa" },
    ],
  },
  media: {
    fallbackPdfPath: "./assets/pdfs/Pads.pdf",
  },
  isActive: true,
};

/**
 * Brake configurations keyed by vehicle type
 */
export const BRAKE_CONFIGS: Record<string, BrakeConfiguration> = {
  light: BRAKE_CONFIG_LIGHT,
  commercial: BRAKE_CONFIG_COMMERCIAL,
  rail: BRAKE_CONFIG_RAIL,
};
