import { useGLTF } from "@react-three/drei";
import React from "react";

const MODEL_PATH = "./models/pad.glb";

const Pad = () => {
  const result = useGLTF(MODEL_PATH);

  return <primitive object={result.scene} scale={0.05} />;
};

export default Pad;
