import React from "react";
import { cn } from "@/lib/utils";

export const Slider = React.forwardRef(({ className, value = [50], onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
  const [internalValue, setInternalValue] = React.useState(value);
  
  React.useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = [parseInt(e.target.value)];
    setInternalValue(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  const percentage = ((internalValue[0] - min) / (max - min)) * 100;

  return (
    <div ref={ref} className={cn("relative w-full", className)} {...props}>
      <div className="relative h-2 w-full rounded-full bg-slate-700">
        <div 
          className="absolute h-full rounded-full bg-purple-500 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={internalValue[0]}
        onChange={handleChange}
        className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer"
      />
      <div 
        className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-purple-500 bg-white transition-all pointer-events-none"
        style={{ left: `calc(${percentage}% - 10px)` }}
      />
    </div>
  );
});

Slider.displayName = "Slider";