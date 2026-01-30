import { useGLTF } from "@react-three/drei";
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ModelConfiguration } from "../../_types/content";

interface J4444Props {
  config: ModelConfiguration;
  onReturnClick?: () => void;
}

const J4444 = ({ config }: J4444Props) => {
  const modelPath = config.modelFile.fallbackPath || "./models/J-4444.glb";
  const result = useGLTF(modelPath);
  const groupRef = useRef<THREE.Group>(null);
  const isPositionedRef = useRef(false);

  useFrame(() => {
    if (groupRef.current && !isPositionedRef.current) {
      const box = new THREE.Box3();
      box.setFromObject(groupRef.current);

      if (box.isEmpty()) return;

      const minY = box.min.y;
      const offsetY = config.transform.groundY - minY + config.transform.groundOffset;

      groupRef.current.position.y = offsetY;
      isPositionedRef.current = true;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive
        object={result.scene}
        scale={config.transform.scale}
        rotation={[
          config.transform.rotation.x,
          config.transform.rotation.y,
          config.transform.rotation.z
        ]}
      />
    </group>
  );
};

export default J4444;
