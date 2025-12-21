import * as React from "react"
import { cn } from "@/lib/utils"

const Sheet = ({ children }) => <div>{children}</div>
const SheetTrigger = ({ children }) => <>{children}</>
const SheetContent = ({ children, className }) => (
  <div className={cn("fixed inset-y-0 right-0 z-50 h-full w-3/4 border-l bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm", className)}>
    {children}
  </div>
)
const SheetHeader = ({ children, className }) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}>
    {children}
  </div>
)
const SheetFooter = ({ children, className }) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}>
    {children}
  </div>
)
const SheetTitle = ({ children, className }) => (
  <div className={cn("text-lg font-semibold text-foreground", className)}>
    {children}
  </div>
)
const SheetDescription = ({ children, className }) => (
  <div className={cn("text-sm text-muted-foreground", className)}>
    {children}
  </div>
)

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}