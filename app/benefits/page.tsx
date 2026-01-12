"use client";

import LoadingSpinner from "../_components/LoadingSpinner";
import { useActiveComponent } from "../providers/ActiveComponentProvider";
import Benefits from "./benefits";

const BenefitsPage = () => {
  const { loading } = useActiveComponent();

  const anyLoading = Object.values(loading).some((value) => value);

  console.log("loading", anyLoading);

  return anyLoading ? <LoadingSpinner /> : <Benefits />;
};

export default BenefitsPage;
