"use client";

import { Environment, OrbitControls, PerspectiveCamera, ContactShadows, Float, useGLTF } from "@react-three/drei";
import { useRef, useEffect, useState, forwardRef, useImperativeHandle, useMemo } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import BrakeModel from "../Models/BrakeModel";
import { usePreload } from "../ModelPreloader";
import { viewer, transition } from "../../config";
import { VehicleType, VehicleConfiguration, BrakeConfiguration, HotspotConfiguration, HotspotItem } from "../../_types/content";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

interface SceneProps {
  vehicleType: VehicleType;
  vehicleConfig: VehicleConfiguration;
  brakeConfig: BrakeConfiguration;
  hotspotConfig?: HotspotConfiguration | null;
  onHotspotClick?: (hotspot: HotspotItem | null) => void;
  isAnimating?: boolean;
  onAnimationComplete?: () => void;
}

// Vehicle model component for transition animation
interface VehicleModelProps {
  vehicleType: VehicleType;
  vehicleConfig: VehicleConfiguration;
  opacity: number;
  blueTransitionProgress?: number;
}

const VehicleModel = (props: VehicleModelProps) => {
  const { resolvedUrls } = usePreload();
  const modelPath = resolvedUrls.vehicles[props.vehicleType] || "";

  // Guard: don't attempt to load if we have no valid model path
  if (!modelPath) return null;

  return <VehicleModelInner {...props} modelPath={modelPath} />;
};

const VehicleModelInner = ({ vehicleConfig, opacity, blueTransitionProgress = 0, modelPath }: VehicleModelProps & { modelPath: string }) => {
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef<THREE.Group>(null);

  // Use scale from config - handle both Vector3 and number formats
  const baseScale = typeof vehicleConfig.scale === 'number'
    ? vehicleConfig.scale
    : vehicleConfig.scale.x;
  const modelScale = vehicleConfig.zoomConfig.initialScale * baseScale;

  const originalMaterials = useRef<Map<THREE.Material, {
    color: THREE.Color;
    metalness: number;
    roughness: number;
    emissive: THREE.Color;
    emissiveIntensity: number;
  }>>(new Map());

  const { clonedScene, centerOffset } = useMemo(() => {
    const cloned = clone(scene) as THREE.Group;

    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map(mat => mat.clone());
          } else {
            mesh.material = mesh.material.clone();
          }

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

    const box = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const minY = box.min.y;

    const offset = center.clone().negate().multiplyScalar(modelScale);
    offset.y = (-minY - 0.5) * modelScale;

    return { clonedScene: cloned, centerOffset: offset };
  }, [scene, modelScale]);

  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material && (mesh.material as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
          const stdMat = mesh.material as THREE.MeshStandardMaterial;
          const original = originalMaterials.current.get(stdMat);

          if (original) {
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

          if ((material as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
            const stdMat = material as THREE.MeshStandardMaterial;
            const original = originalMaterials.current.get(stdMat);

            if (original) {
              stdMat.color.lerpColors(original.color, blueColor, blueTransitionProgress);
              const targetMetalness = blueTransitionProgress > 0 ? 0.3 : Math.min(original.metalness, 0.3);
              stdMat.metalness = THREE.MathUtils.lerp(Math.min(original.metalness, 0.3), targetMetalness, blueTransitionProgress);
              const targetRoughness = blueTransitionProgress > 0 ? 0.5 : Math.max(original.roughness, 0.7);
              stdMat.roughness = THREE.MathUtils.lerp(Math.max(original.roughness, 0.7), targetRoughness, blueTransitionProgress);
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
        rotation={[vehicleConfig.rotation.x, vehicleConfig.rotation.y, vehicleConfig.rotation.z]}
      />
    </group>
  );
};

const Scene = forwardRef(({ vehicleType, vehicleConfig, brakeConfig, hotspotConfig, onHotspotClick, isAnimating = false, onAnimationComplete }: SceneProps, ref) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const { camera } = useThree();
  const [isInitialized, setIsInitialized] = useState(false);
  const [modelsPreloaded, setModelsPreloaded] = useState(false);

  // Animation state - component remounts on vehicle change so state is always fresh
  const [phase, setPhase] = useState<"showing" | "blueTransition" | "zooming" | "transitioning" | "brake" | "complete">(
    isAnimating ? "showing" : "complete"
  );
  const [vehicleOpacity, setVehicleOpacity] = useState(isAnimating ? 1 : 0);
  const [blueTransitionProgress, setBlueTransitionProgress] = useState(0);
  const [brakeOpacity, setBrakeOpacity] = useState(isAnimating ? 0 : 1);
  const [brakeFadeComplete, setBrakeFadeComplete] = useState(!isAnimating);
  const startTime = useRef(Date.now());
  const completedRef = useRef(false);
  const zoomCompletedRef = useRef(false);
  const transitionCompletedRef = useRef(false);
  const cameraLockedToBrakeRef = useRef(false);

  // Prevent animation from restarting - if isAnimating becomes false while animating, complete immediately
  useEffect(() => {
    if (!isAnimating && phase !== "complete" && !completedRef.current) {
      setPhase("complete");
      setBrakeOpacity(1);
      setVehicleOpacity(0);
      completedRef.current = true;
    }
  }, [isAnimating, phase]);

  const config = viewer;
  const zoomConfig = vehicleConfig.zoomConfig;

  // Get model paths from preload context (already preloaded by ModelPreloader)
  const { isPreloaded } = usePreload();

  // Models are already preloaded by ModelPreloader, just mark as ready
  useEffect(() => {
    if (isPreloaded) {
      setModelsPreloaded(true);
    }
  }, [isPreloaded]);

  // Timing from config
  const { showVehicleDuration, zoomDuration, transitionDuration, showBrakeDuration } = transition.timing;
  const blueTransitionDuration = 800;

  // Camera positions for animation
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

  const currentLookAt = useRef(new THREE.Vector3(
    zoomConfig.initialLookAtTarget.x,
    zoomConfig.initialLookAtTarget.y,
    zoomConfig.initialLookAtTarget.z
  ));

  // Camera view from config - Final position after animation
  const cameraView = useMemo(() => ({
    position: new THREE.Vector3(
      transition.camera.brakeViewPosition.x,
      transition.camera.brakeViewPosition.y,
      transition.camera.brakeViewPosition.z
    ),
    target: new THREE.Vector3(
      transition.camera.brakeViewTarget.x,
      transition.camera.brakeViewTarget.y,
      transition.camera.brakeViewTarget.z
    ),
    zoomFactor: config.camera.zoomFactor,
    maxDistance: config.camera.maxDistance,
    minDistance: config.camera.minDistance,
  }), [config.camera.zoomFactor, config.camera.maxDistance, config.camera.minDistance]);

  // Animation frame loop
  useFrame(() => {
    // Don't run animation if completed or not animating or not initialized or models not preloaded
    if (!isAnimating || phase === "complete" || completedRef.current || !isInitialized || !modelsPreloaded) return;

    const elapsed = Date.now() - startTime.current;

    // Phase 1: Show vehicle
    if (phase === "showing") {
      camera.lookAt(initialLookAt.current);

      if (elapsed < showVehicleDuration) {
        setVehicleOpacity(1);
      } else {
        setPhase("blueTransition");
        startTime.current = Date.now();
      }
    }
    // Phase 2: Transition to blue
    else if (phase === "blueTransition") {
      camera.lookAt(initialLookAt.current);

      const blueElapsed = Date.now() - startTime.current;
      const progress = Math.min(blueElapsed / blueTransitionDuration, 1);

      setBlueTransitionProgress(progress);
      setVehicleOpacity(1 - progress * 0.3); // 1.0 to 0.7

      if (progress >= 1) {
        setPhase("zooming");
        startTime.current = Date.now();
      }
    }
    // Phase 3: Zoom into brake area
    else if (phase === "zooming" && !zoomCompletedRef.current && !cameraLockedToBrakeRef.current) {
      const zoomElapsed = Date.now() - startTime.current;
      const progress = Math.min(zoomElapsed / zoomDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setVehicleOpacity(0.7);
      setBlueTransitionProgress(1);

      camera.position.lerpVectors(initialPosition.current, zoomTargetPosition.current, eased);
      currentLookAt.current.lerpVectors(initialLookAt.current, zoomLookAt.current, eased);
      camera.lookAt(currentLookAt.current);

      if (progress >= 1) {
        zoomCompletedRef.current = true;
        setPhase("transitioning");
        startTime.current = Date.now();
      }
    }
    // Phase 4: Fade out vehicle completely (no brake yet)
    else if (phase === "transitioning" && !transitionCompletedRef.current) {
      const transitionElapsed = Date.now() - startTime.current;
      const progress = Math.min(transitionElapsed / transitionDuration, 1);

      // Fade out vehicle to 0, keep brake hidden
      setVehicleOpacity(0.7 * (1 - progress));
      setBrakeOpacity(0);

      if (progress >= 1 && !cameraLockedToBrakeRef.current) {
        // Transition complete - immediately move to brake phase
        transitionCompletedRef.current = true;
        cameraLockedToBrakeRef.current = true;
        setVehicleOpacity(0);
        setBrakeOpacity(0);
        setPhase("brake");
        startTime.current = Date.now();

        // Set final camera position for brake view - this should only happen ONCE
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

        // Update OrbitControls target to match
        if (controlsRef.current) {
          controlsRef.current.target.set(
            transition.camera.brakeViewTarget.x,
            transition.camera.brakeViewTarget.y,
            transition.camera.brakeViewTarget.z
          );
          controlsRef.current.update();
        }
      }
    }
    // Phase 5: Fade in brake at final camera position
    else if (phase === "brake") {
      const brakeElapsed = Date.now() - startTime.current;
      const fadeProgress = Math.min(brakeElapsed / showBrakeDuration, 1);

      // Fade in brake from 0 to 1
      setBrakeOpacity(fadeProgress);

      // Mark fade as complete when opacity reaches 1
      if (fadeProgress >= 1 && !brakeFadeComplete) {
        setBrakeFadeComplete(true);
      }

      if (fadeProgress >= 1 && !completedRef.current) {
        completedRef.current = true;
        setBrakeOpacity(1);
        setPhase("complete");
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }
    }
  });

  // Expose reset camera function
  useImperativeHandle(ref, () => ({
    resetCamera: () => {
      if (controlsRef.current) {
        camera.position.set(cameraView.position.x, cameraView.position.y, cameraView.position.z);
        controlsRef.current.target.set(cameraView.target.x, cameraView.target.y, cameraView.target.z);
        controlsRef.current.update();
      }
    },
  }));

  // Set initial camera position
  useEffect(() => {
    if (!isInitialized) {
      if (isAnimating) {
        // Start from animation initial position
        camera.position.set(initialPosition.current.x, initialPosition.current.y, initialPosition.current.z);
        camera.lookAt(initialLookAt.current);
        // Reset animation start time to NOW to prevent skipping on first load
        startTime.current = Date.now();
      } else {
        // Start from brake view position
        camera.position.set(cameraView.position.x, cameraView.position.y, cameraView.position.z);
        if (controlsRef.current) {
          controlsRef.current.target.set(cameraView.target.x, cameraView.target.y, cameraView.target.z);
          controlsRef.current.update();
        }
      }

      camera.zoom = cameraView.zoomFactor;
      camera.updateProjectionMatrix();
      setIsInitialized(true);
    }
  }, [camera, isInitialized, cameraView, isAnimating]);

  // Listen for camera reset event
  useEffect(() => {
    const handleResetCamera = () => {
      if (controlsRef.current) {
        camera.position.set(cameraView.position.x, cameraView.position.y, cameraView.position.z);
        controlsRef.current.target.set(cameraView.target.x, cameraView.target.y, cameraView.target.z);
        controlsRef.current.update();
      }
    };

    window.addEventListener("resetCamera", handleResetCamera);
    return () => window.removeEventListener("resetCamera", handleResetCamera);
  }, [camera, cameraView]);

  // Listen for zoom events
  useEffect(() => {
    const handleZoomIn = () => {
      if (controlsRef.current) {
        const target = controlsRef.current.target;
        const direction = new THREE.Vector3();
        direction.subVectors(target, camera.position).normalize();
        const distance = camera.position.distanceTo(target);
        const zoomAmount = Math.min(distance * 0.2, 2);
        camera.position.add(direction.multiplyScalar(zoomAmount));
        controlsRef.current.update();
      }
    };

    const handleZoomOut = () => {
      if (controlsRef.current) {
        const target = controlsRef.current.target;
        const direction = new THREE.Vector3();
        direction.subVectors(camera.position, target).normalize();
        camera.position.add(direction.multiplyScalar(2));
        controlsRef.current.update();
      }
    };

    window.addEventListener("zoomIn", handleZoomIn);
    window.addEventListener("zoomOut", handleZoomOut);

    return () => {
      window.removeEventListener("zoomIn", handleZoomIn);
      window.removeEventListener("zoomOut", handleZoomOut);
    };
  }, [camera]);

  const lighting = config.lighting;
  const floatConfig = config.float;
  const postProcessing = config.postProcessing;
  const controls = config.controls;

  // Reduce lighting during animation to prevent overexposure
  const lightingMultiplier = isAnimating && phase !== "complete" ? 0.6 : 1;

  return (
    <>
      {/* Camera Setup */}
      <PerspectiveCamera makeDefault fov={config.camera.fov} />

      {/* Lighting */}
      <ambientLight intensity={lighting.ambient.intensity * lightingMultiplier} />
      <directionalLight
        position={[lighting.directional1.position.x, lighting.directional1.position.y, lighting.directional1.position.z]}
        intensity={lighting.directional1.intensity * (isAnimating && phase !== "complete" ? 0.5 : 1)}
        castShadow
      />
      <directionalLight
        position={[lighting.directional2.position.x, lighting.directional2.position.y, lighting.directional2.position.z]}
        intensity={lighting.directional2.intensity * (isAnimating && phase !== "complete" ? 0.5 : 1)}
      />
      <spotLight
        position={[lighting.spot.position.x, lighting.spot.position.y, lighting.spot.position.z]}
        intensity={lighting.spot.intensity * (isAnimating && phase !== "complete" ? 0.4 : 1)}
        angle={lighting.spot.angle}
        penumbra={1}
        castShadow
      />
      <hemisphereLight groundColor={lighting.hemisphere.groundColor} intensity={lighting.hemisphere.intensity * lightingMultiplier} />

      {/* Background */}
      <color attach="background" args={[config.scene.backgroundColor]} />

      {/* Fog */}
      <fog attach="fog" args={[config.scene.fogColor, config.scene.fogNear, config.scene.fogFar]} />

      {/* Vehicle Model - only show before brake appears */}
      {isAnimating && (phase === "showing" || phase === "blueTransition" || phase === "zooming" || (phase === "transitioning" && vehicleOpacity > 0)) && (
        <VehicleModel
          vehicleType={vehicleType}
          vehicleConfig={vehicleConfig}
          opacity={vehicleOpacity}
          blueTransitionProgress={blueTransitionProgress}
        />
      )}

      {/* Brake Model - only render during transition/brake phases or when animation complete */}
      {!isAnimating || phase === "complete" ? (
        <Float
          speed={floatConfig.speed}
          rotationIntensity={floatConfig.rotationIntensity}
          floatIntensity={floatConfig.floatIntensity}
          floatingRange={floatConfig.floatingRange}
        >
          <group ref={groupRef}>
            <BrakeModel
              vehicleType={vehicleType}
              brakeConfig={brakeConfig}
              hotspotConfig={hotspotConfig}
              onHotspotClick={onHotspotClick}
              opacity={1}
              showExplosionHotspot={true}
            />
          </group>
        </Float>
      ) : brakeOpacity > 0 ? (
        // During transition - only render brake when it actually has opacity > 0
        <group ref={groupRef}>
          <BrakeModel
            vehicleType={vehicleType}
            brakeConfig={brakeConfig}
            hotspotConfig={hotspotConfig}
            onHotspotClick={undefined} // Disable hotspots during animation
            opacity={brakeOpacity}
            showExplosionHotspot={brakeFadeComplete}
          />
        </group>
      ) : null}

      {/* Ground Shadow */}
      <ContactShadows
        position={[0, -2, 0]}
        opacity={0.4}
        scale={500}
        blur={2}
        far={100}
      />

      {/* Infinite Ground Grid */}
      <gridHelper
        args={[config.scene.gridSize, config.scene.gridDivisions, config.scene.gridColor1, config.scene.gridColor2]}
        position={[0, -2, 0]}
      />

      {/* Camera Controls - disabled during animation */}
      <OrbitControls
        ref={controlsRef}
        enabled={!isAnimating || phase === "complete"}
        enableDamping={controls.enableDamping}
        dampingFactor={controls.dampingFactor}
        rotateSpeed={controls.rotateSpeed}
        zoomSpeed={controls.zoomSpeed}
        minPolarAngle={controls.minPolarAngle}
        maxPolarAngle={controls.maxPolarAngle}
        maxDistance={cameraView.maxDistance}
        minDistance={cameraView.minDistance}
        makeDefault
      />

      {/* Environment Lighting */}
      <Environment preset="city" background={false} />

      {/* Post Processing Effects */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={isAnimating && phase !== "complete" ? 0.95 : postProcessing.bloom.luminanceThreshold}
          luminanceSmoothing={isAnimating && phase !== "complete" ? 0.9 : postProcessing.bloom.luminanceSmoothing}
          intensity={isAnimating && phase !== "complete" ? 0.15 : postProcessing.bloom.intensity}
        />
        <Vignette offset={postProcessing.vignette.offset} darkness={postProcessing.vignette.darkness} eskil={false} />
      </EffectComposer>
    </>
  );
});

Scene.displayName = "Scene"; // SAS

export default Scene;
