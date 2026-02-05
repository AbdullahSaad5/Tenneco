import React from "react";
import { ActiveComponent } from "../_types";

type ActiveComponentContextType = {
  activeComponent: ActiveComponent;
  handleSetActiveComponent: (component: ActiveComponent) => void;
  zoomLevel: number;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  scaleFactor: number;
  showComponentDetails: boolean;
  setShowComponentDetails: React.Dispatch<React.SetStateAction<boolean>>;
};

const ActiveComponentContext = React.createContext<ActiveComponentContextType | undefined>(undefined);

const ActiveComponentProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeComponent, setActiveComponent] = React.useState<ActiveComponent>(null);
  const [showComponentDetails, setShowComponentDetails] = React.useState(false);
  const [zoomLevel, setZoomLevel] = React.useState(1);
  const scaleFactor = 0.5 / zoomLevel;
  const maxScale = 1.5;

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
