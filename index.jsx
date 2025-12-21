import Layout from "./Layout.jsx";

import Analyze from "./Analyze";

import AnalysisResult from "./AnalysisResult";

import AnalyzeRhythm from "./AnalyzeRhythm";

import SheetMusic from "./SheetMusic";

import Settings from "./Settings";

import PrivacyPolicy from "./PrivacyPolicy";

import FAQ from "./FAQ";

import NotFound from "./NotFound";

import Support from "./Support";

import TrackQuery from "./TrackQuery";

import LyricsAnalyzer from "./LyricsAnalyzer";

import AudioConverter from "./AudioConverter";

import DSPAlgorithms from "./DSPAlgorithms";

import MarketResearch from "./MarketResearch";

import BusinessInsights from "./BusinessInsights";

import Trends from "./Trends";

import Advancements from "./Advancements";

import IndustryInsights from "./IndustryInsights";

import AnalyzeTimeSeries from "./AnalyzeTimeSeries";

import AnalyzeMarketFit from "./AnalyzeMarketFit";

import LyricsRetrieval from "./LyricsRetrieval";

import Terms from "./Terms";

import MusicEducation from "./MusicEducation";

import GenrePredictor from "./GenrePredictor";

import EmojiLyrics from "./EmojiLyrics";

import CopyrightProtection from "./CopyrightProtection";

import MarketFitResearch from "./MarketFitResearch";

import SheetMusicView from "./SheetMusicView";

import PrivacySettings from "./PrivacySettings";

import VersionInfo from "./VersionInfo";

import Accessibility from "./Accessibility";

import AdvancedAnalytics from "./AdvancedAnalytics";

import StudioCorrector from "./StudioCorrector";

import VideoGenerator from "./VideoGenerator";

import SpectroVerse from "./SpectroVerse";

import SystemCheck from "./SystemCheck";

import MLTraining from "./MLTraining";

import DataLearning from "./DataLearning";

import VersionHistory from "./VersionHistory";

import HapticFeedback from "./HapticFeedback";

import SceneGenerator from "./SceneGenerator";

import AvatarCustomizer from "./AvatarCustomizer";

import PhysicsEngine from "./PhysicsEngine";

import CreativeAnalysis from "./CreativeAnalysis";

import MarketingAnalysis from "./MarketingAnalysis";

import CognitiveAnalysis from "./CognitiveAnalysis";

import EmotionalAnalysis from "./EmotionalAnalysis";

import MusicResearch from "./MusicResearch";

import SpectroModelProRes4K from "./SpectroModelProRes4K";

import VideoStudio from "./VideoStudio";

import Projects from "./Projects";

import ProjectDetail from "./ProjectDetail";

import Monetization from "./Monetization";

import ArtistVault from "./ArtistVault";

import LegalAudit from "./LegalAudit";

import DistributionPromotion from "./DistributionPromotion";

import CompanyCopyright from "./CompanyCopyright";

import SibilanceCorrector from "./SibilanceCorrector";

import Trademarks from "./Trademarks";

import Patents from "./Patents";

import AuditLog from "./AuditLog";

import Landing from "./Landing";

import Dashboard from "./Dashboard";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Analyze: Analyze,
    
    AnalysisResult: AnalysisResult,
    
    AnalyzeRhythm: AnalyzeRhythm,
    
    SheetMusic: SheetMusic,
    
    Settings: Settings,
    
    PrivacyPolicy: PrivacyPolicy,
    
    FAQ: FAQ,
    
    NotFound: NotFound,
    
    Support: Support,
    
    TrackQuery: TrackQuery,
    
    LyricsAnalyzer: LyricsAnalyzer,
    
    AudioConverter: AudioConverter,
    
    DSPAlgorithms: DSPAlgorithms,
    
    MarketResearch: MarketResearch,
    
    BusinessInsights: BusinessInsights,
    
    Trends: Trends,
    
    Advancements: Advancements,
    
    IndustryInsights: IndustryInsights,
    
    AnalyzeTimeSeries: AnalyzeTimeSeries,
    
    AnalyzeMarketFit: AnalyzeMarketFit,
    
    LyricsRetrieval: LyricsRetrieval,
    
    Terms: Terms,
    
    MusicEducation: MusicEducation,
    
    GenrePredictor: GenrePredictor,
    
    EmojiLyrics: EmojiLyrics,
    
    CopyrightProtection: CopyrightProtection,
    
    MarketFitResearch: MarketFitResearch,
    
    SheetMusicView: SheetMusicView,
    
    PrivacySettings: PrivacySettings,
    
    VersionInfo: VersionInfo,
    
    Accessibility: Accessibility,
    
    AdvancedAnalytics: AdvancedAnalytics,
    
    StudioCorrector: StudioCorrector,
    
    VideoGenerator: VideoGenerator,
    
    SpectroVerse: SpectroVerse,
    
    SystemCheck: SystemCheck,
    
    MLTraining: MLTraining,
    
    DataLearning: DataLearning,
    
    VersionHistory: VersionHistory,
    
    HapticFeedback: HapticFeedback,
    
    SceneGenerator: SceneGenerator,
    
    AvatarCustomizer: AvatarCustomizer,
    
    PhysicsEngine: PhysicsEngine,
    
    CreativeAnalysis: CreativeAnalysis,
    
    MarketingAnalysis: MarketingAnalysis,
    
    CognitiveAnalysis: CognitiveAnalysis,
    
    EmotionalAnalysis: EmotionalAnalysis,
    
    MusicResearch: MusicResearch,
    
    SpectroModelProRes4K: SpectroModelProRes4K,
    
    VideoStudio: VideoStudio,
    
    Projects: Projects,
    
    ProjectDetail: ProjectDetail,
    
    Monetization: Monetization,
    
    ArtistVault: ArtistVault,
    
    LegalAudit: LegalAudit,
    
    DistributionPromotion: DistributionPromotion,
    
    CompanyCopyright: CompanyCopyright,
    
    SibilanceCorrector: SibilanceCorrector,
    
    Trademarks: Trademarks,
    
    Patents: Patents,
    
    AuditLog: AuditLog,
    
    Landing: Landing,
    
    Dashboard: Dashboard,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Analyze />} />
                
                
                <Route path="/Analyze" element={<Analyze />} />
                
                <Route path="/AnalysisResult" element={<AnalysisResult />} />
                
                <Route path="/AnalyzeRhythm" element={<AnalyzeRhythm />} />
                
                <Route path="/SheetMusic" element={<SheetMusic />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                
                <Route path="/FAQ" element={<FAQ />} />
                
                <Route path="/NotFound" element={<NotFound />} />
                
                <Route path="/Support" element={<Support />} />
                
                <Route path="/TrackQuery" element={<TrackQuery />} />
                
                <Route path="/LyricsAnalyzer" element={<LyricsAnalyzer />} />
                
                <Route path="/AudioConverter" element={<AudioConverter />} />
                
                <Route path="/DSPAlgorithms" element={<DSPAlgorithms />} />
                
                <Route path="/MarketResearch" element={<MarketResearch />} />
                
                <Route path="/BusinessInsights" element={<BusinessInsights />} />
                
                <Route path="/Trends" element={<Trends />} />
                
                <Route path="/Advancements" element={<Advancements />} />
                
                <Route path="/IndustryInsights" element={<IndustryInsights />} />
                
                <Route path="/AnalyzeTimeSeries" element={<AnalyzeTimeSeries />} />
                
                <Route path="/AnalyzeMarketFit" element={<AnalyzeMarketFit />} />
                
                <Route path="/LyricsRetrieval" element={<LyricsRetrieval />} />
                
                <Route path="/Terms" element={<Terms />} />
                
                <Route path="/MusicEducation" element={<MusicEducation />} />
                
                <Route path="/GenrePredictor" element={<GenrePredictor />} />
                
                <Route path="/EmojiLyrics" element={<EmojiLyrics />} />
                
                <Route path="/CopyrightProtection" element={<CopyrightProtection />} />
                
                <Route path="/MarketFitResearch" element={<MarketFitResearch />} />
                
                <Route path="/SheetMusicView" element={<SheetMusicView />} />
                
                <Route path="/PrivacySettings" element={<PrivacySettings />} />
                
                <Route path="/VersionInfo" element={<VersionInfo />} />
                
                <Route path="/Accessibility" element={<Accessibility />} />
                
                <Route path="/AdvancedAnalytics" element={<AdvancedAnalytics />} />
                
                <Route path="/StudioCorrector" element={<StudioCorrector />} />
                
                <Route path="/VideoGenerator" element={<VideoGenerator />} />
                
                <Route path="/SpectroVerse" element={<SpectroVerse />} />
                
                <Route path="/SystemCheck" element={<SystemCheck />} />
                
                <Route path="/MLTraining" element={<MLTraining />} />
                
                <Route path="/DataLearning" element={<DataLearning />} />
                
                <Route path="/VersionHistory" element={<VersionHistory />} />
                
                <Route path="/HapticFeedback" element={<HapticFeedback />} />
                
                <Route path="/SceneGenerator" element={<SceneGenerator />} />
                
                <Route path="/AvatarCustomizer" element={<AvatarCustomizer />} />
                
                <Route path="/PhysicsEngine" element={<PhysicsEngine />} />
                
                <Route path="/CreativeAnalysis" element={<CreativeAnalysis />} />
                
                <Route path="/MarketingAnalysis" element={<MarketingAnalysis />} />
                
                <Route path="/CognitiveAnalysis" element={<CognitiveAnalysis />} />
                
                <Route path="/EmotionalAnalysis" element={<EmotionalAnalysis />} />
                
                <Route path="/MusicResearch" element={<MusicResearch />} />
                
                <Route path="/SpectroModelProRes4K" element={<SpectroModelProRes4K />} />
                
                <Route path="/VideoStudio" element={<VideoStudio />} />
                
                <Route path="/Projects" element={<Projects />} />
                
                <Route path="/ProjectDetail" element={<ProjectDetail />} />
                
                <Route path="/Monetization" element={<Monetization />} />
                
                <Route path="/ArtistVault" element={<ArtistVault />} />
                
                <Route path="/LegalAudit" element={<LegalAudit />} />
                
                <Route path="/DistributionPromotion" element={<DistributionPromotion />} />
                
                <Route path="/CompanyCopyright" element={<CompanyCopyright />} />
                
                <Route path="/SibilanceCorrector" element={<SibilanceCorrector />} />
                
                <Route path="/Trademarks" element={<Trademarks />} />
                
                <Route path="/Patents" element={<Patents />} />
                
                <Route path="/AuditLog" element={<AuditLog />} />
                
                <Route path="/Landing" element={<Landing />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}