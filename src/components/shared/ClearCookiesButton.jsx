import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ClearCookiesButton({ variant = "outline", size = "sm" }) {
  const handleClearCookies = () => {
    try {
      // INTELLIGENT CLEAR: Preserves Auth Tokens
      
      // 1. Clear App Cookies only (ignoring common auth cookies if possible, though exact names vary)
      // Base44/Supabase auth often uses specific keys. We'll clear everything else.
      document.cookie.split(";").forEach(cookie => {
        const name = cookie.split("=")[0].trim();
        // Skip clearing potential auth cookies if we can identify them (often start with sb- or base44)
        if (!name.startsWith('sb-') && !name.includes('auth') && !name.includes('token')) {
             document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });

      // 2. Clear localStorage safely (Preserving Auth)
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            // Keep auth tokens
            if (key && !key.includes('auth') && !key.includes('token') && !key.includes('sb-') && !key.includes('user')) {
                keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
        }
      } catch (e) {
        console.warn("localStorage clear failed:", e);
      }

      // 3. Clear sessionStorage safely (Preserving Auth)
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
           // Often session storage is temporary data, usually safe to clear, but let's be careful
           const keysToRemove = [];
           for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && !key.includes('auth') && !key.includes('token')) {
                keysToRemove.push(key);
            }
           }
           keysToRemove.forEach(key => sessionStorage.removeItem(key));
        }
      } catch (e) {
        console.warn("sessionStorage clear failed:", e);
      }

      alert("✓ App cache and data cleared (Login preserved).");
      
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Error clearing cookies:", error);
      alert("Failed to clear some data. Please try again.");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size={size} className="w-full border-red-600 text-red-300 hover:bg-red-900/50">
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Cookies
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-slate-800 border-slate-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Clear All Cookies & Storage?</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300">
            This will clear all cookies, localStorage, and sessionStorage. 
            You may need to log in again. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleClearCookies}
            className="bg-red-600 hover:bg-red-700"
          >
            Clear Everything
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}