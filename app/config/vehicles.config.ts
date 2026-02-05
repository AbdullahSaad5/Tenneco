// ============================================================================
// Vehicle Configuration - Matches VehicleConfiguration interface from content.ts
// ============================================================================

import { VehicleConfiguration, VehicleType } from "../_types/content";

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
  position: { x: 0, y: 0, z: 0 },
  tirePosition: { x: -1.5, y: 0.4, z: 1.5 },
  cameraStart: { x: 8, y: 4, z: 12 },
  cameraZoomTarget: { x: 0, y: 0.9, z: 3.5 },
  zoomConfig: {
    initialScale: 1.0,
    initialLookAtTarget: { x: 0, y: 0, z: 0 },
    zoomLookAtTarget: { x: 1, y: 0, z: -4 },
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
  position: { x: 0, y: 0, z: 0 },
  tirePosition: { x: -2, y: 0.6, z: 2 },
  cameraStart: { x: 10, y: 5, z: 15 },
  cameraZoomTarget: { x: 0.5, y: 1.1, z: 4 },
  zoomConfig: {
    initialScale: 1.0,
    initialLookAtTarget: { x: 0, y: 0, z: 0 },
    zoomLookAtTarget: { x: 0, y: 0, z: 0 },
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
  position: { x: 0, y: 0, z: 0 },
  tirePosition: { x: -1.5, y: 0.5, z: 1.5 },
  cameraStart: { x: 12, y: 6, z: 18 },
  cameraZoomTarget: { x: 0, y: 1, z: 4 },
  zoomConfig: {
    initialScale: 1.0,
    initialLookAtTarget: { x: 0, y: 0, z: 0 },
    zoomLookAtTarget: { x: 0, y: -6, z: 1 },
    zoomIntensity: 1.0,
  },
  isActive: true,
};

/**
 * Vehicle configurations keyed by vehicle type
 */
export const VEHICLE_CONFIGS: Record<VehicleType, VehicleConfiguration> = {
  light: VEHICLE_CONFIG_LIGHT,
  commercial: VEHICLE_CONFIG_COMMERCIAL,
  rail: VEHICLE_CONFIG_RAIL,
};
