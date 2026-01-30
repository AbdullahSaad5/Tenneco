"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, PerspectiveCamera, ContactShadows } from "@react-three/drei";
import { Suspense, useRef, useState, useEffect, useMemo } from "react";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { vehicles, brakes, transition, viewer, VehicleType } from "../../config";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

interface VehicleZoomTransitionProps {
  vehicleType: VehicleType;
  onComplete: () => void;
}

interface VehicleModelProps {
  vehicleType: VehicleType;
  opacity: number;
  blueTransitionProgress?: number; // 0 = normal, 1 = fully blue
}

const VehicleModel = ({ vehicleType, opacity, blueTransitionProgress = 0 }: VehicleModelProps) => {
  const config = vehicles[vehicleType];
  const { scene } = useGLTF(config.modelPath);
  const groupRef = useRef<THREE.Group>(null);

  // Use initialScale from zoomConfig
  const modelScale = config.zoomConfig.initialScale * config.scale;

  // Store original material properties
  const originalMaterials = useRef<Map<THREE.Material, {
    color: THREE.Color;
    metalness: number;
    roughness: number;
    emissive: THREE.Color;
    emissiveIntensity: number;
  }>>(new Map());

  // Clone and calculate offset synchronously
  const { clonedScene, centerOffset } = useMemo(() => {
    // Use SkeletonUtils.clone for proper animation and hierarchy support
    const cloned = clone(scene) as THREE.Group;

    // Clone materials to prevent mutation of cached GLTF materials
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          // Clone the material so we don't mutate the cached original
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map(mat => mat.clone());
          } else {
            mesh.material = mesh.material.clone();
          }

          // Store original material properties from the cloned material
          if ((mesh.material as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
            const stdMat = mesh.material as THREE.MeshStandardMaterial;
            originalMaterials.current.set(stdMat, {
              color: stdMat.color.clone(),
              metalness: stdMat.metalness,
              roughness: stdMat.roughness,
              emissive: stdMat.emissive.clone(),
              emissiveIntensity: stdMat.emissiveIntensity,
            });
          }
        }
      }
    });

    // Calculate center BEFORE scaling (use original size for offset calculation)
    const box = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const minY = box.min.y;

    // Calculate offset and scale it appropriately
    const offset = center.clone().negate().multiplyScalar(modelScale);
    offset.y = (-minY - 0.5) * modelScale; // Position on ground, scaled

    return { clonedScene: cloned, centerOffset: offset };
  }, [scene, modelScale]);

  // Initialize materials on mount - ensure original appearance first
  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material && (mesh.material as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
          const stdMat = mesh.material as THREE.MeshStandardMaterial;
          const original = originalMaterials.current.get(stdMat);

          if (original) {
            // Explicitly restore original colors on mount
            stdMat.color.copy(original.color);
            stdMat.metalness = Math.min(original.metalness, 0.3);
            stdMat.roughness = Math.max(original.roughness, 0.7);
            stdMat.emissiveIntensity = 0;
            stdMat.emissive.set(0x000000);
          }

          stdMat.transparent = true;
          stdMat.needsUpdate = true;
        }
      }
    });
  }, [clonedScene]);

  // Update opacity and material properties with smooth transitions
  useEffect(() => {
    const blueColor = new THREE.Color(0x5BA3F5);
    const blueEmissive = new THREE.Color(0x3A80D5);
    const blackEmissive = new THREE.Color(0x000000);

    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const material = mesh.material as THREE.Material;
          material.transparent = true;
          material.opacity = opacity;

          // Smoothly interpolate material properties based on transition progress
          if ((material as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
            const stdMat = material as THREE.MeshStandardMaterial;
            const original = originalMaterials.current.get(stdMat);

            if (original) {
              // Interpolate color from original to blue
              stdMat.color.lerpColors(original.color, blueColor, blueTransitionProgress);

              // Interpolate metalness
              const targetMetalness = blueTransitionProgress > 0 ? 0.3 : Math.min(original.metalness, 0.3);
              stdMat.metalness = THREE.MathUtils.lerp(Math.min(original.metalness, 0.3), targetMetalness, blueTransitionProgress);

              // Interpolate roughness
              const targetRoughness = blueTransitionProgress > 0 ? 0.5 : Math.max(original.roughness, 0.7);
              stdMat.roughness = THREE.MathUtils.lerp(Math.max(original.roughness, 0.7), targetRoughness, blueTransitionProgress);

              // Interpolate emissive
              stdMat.emissive.lerpColors(blackEmissive, blueEmissive, blueTransitionProgress);
              stdMat.emissiveIntensity = THREE.MathUtils.lerp(0, 0.4, blueTransitionProgress);
            }
          }

          material.needsUpdate = true;
        }
      }
    });
  }, [clonedScene, opacity, blueTransitionProgress]);

  return (
    <group
      ref={groupRef}
      position={[centerOffset.x, centerOffset.y, centerOffset.z]}
      scale={[modelScale, modelScale, modelScale]}
    >
      <primitive
        object={clonedScene}
        rotation={[config.rotation.x, config.rotation.y, config.rotation.z]}
      />
    </group>
  );
};

interface BrakeModelProps {
  vehicleType: VehicleType;
  opacity: number;
}

const BrakeTransitionModel = ({ vehicleType, opacity }: BrakeModelProps) => {
  const config = brakes[vehicleType];

  // Debug: Log entire config on mount
  useEffect(() => {
    console.log('[BrakeTransitionModel] Full config:', config);
  }, [config]);

  const { scene } = useGLTF(config.modelPath);
  const groupRef = useRef<THREE.Group>(null);

  // Use transitionScale from scaleConfig
  const brakeScale = config.scaleConfig.transitionScale * config.scale;

  // Clone and calculate offset synchronously
  const { clonedScene, centerOffset } = useMemo(() => {
    // Use SkeletonUtils.clone for proper animation and hierarchy support
    const cloned = clone(scene) as THREE.Group;

    // Calculate center BEFORE scaling (use original size for offset calculation)
    const box = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Calculate offset to center the brake model at origin (0, 0, 0)
    // Scale the offset by brakeScale so it works with the scaled model
    const offset = center.clone().negate().multiplyScalar(brakeScale);

    return { clonedScene: cloned, centerOffset: offset };
  }, [scene, brakeScale]);

  // Update opacity
  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const material = mesh.material as THREE.Material;
          material.transparent = true;
          material.opacity = opacity;
          material.needsUpdate = true;
        }
      }
    });
  }, [clonedScene, opacity]);

  // Debug logging
  console.log('[BrakeTransitionModel]', {
    vehicleType,
    transitionScale: config.scaleConfig.transitionScale,
    baseScale: config.scale,
    finalScale: brakeScale
  });

  return (
    <group
      ref={groupRef}
      position={[centerOffset.x, centerOffset.y, centerOffset.z]}
      scale={[brakeScale, brakeScale, brakeScale]}
    >
      <primitive
        object={clonedScene}
        rotation={[config.rotation.x, config.rotation.y, config.rotation.z]}
      />
    </group>
  );
};

interface TransitionSceneProps {
  vehicleType: VehicleType;
  onZoomComplete: () => void;
}

const TransitionScene = ({ vehicleType, onZoomComplete }: TransitionSceneProps) => {
  const { camera } = useThree();
  const [phase, setPhase] = useState<"showing" | "blueTransition" | "zooming" | "transitioning" | "brake">("showing");
  const [vehicleOpacity, setVehicleOpacity] = useState(1); // Start at full opacity
  const [blueTransitionProgress, setBlueTransitionProgress] = useState(0); // 0 = normal, 1 = fully blue
  const [brakeOpacity, setBrakeOpacity] = useState(0);
  const completedRef = useRef(false);

  const startTime = useRef(Date.now());
  const vehicleConfig = vehicles[vehicleType];
  const zoomConfig = vehicleConfig.zoomConfig;

  // Timing from config
  const { fadeInDuration, showVehicleDuration, zoomDuration, transitionDuration, showBrakeDuration } = transition.timing;
  const blueTransitionDuration = 800; // Duration for transitioning to blue variant

  // Camera positions from config
  const initialPosition = useRef(new THREE.Vector3(
    vehicleConfig.cameraStart.x,
    vehicleConfig.cameraStart.y,
    vehicleConfig.cameraStart.z
  ));
  const zoomTargetPosition = useRef(new THREE.Vector3(
    vehicleConfig.cameraZoomTarget.x * zoomConfig.zoomIntensity,
    vehicleConfig.cameraZoomTarget.y * zoomConfig.zoomIntensity,
    vehicleConfig.cameraZoomTarget.z * zoomConfig.zoomIntensity
  ));

  // LookAt targets from config
  const initialLookAt = useRef(new THREE.Vector3(
    zoomConfig.initialLookAtTarget.x,
    zoomConfig.initialLookAtTarget.y,
    zoomConfig.initialLookAtTarget.z
  ));
  const zoomLookAt = useRef(new THREE.Vector3(
    zoomConfig.zoomLookAtTarget.x,
    zoomConfig.zoomLookAtTarget.y,
    zoomConfig.zoomLookAtTarget.z
  ));

  // For smooth lookAt interpolation
  const currentLookAt = useRef(new THREE.Vector3(
    zoomConfig.initialLookAtTarget.x,
    zoomConfig.initialLookAtTarget.y,
    zoomConfig.initialLookAtTarget.z
  ));

  useFrame(() => {
    const elapsed = Date.now() - startTime.current;

    // Phase 1: Show vehicle instantly (no fade-in)
    if (phase === "showing") {
      // Keep camera looking at initial lookAt target
      camera.lookAt(initialLookAt.current);

      if (elapsed < showVehicleDuration) {
        setVehicleOpacity(1);
      } else {
        setPhase("blueTransition");
        startTime.current = Date.now();
      }
    }

    // Phase 2: Transition to blue semi-transparent variant
    if (phase === "blueTransition") {
      camera.lookAt(initialLookAt.current);

      const blueElapsed = Date.now() - startTime.current;
      const progress = Math.min(blueElapsed / blueTransitionDuration, 1);

      // Smoothly transition blue progress from 0 to 1
      setBlueTransitionProgress(progress);

      // Transition to 70% opacity
      setVehicleOpacity(1 - progress * 0.3); // Goes from 1.0 to 0.7

      if (progress >= 1) {
        setPhase("zooming");
        startTime.current = Date.now();
      }
    }

    // Phase 3: Zoom into tire - smoothly interpolate BOTH position and lookAt
    if (phase === "zooming") {
      const zoomElapsed = Date.now() - startTime.current;
      const progress = Math.min(zoomElapsed / zoomDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      // Keep vehicle at 70% opacity and fully blue
      setVehicleOpacity(0.7);
      setBlueTransitionProgress(1); // Maintain fully blue during zoom

      // Smoothly move camera position
      camera.position.lerpVectors(initialPosition.current, zoomTargetPosition.current, eased);

      // Smoothly interpolate lookAt target to avoid sudden shifts
      currentLookAt.current.lerpVectors(initialLookAt.current, zoomLookAt.current, eased);
      camera.lookAt(currentLookAt.current);

      if (progress >= 1) {
        setPhase("transitioning");
        startTime.current = Date.now();
      }
    }

    // Phase 3: Transition - fade out vehicle, fade in brake
    if (phase === "transitioning") {
      const transitionElapsed = Date.now() - startTime.current;
      const progress = Math.min(transitionElapsed / transitionDuration, 1);

      setVehicleOpacity(1 - progress);
      setBrakeOpacity(progress);

      if (progress >= 1) {
        setPhase("brake");
        startTime.current = Date.now();

        // Reset camera for brake view
        camera.position.set(
          transition.camera.brakeViewPosition.x,
          transition.camera.brakeViewPosition.y,
          transition.camera.brakeViewPosition.z
        );
        camera.lookAt(
          transition.camera.brakeViewTarget.x,
          transition.camera.brakeViewTarget.y,
          transition.camera.brakeViewTarget.z
        );
      }
    }

    // Phase 4: Show brake
    if (phase === "brake") {
      const brakeElapsed = Date.now() - startTime.current;
      setBrakeOpacity(1);

      if (brakeElapsed > showBrakeDuration && !completedRef.current) {
        completedRef.current = true;
        onZoomComplete();
      }
    }
  });

  const lighting = viewer.lighting;
  const sceneConfig = viewer.scene;

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[initialPosition.current.x, initialPosition.current.y, initialPosition.current.z]}
        fov={viewer.camera.fov}
      />

      {/* Lighting - Reduced intensity to prevent overexposure */}
      <ambientLight intensity={lighting.ambient.intensity * 0.6} />
      <directionalLight
        position={[lighting.directional1.position.x, lighting.directional1.position.y, lighting.directional1.position.z]}
        intensity={lighting.directional1.intensity * 0.5}
        castShadow
      />
      <directionalLight
        position={[lighting.directional2.position.x, lighting.directional2.position.y, lighting.directional2.position.z]}
        intensity={lighting.directional2.intensity * 0.5}
      />
      <spotLight
        position={[lighting.spot.position.x, lighting.spot.position.y, lighting.spot.position.z]}
        intensity={lighting.spot.intensity * 0.4}
        angle={lighting.spot.angle}
        penumbra={1}
        castShadow
      />
      <hemisphereLight groundColor={lighting.hemisphere.groundColor} intensity={lighting.hemisphere.intensity * 0.6} />

      {/* Background - Same as viewer */}
      <color attach="background" args={[sceneConfig.backgroundColor]} />

      {/* Fog - Same as viewer */}
      <fog attach="fog" args={[sceneConfig.fogColor, sceneConfig.fogNear, sceneConfig.fogFar]} />

      {/* Environment for reflections - Same as viewer */}
      <Environment preset="city" background={false} />

      {/* Vehicle Model */}
      {vehicleOpacity > 0 && (
        <VehicleModel vehicleType={vehicleType} opacity={vehicleOpacity} blueTransitionProgress={blueTransitionProgress} />
      )}

      {/* Brake Model */}
      {brakeOpacity > 0 && (
        <BrakeTransitionModel vehicleType={vehicleType} opacity={brakeOpacity} />
      )}

      {/* Ground Shadow - Same as viewer */}
      <ContactShadows
        position={[0, -2, 0]}
        opacity={0.4}
        scale={500}
        blur={2}
        far={100}
      />

      {/* Infinite Ground Grid - Same as viewer */}
      <gridHelper
        args={[sceneConfig.gridSize, sceneConfig.gridDivisions, sceneConfig.gridColor1, sceneConfig.gridColor2]}
        position={[0, -2, 0]}
      />

      {/* Post Processing Effects - Reduced bloom to prevent overexposure */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.95}
          luminanceSmoothing={0.9}
          intensity={0.15}
        />
        <Vignette offset={viewer.postProcessing.vignette.offset} darkness={viewer.postProcessing.vignette.darkness} eskil={false} />
      </EffectComposer>
    </>
  );
};

const VehicleZoomTransition: React.FC<VehicleZoomTransitionProps> = ({
  vehicleType,
  onComplete,
}) => {
  const [isComplete, setIsComplete] = useState(false);
  const vehicleConfig = vehicles[vehicleType];

  const handleZoomComplete = () => {
    setIsComplete(true);
    // Call immediately for seamless transition
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0f] overflow-hidden">
      {/* 3D Canvas - No fade effects for seamless transition */}
      <div className="absolute inset-0">
        <Canvas
          shadows
          gl={{
            antialias: true,
            powerPreference: "high-performance",
            alpha: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 0.8,
          }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <TransitionScene
              vehicleType={vehicleType}
              onZoomComplete={handleZoomComplete}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Vehicle type label */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isComplete ? 0 : 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="bg-gradient-to-r from-blue-600/90 to-cyan-500/90 backdrop-blur-md px-8 py-4 rounded-full border border-white/20">
          <p className="text-white font-bold text-xl tracking-wide text-center">
            {vehicleConfig.name}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default VehicleZoomTransition;
