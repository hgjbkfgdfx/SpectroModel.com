import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Target, Award, Flame, Crown, Medal, Zap, BookOpen, Brain, Shield } from "lucide-react";

const BADGES = [
  { id: 'first_quiz', name: 'Quiz Starter', icon: Star, description: 'Complete your first quiz', requirement: 1, type: 'quiz' },
  { id: 'quiz_master', name: 'Quiz Master', icon: Trophy, description: 'Complete 10 quizzes', requirement: 10, type: 'quiz' },
  { id: 'perfect_score', name: 'Perfect Score', icon: Crown, description: 'Get 100% on a quiz', requirement: 100, type: 'score' },
  { id: 'streak_3', name: 'Hot Streak', icon: Flame, description: '3 correct answers in a row', requirement: 3, type: 'streak' },
  { id: 'streak_7', name: 'On Fire', icon: Flame, description: '7 correct answers in a row', requirement: 7, type: 'streak' },
  { id: 'learner', name: 'Curious Mind', icon: BookOpen, description: 'Complete 5 lessons', requirement: 5, type: 'lesson' },
  { id: 'scholar', name: 'Scholar', icon: Award, description: 'Complete 20 lessons', requirement: 20, type: 'lesson' },
  { id: 'explorer', name: 'Explorer', icon: Target, description: 'Try all learning modules', requirement: 4, type: 'modules' },
];

const LEVELS = [
  { level: 1, name: 'Beginner', minPoints: 0, color: 'bg-slate-500' },
  { level: 2, name: 'Apprentice', minPoints: 100, color: 'bg-green-500' },
  { level: 3, name: 'Intermediate', minPoints: 300, color: 'bg-blue-500' },
  { level: 4, name: 'Advanced', minPoints: 600, color: 'bg-purple-500' },
  { level: 5, name: 'Expert', minPoints: 1000, color: 'bg-yellow-500' },
  { level: 6, name: 'Master', minPoints: 2000, color: 'bg-orange-500' },
  { level: 7, name: 'Grandmaster', minPoints: 5000, color: 'bg-red-500' },
];

export default function GamificationSystem({ quizScores = {}, lessonsCompleted = 0, modulesVisited = [], onPointsUpdate }) {
  const [totalPoints, setTotalPoints] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [showBadgeUnlock, setShowBadgeUnlock] = useState(null);

  useEffect(() => {
    // Load saved progress
    const saved = localStorage.getItem('gamification_progress');
    if (saved) {
      const data = JSON.parse(saved);
      setTotalPoints(data.totalPoints || 0);
      setEarnedBadges(data.earnedBadges || []);
      setCurrentStreak(data.currentStreak || 0);
    }
  }, []);

  useEffect(() => {
    // Calculate points from quiz scores
    const quizPoints = Object.values(quizScores).reduce((sum, score) => sum + (score === 100 ? 20 : score > 0 ? 10 : 0), 0);
    const lessonPoints = lessonsCompleted * 15;
    const newTotal = quizPoints + lessonPoints;
    
    setTotalPoints(newTotal);
    
    // Check for new badges
    checkBadges(quizPoints, lessonsCompleted, modulesVisited);
    
    // Save progress
    localStorage.setItem('gamification_progress', JSON.stringify({
      totalPoints: newTotal,
      earnedBadges,
      currentStreak
    }));
    
    if (onPointsUpdate) onPointsUpdate(newTotal);
  }, [quizScores, lessonsCompleted, modulesVisited]);

  const checkBadges = (quizCount, lessonCount, modules) => {
    const newBadges = [...earnedBadges];
    
    BADGES.forEach(badge => {
      if (newBadges.includes(badge.id)) return;
      
      let earned = false;
      switch (badge.type) {
        case 'quiz':
          earned = Object.keys(quizScores).length >= badge.requirement;
          break;
        case 'score':
          earned = Object.values(quizScores).some(s => s >= badge.requirement);
          break;
        case 'streak':
          earned = currentStreak >= badge.requirement;
          break;
        case 'lesson':
          earned = lessonCount >= badge.requirement;
          break;
        case 'modules':
          earned = modules.length >= badge.requirement;
          break;
      }
      
      if (earned) {
        newBadges.push(badge.id);
        setShowBadgeUnlock(badge);
        setTimeout(() => setShowBadgeUnlock(null), 3000);
      }
    });
    
    setEarnedBadges(newBadges);
  };

  const getCurrentLevel = () => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (totalPoints >= LEVELS[i].minPoints) return LEVELS[i];
    }
    return LEVELS[0];
  };

  const getNextLevel = () => {
    const current = getCurrentLevel();
    const idx = LEVELS.findIndex(l => l.level === current.level);
    return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progressToNext = nextLevel 
    ? ((totalPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100;

  return (
    <Card className="bg-slate-900/80 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Your Progress
        </CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <Brain className="w-3 h-3 text-cyan-400" />
          <span className="text-[10px] text-cyan-300">🤖 AI tracks your learning</span>
          <Shield className="w-3 h-3 text-green-400 ml-2" />
          <span className="text-[10px] text-green-300">🛡️ Secure</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Badge Unlock Animation */}
        {showBadgeUnlock && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 animate-pulse">
            <Card className="bg-gradient-to-r from-yellow-600 to-orange-600 border-yellow-400 p-8 text-center">
              <showBadgeUnlock.icon className="w-16 h-16 text-white mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">🎉 Badge Unlocked!</h3>
              <p className="text-yellow-100 text-lg">{showBadgeUnlock.name}</p>
              <p className="text-yellow-200 text-sm mt-2">{showBadgeUnlock.description}</p>
            </Card>
          </div>
        )}

        {/* Level & Points */}
        <div className="p-4 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg border border-purple-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${currentLevel.color} rounded-full flex items-center justify-center`}>
                <span className="text-white font-bold text-lg">{currentLevel.level}</span>
              </div>
              <div>
                <h3 className="text-white font-bold">{currentLevel.name}</h3>
                <p className="text-purple-300 text-sm">{totalPoints} points</p>
              </div>
            </div>
            <Zap className="w-8 h-8 text-yellow-400" />
          </div>
          
          {nextLevel && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Progress to {nextLevel.name}</span>
                <span>{nextLevel.minPoints - totalPoints} pts needed</span>
              </div>
              <Progress value={progressToNext} className="h-3 bg-slate-700" />
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-slate-800/60 rounded-lg text-center">
            <p className="text-2xl font-bold text-white">{Object.keys(quizScores).length}</p>
            <p className="text-xs text-slate-400">Quizzes</p>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-lg text-center">
            <p className="text-2xl font-bold text-white">{lessonsCompleted}</p>
            <p className="text-xs text-slate-400">Lessons</p>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-lg text-center">
            <p className="text-2xl font-bold text-orange-400">{currentStreak}</p>
            <p className="text-xs text-slate-400">Streak 🔥</p>
          </div>
        </div>

        {/* Badges */}
        <div>
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Medal className="w-4 h-4 text-yellow-400" /> Badges ({earnedBadges.length}/{BADGES.length})
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {BADGES.map(badge => {
              const isEarned = earnedBadges.includes(badge.id);
              return (
                <div 
                  key={badge.id}
                  className={`p-2 rounded-lg text-center transition-all ${
                    isEarned 
                      ? 'bg-gradient-to-r from-yellow-600/30 to-orange-600/30 border border-yellow-500/50' 
                      : 'bg-slate-800/40 border border-slate-700/30 opacity-50'
                  }`}
                  title={badge.description}
                >
                  <badge.icon className={`w-6 h-6 mx-auto mb-1 ${isEarned ? 'text-yellow-400' : 'text-slate-600'}`} />
                  <p className={`text-[10px] ${isEarned ? 'text-yellow-200' : 'text-slate-500'}`}>{badge.name}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard Preview */}
        <div className="p-4 bg-slate-800/60 rounded-lg">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-400" /> Leaderboard
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-yellow-500/20 rounded border border-yellow-500/30">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold">🥇</span>
                <span className="text-white text-sm">You</span>
              </div>
              <span className="text-yellow-300 font-bold">{totalPoints} pts</span>
            </div>
            <p className="text-xs text-slate-400 text-center mt-2">
              Complete more lessons and quizzes to climb the leaderboard!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}