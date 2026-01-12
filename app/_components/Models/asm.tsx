import { useGLTF } from "@react-three/drei";
import React from "react";

const MODEL_PATH = "./models/asm.glb";

const Asm = () => {
  const result = useGLTF(MODEL_PATH);

  return <primitive object={result.scene} scale={0.01} />;
};

export default Asm;
