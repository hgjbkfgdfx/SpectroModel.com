import React from "react";

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const baseStyles = "inline-flex items-center rounded-sm border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-mono uppercase tracking-widest";
  
  const variants = {
    default: "border-transparent bg-cyber-cyan text-cyber-black hover:bg-cyan-400/80",
    secondary: "border-transparent bg-cyber-purple text-white hover:bg-cyber-purple/80",
    destructive: "border-transparent bg-red-900 text-red-100 hover:bg-red-900/80",
    outline: "text-cyber-cyan border-cyber-cyan/30 bg-cyber-cyan/5"
  };

  const variantStyles = variants[variant] || variants.default;
  const combinedClassName = `${baseStyles} ${variantStyles} ${className || ""}`;

  return (
    <div ref={ref} className={combinedClassName} {...props} />
  );
});
Badge.displayName = "Badge";

export { Badge };