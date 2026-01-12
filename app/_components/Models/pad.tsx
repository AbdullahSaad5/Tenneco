import { useGLTF } from "@react-three/drei";
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const MODEL_PATH = "./models/pad.glb";
const GROUND_Y = -2; // Ground plane Y position
const GROUND_OFFSET = 0.15; // Space between model bottom and ground

const Pad = () => {
  const result = useGLTF(MODEL_PATH);
  const groupRef = useRef<THREE.Group>(null);
  const isPositionedRef = useRef(false);

  useFrame(() => {
    if (groupRef.current && !isPositionedRef.current) {
      // Calculate bounding box after model is rendered
      const box = new THREE.Box3();
      box.setFromObject(groupRef.current);
      
      // Check if bounding box is valid
      if (box.isEmpty()) return;
      
      // Get the minimum Y (bottom of the model)
      const minY = box.min.y;
      
      // Calculate offset to place bottom above ground with some space
      const offsetY = GROUND_Y - minY + GROUND_OFFSET;
      
      // Apply offset to position
      groupRef.current.position.y = offsetY;
      isPositionedRef.current = true;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={result.scene} scale={0.05} />
    </group>
  );
};

export default Pad;
