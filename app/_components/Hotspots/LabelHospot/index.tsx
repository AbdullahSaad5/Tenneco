import { useActiveComponent } from "@/app/providers/ActiveComponentProvider";
import { Html } from "@react-three/drei";
import React, { useMemo, useState } from "react";
import { Group } from "three";

type HotspotProps = {
  position: [number, number, number];
  groupRef?: React.RefObject<Group>;
  occlude?: boolean;
  onClick?: () => void;
  label?: string; // New prop for the label text
  show?: boolean;
  positionAdjustments?: [number, number, number];
};

const Label = ({
  position,
  groupRef,
  occlude = false,
  label = "Hotspot",
  show = true,
  positionAdjustments = [0, 0, 0],
}: HotspotProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { scaleFactor } = useActiveComponent();

  const calculatedScaleFactor = useMemo(() => {
    return scaleFactor < 1 ? 1 : scaleFactor;
  }, [scaleFactor]);

  if (!show) return;

  const finalCalculatedPosition = (
    positionAdjustments
      ? [
          position[0] + positionAdjustments[0],
          position[1] + positionAdjustments[1],
          position[2] + positionAdjustments[2],
        ]
      : position
  ) as [number, number, number];

  return (
    <Html
      position={finalCalculatedPosition}
      center
      distanceFactor={calculatedScaleFactor}
      occlude={groupRef && occlude ? [groupRef] : undefined}
      className="pointer-events-auto"
    >
      <div className="relative">
        {/* Label that appears on hover */}

        {isHovered && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap select-none">
            <div className="bg-secondary text-primary px-2 py-1 rounded shadow-lg text-sm">{label}</div>
            {/* Triangle pointer */}
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#c9ed08]/90 mx-auto" />
          </div>
        )}

        {/* Hotspot button */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="cursor-default bg-transparent border-[3px] border-secondary rounded-full p-1 hover:border-secondaryHover transition-colors duration-200"
        />
      </div>
    </Html>
  );
};

export default Label;
