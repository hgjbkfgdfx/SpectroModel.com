import React, { useState, createContext, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const AlertDialogContext = createContext();

export const AlertDialog = ({ children, open, onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (newOpen) => {
    setIsOpen(newOpen);
    if (onOpenChange) onOpenChange(newOpen);
  };

  const contextValue = {
    isOpen: open !== undefined ? open : isOpen,
    setIsOpen: handleOpenChange
  };

  return (
    <AlertDialogContext.Provider value={contextValue}>
      {children}
    </AlertDialogContext.Provider>
  );
};

export const AlertDialogTrigger = ({ children, asChild }) => {
  const context = useContext(AlertDialogContext);
  
  const handleClick = (e) => {
    e.stopPropagation();
    if (context?.setIsOpen) {
      context.setIsOpen(true);
    }
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick
    });
  }

  return (
    <button onClick={handleClick}>
      {children}
    </button>
  );
};

export const AlertDialogContent = ({ children, className }) => {
  const context = useContext(AlertDialogContext);
  
  if (!context?.isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-50 bg-black/80 animate-in fade-in-0"
        onClick={() => context.setIsOpen(false)}
      />
      
      {/* Dialog */}
      <div 
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
          "gap-4 border bg-slate-800 border-slate-700 p-6 shadow-lg duration-200",
          "animate-in fade-in-0 zoom-in-95 sm:rounded-lg",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </>
  );
};

export const AlertDialogHeader = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}>
      {children}
    </div>
  );
};

export const AlertDialogFooter = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}>
      {children}
    </div>
  );
};

export const AlertDialogTitle = ({ children, className }) => {
  return (
    <h2 className={cn("text-lg font-semibold text-white", className)}>
      {children}
    </h2>
  );
};

export const AlertDialogDescription = ({ children, className }) => {
  return (
    <p className={cn("text-sm text-slate-300", className)}>
      {children}
    </p>
  );
};

export const AlertDialogAction = ({ children, onClick, className }) => {
  const context = useContext(AlertDialogContext);
  
  const handleClick = async (e) => {
    e.stopPropagation();
    if (onClick) {
      await onClick(e);
    }
    if (context?.setIsOpen) {
      context.setIsOpen(false);
    }
  };

  return (
    <Button onClick={handleClick} className={className}>
      {children}
    </Button>
  );
};

export const AlertDialogCancel = ({ children, className }) => {
  const context = useContext(AlertDialogContext);
  
  const handleClick = (e) => {
    e.stopPropagation();
    if (context?.setIsOpen) {
      context.setIsOpen(false);
    }
  };
  
  return (
    <Button 
      variant="outline" 
      onClick={handleClick}
      className={cn("mt-2 sm:mt-0 bg-slate-700 text-white hover:bg-slate-600", className)}
    >
      {children}
    </Button>
  );
};

export const AlertDialogPortal = ({ children }) => {
  return <>{children}</>;
};

export const AlertDialogOverlay = () => {
  return null;
};