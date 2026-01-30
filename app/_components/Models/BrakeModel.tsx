import { useGLTF, Html } from "@react-three/drei";
import React, { useRef, useState, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { brakes, hotspots, VehicleType, HotspotConfig } from "../../config";

interface HotspotProps {
  config: HotspotConfig;
  onClick?: () => void;
  occludeRef?: React.RefObject<THREE.Group>;
}

const Hotspot = ({ config, onClick, occludeRef }: HotspotProps) => {
  const [hovered, setHovered] = useState(false);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const [distanceFactor, setDistanceFactor] = useState(8);

  const position: [number, number, number] = [config.position.x, config.position.y, config.position.z];
  const color = config.color;
  const label = config.label;

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = time * 0.8;
      ring1Ref.current.scale.setScalar(1 + Math.sin(time * 2) * 0.08);
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -time * 1.2;
      ring2Ref.current.scale.setScalar(1 + Math.sin(time * 2.5 + 1) * 0.06);
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(time * 3) * 0.12;
      glowRef.current.scale.setScalar(scale);
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.15 + Math.sin(time * 3) * 0.08;
    }

    if (groupRef.current) {
      const worldPosition = new THREE.Vector3();
      groupRef.current.getWorldPosition(worldPosition);
      const distance = camera.position.distanceTo(worldPosition);
      const baseDistance = 20;
      const newDistanceFactor = (distance / baseDistance) * 8;
      setDistanceFactor(newDistanceFactor);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <mesh ref={glowRef}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.BackSide} />
      </mesh>

      <mesh>
        <circleGeometry args={[0.22, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={hovered ? 0.8 : 0.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      <mesh ref={ring1Ref}>
        <torusGeometry args={[0.28, 0.025, 16, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 1.8 : 1.2}
          transparent
          opacity={hovered ? 1 : 0.85}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>

      <mesh ref={ring2Ref}>
        <torusGeometry args={[0.37, 0.018, 16, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 1.4 : 0.9}
          transparent
          opacity={hovered ? 0.9 : 0.65}
          metalness={0.6}
          roughness={0.25}
        />
      </mesh>

      <Html
        center
        distanceFactor={distanceFactor}
        zIndexRange={[10, 0]}
        style={{ pointerEvents: "none" }}
        occlude={occludeRef ? [occludeRef] : undefined}
      >
        <svg
          width="56"
          height="56"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
          style={{
            filter: hovered ? `drop-shadow(0 0 12px ${color})` : "drop-shadow(0 2px 6px rgba(0,0,0,0.3))",
            transition: "filter 0.2s ease",
          }}
        >
          <circle cx="12" cy="12" r="10" fill={color} opacity={hovered ? "0.9" : "0.8"} />
          <circle cx="12" cy="12" r="9" fill="white" />
          <path d="M12 8v8m-4-4h8" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </Html>

      {hovered && (
        <Html
          position={[0, 0.8, 0]}
          center
          distanceFactor={distanceFactor}
          zIndexRange={[11, 0]}
          style={{ pointerEvents: "none" }}
          occlude={occludeRef ? [occludeRef] : undefined}
        >
          <div
            className="bg-white text-gray-900 px-8 py-4 rounded-xl text-3xl font-bold shadow-xl whitespace-nowrap border-3 backdrop-blur-sm"
            style={{
              borderColor: color,
              borderWidth: "3px",
              boxShadow: `0 4px 20px rgba(0,0,0,0.2), 0 0 30px ${color}40`,
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
              <span>{label}</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

interface BrakeModelProps {
  vehicleType: VehicleType;
}

const BrakeModel = ({ vehicleType }: BrakeModelProps) => {
  const config = brakes[vehicleType];
  const vehicleHotspots = hotspots[vehicleType];

  const { scene } = useGLTF(config.modelPath);
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);

  // Clone and calculate offset synchronously
  const { clonedScene, centerOffset } = useMemo(() => {
    const cloned = scene.clone();

    // Calculate center immediately when cloning
    const box = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Calculate offset to center the model at origin
    const offset = center.clone().negate();

    // Also adjust Y so model sits on ground (y = -2)
    const minY = box.min.y;
    offset.y = -minY - 2;

    return { clonedScene: cloned, centerOffset: offset };
  }, [scene]);

  // Filter enabled hotspots
  const activeHotspots = vehicleHotspots.filter(hs => hs.isEnabled);

  return (
    <group ref={groupRef}>
      <group ref={modelRef} position={[centerOffset.x, centerOffset.y, centerOffset.z]}>
        <primitive
          object={clonedScene}
          scale={config.scale}
          rotation={[config.rotation.x, config.rotation.y, config.rotation.z]}
        />
      </group>

      {/* Dynamic Hotspots from config */}
      {activeHotspots.map((hotspotConfig) => (
        <Hotspot
          key={hotspotConfig.id}
          config={hotspotConfig}
          occludeRef={modelRef}
        />
      ))}
    </group>
  );
};

export default BrakeModel;
