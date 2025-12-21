import React from "react";
import { cn } from "@/lib/utils";

export const Switch = React.forwardRef(({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
  const handleClick = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleClick}
      ref={ref}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-purple-600" : "bg-slate-700",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
});

Switch.displayName = "Switch";