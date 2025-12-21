import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Music, BookOpen, HelpCircle, Lightbulb, ExternalLink, Award, Sparkles, Shield, Brain, Users, GraduationCap, Copyright } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import SearchHistory from "../components/shared/SearchHistory";
import { Input } from "@/components/ui/input";
import { validateCSP, blockScriptInjection } from '@/components/shared/SecurityValidator';
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import { Badge } from "@/components/ui/badge";
import CommunityForum from "@/components/education/CommunityForum";
import PersonalizedLearningPath from "@/components/education/PersonalizedLearningPath";
import CopyrightEducation from "@/components/education/CopyrightEducation";
import GamificationSystem from "@/components/education/GamificationSystem";

export default function MusicEducationPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  const [dailyFact, setDailyFact] = useState("");
  const [quizQuestion, setQuizQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loadingFact, setLoadingFact] = useState(true);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [quizScores, setQuizScores] = useState({});
  const [user, setUser] = useState(null);

  const [analysisPrompt, setAnalysisPrompt] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  const [isViewingExistingAnalysis, setIsViewingExistingAnalysis] = useState(false);
  const [isLoadingPageInitial, setIsLoadingPageInitial] = useState(true);
  const [pageLoadError, setPageLoadError] = useState("");
  const [activeTab, setActiveTab] = useState("learn");
  const [lessonsCompleted, setLessonsCompleted] = useState(0);
  const [modulesVisited, setModulesVisited] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);

  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0, mlComplexity: 0 });
  const [sessionStartTime] = useState(Date.now());

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        blockScriptInjection();
        const cspResult = validateCSP();
        
        if (mounted) {
          setSecurityStatus({
            safe: cspResult.valid,
            threats: cspResult.violations?.length || 0,
            mlComplexity: cspResult.mlComplexity || 0
          });
        }

        mlDataCollector.record('music_education_page_visit', {
          feature: 'music_education',
          security: { safe: cspResult.valid, threats: cspResult.violations?.length || 0 },
          timestamp: Date.now()
        });

        // Load user
        try {
          const userData = await base44.auth.me();
          if (mounted) setUser(userData);
        } catch (e) {
          console.warn('User not logged in');
        }
      } catch (error) {
        console.error('Security init failed:', error);
      }
    };

    init();

    return () => {
      mounted = false;
      const sessionDuration = Date.now() - sessionStartTime;
      mlDataCollector.record('music_education_session_end', {
        feature: 'music_education',
        sessionDuration,
        timestamp: Date.now()
      });
    };
  }, []);

  useEffect(() => {
    loadDailyFact();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('spectro_education_searches');
    if (saved) setRecentSearches(JSON.parse(saved));
    
    const scores = localStorage.getItem('quiz_scores');
    if (scores) setQuizScores(JSON.parse(scores));
    
    const lessons = localStorage.getItem('lessons_completed');
    if (lessons) setLessonsCompleted(parseInt(lessons) || 0);
    
    const modules = localStorage.getItem('modules_visited');
    if (modules) setModulesVisited(JSON.parse(modules));
  }, []);

  // Track module visits
  useEffect(() => {
    if (activeTab && !modulesVisited.includes(activeTab)) {
      const newModules = [...modulesVisited, activeTab];
      setModulesVisited(newModules);
      localStorage.setItem('modules_visited', JSON.stringify(newModules));
    }
  }, [activeTab]);

  useEffect(() => {
    const loadExistingAnalysis = async () => {
      setIsLoadingPageInitial(true);
      setPageLoadError("");

      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id');
      
      if (id) {
        setIsViewingExistingAnalysis(true);
        setLoadingAnalysis(true);
        setAnalysisError("");
        try {
          const allAnalyses = await base44.entities.MusicAnalysis.list('-created_date', 500);
          const analysis = allAnalyses.find(a => a.id === id);
          if (analysis && analysis.music_education) {
            setAnalysisPrompt(analysis.track_name || "");
            if (typeof analysis.music_education === 'string') {
              setAnalysisResult(analysis.music_education);
            } else if (typeof analysis.music_education === 'object' && analysis.music_education !== null) {
              if (analysis.music_education.response) {
                setAnalysisResult(analysis.music_education.response);
                if (analysis.music_education.query) setAnalysisPrompt(analysis.music_education.query);
              } else if (analysis.music_education.content) {
                setAnalysisResult(analysis.music_education.content);
              } else {
                setAnalysisResult("Failed to parse music education content.");
              }
            } else {
              setAnalysisResult("Failed to parse music education content.");
            }
          } else {
            setPageLoadError("Music analysis data not found for this ID.");
            setIsViewingExistingAnalysis(false);
          }
        } catch (error) {
          console.error("Failed to load analysis:", error);
          setPageLoadError("Could not load music education data.");
          setIsViewingExistingAnalysis(false);
        } finally {
          setLoadingAnalysis(false);
        }
      }
      setIsLoadingPageInitial(false);
    };

    loadExistingAnalysis();
  }, []);

  const loadDailyFact = async () => {
    setLoadingFact(true);
    try {
      const topics = [
        "rare music production techniques", "unusual musical instruments history",
        "famous recording studio secrets", "music theory discoveries",
        "audio engineering innovations", "legendary music producer techniques"
      ];
      
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      
      const fact = await base44.integrations.Core.InvokeLLM({
        prompt: `Share ONE unique, fascinating fact about: "${randomTopic}". Keep under 80 words.`,
        add_context_from_internet: true
      });
      
      setDailyFact(fact);
    } catch (error) {
      console.error("Failed to load music fact:", error);
      setDailyFact("Music is a universal language that transcends cultural boundaries!");
    } finally {
      setLoadingFact(false);
    }
  };

  const loadQuiz = async () => {
    setLoadingQuiz(true);
    setShowAnswer(false);
    try {
      const quiz = await base44.integrations.Core.InvokeLLM({
        prompt: "Create a music trivia question with 4 multiple choice answers. Format as JSON.",
        response_json_schema: {
          type: "object",
          properties: {
            question: { type: "string" },
            options: { type: "array", items: { type: "string" } },
            correct_answer_index: { type: "number" },
            explanation: { type: "string" }
          }
        }
      });
      setQuizQuestion(quiz);
    } catch (error) {
      console.error("Quiz load failed:", error);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleQuizAnswer = (selectedIdx) => {
    setShowAnswer(true);
    const isCorrect = selectedIdx === quizQuestion.correct_answer_index;
    const newScores = { ...quizScores, [Date.now()]: isCorrect ? 100 : 0 };
    setQuizScores(newScores);
    localStorage.setItem('quiz_scores', JSON.stringify(newScores));
  };

  const handleEducationalAnalysis = async () => {
    if (!analysisPrompt.trim()) {
      setAnalysisError("Please enter a topic for analysis.");
      return;
    }
    if (loadingAnalysis) return;

    setLoadingAnalysis(true);
    setAnalysisError("");
    setAnalysisResult("");
    setIsViewingExistingAnalysis(false);
    
    try {
      const llmResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a music education assistant. Provide educational analysis about: ${analysisPrompt}

Include: 1. Core concepts 2. Technical explanation 3. Practical applications 4. Industry examples 5. Resources`,
        add_context_from_internet: true
      });

      setAnalysisResult(llmResponse);
      await base44.entities.MusicAnalysis.create({
        track_name: analysisPrompt,
        artist_name: "Educational Query", 
        music_education: { query: analysisPrompt, response: llmResponse },
        status: "completed",
        analysis_type: "music_education"
      });

      const newSearch = analysisPrompt;
      setRecentSearches(prev => {
        const updated = [newSearch, ...prev.filter(item => item !== newSearch)];
        localStorage.setItem('spectro_education_searches', JSON.stringify(updated.slice(0, 5)));
        return updated.slice(0, 5);
      });

    } catch (error) {
      console.error("Educational analysis failed:", error);
      setAnalysisError("Failed to generate educational content. Please try again.");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const musicResources = [
    { title: "Music Theory", links: [
      { name: "Musictheory.net", url: "https://www.musictheory.net" },
      { name: "teoria.com", url: "https://www.teoria.com" }
    ]},
    { title: "Vocal Training", links: [
      { name: "Free Vocal Training (YouTube)", url: "https://www.youtube.com/results?search_query=free+vocal+training" },
      { name: "Singing Success", url: "https://singingsuccess.com" }
    ]},
    { title: "Instrument Lessons", links: [
      { name: "Justin Guitar (Free)", url: "https://www.justinguitar.com" },
      { name: "Piano Lessons (YouTube)", url: "https://www.youtube.com/results?search_query=piano+lessons+free" }
    ]},
    { title: "Production & Mixing", links: [
      { name: "Recording Revolution YouTube", url: "https://www.youtube.com/user/recordingrevolution" },
      { name: "Pro Audio Files", url: "https://theproaudiofiles.com" }
    ]}
  ];

  if (isLoadingPageInitial) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900/50 to-purple-900/50 flex items-center justify-center p-4">
        <p className="text-white text-lg">Loading Music Education Hub...</p>
      </div>
    );
  }

  if (pageLoadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900/50 to-purple-900/50 flex flex-col items-center justify-center p-4 text-center">
        <p className="text-red-400 text-lg mb-4">{pageLoadError}</p>
        <Button onClick={() => navigate(createPageUrl("Dashboard"))} className="mt-4">Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("Dashboard"))} className="text-slate-300 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-purple-400" /> Music Education Hub
            </h1>
            <p className="text-slate-400 mt-1">Learn, practice, collaborate, and master music</p>
          </div>
        </div>

        {/* Security & AI */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-black/40 backdrop-blur-xl border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white font-semibold text-sm">🛡️ Security Active</p>
                    <p className="text-xs text-slate-400">{securityStatus.safe ? 'Protected' : `${securityStatus.threats} blocked`}</p>
                  </div>
                </div>
                <Badge className={securityStatus.safe ? 'bg-green-500' : 'bg-orange-500'}>
                  {securityStatus.safe ? 'SAFE' : 'ALERT'}
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-cyan-950/90 border-cyan-500/40">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Brain className="w-6 h-6 text-cyan-400 animate-pulse" />
                <div>
                  <p className="text-white font-semibold text-sm">🤖 AI Learns From Your Data</p>
                  <p className="text-xs text-cyan-300">{recentSearches.length} queries • Personalized learning</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gamification Progress */}
        <GamificationSystem 
          quizScores={quizScores}
          lessonsCompleted={lessonsCompleted}
          modulesVisited={modulesVisited}
          onPointsUpdate={setTotalPoints}
        />

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800 flex-wrap">
            <TabsTrigger value="learn"><BookOpen className="w-4 h-4 mr-1" /> Learn</TabsTrigger>
            <TabsTrigger value="path"><GraduationCap className="w-4 h-4 mr-1" /> My Path</TabsTrigger>
            <TabsTrigger value="community"><Users className="w-4 h-4 mr-1" /> Community</TabsTrigger>
            <TabsTrigger value="copyright"><Copyright className="w-4 h-4 mr-1" /> Copyright</TabsTrigger>
            <TabsTrigger value="resources"><ExternalLink className="w-4 h-4 mr-1" /> Resources</TabsTrigger>
          </TabsList>

          {/* Learn Tab */}
          <TabsContent value="learn" className="space-y-6 mt-6">
            <SearchHistory
              searches={recentSearches}
              onSelect={(search) => {
                setAnalysisPrompt(search);
                setAnalysisResult("");
                setAnalysisError("");
                setIsViewingExistingAnalysis(false);
              }}
              onClear={() => {
                setRecentSearches([]);
                localStorage.removeItem('spectro_education_searches');
              }}
              storageKey="spectro_education_searches"
            />

            <Card className="bg-black/40 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  Daily Music Fact
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingFact ? (
                  <p className="text-slate-400">Loading fact...</p>
                ) : (
                  <p className="text-slate-300">{dailyFact}</p>
                )}
                <Button variant="outline" size="sm" onClick={loadDailyFact} disabled={loadingFact} className="mt-4 border-purple-500/50 text-slate-200">
                  {loadingFact ? "Loading..." : "New Fact"}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-green-400" />
                  Music Trivia Quiz
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!quizQuestion ? (
                  <Button onClick={loadQuiz} disabled={loadingQuiz} className="w-full bg-green-600 hover:bg-green-700 text-white">
                    {loadingQuiz ? "Loading..." : "Start Quiz"}
                  </Button>
                ) : (
                  <>
                    <h3 className="text-white font-semibold">{quizQuestion.question}</h3>
                    <div className="space-y-2">
                      {quizQuestion.options.map((option, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          className={`w-full justify-start text-left ${
                            showAnswer && idx === quizQuestion.correct_answer_index
                              ? 'border-green-500 bg-green-500/20 text-green-200'
                              : 'border-slate-600 text-slate-300'
                          }`}
                          onClick={() => handleQuizAnswer(idx)}
                          disabled={showAnswer}
                        >
                          {String.fromCharCode(65 + idx)}. {option}
                        </Button>
                      ))}
                    </div>
                    {showAnswer && (
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                        <p className="text-green-300 font-semibold mb-2">
                          Correct: {String.fromCharCode(65 + quizQuestion.correct_answer_index)}
                        </p>
                        <p className="text-slate-300 text-sm">{quizQuestion.explanation}</p>
                      </div>
                    )}
                    <Button onClick={loadQuiz} variant="outline" className="w-full mt-2 border-blue-500/50 text-blue-200">
                      Next Question
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-300" />
                  Custom Music Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingAnalysis && !analysisResult ? (
                  <p className="text-slate-400">Loading analysis...</p>
                ) : (
                  <>
                    {!isViewingExistingAnalysis && (
                      <>
                        <p className="text-slate-400">Enter a music-related topic to get an AI-generated educational analysis.</p>
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="e.g., 'What is counterpoint?', 'History of jazz'"
                            value={analysisPrompt}
                            onChange={(e) => setAnalysisPrompt(e.target.value)}
                            className="flex-grow bg-slate-700 border-slate-600 text-white"
                            onKeyPress={(e) => e.key === 'Enter' && handleEducationalAnalysis()}
                          />
                          <Button onClick={handleEducationalAnalysis} disabled={!analysisPrompt.trim() || loadingAnalysis}>
                            Analyze
                          </Button>
                        </div>
                      </>
                    )}
                    {analysisError && <p className="text-red-400 text-sm">{analysisError}</p>}
                    {analysisResult && (
                      <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-600">
                        <h3 className="font-semibold text-white mb-2">{analysisPrompt}</h3>
                        <p className="text-slate-300 text-sm whitespace-pre-wrap">{analysisResult}</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Personalized Learning Path Tab */}
          <TabsContent value="path" className="mt-6">
            <PersonalizedLearningPath 
              quizScores={quizScores} 
              analysisQueries={recentSearches}
              user={user}
            />
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="mt-6">
            <CommunityForum user={user} />
          </TabsContent>

          {/* Copyright Education Tab */}
          <TabsContent value="copyright" className="mt-6">
            <CopyrightEducation />
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {musicResources.map((category, idx) => (
                <Card key={idx} className="bg-black/40 backdrop-blur-xl border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Music className="w-5 h-5 text-purple-400" />
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {category.links.map((link, linkIdx) => (
                      <a
                        key={linkIdx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors cursor-pointer"
                      >
                        <span className="text-slate-300 hover:text-white">{link.name}</span>
                        <ExternalLink className="w-4 h-4 text-purple-400" />
                      </a>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}