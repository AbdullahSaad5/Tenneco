import { useGLTF, Html } from "@react-three/drei";
import React, { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const MODEL_PATH = "./models/lv_file.glb";
const GROUND_Y = -2;
const GROUND_OFFSET = 0.15;

type ModelType = "lv" | "asm" | "j4444" | "pad";

interface HotspotProps {
  position: [number, number, number];
  onClick: () => void;
  label: string;
  color: string;
  occludeRef?: React.RefObject<THREE.Group>;
}

const Hotspot = ({ position, onClick, label, color, occludeRef }: HotspotProps) => {
  const [hovered, setHovered] = useState(false);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const [distanceFactor, setDistanceFactor] = useState(8);

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
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <mesh ref={glowRef}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
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
        zIndexRange={[100, 0]}
        style={{ pointerEvents: 'none' }}
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
            filter: hovered ? `drop-shadow(0 0 12px ${color})` : 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))',
            transition: 'filter 0.2s ease'
          }}
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            fill={color}
            opacity={hovered ? "0.9" : "0.8"}
          />
          <circle
            cx="12"
            cy="12"
            r="9"
            fill="white"
          />
          <path
            d="M12 8v8m-4-4h8"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </Html>

      {hovered && (
        <Html
          position={[0, 0.8, 0]}
          center
          distanceFactor={distanceFactor}
          zIndexRange={[101, 0]}
          style={{ pointerEvents: 'none' }}
          occlude={occludeRef ? [occludeRef] : undefined}
        >
          <div
            className="bg-white text-gray-900 px-5 py-3 rounded-lg text-base font-semibold shadow-xl whitespace-nowrap border-2 backdrop-blur-sm"
            style={{
              borderColor: color,
              boxShadow: `0 4px 20px rgba(0,0,0,0.2), 0 0 30px ${color}40`
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span>{label}</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

interface LVProps {
  onHotspotClick?: (model: ModelType) => void;
}

const LV = ({ onHotspotClick }: LVProps) => {
  const result = useGLTF(MODEL_PATH);
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const isPositionedRef = useRef(false);

  useFrame(() => {
    if (groupRef.current && !isPositionedRef.current) {
      const box = new THREE.Box3();
      box.setFromObject(groupRef.current);

      if (box.isEmpty()) return;

      const minY = box.min.y;
      const offsetY = GROUND_Y - minY + GROUND_OFFSET;

      groupRef.current.position.y = offsetY;
      isPositionedRef.current = true;
    }
  });

  const handleHotspotClick = (model: ModelType) => {
    if (onHotspotClick) {
      onHotspotClick(model);
    }
  };

  return (
    <group ref={groupRef}>
      <group ref={modelRef}>
        <primitive object={result.scene} scale={0.05} />
      </group>

      <Hotspot
        position={[-2, 0.5, 1]}
        onClick={() => handleHotspotClick("pad")}
        label="Brake Pad Assembly"
        color="#f59e0b"
        occludeRef={modelRef}
      />
      <Hotspot
        position={[2, 0.8, -0.5]}
        onClick={() => handleHotspotClick("j4444")}
        label="J-4444 Component"
        color="#8b5cf6"
        occludeRef={modelRef}
      />
      <Hotspot
        position={[0, 1.2, 2]}
        onClick={() => handleHotspotClick("asm")}
        label="ASM Assembly"
        color="#ec4899"
        occludeRef={modelRef}
      />
    </group>
  );
};

export default LV;
