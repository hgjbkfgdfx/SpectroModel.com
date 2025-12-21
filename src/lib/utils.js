import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
} 

// Base44 route helper (added for deployment)
export function createPageUrl(path = "/") {
  if (!path) return "/";
  if (path.startsWith("#")) return path;
  // HashRouter pages: "#/route"
  return "#"+(path.startsWith("/") ? path : "/"+path);
}
