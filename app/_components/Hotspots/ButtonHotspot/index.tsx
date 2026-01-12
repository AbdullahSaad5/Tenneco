import { useActiveComponent } from "@/app/providers/ActiveComponentProvider";
import { Html } from "@react-three/drei";
import { Plus } from "lucide-react";
import React from "react";
import { Group } from "three";

type HotspotProps = {
  position: [number, number, number];
  groupRef?: React.RefObject<Group>;
  occlude?: boolean;
  onClick?: () => void;
};

const Hotspot = ({ position, groupRef, occlude = false, onClick }: HotspotProps) => {
  const { scaleFactor } = useActiveComponent();

  return (
    <Html
      position={position}
      zIndexRange={[0, 0]}
      center
      distanceFactor={scaleFactor * 0.7}
      occlude={groupRef && occlude ? [groupRef] : undefined}
      className="pointer-events-auto"
    >
      <button
        onClick={() => {
          if (onClick) {
            onClick();
            return;
          }
          console.log("Hotspot clicked!");
        }}
        className="p-3 bg-secondary text-white rounded-lg
                   hover:bg-secondaryHover hover:opacity-75 transition-all duration-200
                   shadow-lg"
      >
        <Plus size={30} strokeWidth={2} className="text-primary" />
      </button>
    </Html>
  );
};

export default Hotspot;
