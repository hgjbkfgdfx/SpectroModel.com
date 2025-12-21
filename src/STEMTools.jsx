import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Beaker, Code, GraduationCap, Brain, Shield, Play, BookOpen, Music } from "lucide-react";

export default function STEMTools({ projectType, canEdit = true }) {
  const [mathInput, setMathInput] = useState('');
  const [mathResult, setMathResult] = useState('');
  const [codeInput, setCodeInput] = useState('// Write your code here\n');
  const [codeOutput, setCodeOutput] = useState('');

  const evaluateMath = () => {
    try {
      // Safe math evaluation
      const sanitized = mathInput.replace(/[^0-9+\-*/().sqrt\s]/g, '');
      const result = Function('"use strict"; return (' + sanitized + ')')();
      setMathResult(`Result: ${result}`);
    } catch (e) {
      setMathResult('Error: Invalid expression');
    }
  };

  const runCode = () => {
    try {
      // Simulated code execution
      const logs = [];
      const mockConsole = { log: (...args) => logs.push(args.join(' ')) };
      const fn = new Function('console', codeInput);
      fn(mockConsole);
      setCodeOutput(logs.join('\n') || 'Code executed successfully');
    } catch (e) {
      setCodeOutput(`Error: ${e.message}`);
    }
  };

  return (
    <Card className="bg-slate-900/80 border-slate-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Beaker className="w-5 h-5 text-teal-400" />
            STEM Tools
            <Badge className="bg-purple-500/20 text-purple-300 text-xs ml-2">
              <Music className="w-3 h-3 mr-1" /> Music Connected
            </Badge>
          </CardTitle>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1">
            <Brain className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] text-cyan-300">🤖 AI Learning</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-green-400" />
            <span className="text-[10px] text-green-300">🛡️ Secure</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="math">
          <TabsList className="bg-slate-800 mb-4">
            <TabsTrigger value="math"><Calculator className="w-4 h-4 mr-1" /> Math</TabsTrigger>
            <TabsTrigger value="science"><Beaker className="w-4 h-4 mr-1" /> Science</TabsTrigger>
            <TabsTrigger value="coding"><Code className="w-4 h-4 mr-1" /> Coding</TabsTrigger>
            <TabsTrigger value="learning"><GraduationCap className="w-4 h-4 mr-1" /> Learning</TabsTrigger>
          </TabsList>

          <TabsContent value="math" className="space-y-4">
            {/* Music Connection Banner */}
            <div className="p-3 bg-purple-500/20 border border-purple-500/30 rounded-lg mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Music className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-purple-300">🎵 Music Connection:</span>
                <span className="font-bold text-purple-100">Math is the foundation of music - rhythm (fractions), frequency (Hz), BPM calculations, time signatures</span>
              </div>
            </div>
            
            {/* Math Notebook - Real Composition Paper Style */}
            <div className="rounded-lg overflow-hidden shadow-xl" style={{ border: '3px solid #8B4513' }}>
              {/* Marbled header */}
              <div className="p-2" style={{
                background: 'linear-gradient(45deg, #1a1a1a 25%, #2d2d2d 25%, #2d2d2d 50%, #1a1a1a 50%, #1a1a1a 75%, #2d2d2d 75%)',
                backgroundSize: '20px 20px'
              }}>
                <h4 className="text-white font-bold text-center">📐 Math Notebook</h4>
              </div>
              {/* Writing area - White paper, blue lines, red margin */}
              <div className="relative" style={{ background: '#fff', minHeight: '200px' }}>
                {/* Red margin line */}
                <div className="absolute left-16 top-0 bottom-0 w-[2px]" style={{ background: '#ff6b6b' }} />
                {/* Blue horizontal lines */}
                <div className="p-4 pl-20" style={{
                  backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #a8d4ff 27px, #a8d4ff 28px)',
                  backgroundPosition: '0 8px',
                  minHeight: '200px'
                }}>
                  <Textarea
                    value={mathInput}
                    onChange={(e) => setMathInput(e.target.value)}
                    placeholder="Enter math expression: 2 + 2 * 3&#10;&#10;🎵 Try: 60 / 120 (beat duration at 120 BPM)"
                    className="bg-transparent border-none font-mono text-lg focus:ring-0 focus:outline-none resize-none placeholder:text-slate-400"
                    style={{ lineHeight: '28px', color: '#1e3a5f' }}
                    rows={5}
                  />
                </div>
              </div>
              <div className="flex gap-2 p-3" style={{ background: '#f5f5dc', borderTop: '2px solid #8B4513' }}>
                <Button onClick={evaluateMath} className="bg-blue-600 hover:bg-blue-700 font-bold text-white">
                  <Calculator className="w-4 h-4 mr-2" /> Calculate
                </Button>
                <Button variant="outline" onClick={() => { setMathInput(''); setMathResult(''); }} className="border-slate-500 text-slate-700 bg-white hover:bg-slate-100">
                  Clear
                </Button>
              </div>
              {mathResult && (
                <div className="p-3 mx-3 mb-3 bg-yellow-100 rounded border-2 border-yellow-400 font-mono font-bold text-lg" style={{ color: '#1e3a5f' }}>
                  {mathResult}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="science" className="space-y-4">
            {/* Music Connection Banner */}
            <div className="p-3 bg-teal-500/20 border border-teal-500/30 rounded-lg mb-4">
              <div className="flex items-center gap-2 text-teal-300 text-sm">
                <Music className="w-4 h-4" />
                <span className="font-bold">🎵 Music Connection:</span>
                <span className="text-teal-200">Sound waves, acoustics, resonance, harmonic series - all science!</span>
              </div>
            </div>
            
            {/* Science Notebook */}
            <div className="rounded-lg overflow-hidden shadow-xl" style={{ border: '3px solid #2d5a3d' }}>
              <div className="p-2" style={{ background: 'linear-gradient(135deg, #1a3a2a, #2d5a3d)' }}>
                <h4 className="text-white font-bold text-center">🔬 Science Lab Notebook</h4>
              </div>
              <div className="p-4" style={{ background: '#f8f9e8' }}>
                <div className="grid grid-cols-2 gap-3">
                  <a href="https://www.khanacademy.org/science/physics/mechanical-waves-and-sound" target="_blank" rel="noopener noreferrer" 
                    className="p-4 rounded-lg border-2 border-teal-600 hover:border-teal-400 cursor-pointer transition-all" style={{ background: '#e8f5e9' }}>
                    <h5 className="text-teal-800 font-bold text-sm">🌊 Physics</h5>
                    <p className="text-teal-700 text-xs mt-1">Sound waves, frequency, amplitude</p>
                    <p className="text-purple-600 text-[10px] mt-2 font-bold">🎵 How instruments make sound</p>
                  </a>
                  <a href="https://www.khanacademy.org/science/chemistry" target="_blank" rel="noopener noreferrer" 
                    className="p-4 rounded-lg border-2 border-purple-600 hover:border-purple-400 cursor-pointer transition-all" style={{ background: '#f3e5f5' }}>
                    <h5 className="text-purple-800 font-bold text-sm">⚗️ Chemistry</h5>
                    <p className="text-purple-700 text-xs mt-1">Material science for instruments</p>
                    <p className="text-purple-600 text-[10px] mt-2 font-bold">🎵 Why strings vibrate differently</p>
                  </a>
                  <a href="https://www.khanacademy.org/science/biology" target="_blank" rel="noopener noreferrer" 
                    className="p-4 rounded-lg border-2 border-blue-600 hover:border-blue-400 cursor-pointer transition-all" style={{ background: '#e3f2fd' }}>
                    <h5 className="text-blue-800 font-bold text-sm">🧬 Biology</h5>
                    <p className="text-blue-700 text-xs mt-1">Hearing, ear anatomy</p>
                    <p className="text-purple-600 text-[10px] mt-2 font-bold">🎵 How we perceive music</p>
                  </a>
                  <a href="https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/" target="_blank" rel="noopener noreferrer" 
                    className="p-4 rounded-lg border-2 border-green-600 hover:border-green-400 cursor-pointer transition-all" style={{ background: '#e8f5e9' }}>
                    <h5 className="text-green-800 font-bold text-sm">⚡ Engineering</h5>
                    <p className="text-green-700 text-xs mt-1">Audio engineering, DSP</p>
                    <p className="text-purple-600 text-[10px] mt-2 font-bold">🎵 Recording & mixing tech</p>
                  </a>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="coding" className="space-y-4">
            {/* Music Connection Banner */}
            <div className="p-3 bg-sky-500/20 border border-sky-500/30 rounded-lg mb-4">
              <div className="flex items-center gap-2 text-sky-300 text-sm">
                <Music className="w-4 h-4" />
                <span className="font-bold">🎵 Music Connection:</span>
                <span className="text-sky-200">Code powers DAWs, plugins, audio processing, MIDI, and music apps!</span>
              </div>
            </div>
            
            {/* Code Editor - Terminal style */}
            <div className="rounded-lg overflow-hidden shadow-xl border-2 border-slate-600">
              <div className="p-2 bg-slate-800 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <h4 className="text-slate-300 font-mono text-sm ml-2">💻 Code Editor</h4>
              </div>
              <div className="p-4" style={{ background: '#0d1117' }}>
                <Textarea
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  className="bg-transparent border-none font-mono text-sm focus:ring-0 focus:outline-none resize-none"
                  style={{ color: '#7ee787' }}
                  rows={8}
                />
              </div>
              <div className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
                <Button onClick={runCode} className="bg-green-600 hover:bg-green-700 font-bold">
                  <Play className="w-4 h-4 mr-2" /> Run Code
                </Button>
                <Button variant="outline" onClick={() => { setCodeInput('// Write your code here\n'); setCodeOutput(''); }} className="border-slate-500 text-slate-300">
                  Clear
                </Button>
              </div>
              {codeOutput && (
                <div className="p-3 mx-3 mb-3 rounded font-mono text-sm whitespace-pre-wrap" style={{ background: '#161b22', color: '#c9d1d9', border: '1px solid #30363d' }}>
                  <span className="text-slate-500">Output:</span>
                  <br />
                  {codeOutput}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="learning" className="space-y-4">
            {/* Music Connection Banner */}
            <div className="p-3 bg-fuchsia-500/20 border border-fuchsia-500/30 rounded-lg mb-4">
              <div className="flex items-center gap-2 text-fuchsia-300 text-sm">
                <Music className="w-4 h-4" />
                <span className="font-bold">🎵 Music Connection:</span>
                <span className="text-fuchsia-200">All learning connects to music - theory, production, engineering!</span>
              </div>
            </div>
            
            {/* Learning Resources - Notebook style */}
            <div className="rounded-lg overflow-hidden shadow-xl" style={{ border: '3px solid #7c3aed' }}>
              <div className="p-2" style={{ background: 'linear-gradient(135deg, #4c1d95, #7c3aed)' }}>
                <h4 className="text-white font-bold text-center">📚 Learning Resources</h4>
              </div>
              <div className="p-4" style={{ background: '#faf5ff' }}>
                <div className="space-y-3">
                  {[
                    { title: 'Music Theory Basics', desc: 'Scales, chords, progressions', url: 'https://www.musictheory.net/lessons', music: 'Foundation of all music' },
                    { title: 'Audio Engineering 101', desc: 'Signal flow, mixing basics', url: 'https://www.youtube.com/results?search_query=audio+engineering+basics', music: 'How recordings are made' },
                    { title: 'Sound Design', desc: 'Synthesis, sampling, effects', url: 'https://www.youtube.com/results?search_query=sound+design+tutorial', music: 'Creating unique sounds' },
                    { title: 'Music Production', desc: 'DAW workflow, arrangement', url: 'https://www.youtube.com/results?search_query=music+production+tutorial', music: 'Making complete songs' }
                  ].map((item, idx) => (
                    <a key={idx} href={item.url} target="_blank" rel="noopener noreferrer" 
                      className="p-4 rounded-lg border-2 border-purple-400 flex items-center gap-3 hover:border-fuchsia-500 cursor-pointer transition-all" 
                      style={{ background: '#fff' }}>
                      <BookOpen className="w-6 h-6 text-purple-600" />
                      <div className="flex-1">
                        <h5 className="text-purple-900 font-bold text-sm">{item.title}</h5>
                        <p className="text-purple-700 text-xs">{item.desc}</p>
                        <p className="text-fuchsia-600 text-[10px] mt-1 font-bold">🎵 {item.music}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}