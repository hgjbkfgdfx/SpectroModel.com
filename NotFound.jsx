import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="bg-slate-800/80 border-slate-700/50 shadow-2xl max-w-2xl w-full">
        <CardContent className="p-12 text-center">
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="text-9xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                404
              </div>
              <AlertCircle className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-16 h-16 text-red-400 animate-bounce" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Page Not Found
          </h1>
          
          <p className="text-lg text-slate-300 mb-8">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate(createPageUrl("Dashboard"))}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Dashboard
            </Button>
            
            <Button
              onClick={() => navigate(createPageUrl("Landing"))}
              size="lg"
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Search className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-700">
            <p className="text-sm text-slate-400 mb-4">Popular pages:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(createPageUrl("Analyze"))}
                className="text-slate-300 hover:text-white"
              >
                Hit Analysis
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(createPageUrl("AnalyzeRhythm"))}
                className="text-slate-300 hover:text-white"
              >
                Rhythm Analysis
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(createPageUrl("SheetMusic"))}
                className="text-slate-300 hover:text-white"
              >
                Sheet Music
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(createPageUrl("FAQ"))}
                className="text-slate-300 hover:text-white"
              >
                FAQ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}