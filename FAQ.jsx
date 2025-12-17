import React, { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, HelpCircle, MessageCircle, Music, TrendingUp, Globe, Shield, AlertTriangle, ArrowLeft, Settings, BarChart3, Sparkles, Monitor, Smartphone, Tablet, Chrome, Layout, Users, Layers, Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";
import { validateCSP, blockScriptInjection } from "@/components/shared/SecurityValidator";
import { AILearningBanner } from "@/components/shared/NetworkErrorHandler";

export default function FAQPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    blockScriptInjection();
    validateCSP();
    mlDataCollector.record('faq_page_visit', { feature: 'support', timestamp: Date.now() });
    
    const blockCodeViewShortcuts = (e) => {
      if (e.ctrlKey && e.key === 'u') { e.preventDefault(); return false; }
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) { e.preventDefault(); return false; }
      if (e.key === 'F12') { e.preventDefault(); return false; }
      if (e.ctrlKey && e.key === 's') { e.preventDefault(); return false; }
    };
    const blockContextMenu = (e) => { e.preventDefault(); return false; };
    
    document.addEventListener('keydown', blockCodeViewShortcuts, true);
    document.addEventListener('contextmenu', blockContextMenu, true);
    
    return () => {
      document.removeEventListener('keydown', blockCodeViewShortcuts, true);
      document.removeEventListener('contextmenu', blockContextMenu, true);
    };
  }, []);

  const features = [
    {
      category: "User Interface & Experience",
      id: "ui",
      icon: Layout,
      color: "text-cyan-400",
      borderColor: "border-cyan-500/30",
      faqs: [
        { id: "UI-001", q: "Persistent Navigation Bar", a: "A fixed, top-level menu providing immediate access to core modules: Analyses, Business Tools, Creative Tools, Collaboration, Resources, Settings, and the AI Chatbot. Available on all pages." },
        { id: "UI-002", q: "Dynamic Dashboard", a: "The central landing hub that aggregates real-time data, recent activities, and quick-access tools. Features a customizable layout with draggable widgets." },
        { id: "UI-003", q: "Open/Close Dashboard Toggles", a: "UI mechanism allowing users to rapidly expand or collapse the main dashboard view from any subsidiary page without losing state in the current module." },
        { id: "UI-004", q: "UI Draggers (Expand/Collapse)", a: "Interactive handle elements allowing users to resize panels, sidebars, and module views to customize their workspace based on current task focus." },
        { id: "UI-005", q: "Accessibility Arrow", a: "A persistent, movable, and lockable on-screen widget providing instant access to accessibility features (screen reader, high contrast, font sizing) regardless of current page." },
        { id: "UI-006", q: "Persistent Music Bar", a: "A continuous audio playback interface at the bottom of the viewport, offering meditative music and varied instrument sounds for focus, independent of main app audio processing." },
        { id: "UI-007", q: "Theme Selector/Changer", a: "An interface allowing users to switch the visual aesthetic of the application (Light Mode, Dark Mode, High Contrast) to suit preference or lighting conditions." },
        { id: "UI-008", q: "Particle Selector/Changer", a: "A customization engine that controls background visual effects (dynamic particles), allowing users to adjust visual complexity based on hardware performance or preference." },
        { id: "UI-009", q: "Cross-Platform Optimization", a: "The underlying responsive architecture ensuring full functionality and optimized layout across Mobile, Tablet, Desktop PC, and various Web Browsers." }
      ]
    },
    {
      category: "Security & Legal",
      id: "security",
      icon: Shield,
      color: "text-red-400",
      borderColor: "border-red-500/30",
      faqs: [
        { id: "SEC-001", q: "MSA & Pop-up Sign-off Flow", a: "A mandatory, legally binding gateway that requires users to review and digitally sign the Master Service Agreement (MSA) and Privacy Policy before accessing any features." },
        { id: "SEC-002", q: "Sign In / Sign Out Authentication", a: "Secure OAuth 2.0 protocol handling user session initiation and termination, protecting account data and intellectual property." },
        { id: "SEC-003", q: "System Check Utility", a: "A diagnostic tool that scans the user's browser, hardware acceleration, and internet connection to ensure compatibility with advanced DSP and 3D rendering features." },
        { id: "SEC-004", q: "Proprietary Security Protocols", a: "The hidden layer of protection encompassing original algorithms, codebase architecture, and anti-reverse-engineering measures protecting the platform's IP." },
        { id: "SEC-005", q: "AI Learning & Enhancements", a: "Continuous machine learning protocols that monitor system usage patterns to detect anomalies, improve algorithmic accuracy, and deploy security patches automatically." },
        { id: "LEG-001", q: "Company Copyright & IP Links", a: "Direct access points to the company's intellectual property declarations, patent status, and trademark registrations." },
        { id: "LEG-002", q: "USPTO & Copyright Protection Links", a: "Integrated external links guiding users to the United States Patent and Trademark Office and Copyright Office for registering their own creative works." },
        { id: "LEG-003", q: "Privacy, Terms, Support Pages", a: "Dedicated repositories for legal definitions regarding data handling (Privacy), usage rules (Terms), and user assistance channels (Support)." }
      ]
    },
    {
      category: "Dashboard & Data Management",
      id: "dashboard",
      icon: Database,
      color: "text-purple-400",
      borderColor: "border-purple-500/30",
      faqs: [
        { id: "DB-001", q: "Quick Actions Widget", a: "A dynamic panel offering expedited one-click access to the most frequently used tools (New Track Analysis, Upload Video, Quick Scan)." },
        { id: "DB-002", q: "Recent Analyses Feed", a: "A chronological activity log displaying previously processed tracks, videos, or datasets, allowing instant retrieval of past results." },
        { id: "DB-003", q: "Universal Filter Bar", a: "A context-aware search and sorting mechanism allowing users to filter content by date, file type, genre, project tag, or completion status." },
        { id: "DB-004", q: "Universal Search Bar with History", a: "A global search input that indexes the entire platform. It retains a local history of recent queries for rapid re-searching." },
        { id: "DB-005", q: "Tutorial Pop-up System", a: "Context-sensitive guided tours and tooltips that appear upon first use of a feature or when requested, explaining functionality." },
        { id: "DB-006", q: "Timezones & Location Settings", a: "Configuration tools to localize timestamp data for projects and align marketing analysis tools with specific target geographic regions." },
        { id: "DAT-001", q: "Cloud Connection & Saving", a: "Integration protocols connecting the app to user's third-party cloud storage (Google Drive, Dropbox) for persistent data saving." },
        { id: "DAT-002", q: "Data Export & Requesting", a: "Tools allowing users to download their processed data, analysis reports, and project files in standard formats (JSON, CSV, ZIP) or request a full data dump in compliance with privacy laws (GDPR)." },
        { id: "DAT-003", q: "Clear Cache / Clear Cookies", a: "Maintenance utilities that purge local browser storage to resolve display issues, free up memory, or ensure privacy on shared devices." },
        { id: "DAT-004", q: "Universal File Upload & Converter", a: "A robust ingestion engine handling various media formats, coupled with an integrated converter (WAV to MP3 MPEG-2/3) to standardize files for analysis." }
      ]
    },
    {
      category: "Analysis Tools",
      id: "analysis",
      icon: Music,
      color: "text-amber-400",
      borderColor: "border-amber-500/30",
      faqs: [
        { id: "ANA-001", q: "DSP Track Analyses", a: "Digital Signal Processing engines that deconstruct audio files into fundamental components: frequency spectrum, amplitude, phase, and transient data." },
        { id: "ANA-002", q: "Rhythm & Tempo Analysis", a: "Algorithms specifically designed to detect BPM (beats per minute), time signature, groove patterns, and rhythmic deviations in an audio file." },
        { id: "ANA-003", q: "AI Genre Prediction", a: "Machine learning models trained on vast music datasets to classify uploaded tracks into primary and secondary genres based on sonic characteristics." },
        { id: "ANA-004", q: "AI Track Query", a: "A Shazam-like feature using audio fingerprinting to identify existing songs, artists, and metadata from an uploaded sample." },
        { id: "ANA-005", q: "Lyrics Analyzer & Retrieval", a: "Natural Language Processing (NLP) tools that extract lyrics from audio, retrieve them from databases, and analyze them for sentiment, rhyme scheme, and thematic density." },
        { id: "ANA-006", q: "Emoji Lyrics Converter", a: "A creative AI tool that translates text lyrics into strings of relevant emojis based on keyword sentiment and object recognition." },
        { id: "ANA-007", q: "Sheet Music Generator", a: "AI-driven polyphonic transcription technology that converts audio signals into readable musical notation (MIDI/PDF)." },
        { id: "ANA-008", q: "AI Analysis Customization", a: "Advanced settings allowing users to fine-tune the parameters of the AI models (adjusting sensitivity thresholds for genre detection) for specific use cases." }
      ]
    },
    {
      category: "Business Tools",
      id: "business",
      icon: TrendingUp,
      color: "text-green-400",
      borderColor: "border-green-500/30",
      faqs: [
        { id: "BUS-001", q: "Monetization Streamlining Hub", a: "A central command center for managing all income streams, including subscriptions, track sales, and merchandise links." },
        { id: "BUS-002", q: "Subscription & Plan Management", a: "Tools for creators to define their own pricing tiers, manage subscriber access to exclusive content, and handle billing cycles." },
        { id: "BUS-003", q: "Royalties & Pricing Calculator", a: "An analytical tool that estimates potential earnings across various platforms based on stream counts, territory rates, and pricing inputs." },
        { id: "BUS-004", q: "NFT Creation & Listing", a: "An integrated interface for minting audio/visual assets as Non-Fungible Tokens on supported blockchains and listing them for sale." },
        { id: "BUS-005", q: "Distribution Command Center", a: "A portal for preparing and submitting releases to major streaming services (Spotify, Apple Music) directly from the platform." },
        { id: "BUS-006", q: "Marketing & Market Fit Analysis", a: "AI-driven tools that analyze a track's sonic profile against current market trends to predict commercial viability and suggest target demographics." },
        { id: "BUS-007", q: "Time Series Analysis", a: "Financial modeling tools that track performance metrics (streams, revenue, fan growth) over time to identify trends and seasonal cycles." },
        { id: "BUS-008", q: "Fan Base & Profile Management", a: "CRM (Customer Relationship Management) features for tracking fan engagement, demographics, and managing the artist's public-facing profile." },
        { id: "BUS-009", q: "Contracts & Legal Templates", a: "A library of customizable legal document templates for marketing agreements, split sheets, and business contracts." }
      ]
    },
    {
      category: "Creative Tools",
      id: "creative",
      icon: Sparkles,
      color: "text-pink-400",
      borderColor: "border-pink-500/30",
      faqs: [
        { id: "CRE-001", q: "Advanced Creative Analytics", a: "High-level analysis breaking down musical composition, arrangement complexity, and production quality against industry benchmarks." },
        { id: "CRE-002", q: "Emotional & Cognitive Analysis", a: "Psychoacoustic AI models that evaluate audio to predict the emotional impact and cognitive load (attention demand) on the listener." },
        { id: "CRE-003", q: "Spectrogram Generation", a: "High-resolution visual rendering of the audio frequency spectrum over time, used for detailed sonic inspection." },
        { id: "CRE-004", q: "Studio Corrector Suite", a: "An AI-powered audio engineering suite including automated Mastering, Advanced Mixing balancing, and Genre-specific editing suggestions." },
        { id: "CRE-005", q: "Sibilance Corrector & Vocal Isolation", a: "Specialized DSP tools designed to reduce harsh high-frequency vocal sounds (De-essing) and use neural networks to isolate vocals from a mixed track." },
        { id: "CRE-006", q: "SpectroVerse: ML Avatar Customizer", a: "A machine-learning-assisted 3D design interface for creating and customizing digital avatars based on user preferences or audio input characteristics." },
        { id: "CRE-007", q: "SpectroVerse: Scene Generation", a: "AI-driven creation of 3D environments (Concert Stages, Abstract Worlds) featuring varied Scene Styles that react dynamically to music." },
        { id: "CRE-008", q: "SpectroVerse: Avatar Visualizer", a: "A real-time rendering engine where customized avatars perform animations synchronized to musical rhythm and frequency." },
        { id: "CRE-009", q: "Video Studio & Lyric Video Generator", a: "A non-linear video editing interface specialized for music, including automated kinetic typography generation for lyric videos." },
        { id: "CRE-010", q: "ProRes 4K Export", a: "High-fidelity rendering pipeline allowing video and visualizer content to be exported in professional broadcast-quality formats." },
        { id: "CRE-011", q: "Artist Vault", a: "A secure, encrypted storage repository specifically designed for unofficial, unreleased, or work-in-progress songs, videos, and lyrics." }
      ]
    },
    {
      category: "Collaboration & Resources",
      id: "collab",
      icon: Users,
      color: "text-blue-400",
      borderColor: "border-blue-500/30",
      faqs: [
        { id: "COL-001", q: "Project Management Hub", a: "A shared workspace for teams to organize files, assign tasks, and track progress on creative endeavors." },
        { id: "COL-002", q: "Live Stream & Screen Share", a: "Integrated low-latency streaming protocols allowing users to broadcast their DAW or creative process to collaborators in real-time." },
        { id: "COL-003", q: "STEM Tools (Science/Tech/Eng/Math)", a: "Integrated utilities including scientific calculators, journaling for research notes, and engineering reference materials relevant to audio and tech." },
        { id: "RES-001", q: "Music Education (AI Chat & Quiz)", a: "An interactive learning platform using an AI tutor to teach music theory and production, featuring reward-based gamification for quiz completion." },
        { id: "RES-002", q: "African Music Library & Research", a: "A specialized database and research portal dedicated to the preservation, analysis, and study of African musical traditions and ethnomusicology." },
        { id: "RES-003", q: "Trends & Advancements Feed", a: "A curated news feed tracking emerging technologies, algorithm updates, and industry shifts in music and technology." },
        { id: "RES-004", q: "Haptic Feedback Settings", a: "Controls for enabling and customizing tactile feedback responses on supported devices, enhancing user interaction with the interface and music." },
        { id: "RES-005", q: "AI Chatbot Assistant", a: "A persistent, floating AI conversational interface available throughout the app to answer user queries, navigate features, or provide creative suggestions." }
      ]
    },
    {
      category: "Platform Compatibility",
      id: "platform",
      icon: Monitor,
      color: "text-indigo-400",
      borderColor: "border-indigo-500/30",
      faqs: [
        { q: "Desktop PC Optimization", a: "Full-featured experience on Windows, macOS, and Linux desktop browsers. Supports keyboard shortcuts, multi-monitor setups, and maximum processing power for DSP analysis." },
        { q: "Mobile Device Support (iOS/Android)", a: "Touch-optimized responsive interface with gesture controls, portrait/landscape modes, and mobile-specific navigation. Works on Safari (iOS 14+), Chrome (Android 10+)." },
        { q: "Tablet Optimization (iPad/Android)", a: "Hybrid interface combining touch gestures with larger screen real estate. Split-view support, stylus compatibility, and optimized layouts for 10-13 inch displays." },
        { q: "Browser Compatibility", a: "Fully tested on Chrome (v90+), Firefox (v88+), Safari (v14+), Edge (v90+), Opera (v76+). WebGL 2.0 required for 3D features. Web Audio API required for DSP." },
        { q: "Progressive Web App (PWA)", a: "Install SpectroModel as a standalone app on any device. Works offline for cached content, receives push notifications, and provides native-app-like experience." },
        { q: "Hardware Acceleration", a: "Leverages GPU acceleration for real-time audio visualization, 3D rendering in SpectroVerse, and video processing. Enable in browser settings for best performance." }
      ]
    }
  ];

  const tabs = [
    { id: "all", label: "All", icon: Layers },
    { id: "ui", label: "UI/UX", icon: Layout },
    { id: "security", label: "Security", icon: Shield },
    { id: "dashboard", label: "Data", icon: Database },
    { id: "analysis", label: "Analysis", icon: Music },
    { id: "business", label: "Business", icon: TrendingUp },
    { id: "creative", label: "Creative", icon: Sparkles },
    { id: "collab", label: "Collab", icon: Users },
    { id: "platform", label: "Devices", icon: Monitor }
  ];

  const filteredFeatures = features
    .filter(cat => activeTab === "all" || cat.id === activeTab)
    .map(cat => ({
      ...cat,
      faqs: cat.faqs.filter(f => 
        f.q.toLowerCase().includes(search.toLowerCase()) || 
        f.a.toLowerCase().includes(search.toLowerCase()) ||
        (f.id && f.id.toLowerCase().includes(search.toLowerCase()))
      )
    })).filter(cat => cat.faqs.length > 0);

  const totalFeatures = features.reduce((acc, cat) => acc + cat.faqs.length, 0);

  return (
    <div className="min-h-screen bg-[#030014] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900/0 to-slate-900/0 p-2 sm:p-4 md:p-8 pb-8 text-cyan-50 selection:bg-cyan-500/30 overflow-x-hidden">
      
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        
        <AILearningBanner />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 border-b border-slate-800 pb-4 mt-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("Landing"))} className="text-cyan-400 hover:text-cyan-300 rounded-full shrink-0">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-3xl font-black flex items-center gap-2 flex-wrap">
              <HelpCircle className="w-6 h-6 text-cyan-400 animate-pulse shrink-0" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">KNOWLEDGE BASE</span>
            </h1>
            <p className="text-slate-400 uppercase tracking-wider text-[10px] sm:text-xs font-semibold">{totalFeatures} FEATURES DOCUMENTED • PREMIUM RELEASE</p>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">v2025.12</Badge>
        </div>

        <div className="relative max-w-3xl mx-auto group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-xl opacity-20 blur group-hover:opacity-40"></div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input className="pl-12 py-5 bg-black/80 border border-slate-700 text-white placeholder:text-slate-600 rounded-xl" placeholder="Search features or IDs (UI-001)..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 justify-center">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase transition-all ${activeTab === tab.id ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-black/40 text-slate-400 border border-white/10 hover:text-white'}`}>
              <tab.icon className="w-3 h-3" />
              <span className="hidden xs:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-4">
          {filteredFeatures.map((section, idx) => (
            <Card key={idx} className={`bg-black/40 border ${section.borderColor} backdrop-blur-md rounded-xl overflow-hidden`}>
              <div className="p-3 border-b border-white/5 bg-white/5 flex items-center gap-2">
                <div className={`p-1.5 rounded-lg bg-black/50 border ${section.borderColor}`}>
                  <section.icon className={`w-4 h-4 ${section.color}`} />
                </div>
                <h2 className="text-sm font-black text-white uppercase truncate">{section.category}</h2>
                <Badge variant="outline" className="ml-auto text-[9px] border-slate-600">{section.faqs.length}</Badge>
              </div>
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {section.faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`${idx}-${i}`} className="border-b border-white/5 last:border-0 px-3 sm:px-4">
                      <AccordionTrigger className="text-left font-bold text-slate-200 py-3 hover:text-cyan-400 text-xs sm:text-sm data-[state=open]:text-cyan-400">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {faq.id && <Badge variant="outline" className="text-[8px] font-mono shrink-0 border-slate-600 text-slate-400">{faq.id}</Badge>}
                          <span className="truncate">{faq.q}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 pb-4 text-xs sm:text-sm pl-2 border-l-2 border-slate-700">{faq.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredFeatures.length === 0 && (
          <div className="text-center py-16">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-slate-700" />
            <p className="text-xl font-bold text-slate-500">No Results Found</p>
          </div>
        )}

        <Card className="bg-black/40 border border-indigo-500/30 rounded-xl">
          <div className="p-3 border-b border-white/5 bg-indigo-500/10">
            <h3 className="font-black text-white uppercase flex items-center gap-2 text-sm">
              <Monitor className="w-4 h-4 text-indigo-400" />Cross-Platform Support
            </h3>
          </div>
          <CardContent className="p-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { icon: Monitor, label: "Desktop", status: "Full Support" },
                { icon: Smartphone, label: "Mobile", status: "Optimized" },
                { icon: Tablet, label: "Tablet", status: "Optimized" },
                { icon: Chrome, label: "Browsers", status: "All Major" }
              ].map((d, i) => (
                <div key={i} className="bg-black/40 rounded-lg p-3 text-center border border-white/10">
                  <d.icon className="w-6 h-6 mx-auto mb-1 text-green-400" />
                  <p className="font-bold text-white text-xs">{d.label}</p>
                  <p className="text-[10px] text-green-400">{d.status}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap justify-center gap-2 pt-4 border-t border-slate-800">
          {["Landing", "Terms", "PrivacyPolicy", "CompanyCopyright", "Support"].map(page => (
            <Button key={page} variant="outline" onClick={() => navigate(createPageUrl(page))} className="text-slate-400 border-slate-500/30 hover:bg-slate-950/30 text-xs px-3">{page.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}</Button>
          ))}
        </div>

        <div className="flex flex-col items-center pt-4 gap-3">
          <Button onClick={() => window.location.href = "mailto:jspectro2016@gmail.com"} className="bg-cyan-600/10 hover:bg-cyan-600 text-cyan-400 border border-cyan-500/50 font-bold py-4 px-8 rounded-full">
            <MessageCircle className="w-4 h-4 mr-2" />CONTACT SUPPORT
          </Button>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">© 2025 SpectroModel ENT. All Rights Reserved.</p>
          <p className="text-slate-600 text-[9px] font-mono">PATENT PENDING • PREMIUM RELEASE • AI LEARNS FROM YOUR DATA</p>
        </div>
      </div>
    </div>
  );
}