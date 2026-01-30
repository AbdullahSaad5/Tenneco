"use client";

import { Environment, OrbitControls, PerspectiveCamera, ContactShadows, Float } from "@react-three/drei";
import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import BrakeModel from "../Models/BrakeModel";
import { viewer, transition, VehicleType } from "../../config";

interface SceneProps {
  vehicleType: VehicleType;
}

const Scene = forwardRef(({ vehicleType }: SceneProps, ref) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const { camera } = useThree();
  const [isInitialized, setIsInitialized] = useState(false);

  const config = viewer;

  // Camera view from config - Start from transition's brake view position for seamless transition
  const cameraView = {
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
  };

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
      camera.position.set(cameraView.position.x, cameraView.position.y, cameraView.position.z);

      if (controlsRef.current) {
        controlsRef.current.target.set(cameraView.target.x, cameraView.target.y, cameraView.target.z);
        controlsRef.current.update();
      }

      camera.zoom = cameraView.zoomFactor;
      camera.updateProjectionMatrix();
      setIsInitialized(true);
    }
  }, [camera, isInitialized, cameraView]);

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

  return (
    <>
      {/* Camera Setup */}
      <PerspectiveCamera makeDefault fov={config.camera.fov} />

      {/* Lighting */}
      <ambientLight intensity={lighting.ambient.intensity} />
      <directionalLight
        position={[lighting.directional1.position.x, lighting.directional1.position.y, lighting.directional1.position.z]}
        intensity={lighting.directional1.intensity}
        castShadow
      />
      <directionalLight
        position={[lighting.directional2.position.x, lighting.directional2.position.y, lighting.directional2.position.z]}
        intensity={lighting.directional2.intensity}
      />
      <spotLight
        position={[lighting.spot.position.x, lighting.spot.position.y, lighting.spot.position.z]}
        intensity={lighting.spot.intensity}
        angle={lighting.spot.angle}
        penumbra={1}
        castShadow
      />
      <hemisphereLight groundColor={lighting.hemisphere.groundColor} intensity={lighting.hemisphere.intensity} />

      {/* Background */}
      <color attach="background" args={[config.scene.backgroundColor]} />

      {/* Fog */}
      <fog attach="fog" args={[config.scene.fogColor, config.scene.fogNear, config.scene.fogFar]} />

      {/* 3D Model with Float animation */}
      <Float
        speed={floatConfig.speed}
        rotationIntensity={floatConfig.rotationIntensity}
        floatIntensity={floatConfig.floatIntensity}
        floatingRange={floatConfig.floatingRange}
      >
        <group ref={groupRef}>
          <BrakeModel vehicleType={vehicleType} />
        </group>
      </Float>

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

      {/* Camera Controls */}
      <OrbitControls
        ref={controlsRef}
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
          luminanceThreshold={postProcessing.bloom.luminanceThreshold}
          luminanceSmoothing={postProcessing.bloom.luminanceSmoothing}
          intensity={postProcessing.bloom.intensity}
        />
        <Vignette offset={postProcessing.vignette.offset} darkness={postProcessing.vignette.darkness} eskil={false} />
      </EffectComposer>
    </>
  );
});

Scene.displayName = "Scene";

export default Scene;
