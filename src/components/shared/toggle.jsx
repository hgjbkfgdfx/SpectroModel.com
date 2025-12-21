import * as React from "react"
import { cn } from "@/lib/utils"

const Toggle = React.forwardRef(({ className, pressed, onPressedChange, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-pressed={pressed}
    data-state={pressed ? "on" : "off"}
    className={cn(
      "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
      className
    )}
    onClick={() => onPressedChange?.(!pressed)}
    {...props}
  />
))
Toggle.displayName = "Toggle"

export { Toggle }