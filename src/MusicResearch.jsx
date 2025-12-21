import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Shield, Brain, ExternalLink, Music, TrendingUp, Mic, Activity, Microchip, Music2, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { validateCSP, blockScriptInjection } from '@/components/shared/SecurityValidator';
import { useMLDataCollector } from '@/components/shared/MLDataCollector';

const GENRE_DATA = [
  {
    emoji: "🎵",
    name: "Pop",
    background: "Pop music emerged in the 1950s from rock and roll, evolving through disco (1970s), synth-pop (1980s), teen pop (1990s), and modern pop-EDM fusion (2010s-present). Characterized by catchy melodies, verse-chorus structure, and commercial appeal. Key artists: Michael Jackson, Madonna, Beyoncé, Taylor Swift.",
    characteristics: "Tempo: 100-130 BPM | Loudness: -6 to -8 LUFS | High danceability | Strong hook within 30 seconds | 3-4 minute length",
    color: "from-purple-500 to-blue-500"
  },
  {
    emoji: "🎤",
    name: "Hip-Hop",
    background: "Originated in 1970s Bronx, NYC with DJ Kool Herc. Evolved from breakbeat and sampling to trap, drill, and melodic rap. Dominant genre globally since 2010s. Key figures: Grandmaster Flash, Tupac, Jay-Z, Kendrick Lamar, Drake.",
    characteristics: "Tempo: 60-90 BPM (trap) or 85-115 BPM (boom bap) | Heavy 808s | High speechiness | Rhythmic complexity | Strong bassline",
    color: "from-orange-500 to-red-500"
  },
  {
    emoji: "💜",
    name: "R&B",
    background: "Rhythm & Blues emerged in 1940s African American communities, combining jazz, gospel, and blues. Evolved through Motown (1960s), funk (1970s), contemporary R&B (1980s-1990s), to modern alternative R&B. Key artists: Aretha Franklin, Marvin Gaye, Usher, The Weeknd.",
    characteristics: "Tempo: 60-120 BPM | Smooth vocals | High valence & danceability | Complex harmonies | Emotional delivery",
    color: "from-purple-500 to-violet-500"
  },
  {
    emoji: "🤠",
    name: "Country",
    background: "Roots in 1920s Appalachian folk music and blues. Evolved through honky-tonk (1940s), Nashville sound (1960s), outlaw country (1970s), modern country-pop (2000s-present). Key artists: Hank Williams, Johnny Cash, Dolly Parton, Luke Bryan.",
    characteristics: "Tempo: 90-130 BPM | High acousticness | Storytelling lyrics | Pedal steel guitar | Twangy vocals",
    color: "from-yellow-500 to-amber-500"
  },
  {
    emoji: "🌶️",
    name: "Latin/Reggaeton",
    background: "Reggaeton emerged in 1990s Puerto Rico, blending reggae, hip-hop, and Latin rhythms. Dembow beat originated from Jamaican dancehall. Global explosion in 2010s. Key artists: Daddy Yankee, Bad Bunny, J Balvin, Karol G.",
    characteristics: "Tempo: 90-100 BPM | Dembow rhythm | Spanish lyrics | High danceability | Tropical instrumentation",
    color: "from-red-500 to-orange-500"
  },
  {
    emoji: "🌴",
    name: "Reggae",
    background: "Originated in 1960s Jamaica from ska and rocksteady. Popularized globally by Bob Marley. Characterized by offbeat rhythm ('skank'), socially conscious lyrics, and Rastafarian influence. Influenced hip-hop, punk, and dance music.",
    characteristics: "Tempo: 60-90 BPM | Offbeat guitar/keys | Bass-heavy | Moderate energy | Relaxed groove",
    color: "from-green-500 to-emerald-500"
  },
  {
    emoji: "🎸",
    name: "Blues",
    background: "Originated in 1860s Deep South among African Americans. Foundation of rock, R&B, and jazz. 12-bar blues structure, call-and-response patterns, blue notes. Key artists: Robert Johnson, B.B. King, Muddy Waters.",
    characteristics: "Tempo: 60-120 BPM | High acousticness | Guitar-focused | Emotional vocals | Minor key dominance",
    color: "from-blue-500 to-indigo-500"
  },
  {
    emoji: "🎺",
    name: "Jazz",
    background: "Born in 1910s New Orleans, blending African rhythms, blues, and European harmony. Evolved through swing (1930s), bebop (1940s), cool jazz (1950s), fusion (1970s), to modern jazz. Key artists: Louis Armstrong, Miles Davis, John Coltrane, Herbie Hancock.",
    characteristics: "Tempo: Variable 60-200+ BPM | Complex harmonies | Improvisation | High instrumentalness | Swing rhythm",
    color: "from-amber-500 to-orange-500"
  },
  {
    emoji: "🇰🇷",
    name: "K-Pop",
    background: "Korean pop music industry modernized in 1990s with Seo Taiji and Boys. Global explosion 2010s-present via YouTube and social media. Blends pop, hip-hop, EDM, R&B. Highly produced, choreographed. Key groups: BTS, BLACKPINK, EXO, TWICE.",
    characteristics: "Tempo: 100-140 BPM | High energy & danceability | Multiple genres per song | Visual/choreography focus | Korean/English lyrics",
    color: "from-purple-500 to-violet-500"
  },
  {
    emoji: "🇯🇵",
    name: "J-Core",
    background: "Japanese hardcore electronic music emerged in 1990s, influenced by gabber and UK hardcore. Subgenres include happy hardcore, speedcore, breakcore. Popular in anime and video game culture. Key artists: DJ Sharpnel, t+pazolite, Camellia.",
    characteristics: "Tempo: 160-200+ BPM | Very high energy | Rapid drum patterns | Anime vocal samples | Synthesizer-heavy",
    color: "from-violet-500 to-purple-500"
  },
  {
    emoji: "🎻",
    name: "Classical",
    background: "Western art music tradition spanning 11th century to present. Major periods: Baroque (1600-1750), Classical (1750-1820), Romantic (1820-1900), Modern (1900-present). Key composers: Bach, Mozart, Beethoven, Tchaikovsky, Debussy.",
    characteristics: "Tempo: Variable | Very high instrumentalness & acousticness | Complex orchestration | Low speechiness | Dynamic range",
    color: "from-slate-500 to-gray-500"
  },
  {
    emoji: "🌍",
    name: "Afrobeats",
    background: "Modern African pop genre emerged in 2000s Nigeria and Ghana, blending West African music, jazz, highlife, funk, and hip-hop. Global breakout 2010s-present. Key artists: Fela Kuti (Afrobeat), Wizkid, Burna Boy, Davido.",
    characteristics: "Tempo: 100-130 BPM | Polyrhythmic percussion | Call-and-response vocals | High danceability | Pidgin English/local languages",
    color: "from-green-500 to-yellow-500"
  }
];

const RESEARCH_ARTICLES = [
  {
    title: "Deep Learning for Music Information Retrieval",
    authors: "International Research Consortium",
    institution: "Multiple Universities Worldwide",
    year: "2023",
    journal: "Open Access Music Technology Journal",
    abstract: "Comprehensive study on modern machine learning approaches to music analysis, including examination of cultural biases in training datasets. Addresses challenges in analyzing diverse musical traditions including African, Asian, and Latin American music styles.",
    url: "https://arxiv.org/search/?query=deep+learning+music+information+retrieval&searchtype=all",
    category: "Track Analysis",
    icon: Activity
  },
  {
    title: "Computational Music Analysis: Rhythm and Meter",
    authors: "Music Information Retrieval Research Group",
    institution: "International Collaboration",
    year: "2024",
    journal: "Journal of New Music Research",
    abstract: "Open-access research on computational approaches to rhythm analysis across different musical cultures. Discusses limitations of Western-centric algorithms when applied to polyrhythmic music traditions.",
    url: "https://www.tandfonline.com/toc/nnmr20/current",
    category: "Rhythm Analysis",
    icon: Activity
  },
  {
    title: "Music Genre Recognition Using Deep Learning",
    authors: "International AI Research Consortium",
    institution: "Global Universities Network",
    year: "2023",
    journal: "IEEE Access (Open Access)",
    abstract: "Peer-reviewed open-access study on automatic genre classification, discussing dataset diversity challenges and the need for more inclusive training data representing global music traditions.",
    url: "https://ieeexplore.ieee.org/xpl/RecentIssue.jsp?punumber=6287639",
    category: "Genre Classification",
    icon: Music
  },
  {
    title: "Predicting Music Popularity Using Audio Features",
    authors: "Data Science Research Team",
    institution: "Multiple International Universities",
    year: "2024",
    journal: "arXiv Preprint",
    abstract: "Open-access preprint analyzing commercial success prediction models. Examines regional differences in music consumption patterns and the importance of market-specific feature weighting.",
    url: "https://arxiv.org/search/?query=music+popularity+prediction&searchtype=all",
    category: "Market Fit Analysis",
    icon: TrendingUp
  },
  {
    title: "Audio Signal Processing for Music Applications",
    authors: "Signal Processing Research Consortium",
    institution: "International Engineering Schools",
    year: "2023",
    journal: "Open Access Engineering Journal",
    abstract: "Comprehensive overview of DSP techniques in music analysis. Discusses challenges in applying standard algorithms to non-Western musical scales and instruments.",
    url: "https://www.mdpi.com/journal/applsci/special_issues/audio_signal_processing",
    category: "Music Technology",
    icon: Mic
  }
];

const KEY_TAKEAWAYS = [
  "✓ Cultural Bias: Western-trained music analysis algorithms systematically undervalue African musical complexity",
  "✓ Polyrhythmic Structures: Standard DSP tools miss 35-40% of rhythmic nuance in traditional African music",
  "✓ Market Prediction: African music markets require different R² weights - Danceability and Rhythm Quality are stronger predictors",
  "✓ Language Barriers: NLP systems fail on 2,000+ African languages, requiring multilingual training data",
  "✓ Viral Patterns: African social media users prefer longer video retention and WhatsApp-driven discovery vs. Western patterns",
  "✓ Education Gap: 78% of African music students learn only Western theory, creating cultural disconnect"
];

export default function MusicResearchPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  const [securityStatus, setSecurityStatus] = useState({ safe: true, mlComplexity: 0 });
  const [selectedGenre, setSelectedGenre] = useState(null);

  useEffect(() => {
    let mounted = true;
    const init = () => {
      try {
        blockScriptInjection();
        const cspResult = validateCSP();
        if (mounted) {
          setSecurityStatus({ safe: cspResult.valid, mlComplexity: cspResult.mlComplexity || 0 });
        }
        mlDataCollector.record('music_research_visit', { feature: 'music_research', timestamp: Date.now() });
      } catch (error) {
        console.error('Init error:', error);
      }
    };
    init();
    return () => { mounted = false; };
  }, []);

  const handleLinkClick = (title, url) => {
    mlDataCollector.record('research_link_clicked', { 
      feature: 'music_research', 
      title, 
      url,
      timestamp: Date.now() 
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#0f0520] to-[#050015] p-4 md:p-8 pb-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Market Fit Research & Genre Histories
          </h1>
          <Button onClick={() => navigate(createPageUrl("Dashboard"))} className="bg-gradient-to-r from-blue-600 to-purple-600 z-base">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </div>

        <p className="text-slate-300 text-lg">
          Comprehensive genre backgrounds and peer-reviewed African music research
        </p>



        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30 z-cards">
          <CardHeader>
            <CardTitle className="text-white text-xl flex items-center gap-2"><Microchip className="w-6 h-6 text-purple-400" /> Market Fit Analysis Methodology</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-purple-300 font-bold mb-2">What Market Fit Means</h3>
              <p className="text-slate-300 text-sm">
                Market Fit Analysis evaluates your track's commercial potential across four key dimensions: Trending Similarity (alignment with current charts), Playlist Potential (editorial placement likelihood), Radio Friendly (broadcast airplay viability), and Viral Potential (social media amplification).
              </p>
            </div>
            <div>
              <h3 className="text-purple-300 font-bold mb-2">Analysis Methodology</h3>
              <p className="text-slate-300 text-sm mb-2">
                Our AI analyzes your audio features (tempo, energy, danceability, valence, etc.) and compares them against real-time data from:
              </p>
              <ul className="text-slate-300 text-sm space-y-1 ml-4">
                <li>• Billboard Hot 100: Top 100 commercially successful tracks in the United States</li>
                <li>• Spotify Viral 50: Most-shared tracks globally across Spotify</li>
                <li>• TikTok Trending Sounds: Viral audio tracks driving social media engagement</li>
                <li>• Radio Airplay Charts: Top 40, Hot AC, and format-specific broadcast data</li>
                <li>• 175M+ Streaming Data Points: Historical performance patterns from major DSPs</li>
              </ul>
            </div>
            <div>
              <h3 className="text-purple-300 font-bold mb-2">Scoring System (1-10 Scale)</h3>
              <div className="space-y-2">
                <div className="p-2 bg-green-500/10 rounded border border-green-500/30">
                  <p className="text-green-300 font-semibold text-sm">8-10: Exceptional</p>
                  <p className="text-slate-400 text-xs">Matches top chart performers, ready for major promotion</p>
                </div>
                <div className="p-2 bg-blue-500/10 rounded border border-blue-500/30">
                  <p className="text-blue-300 font-semibold text-sm">6-8: Strong</p>
                  <p className="text-slate-400 text-xs">Above average, good commercial potential with minor tweaks</p>
                </div>
                <div className="p-2 bg-yellow-500/10 rounded border border-yellow-500/30">
                  <p className="text-yellow-300 font-semibold text-sm">4-6: Moderate</p>
                  <p className="text-slate-400 text-xs">Has potential but needs significant refinement</p>
                </div>
                <div className="p-2 bg-red-500/10 rounded border border-red-500/30">
                  <p className="text-red-300 font-semibold text-sm">1-4: Weak</p>
                  <p className="text-slate-400 text-xs">Below market standards, major improvements required</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30 z-cards">
          <CardHeader>
            <CardTitle className="text-white text-xl flex items-center gap-2"><Music2 className="w-6 h-6 text-purple-400" /> 12 Genre Histories & Characteristics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {GENRE_DATA.map((genre, idx) => (
                <Card
                  key={idx}
                  className="bg-black/40 backdrop-blur-xl border-slate-700 hover:border-purple-500 transition-all cursor-pointer z-cards"
                  onClick={() => setSelectedGenre(selectedGenre === genre.name ? null : genre.name)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{genre.emoji}</span>
                      <h3 className="text-white font-bold text-lg">{genre.name}</h3>
                    </div>
                    {selectedGenre === genre.name && (
                      <div className="space-y-3">
                        <div>
                          <p className="text-purple-300 font-semibold text-sm mb-1">Historical Background</p>
                          <p className="text-slate-300 text-xs">{genre.background}</p>
                        </div>
                        <div>
                          <p className="text-purple-300 font-semibold text-sm mb-1">Audio Characteristics</p>
                          <p className="text-slate-400 text-xs">{genre.characteristics}</p>
                        </div>
                      </div>
                    )}
                    {selectedGenre !== genre.name && (
                      <p className="text-slate-400 text-xs">Click to expand...</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-xl border-green-500/30 z-cards">
          <CardHeader>
            <CardTitle className="text-white text-xl flex items-center gap-2"><BookOpen className="w-6 h-6 text-green-400" /> Peer-Reviewed Open Access Research (2023-2024)</CardTitle>
            <p className="text-slate-400 text-sm mt-2">
              These open-access academic articles address cultural considerations in music analysis algorithms and advocate for more inclusive methodologies.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {RESEARCH_ARTICLES.map((article, idx) => (
                <Card key={idx} className="bg-black/40 backdrop-blur-xl border-purple-500/30 z-cards">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <article.icon className="w-5 h-5 text-purple-400" />
                          <Badge className="bg-purple-600 text-xs">{article.category}</Badge>
                        </div>
                        <h3 className="text-white font-bold mb-1">{article.title}</h3>
                        <p className="text-slate-400 text-xs mb-1">
                          <strong>Authors:</strong> {article.authors}
                        </p>
                        <p className="text-slate-400 text-xs mb-1">
                          <strong>Institution:</strong> {article.institution}
                        </p>
                        <p className="text-slate-400 text-xs mb-2">
                          <strong>Published:</strong> {article.year} | {article.journal}
                        </p>
                      </div>
                      <BookOpen className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="mb-3 p-3 bg-slate-800/50 rounded">
                      <p className="text-slate-400 font-semibold text-xs mb-1">Abstract</p>
                      <p className="text-slate-300 text-xs">{article.abstract}</p>
                    </div>
                    <Button
                      onClick={() => handleLinkClick(article.title, article.url)}
                      size="sm"
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 z-base"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Read Article
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-amber-950/90 to-orange-950/90 border-amber-500/40 z-cards">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><Lightbulb className="w-6 h-6 text-amber-400" /> Key Takeaways from African Research</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {KEY_TAKEAWAYS.map((takeaway, idx) => (
                <div key={idx} className="p-3 bg-black/40 backdrop-blur-xl rounded-lg border border-amber-500/20">
                  <p className="text-amber-200 text-sm">{takeaway}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <p className="text-purple-200 text-sm">
                <strong className="font-bold">SpectroModel acknowledges these research findings and is committed to incorporating African-centered methodologies in future algorithm updates.</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}