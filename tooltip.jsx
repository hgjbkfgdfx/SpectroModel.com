import * as React from "react"
import { cn } from "@/lib/utils"

const TooltipProvider = ({ children }) => {
  return <>{children}</>
}

const Tooltip = ({ children }) => {
  const [open, setOpen] = React.useState(false)
  
  return (
    <div className="relative inline-block">
      {React.Children.map(children, child =>
        React.cloneElement(child, { open, setOpen })
      )}
    </div>
  )
}

const TooltipTrigger = ({ children, open, setOpen }) => {
  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="cursor-help"
    >
      {children}
    </div>
  )
}

const TooltipContent = ({ children, className, open }) => {
  if (!open) return null
  
  return (
    <div
      className={cn(
        "absolute z-50 px-3 py-2 text-sm rounded-lg shadow-lg",
        "bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
    >
      {children}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-px">
        <div className="border-4 border-transparent border-t-slate-800" />
      </div>
    </div>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }