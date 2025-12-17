import React from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";

const Select = React.forwardRef(({ children, value, onValueChange, ...props }, ref) => {
  const [open, setOpen] = React.useState(false);
  // This is a simplified select for now
  return (
    <div className="relative">
      <select 
        className="w-full bg-transparent opacity-0 absolute inset-0 cursor-pointer z-10"
        value={value}
        onChange={(e) => onValueChange && onValueChange(e.target.value)}
        {...props}
        ref={ref}
      >
        {children}
      </select>
      <div className="flex h-10 w-full items-center justify-between rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white ring-offset-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
        <span>{value || "Select..."}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </div>
    </div>
  );
});
Select.displayName = "Select";

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white ring-offset-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </div>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = React.forwardRef(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("block truncate", className)}
    {...props}
  />
));
SelectValue.displayName = "SelectValue";

const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-700 bg-slate-900 text-white shadow-md animate-in fade-in-80",
      position === "popper" && "translate-y-1",
      className
    )}
    {...props}
  >
    <div className="p-1">{children}</div>
  </div>
));
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  return (
    <option value={value} className={cn("text-black", className)} {...props}>
      {children}
    </option>
  );
});
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };