import { useGLTF, Html } from "@react-three/drei";
import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const MODEL_PATH = "./models/J-4444.glb";
const GROUND_Y = -2;
const GROUND_OFFSET = 0.15;

type ModelType = "lv" | "asm" | "j4444" | "pad";

interface ReturnButtonProps {
  position: [number, number, number];
  onClick: () => void;
}

const ReturnButton = ({ position, onClick }: ReturnButtonProps) => {
  const [hovered, setHovered] = useState(false);
  const ringRef = useRef<THREE.Mesh>(null);
  const arrowRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (ringRef.current) {
      ringRef.current.rotation.z = time * 0.5;
    }
    if (arrowRef.current) {
      arrowRef.current.position.x = Math.sin(time * 3) * 0.05;
    }
  });

  return (
    <group position={position}>
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
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
        <meshStandardMaterial
          color={hovered ? "#3b82f6" : "#2563eb"}
          emissive={hovered ? "#3b82f6" : "#2563eb"}
          emissiveIntensity={hovered ? 1.2 : 0.8}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      <mesh ref={ringRef}>
        <torusGeometry args={[0.52, 0.03, 16, 32]} />
        <meshStandardMaterial
          color="#60a5fa"
          emissive="#60a5fa"
          emissiveIntensity={0.6}
          transparent
          opacity={0.7}
        />
      </mesh>

      <group ref={arrowRef} position={[0, 0, 0.06]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.15, 0.3, 3]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={hovered ? 0.5 : 0.3}
          />
        </mesh>
      </group>

      {hovered && (
        <Html center distanceFactor={8}>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-2xl whitespace-nowrap border border-white/30 backdrop-blur-sm">
            Return to Main Model
          </div>
        </Html>
      )}
    </group>
  );
};

interface J4444Props {
  onReturnClick?: (model: ModelType) => void;
}

const J4444 = ({ onReturnClick }: J4444Props) => {
  const result = useGLTF(MODEL_PATH);
  const groupRef = useRef<THREE.Group>(null);
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

  const handleReturnClick = () => {
    if (onReturnClick) {
      onReturnClick("lv");
    }
  };

  return (
    <group ref={groupRef}>
      <primitive object={result.scene} scale={0.025} />
      <ReturnButton
        position={[0, 1.5, 0]}
        onClick={handleReturnClick}
      />
    </group>
  );
};

export default J4444;
