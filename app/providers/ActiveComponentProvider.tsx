import React from "react";
import { useGLTF } from "@react-three/drei";
import useAxios from "../hooks/useAxios";
import { ComponentsData, ModelsData, ActiveComponent } from "../_types";
import { TechnologiesData, SetupData, BenefitsData } from "../_types/axios";
import { usePathname } from "next/navigation";

interface LoadingState {
  components: boolean;
  models: boolean;
  technologies: boolean;
  setup: boolean;
  benefits: boolean;
}

type ActiveComponentContextType = {
  activeComponent: ActiveComponent;
  handleSetActiveComponent: (component: ActiveComponent) => void;
  zoomLevel: number;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  scaleFactor: number;
  showComponentDetails: boolean;
  setShowComponentDetails: React.Dispatch<React.SetStateAction<boolean>>;
  componentsData: ComponentsData | null;
  setComponentsData: React.Dispatch<React.SetStateAction<ComponentsData | null>>;
  modelsData: ModelsData | null;
  setModelsData: React.Dispatch<React.SetStateAction<ModelsData | null>>;
  technologiesData: TechnologiesData | null;
  setTechnologiesData: React.Dispatch<React.SetStateAction<TechnologiesData | null>>;
  setupData: SetupData | null;
  setSetupData: React.Dispatch<React.SetStateAction<SetupData | null>>;
  benefitsData: BenefitsData | null;
  setBenefitsData: React.Dispatch<React.SetStateAction<BenefitsData | null>>;
  loading: LoadingState;
};

const ActiveComponentContext = React.createContext<ActiveComponentContextType | undefined>(undefined);

const ActiveComponentProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeComponent, setActiveComponent] = React.useState<ActiveComponent>(null);
  const [showComponentDetails, setShowComponentDetails] = React.useState(false);
  const [zoomLevel, setZoomLevel] = React.useState(1);
  const scaleFactor = 0.5 / zoomLevel;
  const maxScale = 1.5;
  const [componentsData, setComponentsData] = React.useState<ComponentsData | null>(null);
  const [modelsData, setModelsData] = React.useState<ModelsData | null>(null);
  const [technologiesData, setTechnologiesData] = React.useState<TechnologiesData | null>(null);
  const [setupData, setSetupData] = React.useState<SetupData | null>(null);
  const [benefitsData, setBenefitsData] = React.useState<BenefitsData | null>(null);
  const [loading, setLoading] = React.useState<LoadingState>({
    components: true,
    models: true,
    technologies: true,
    setup: true,
    benefits: true,
  });

  const { getComponentsData, getModelsData, getTechnologiesData, getSetupData, getBenefitsData } = useAxios();

  const pathname = usePathname();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [componentsResult, modelsResult, technologiesResult, setupResult, benefitsResult] = await Promise.all([
          getComponentsData(),
          getModelsData(),
          getTechnologiesData(),
          getSetupData(),
          getBenefitsData(),
        ]);

        setComponentsData(componentsResult);
        setModelsData(modelsResult);
        setTechnologiesData(technologiesResult);
        setSetupData(setupResult);
        setBenefitsData(benefitsResult);
        setLoading({
          components: false,
          models: false,
          technologies: false,
          setup: false,
          benefits: false,
        });
      } catch (error) {
        console.log(error);
        // Handle AbortError from the useAxios hook
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Data fetching cancelled");
          return;
        }

        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Error fetching data:", errorMessage);

        setLoading({
          components: false,
          models: false,
          technologies: false,
          setup: false,
          benefits: false,
        });
      }
    };

    fetchData();
    // get* functions are stable (from custom hook) so OK to ignore exhaustive deps lint
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Preload 3D models only when on the homepage and after modelsData is available.
  React.useEffect(() => {
    if (pathname !== "/" || !modelsData) return;

    const paths: string[] = [
      modelsData?.mediaData?.stand?.url ?? "",
      modelsData?.mediaData?.nozel?.url ?? "",
      modelsData?.mediaData?.machine?.url ?? "",
      modelsData?.mediaData?.device?.url ?? "",
    ].filter(Boolean);

    paths.forEach((p) => useGLTF.preload(p));
  }, [pathname, modelsData]);

  const handleSetActiveComponent = (component: ActiveComponent) => {
    if (activeComponent === component) {
      setActiveComponent(null);
      setShowComponentDetails(false);
    } else {
      setActiveComponent(component);
    }
  };

  const value: ActiveComponentContextType = {
    activeComponent,
    handleSetActiveComponent,
    zoomLevel,
    setZoomLevel,
    scaleFactor: scaleFactor > maxScale ? maxScale : scaleFactor,
    showComponentDetails,
    setShowComponentDetails,
    componentsData,
    setComponentsData,
    modelsData,
    setModelsData,
    technologiesData,
    setTechnologiesData,
    setupData,
    setSetupData,
    benefitsData,
    setBenefitsData,
    loading,
  };

  return <ActiveComponentContext.Provider value={value}>{children}</ActiveComponentContext.Provider>;
};

export const useActiveComponent = (): ActiveComponentContextType => {
  const context = React.useContext(ActiveComponentContext);
  if (!context) {
    throw new Error("useActiveComponent must be used within an ActiveComponentProvider");
  }
  return context;
};

export default ActiveComponentProvider;
