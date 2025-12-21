import React from "react";

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 uppercase tracking-wider font-mono clip-path-slant";
  
  const variants = {
    default: "bg-cyber-cyan text-cyber-black hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] border border-transparent",
    destructive: "bg-red-600 text-white hover:bg-red-700 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] border border-red-800",
    outline: "border border-cyber-cyan/30 text-cyber-cyan bg-transparent hover:bg-cyber-cyan/10 hover:border-cyber-cyan/60",
    secondary: "bg-cyber-panel text-cyber-cyan border border-cyber-panel hover:border-cyber-cyan/30",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline"
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-sm px-3",
    lg: "h-11 rounded-sm px-8",
    icon: "h-10 w-10"
  };

  const variantStyles = variants[variant] || variants.default;
  const sizeStyles = sizes[size] || sizes.default;
  
  const combinedClassName = `${baseStyles} ${variantStyles} ${sizeStyles} ${className || ""}`;

  return (
    <button
      ref={ref}
      className={combinedClassName}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };