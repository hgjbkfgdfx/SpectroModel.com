import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, id, ...props }, ref) => {
  const handleChange = (e) => {
    if (onCheckedChange) {
      onCheckedChange(e.target.checked);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        ref={ref}
        id={id}
        checked={checked}
        onChange={handleChange}
        className="sr-only peer"
        {...props}
      />
      <div
        className={cn(
          "h-4 w-4 shrink-0 rounded-sm border border-slate-300 ring-offset-white",
          "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-purple-500 peer-focus-visible:ring-offset-2",
          "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
          "peer-checked:bg-purple-600 peer-checked:border-purple-600",
          "flex items-center justify-center transition-all cursor-pointer",
          className
        )}
        onClick={() => {
          const checkbox = document.getElementById(id);
          if (checkbox) {
            checkbox.click();
          }
        }}
      >
        {checked && <Check className="h-3 w-3 text-white" />}
      </div>
    </div>
  );
});

Checkbox.displayName = "Checkbox";