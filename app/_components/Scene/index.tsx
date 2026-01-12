"use client";

import { Environment, OrbitControls, PerspectiveCamera, ContactShadows, Float } from "@react-three/drei";
import { useRef, useEffect, useState, forwardRef, useImperativeHandle, useMemo } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import LV from "../Models/lv";
import Asm from "../Models/asm";
import J4444 from "../Models/j4444";
import Pad from "../Models/pad";

type ModelType = "lv" | "asm" | "j4444" | "pad";

const Scene = forwardRef(({ activeModel }: { activeModel: ModelType }, ref) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const { camera } = useThree();
  const [isInitialized, setIsInitialized] = useState(false);
  const [modelOpacity, setModelOpacity] = useState(1);

  // Static camera view configuration
  const cameraView = useMemo(() => ({
    position: new THREE.Vector3(5, 3, 20),
    target: new THREE.Vector3(0, 0, 0),
    zoomFactor: 1,
    maxDistance: 500,
    minDistance: 0.1,
  }), []);

  // Expose reset camera function
  useImperativeHandle(ref, () => ({
    resetCamera: () => {
      if (controlsRef.current && groupRef.current) {
        const box = new THREE.Box3();
        box.setFromObject(groupRef.current);
        const center = new THREE.Vector3();
        box.getCenter(center);

        camera.position.set(
          center.x + cameraView.position.x,
          center.y + cameraView.position.y,
          center.z + cameraView.position.z
        );

        controlsRef.current.target.set(
          center.x + cameraView.target.x,
          center.y + cameraView.target.y,
          center.z + cameraView.target.z
        );
        controlsRef.current.update();
      }
    },
  }));

  // Set initial camera position (runs once)
  useEffect(() => {
    if (!isInitialized && groupRef.current) {
      const box = new THREE.Box3();
      box.setFromObject(groupRef.current);
      const center = new THREE.Vector3();
      box.getCenter(center);

      // Position camera relative to center
      camera.position.set(
        center.x + cameraView.position.x,
        center.y + cameraView.position.y,
        center.z + cameraView.position.z
      );

      if (controlsRef.current) {
        controlsRef.current.target.set(
          center.x + cameraView.target.x,
          center.y + cameraView.target.y,
          center.z + cameraView.target.z
        );
        controlsRef.current.update();
      }

      // Set the camera zoom factor
      camera.zoom = cameraView.zoomFactor;
      camera.updateProjectionMatrix();

      setIsInitialized(true);
    }
  }, [camera, isInitialized, cameraView]);

  // Listen for camera reset event
  useEffect(() => {
    const handleResetCamera = () => {
      if (controlsRef.current && groupRef.current) {
        const box = new THREE.Box3();
        box.setFromObject(groupRef.current);
        const center = new THREE.Vector3();
        box.getCenter(center);

        camera.position.set(
          center.x + cameraView.position.x,
          center.y + cameraView.position.y,
          center.z + cameraView.position.z
        );

        controlsRef.current.target.set(
          center.x + cameraView.target.x,
          center.y + cameraView.target.y,
          center.z + cameraView.target.z
        );
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

        // Move camera closer to target
        const distance = camera.position.distanceTo(target);
        const zoomAmount = Math.min(distance * 0.2, 2); // 20% closer or max 2 units
        camera.position.add(direction.multiplyScalar(zoomAmount));
        controlsRef.current.update();
      }
    };

    const handleZoomOut = () => {
      if (controlsRef.current) {
        const target = controlsRef.current.target;
        const direction = new THREE.Vector3();
        direction.subVectors(camera.position, target).normalize();

        // Move camera away from target
        camera.position.add(direction.multiplyScalar(2)); // Move 2 units away
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

  // Reset camera when model changes with smooth fade transition
  useEffect(() => {
    if (!isInitialized) return;

    // Start fade out
    setModelOpacity(0);

    const fadeOutTimer = setTimeout(() => {
      // After fade out, recenter camera
      if (controlsRef.current && groupRef.current) {
        const box = new THREE.Box3();
        box.setFromObject(groupRef.current);
        const center = new THREE.Vector3();
        box.getCenter(center);

        // Reposition camera
        camera.position.set(
          center.x + cameraView.position.x,
          center.y + cameraView.position.y,
          center.z + cameraView.position.z
        );

        controlsRef.current.target.set(
          center.x + cameraView.target.x,
          center.y + cameraView.target.y,
          center.z + cameraView.target.z
        );
        controlsRef.current.update();

        // Start fade in after a brief moment
        setTimeout(() => {
          setModelOpacity(1);
        }, 50);
      }
    }, 300); // Wait for fade out animation

    return () => clearTimeout(fadeOutTimer);
  }, [activeModel, camera, cameraView, isInitialized]);

  // Smooth opacity animation using useFrame
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const material = mesh.material as THREE.Material;

          if (material) {
            // Smoothly interpolate opacity
            const targetOpacity = modelOpacity;
            const currentOpacity = material.opacity !== undefined ? material.opacity : 1;
            const newOpacity = THREE.MathUtils.lerp(currentOpacity, targetOpacity, 0.1);

            material.transparent = true;
            material.opacity = newOpacity;
            material.needsUpdate = true;
          }
        }
      });
    }
  });

  return (
    <>
      {/* Camera Setup */}
      <PerspectiveCamera makeDefault fov={50} />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-10, -10, -5]} intensity={0.4} />
      <spotLight position={[0, 15, 0]} intensity={0.8} angle={0.3} penumbra={1} castShadow />
      <hemisphereLight groundColor="#444444" intensity={0.5} />

      {/* Background */}
      <color attach="background" args={["#f8fafc"]} />

      {/* Fog for depth */}
      <fog attach="fog" args={["#f8fafc", 30, 100]} />

      {/* 3D Models with Float animation */}
      <Float
        speed={1.5}
        rotationIntensity={0.2}
        floatIntensity={0.5}
        floatingRange={[0, 0.2]}
      >
        <group ref={groupRef} key={activeModel}>
          {activeModel === "lv" && <LV key="lv" />}
          {activeModel === "asm" && <Asm key="asm" />}
          {activeModel === "j4444" && <J4444 key="j4444" />}
          {activeModel === "pad" && <Pad key="pad" />}
        </group>
      </Float>

      {/* Ground Shadow */}
      <ContactShadows
        position={[0, -2, 0]}
        opacity={0.4}
        scale={50}
        blur={2}
        far={10}
      />

      {/* Grid Helper (optional, subtle) */}
      <gridHelper args={[100, 50, "#e2e8f0", "#f1f5f9"]} position={[0, -2, 0]} />

      {/* Camera Controls */}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 1.8}
        maxDistance={cameraView.maxDistance}
        minDistance={cameraView.minDistance}
        makeDefault
      />

      {/* Environment Lighting */}
      <Environment preset="city" />

      {/* Post Processing Effects */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.9} luminanceSmoothing={0.9} intensity={0.5} />
        <Vignette offset={0.3} darkness={0.4} eskil={false} />
      </EffectComposer>
    </>
  );
});

Scene.displayName = "Scene";

export default Scene;
