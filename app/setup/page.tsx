"use client";

import LoadingSpinner from "../_components/LoadingSpinner";
import { useActiveComponent } from "../providers/ActiveComponentProvider";
import DeviceSetup from "./setup";

const Setup = () => {
  const { loading } = useActiveComponent();

  const anyLoading = Object.values(loading).some((value) => value);

  return anyLoading ? <LoadingSpinner /> : <DeviceSetup />;
};

export default Setup;
