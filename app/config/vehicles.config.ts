// ============================================================================
// Vehicle Configuration - Matches VehicleConfiguration interface from content.ts
// ============================================================================

import { VehicleConfiguration } from "../_types/content";

/**
 * Light vehicle configuration
 */
export const VEHICLE_CONFIG_LIGHT: VehicleConfiguration = {
  id: "vehicle-light-static",
  vehicleType: "light",
  name: "Light Vehicles",
  modelFile: {
    mediaId: "",
    fallbackPath: "./models/vehicles/Light vehicles - Vehicle.glb",
  },
  scale: { x: 1, y: 1, z: 1 },
  rotation: { x: 0, y: 0, z: 0 },
  cameraStart: { x: 8, y: 4, z: 12 },
  cameraZoomTarget: { x: 1.51, y: -0.24, z: 2.29 },
  zoomConfig: {
    initialScale: 1.0,
    initialLookAtTarget: { x: 0, y: 0, z: 0 },
    zoomLookAtTarget: { x: 0.87, y: -0.17, z: 1.21 },
    zoomIntensity: 1.0,
  },
  isActive: true,
};

/**
 * Commercial vehicle configuration
 */
export const VEHICLE_CONFIG_COMMERCIAL: VehicleConfiguration = {
  id: "vehicle-commercial-static",
  vehicleType: "commercial",
  name: "Commercial Vehicles",
  modelFile: {
    mediaId: "",
    fallbackPath: "./models/vehicles/Commercial vehicles - Vehicle.glb",
  },
  scale: { x: 1, y: 1, z: 1 },
  rotation: { x: 0, y: 0, z: 0 },
  cameraStart: { x: 10, y: 5, z: 15 },
  cameraZoomTarget: { x: 2.21, y: 0.26, z: 3.87 },
  zoomConfig: {
    initialScale: 1.0,
    initialLookAtTarget: { x: 0, y: 0, z: 0 },
    zoomLookAtTarget: { x: 0.8, y: -0.12, z: 0.174 },
    zoomIntensity: 1.0,
  },
  isActive: true,
};

/**
 * Rail vehicle configuration
 */
export const VEHICLE_CONFIG_RAIL: VehicleConfiguration = {
  id: "vehicle-rail-static",
  vehicleType: "rail",
  name: "Rail",
  modelFile: {
    mediaId: "",
    fallbackPath: "./models/vehicles/Rails - Vehicle.glb",
  },
  scale: { x: 1, y: 1, z: 1 },
  rotation: { x: 0, y: 0, z: 0 },
  cameraStart: { x: 12, y: 6, z: 18 },
  cameraZoomTarget: { x: 1.15, y: -0.2, z: 2.11 },
  zoomConfig: {
    initialScale: 1.0,
    initialLookAtTarget: { x: 0, y: 0, z: 0 },
    zoomLookAtTarget: { x: 0.26, y: -0.36, z: 0.81 },
    zoomIntensity: 1.0,
  },
  isActive: true,
};

/**
 * Vehicle configurations keyed by vehicle type
 */
export const VEHICLE_CONFIGS: Record<string, VehicleConfiguration> = {
  light: VEHICLE_CONFIG_LIGHT,
  commercial: VEHICLE_CONFIG_COMMERCIAL,
  rail: VEHICLE_CONFIG_RAIL,
};
