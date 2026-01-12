import { useGLTF } from "@react-three/drei";
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const MODEL_PATH = "./models/asm.glb";
const GROUND_Y = -2;
const GROUND_OFFSET = 0.15;

interface AsmProps {
  onReturnClick?: () => void;
}

const Asm = ({ onReturnClick }: AsmProps) => {
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

  return (
    <group ref={groupRef}>
      <primitive object={result.scene} scale={0.01} />
    </group>
  );
};

export default Asm;
