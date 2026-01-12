import { cn } from "@/app/utils/cn";
import React from "react";

const NumberHotspot = ({
  color,
  position,
  onClick,
  number,
}: {
  color: string;
  position: {
    x: number;
    y: number;
  };
  onClick: () => void;
  number: number;
}) => {
  return (
    <div
      className={cn(
        "w-[60px] h-[60px] rounded-full border-4 border-white absolute grid place-items-center cursor-pointer text-white",
        color === "white"
          ? "border-white hover:bg-primary hover:border-primary"
          : "border-secondary hover:bg-secondary hover:text-primary"
      )}
      style={{
        top: `${position.y}%`,
        left: `${position.x}%`,
      }}
      onClick={onClick}
    >
      <p className="text-2xl font-bold">{number}</p>
    </div>
  );
};

export default NumberHotspot;
