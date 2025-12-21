import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";

export default function CopyrightNotice() {
  return (
    <Alert className="bg-amber-900/30 border-amber-500/50 mb-6">
      <AlertTriangle className="h-5 w-5 text-amber-400" />
      <AlertDescription className="text-amber-200">
        <div className="space-y-2">
          <p className="font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Copyright & Ownership Notice
          </p>
          <p className="text-sm leading-relaxed">
            <strong>YOU retain 100% ownership</strong> of all uploaded music files. 
            SpectroModel does NOT claim rights to your music, sell licenses, or share files with third parties. 
            <strong>"AI Learns From My Data"</strong> is active: We use anonymized data to train and improve our AI models.
          </p>
          <p className="text-sm leading-relaxed">
            <strong>⚠️ You must own or have legal rights to upload files.</strong> 
            Uploading copyrighted material without permission violates our Terms of Service and may result in account termination.
          </p>
          <p className="text-xs text-amber-300 mt-2">
            Analysis results (hit scores, recommendations) are for informational purposes only. 
            SpectroModel is not liable for business decisions based on our predictions.
          </p>
          <p className="text-xs text-amber-300 mt-2 border-t border-amber-500/30 pt-2">
            Platform compatibility: Optimized for iPhone X (10) (2018) - iPhone 17 (2025).
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
}