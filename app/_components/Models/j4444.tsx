import { useGLTF } from "@react-three/drei";
import React from "react";

const MODEL_PATH = "./models/J-4444.glb";

const J4444 = () => {
  const result = useGLTF(MODEL_PATH);

  return <primitive object={result.scene} scale={0.025} />;
};

export default J4444;
