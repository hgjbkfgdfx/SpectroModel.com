import React, { useState, useEffect, createContext, useContext } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ChevronRight, X, Play, HelpCircle } from "lucide-react";
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import { base44 } from "@/api/base44Client";

const TutorialContext = createContext();

export const useTutorial = () => useContext(TutorialContext);

const TUTORIAL_STEPS = {
  'Dashboard': [
    {
      target: 'header',
      title: 'Welcome to SpectroModel',
      content: 'This is your command center. From here you can access all analysis tools, project management, and monetization features.',
      position: 'bottom'
    },
    {
      target: 'stats-cards',
      title: 'Real-time Analytics',
      content: 'Track your analysis usage, hit scores, and project progress in real-time. These cards update automatically.',
      position: 'bottom'
    },
    {
      target: 'quick-actions',
      title: 'Quick Actions',
      content: 'Jump straight into your most used features like uploading a track or starting a new project.',
      position: 'top'
    }
  ],
  'Analyze': [
    {
      target: 'upload-zone',
      title: 'Secure Upload',
      content: 'Drag and drop your audio files here. We support all major formats. Your files are encrypted during transfer and analysis.',
      position: 'bottom'
    },
    {
      target: 'converter',
      title: 'Built-in Converter',
      content: 'Need a different format? Use our secure, client-side converter before analysis.',
      position: 'top'
    }
  ],
  'Monetization': [
    {
      target: 'monetization-tabs',
      title: 'Revenue Streams',
      content: 'Manage all your income sources in one place: Royalties, NFTs, Subscriptions, and Licensing.',
      position: 'bottom'
    },
    {
      target: 'pricing-insights',
      title: 'AI Pricing Advisor',
      content: 'Use our AI to determine the optimal pricing for your beats, merchandise, and subscription tiers based on market data.',
      position: 'top'
    }
  ],
  'Welcome': [
    {
      target: 'header',
      title: 'Welcome to SpectroModel! 🚀',
      content: 'You have successfully signed in. This quick tour will guide you through the key features of the platform.',
      position: 'center'
    },
    {
      target: 'dashboard-nav',
      title: 'Navigation',
      content: 'Use the sidebar to access Analysis Tools, Business Features, and Creative Studios.',
      position: 'right'
    },
    {
      target: 'analyze-nav',
      title: 'Start Analyzing',
      content: 'Upload your tracks here to get AI-powered hit predictions, rhythm analysis, and more.',
      position: 'right'
    },
    {
      target: 'settings-nav',
      title: 'Settings & Profile',
      content: 'Customize your experience, manage your subscription, and update your profile here.',
      position: 'right'
    },
    {
      target: 'help-trigger',
      title: 'Need Help?',
      content: 'Click this icon on any page to replay the tutorial or get specific help for that section.',
      position: 'left'
    }
  ]
};

export function TutorialProvider({ children, user }) {
  const [activeTutorial, setActiveTutorial] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedTutorials, setCompletedTutorials] = useState([]);
  const mlDataCollector = useMLDataCollector();

  useEffect(() => {
    if (user && user.completed_tutorials) {
      setCompletedTutorials(user.completed_tutorials);
    }
  }, [user]);

  const startTutorial = (pageName) => {
    if (TUTORIAL_STEPS[pageName]) {
      setActiveTutorial(pageName);
      setCurrentStepIndex(0);
      mlDataCollector.record('tutorial_start', { tutorial: pageName });
    }
  };

  const nextStep = () => {
    const steps = TUTORIAL_STEPS[activeTutorial];
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      completeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const restartTutorial = () => {
    if (activeTutorial) {
      setCurrentStepIndex(0);
    }
  };

  const completeTutorial = async () => {
    if (!activeTutorial) return;
    
    const newCompleted = [...completedTutorials, activeTutorial];
    setCompletedTutorials(newCompleted);
    
    mlDataCollector.record('tutorial_complete', { tutorial: activeTutorial });
    
    // Persist to user profile if possible
    try {
      // Note: This assumes we can update the user entity. If not, we rely on local state/ml data
      if (user) {
        await base44.auth.updateMe({
          completed_tutorials: newCompleted
        });
      }
    } catch (e) {
      console.warn('Failed to save tutorial progress', e);
    }

    setActiveTutorial(null);
    setCurrentStepIndex(0);
  };

  const skipTutorial = () => {
    mlDataCollector.record('tutorial_skip', { tutorial: activeTutorial, step: currentStepIndex });
    setActiveTutorial(null);
    setCurrentStepIndex(0);
  };

  // AI-driven contextual help
  const suggestTutorial = (pageName) => {
    // If user hasn't done the tutorial for this page and visits it often, or it's their first time
    if (TUTORIAL_STEPS[pageName] && !completedTutorials.includes(pageName)) {
       // Could add more complex logic here based on visit count from ML Data
       return true;
    }
    return false;
  };

  return (
    <TutorialContext.Provider value={{ startTutorial, activeTutorial, suggestTutorial, completedTutorials }}>
      {children}
      {activeTutorial && (
        <TutorialOverlay 
          steps={TUTORIAL_STEPS[activeTutorial]} 
          currentStep={currentStepIndex}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={skipTutorial}
        />
      )}
    </TutorialContext.Provider>
  );
}

function TutorialOverlay({ steps, currentStep, onNext, onPrev, onSkip }) {
  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  // Position logic would go here - for now we center or use fixed positions for simplicity/robustness
  // In a full implementation, we'd use a library like popper.js to attach to the 'target' element ID
  
  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="pointer-events-auto bg-white text-black p-6 rounded-xl shadow-2xl max-w-md w-full mx-4 border-2 border-purple-500 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-600 text-white">Step {currentStep + 1}/{steps.length}</Badge>
            <h3 className="font-bold text-lg">{step.title}</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onSkip} className="h-6 w-6 text-slate-400 hover:text-red-500">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <p className="text-slate-600 mb-6 leading-relaxed">
          {step.content}
        </p>

        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 w-2 rounded-full transition-all ${i === currentStep ? 'bg-purple-600 w-4' : 'bg-slate-200'}`} 
              />
            ))}
          </div>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button onClick={onPrev} variant="outline" className="border-slate-300 text-slate-600 hover:bg-slate-100">
                Back
              </Button>
            )}
            <Button onClick={onNext} className="bg-purple-600 hover:bg-purple-700 text-white shadow-md group">
              {isLast ? 'Finish' : 'Next'} 
              {!isLast && <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />}
              {isLast && <Sparkles className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}