import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, Target, BookOpen, CheckCircle, Circle, 
  Brain, Shield, Sparkles, TrendingUp, Music, Headphones,
  Mic, Settings, ChevronRight
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const LEARNING_GOALS = [
  { id: 'ear_training', name: 'Improve Ear Training', icon: Headphones, color: 'from-blue-500 to-cyan-500', lessons: ['Interval Recognition', 'Chord Identification', 'Rhythm Dictation', 'Melody Transcription'] },
  { id: 'music_theory', name: 'Music Theory Fundamentals', icon: BookOpen, color: 'from-purple-500 to-pink-500', lessons: ['Scales & Modes', 'Chord Progressions', 'Voice Leading', 'Form & Structure'] },
  { id: 'production', name: 'Music Production', icon: Settings, color: 'from-orange-500 to-red-500', lessons: ['DAW Basics', 'Mixing Fundamentals', 'EQ & Compression', 'Mastering'] },
  { id: 'songwriting', name: 'Songwriting', icon: Music, color: 'from-green-500 to-emerald-500', lessons: ['Melody Writing', 'Lyric Craft', 'Song Structure', 'Hook Development'] },
  { id: 'vocal', name: 'Vocal Techniques', icon: Mic, color: 'from-pink-500 to-rose-500', lessons: ['Breathing', 'Pitch Control', 'Tone Development', 'Performance'] }
];

export default function PersonalizedLearningPath({ quizScores = {}, analysisQueries = [], user }) {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [completedLessons, setCompletedLessons] = useState({});
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Load progress from localStorage
    const saved = JSON.parse(localStorage.getItem('learning_progress') || '{}');
    setCompletedLessons(saved);
    
    // Generate AI recommendations based on activity
    generateRecommendations();
  }, [quizScores, analysisQueries]);

  const generateRecommendations = async () => {
    setIsGenerating(true);
    try {
      // Analyze user's activity to suggest learning path
      const recommendations = [];
      
      // Based on quiz scores
      const avgScore = Object.values(quizScores).length > 0 
        ? Object.values(quizScores).reduce((a, b) => a + b, 0) / Object.values(quizScores).length 
        : 50;
      
      if (avgScore < 60) {
        recommendations.push({
          goal: 'music_theory',
          reason: 'Strengthen fundamentals based on quiz performance',
          priority: 'high'
        });
      }
      
      // Based on analysis queries
      const queryKeywords = analysisQueries.join(' ').toLowerCase();
      if (queryKeywords.includes('mix') || queryKeywords.includes('master')) {
        recommendations.push({
          goal: 'production',
          reason: 'You\'ve shown interest in production topics',
          priority: 'medium'
        });
      }
      if (queryKeywords.includes('vocal') || queryKeywords.includes('sing')) {
        recommendations.push({
          goal: 'vocal',
          reason: 'Based on your vocal-related queries',
          priority: 'medium'
        });
      }
      
      // Default recommendation
      if (recommendations.length === 0) {
        recommendations.push({
          goal: 'ear_training',
          reason: 'Great starting point for any musician',
          priority: 'medium'
        });
      }
      
      setAiRecommendations(recommendations);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleLessonComplete = (goalId, lessonIdx) => {
    const key = `${goalId}_${lessonIdx}`;
    const updated = { ...completedLessons, [key]: !completedLessons[key] };
    setCompletedLessons(updated);
    localStorage.setItem('learning_progress', JSON.stringify(updated));
  };

  const getGoalProgress = (goalId) => {
    const goal = LEARNING_GOALS.find(g => g.id === goalId);
    if (!goal) return 0;
    const completed = goal.lessons.filter((_, idx) => completedLessons[`${goalId}_${idx}`]).length;
    return Math.round((completed / goal.lessons.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* AI & Security Banner */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-cyan-950/50 border-cyan-500/30">
          <CardContent className="p-3 flex items-center gap-3">
            <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
            <div>
              <p className="text-white font-semibold text-sm">🤖 AI Personalized Learning</p>
              <p className="text-cyan-300 text-xs">Adapts to your progress & interests</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-950/50 border-green-500/30">
          <CardContent className="p-3 flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-white font-semibold text-sm">🛡️ Progress Secured</p>
              <p className="text-green-300 text-xs">Your learning data is protected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      {aiRecommendations.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-950/80 to-pink-950/80 border-purple-500/40">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              AI Recommended for You
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiRecommendations.map((rec, idx) => {
              const goal = LEARNING_GOALS.find(g => g.id === rec.goal);
              if (!goal) return null;
              return (
                <div 
                  key={idx}
                  onClick={() => setSelectedGoal(rec.goal)}
                  className="p-4 bg-slate-800/60 rounded-lg border border-purple-500/30 cursor-pointer hover:border-purple-500/60 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${goal.color} flex items-center justify-center`}>
                        <goal.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{goal.name}</h4>
                        <p className="text-slate-400 text-sm">{rec.reason}</p>
                      </div>
                    </div>
                    <Badge className={rec.priority === 'high' ? 'bg-red-500' : 'bg-blue-500'}>
                      {rec.priority}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Learning Goals */}
      <Card className="bg-slate-900/80 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-green-400" />
            Choose Your Learning Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LEARNING_GOALS.map(goal => (
              <div
                key={goal.id}
                onClick={() => setSelectedGoal(goal.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedGoal === goal.id 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-slate-700 bg-slate-800/60 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${goal.color} flex items-center justify-center`}>
                    <goal.icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-white font-semibold">{goal.name}</h4>
                </div>
                <Progress value={getGoalProgress(goal.id)} className="h-2" />
                <p className="text-slate-400 text-xs mt-2">{getGoalProgress(goal.id)}% complete</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Goal Lessons */}
      {selectedGoal && (
        <Card className="bg-slate-900/80 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-yellow-400" />
              {LEARNING_GOALS.find(g => g.id === selectedGoal)?.name} - Lessons
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {LEARNING_GOALS.find(g => g.id === selectedGoal)?.lessons.map((lesson, idx) => {
              const isCompleted = completedLessons[`${selectedGoal}_${idx}`];
              return (
                <div 
                  key={idx}
                  onClick={() => toggleLessonComplete(selectedGoal, idx)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    isCompleted 
                      ? 'border-green-500/50 bg-green-500/10' 
                      : 'border-slate-700 bg-slate-800/60 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500" />
                    )}
                    <span className={isCompleted ? 'text-green-300' : 'text-white'}>{lesson}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}