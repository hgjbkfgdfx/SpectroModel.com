import React, { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useMLDataCollector } from '@/components/shared/MLDataCollector';

export default function DataLearningPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();

  useEffect(() => {
    mlDataCollector.record('locked_page_access_attempt', { feature: 'data_learning', timestamp: Date.now() });
  }, []);

  return (
    <div className="min-h-screen bg-[#030014] flex items-center justify-center p-8">
      <Card className="max-w-md bg-red-950/20 border-red-500/50 p-8 text-center">
        <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-white mb-2">ACCESS DENIED</h2>
        <p className="text-red-300 mb-6">This feature is locked for all users.</p>
        <Button onClick={() => navigate(createPageUrl("Dashboard"))} className="bg-red-600">Return to Dashboard</Button>
      </Card>
    </div>
  );
}