// ============================================================================
// Config Index - Scene-specific configs only
// Vehicle, brake, and hotspot configs now come from ContentProvider
// ============================================================================

// Scene rendering settings (no CMS equivalent)
import viewerConfig from './viewer.json';
import transitionConfig from './transition.json';

// Types from old config (keeping for backward compatibility during transition)
export type VehicleType = string;

export interface Vector3Config {
  x: number;
  y: number;
  z: number;
}

export interface TransitionConfig {
  timing: {
    fadeInDuration: number;
    showVehicleDuration: number;
    zoomDuration: number;
    transitionDuration: number;
    showBrakeDuration: number;
  };
  camera: {
    fov: number;
    brakeViewPosition: Vector3Config;
    brakeViewTarget: Vector3Config;
  };
  effects: {
    fogNear: number;
    fogFar: number;
    backgroundColor: string;
    ambientLightIntensity: number;
    directionalLightIntensity: number;
    spotLightIntensity: number;
  };
}

export interface ViewerConfig {
  scene: {
    backgroundColor: string;
    fogColor: string;
    fogNear: number;
    fogFar: number;
    gridSize: number;
    gridDivisions: number;
    gridColor1: string;
    gridColor2: string;
  };
  camera: {
    fov: number;
    position: Vector3Config;
    target: Vector3Config;
    zoomFactor: number;
    maxDistance: number;
    minDistance: number;
  };
  lighting: {
    ambient: { intensity: number };
    directional1: { position: Vector3Config; intensity: number };
    directional2: { position: Vector3Config; intensity: number };
    spot: { position: Vector3Config; intensity: number; angle: number };
    hemisphere: { groundColor: string; intensity: number };
  };
  float: {
    speed: number;
    rotationIntensity: number;
    floatIntensity: number;
    floatingRange: [number, number];
  };
  postProcessing: {
    bloom: { luminanceThreshold: number; luminanceSmoothing: number; intensity: number };
    vignette: { offset: number; darkness: number };
  };
  controls: {
    enableDamping: boolean;
    dampingFactor: number;
    rotateSpeed: number;
    zoomSpeed: number;
    minPolarAngle: number;
    maxPolarAngle: number;
  };
}

// Export typed scene configs (these don't have CMS equivalents)
export const transition = transitionConfig as TransitionConfig;
export const viewer = viewerConfig as ViewerConfig;

