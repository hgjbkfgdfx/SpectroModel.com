import React, { useState, createContext, useContext } from "react";
import { cn } from "@/lib/utils";

const TabsContext = createContext();

const Tabs = ({ defaultValue, value, onValueChange, className, children, ...props }) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultValue);
  
  // Use controlled value if provided, otherwise use internal state
  const activeTab = value !== undefined ? value : internalActiveTab;
  const setActiveTab = onValueChange || setInternalActiveTab;
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-slate-800 p-1 text-slate-400 w-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const TabsTrigger = ({ value, className, children, ...props }) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;
  
  return (
    <button
      type="button"
      onClick={() => setActiveTab(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50 flex-1",
        isActive ? "bg-purple-600 text-white shadow-sm" : "text-slate-400 hover:text-white",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, className, children, ...props }) => {
  const { activeTab } = useContext(TabsContext);
  
  if (activeTab !== value) {
    return null;
  }
  
  return (
    <div
      className={cn(
        "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };