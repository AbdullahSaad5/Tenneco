"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, PerspectiveCamera } from "@react-three/drei";
import { Suspense, useRef, useState, useEffect, useMemo } from "react";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { vehicles, brakes, transition, VehicleType } from "../../config";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

interface VehicleZoomTransitionProps {
  vehicleType: VehicleType;
  onComplete: () => void;
}

interface VehicleModelProps {
  vehicleType: VehicleType;
  opacity: number;
}

const VehicleModel = ({ vehicleType, opacity }: VehicleModelProps) => {
  const config = vehicles[vehicleType];
  const { scene } = useGLTF(config.modelPath);
  const groupRef = useRef<THREE.Group>(null);

  // Use initialScale from zoomConfig
  const modelScale = config.zoomConfig.initialScale * config.scale;

  // Clone and calculate offset synchronously
  const { clonedScene, centerOffset } = useMemo(() => {
    // Use SkeletonUtils.clone for proper animation and hierarchy support
    const cloned = clone(scene) as THREE.Group;

    // Apply scale to EVERY object in the hierarchy
    cloned.traverse((child) => {
      if (child instanceof THREE.Object3D) {
        child.scale.set(modelScale, modelScale, modelScale);
      }
    });

    // Calculate center immediately when cloning (after scaling)
    const box = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const offset = center.clone().negate();
    const minY = box.min.y;
    offset.y = -minY - 0.5; // Position on ground

    return { clonedScene: cloned, centerOffset: offset };
  }, [scene, modelScale]);

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

  return (
    <group
      ref={groupRef}
      position={[centerOffset.x, centerOffset.y, centerOffset.z]}
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

    // Apply scale to EVERY object in the hierarchy
    cloned.traverse((child) => {
      if (child instanceof THREE.Object3D) {
        child.scale.set(brakeScale, brakeScale, brakeScale);
      }
    });

    // Calculate center immediately when cloning (after scaling)
    const box = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const offset = center.clone().negate();
    const minY = box.min.y;
    offset.y = -minY - 0.5;

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
  const [phase, setPhase] = useState<"showing" | "zooming" | "transitioning" | "brake">("showing");
  const [vehicleOpacity, setVehicleOpacity] = useState(0);
  const [brakeOpacity, setBrakeOpacity] = useState(0);
  const completedRef = useRef(false);

  const startTime = useRef(Date.now());
  const vehicleConfig = vehicles[vehicleType];
  const zoomConfig = vehicleConfig.zoomConfig;

  // Timing from config
  const { fadeInDuration, showVehicleDuration, zoomDuration, transitionDuration, showBrakeDuration } = transition.timing;

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

    // Phase 1: Fade in vehicle
    if (phase === "showing") {
      // Keep camera looking at initial lookAt target
      camera.lookAt(initialLookAt.current);

      if (elapsed < fadeInDuration) {
        const progress = elapsed / fadeInDuration;
        setVehicleOpacity(progress);
      } else if (elapsed < fadeInDuration + showVehicleDuration) {
        setVehicleOpacity(1);
      } else {
        setPhase("zooming");
        startTime.current = Date.now();
      }
    }

    // Phase 2: Zoom into tire - smoothly interpolate BOTH position and lookAt
    if (phase === "zooming") {
      const zoomElapsed = Date.now() - startTime.current;
      const progress = Math.min(zoomElapsed / zoomDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

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

  const effects = transition.effects;

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[initialPosition.current.x, initialPosition.current.y, initialPosition.current.z]}
        fov={transition.camera.fov}
      />

      {/* Lighting */}
      <ambientLight intensity={effects.ambientLightIntensity} />
      <directionalLight position={[10, 10, 5]} intensity={effects.directionalLightIntensity} castShadow />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />
      <spotLight position={[0, 15, 0]} intensity={effects.spotLightIntensity} angle={0.3} penumbra={1} />
      <hemisphereLight groundColor="#222222" intensity={0.4} />

      {/* Background */}
      <color attach="background" args={[effects.backgroundColor]} />
      <fog attach="fog" args={[effects.backgroundColor, effects.fogNear, effects.fogFar]} />

      {/* Environment for reflections */}
      <Environment preset="city" background={false} />

      {/* Vehicle Model */}
      {vehicleOpacity > 0 && (
        <VehicleModel vehicleType={vehicleType} opacity={vehicleOpacity} />
      )}

      {/* Brake Model */}
      {brakeOpacity > 0 && (
        <BrakeTransitionModel vehicleType={vehicleType} opacity={brakeOpacity} />
      )}

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#111118" metalness={0.8} roughness={0.4} />
      </mesh>
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
    setTimeout(() => {
      onComplete();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0f] overflow-hidden">
      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/60 z-10 pointer-events-none" />

      {/* Ambient particles/stars */}
      <div className="absolute inset-0 z-5 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* 3D Canvas */}
      <AnimatePresence>
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: isComplete ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Canvas
            shadows
            gl={{
              antialias: true,
              powerPreference: "high-performance",
              alpha: true,
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
        </motion.div>
      </AnimatePresence>

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
