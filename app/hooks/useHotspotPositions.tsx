import { useEffect, useState, useMemo } from "react";
import * as THREE from "three";

interface UseHotspotPositionsProps {
  scene: THREE.Group;
  meshNamesToLabel: { name: string; label: string; positionAdjustments?: [number, number, number] }[];
}

export const useHotspotPositions = ({ scene, meshNamesToLabel }: UseHotspotPositionsProps) => {
  const worldPosition = useMemo(() => new THREE.Vector3(), []);
  const [hotspots, setHotspots] = useState<
    { name: string; position: [number, number, number]; positionAdjustments?: [number, number, number] }[]
  >([]);

  useEffect(() => {
    const foundHotspots: {
      name: string;
      position: [number, number, number];
      positionAdjustments?: [number, number, number];
    }[] = [];
    scene.traverse((child) => {
      const foundEntity = meshNamesToLabel.find((mesh) => mesh.name === child.name);
      if ((child as THREE.Mesh).isMesh && foundEntity) {
        child.getWorldPosition(worldPosition);
        foundHotspots.push({
          name: foundEntity.label,
          position: [worldPosition.x, worldPosition.y, worldPosition.z],
          positionAdjustments: foundEntity.positionAdjustments,
        });
      }
    });

    setHotspots(foundHotspots);
  }, [scene, meshNamesToLabel, worldPosition]);

  return { hotspots, updateHotspots: setHotspots };
};
