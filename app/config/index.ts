// Static configuration imports
import vehiclesConfig from './vehicles.json';
import brakesConfig from './brakes.json';
import hotspotsConfig from './hotspots.json';
import transitionConfig from './transition.json';
import homepageConfig from './homepage.json';
import viewerConfig from './viewer.json';

// Types
export type VehicleType = 'light' | 'commercial' | 'rail';

export interface Vector3Config {
  x: number;
  y: number;
  z: number;
}

export interface VehicleConfig {
  name: string;
  modelPath: string;
  scale: number;
  rotation: Vector3Config;
  position: Vector3Config;
  tirePosition: Vector3Config;
  cameraStart: Vector3Config;
  cameraZoomTarget: Vector3Config;
}

export interface BrakeConfig {
  name: string;
  modelPath: string;
  scale: number;
  rotation: Vector3Config;
  position: Vector3Config;
  centerModel: boolean;
}

export interface HotspotConfig {
  id: string;
  label: string;
  position: Vector3Config;
  color: string;
  isEnabled: boolean;
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

export interface HomepageCategory {
  id: string;
  vehicleType: VehicleType;
  title: string;
  subtitle: string;
  image: string;
  gradient: {
    from: string;
    to: string;
  };
  isEnabled: boolean;
  order: number;
}

export interface HomepageConfig {
  logo: {
    path: string;
    alt: string;
    width: number;
    height: number;
  };
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  sectionTitle: string;
  sectionSubtitle: string;
  categories: HomepageCategory[];
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

// Export typed configs
export const vehicles = vehiclesConfig as Record<VehicleType, VehicleConfig>;
export const brakes = brakesConfig as Record<VehicleType, BrakeConfig>;
export const hotspots = hotspotsConfig as Record<VehicleType, HotspotConfig[]>;
export const transition = transitionConfig as TransitionConfig;
export const homepage = homepageConfig as HomepageConfig;
export const viewer = viewerConfig as ViewerConfig;

// Helper to get all model paths for preloading
export function getAllModelPaths(): string[] {
  const paths: string[] = [];

  // Vehicle models
  Object.values(vehicles).forEach(v => paths.push(v.modelPath));

  // Brake models
  Object.values(brakes).forEach(b => paths.push(b.modelPath));

  return paths;
}
