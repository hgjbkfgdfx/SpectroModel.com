import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import AnalysisResults from "../components/analyze/AnalysisResults";
import RhythmAnalysisResults from "../components/rhythm/RhythmAnalysisResults";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Cpu, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useMLDataCollector } from "../components/shared/MLDataCollector";
import { validateCSP, blockScriptInjection } from "../components/shared/SecurityValidator";
import { NetworkErrorBanner, AILearningBanner, setupGlobalNetworkHandler } from "../components/shared/NetworkErrorHandler";
import LiveSecurityDisplay from "../components/shared/LiveSecurityDisplay";
import LiveThreatDisplay from "../components/shared/LiveThreatDisplay";

export default function AnalysisResultPage() {
    const navigate = useNavigate();
    const mlDataCollector = useMLDataCollector();
    const [analysis, setAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const hasFetched = useRef(false);

    // Security init - run once
    useEffect(() => {
        setupGlobalNetworkHandler();
        blockScriptInjection();
        validateCSP();
    }, []);

    // Load analysis - run once on mount
    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        
        if (!id) {
            setError("Missing Analysis ID.");
            setIsLoading(false);
            return;
        }

        const loadData = async () => {
            try {
                const results = await base44.entities.MusicAnalysis.filter({ id });
                const data = results?.[0] || null;
                
                if (data) {
                    setAnalysis(data);
                    mlDataCollector.record('analysis_loaded', { id: data.id, type: data.analysis_type });
                } else {
                    setError("Analysis not found.");
                }
            } catch (err) {
                console.error("Failed to load analysis:", err);
                setError("Failed to load analysis.");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // WRAPPER: Common Cyberpunk Background
    const PageWrapper = ({ children }) => (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#0f0520] to-[#050015] p-4 md:p-8 text-cyan-50">
             <div className="relative z-10 max-w-7xl mx-auto space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <LiveSecurityDisplay />
                    <LiveThreatDisplay />
                </div>
                <NetworkErrorBanner />
                <AILearningBanner />
                {children}
             </div>
        </div>
    );

    // STATE: LOADING (System Boot)
    if (isLoading) {
        return (
            <PageWrapper>
                <div className="space-y-8 animate-pulse">
                    <div className="flex items-center gap-4">
                         <Skeleton className="h-12 w-12 rounded-full bg-slate-800/50" />
                         <Skeleton className="h-10 w-1/3 bg-slate-800/50" />
                    </div>
                    <Skeleton className="h-64 w-full rounded-xl bg-slate-800/30 border border-slate-700/30" />
                    <div className="grid md:grid-cols-3 gap-6">
                        <Skeleton className="h-48 w-full bg-slate-800/30 border border-slate-700/30 rounded-xl" />
                        <Skeleton className="h-48 w-full md:col-span-2 bg-slate-800/30 border border-slate-700/30 rounded-xl" />
                    </div>
                    <div className="text-center font-mono text-xs text-cyan-500/50 mt-4">
                        INITIALIZING DATA STREAMS...
                    </div>
                </div>
            </PageWrapper>
        );
    }

    // STATE: ERROR (System Failure)
    if (error) {
        return (
            <PageWrapper>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <Card className="max-w-md w-full bg-red-950/20 border border-red-500/50 backdrop-blur-xl shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                        <CardContent className="p-8 flex flex-col items-center text-center">
                            <AlertCircle className="w-16 h-16 text-red-500 mb-6 animate-pulse" />
                            <h2 className="text-2xl font-black text-white mb-2 tracking-widest uppercase">System Malfunction</h2>
                            <p className="text-red-200 font-mono text-sm mb-6">{error}</p>
                            <Button 
                                onClick={() => navigate(createPageUrl("Dashboard"))}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold tracking-wide"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                RETURN TO DASHBOARD
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </PageWrapper>
        );
    }
    
    // STATE: PROCESSING - show results anyway (analysis runs in browser)
    // No polling needed since DSP runs client-side

    // STATE: SUCCESS (Render Child Components)
    if (analysis) {
        // Logic to determine which view to show
        const isRhythmOnly = analysis.analysis_type === 'rhythm' || (analysis.rhythm_analysis && !analysis.hit_score);
        
        return (
            <PageWrapper>
                {isRhythmOnly ? (
                    <RhythmAnalysisResults
                        result={analysis}
                        onNewAnalysis={() => navigate(createPageUrl("AnalyzeRhythm"))}
                        onBackToDashboard={() => navigate(createPageUrl("Dashboard"))}
                    />
                ) : (
                    <AnalysisResults
                        analysis={analysis}
                        onNewAnalysis={() => navigate(createPageUrl("Analyze"))}
                        onBackToDashboard={() => navigate(createPageUrl("Dashboard"))}
                    />
                )}
            </PageWrapper>
        );
    }

    return null;
}