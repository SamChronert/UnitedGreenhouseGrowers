import { createContext, useContext, ReactNode } from "react";

interface DemoContextType {
  isDemo: boolean;
  showDemoAction: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ 
  children, 
  isDemo = false 
}: { 
  children: ReactNode;
  isDemo?: boolean;
}) {
  const showDemoAction = () => {
    alert("This is a demo dashboard. Please register or login to access full functionality.");
  };

  return (
    <DemoContext.Provider value={{ isDemo, showDemoAction }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    return { isDemo: false, showDemoAction: () => {} };
  }
  return context;
}
