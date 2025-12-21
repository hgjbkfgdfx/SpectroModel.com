import React, { useEffect, useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AlertCircle } from "lucide-react";

export default function AutoHealingMonitor() {
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleError = (event) => {
      console.error("App Error Detected:", event.error);
      setErrorMessage(event.error?.message || "An unexpected error occurred");
      setShowErrorDialog(true);
    };

    const handleUnhandledRejection = (event) => {
      console.error("Unhandled Promise Rejection:", event.reason);
      setErrorMessage(event.reason?.message || "An unexpected error occurred");
      setShowErrorDialog(true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handleFixWithAI = () => {
    window.open('https://base44.com/ai-chat', '_blank');
    setShowErrorDialog(false);
  };

  return (
    <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
      <AlertDialogContent className="bg-slate-800 border-red-500/50">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-400" />
            App Error Detected
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300">
            SpectroModel encountered an error: {errorMessage}
            <br /><br />
            Would you like to fix this with AI assistance? Click "Fix with AI" to open Base44's AI chat where you can describe the issue and get instant help.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setShowErrorDialog(false)} className="bg-slate-700 hover:bg-slate-600">
            Dismiss
          </AlertDialogAction>
          <AlertDialogAction onClick={handleFixWithAI} className="bg-purple-600 hover:bg-purple-700">
            Fix with AI Chat
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}