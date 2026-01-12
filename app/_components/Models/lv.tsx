import { useGLTF, Html } from "@react-three/drei";
import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
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
}

const Hotspot = ({ position, onClick, label, color }: HotspotProps) => {
  const [hovered, setHovered] = useState(false);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = time * 0.5;
      ring1Ref.current.scale.setScalar(1 + Math.sin(time * 2) * 0.1);
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -time * 0.7;
      ring2Ref.current.scale.setScalar(1 + Math.sin(time * 2 + 1) * 0.1);
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = time * 0.3;
    }
    if (coreRef.current) {
      coreRef.current.scale.setScalar(1 + Math.sin(time * 4) * 0.15);
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
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <mesh ref={coreRef}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 2 : 1.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      <mesh ref={ring1Ref}>
        <torusGeometry args={[0.25, 0.02, 16, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 1.2 : 0.8}
          transparent
          opacity={hovered ? 0.9 : 0.7}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      <mesh ref={ring2Ref}>
        <torusGeometry args={[0.32, 0.015, 16, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 1 : 0.6}
          transparent
          opacity={hovered ? 0.8 : 0.5}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      <mesh ref={ring3Ref}>
        <ringGeometry args={[0.35, 0.38, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.4 : 0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {hovered && (
        <Html center distanceFactor={8}>
          <div 
            className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-2xl whitespace-nowrap border border-white/20 backdrop-blur-sm"
            style={{
              boxShadow: `0 0 20px ${color}40`
            }}
          >
            {label}
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
      <primitive object={result.scene} scale={0.05} />
      
      <Hotspot
        position={[-2, 0.5, 1]}
        onClick={() => handleHotspotClick("pad")}
        label="Brake Pad Assembly"
        color="#f59e0b"
      />
      <Hotspot
        position={[2, 0.8, -0.5]}
        onClick={() => handleHotspotClick("j4444")}
        label="J-4444 Component"
        color="#8b5cf6"
      />
      <Hotspot
        position={[0, 1.2, 2]}
        onClick={() => handleHotspotClick("asm")}
        label="ASM Assembly"
        color="#ec4899"
      />
    </group>
  );
};

export default LV;
