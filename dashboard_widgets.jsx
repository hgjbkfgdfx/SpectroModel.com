import React, { useState } from 'react';
import { Card, CardContent, Button, Badge, cn } from '@/components/ui/index';
import { 
  BarChart3, Activity, Zap, Radio, Play, Pause, MoreHorizontal, 
  Share2, ArrowUpRight, Clock, Box, Layers, Music, Crown,
  TrendingUp, Filter, PieChart, LineChart as LineChartIcon, BarChart as BarChartIcon
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// Stats Cards
export const StatsCards = ({ analyses }) => {
  const total = analyses.length;
  const completed = analyses.filter(a => a.status === 'completed').length;
  const avgScore = total > 0 ? Math.round(analyses.reduce((acc, curr) => acc + (curr.hit_score || 0), 0) / total) : 0;

  const stats = [
    { label: 'Total Scans', value: total, icon: Activity, color: 'text-cyber-cyan', border: 'border-cyber-cyan/30' },
    { label: 'Success Rate', value: `${completed > 0 ? Math.round((completed / total) * 100) : 0}%`, icon: Zap, color: 'text-cyber-green', border: 'border-cyber-green/30' },
    { label: 'Avg Hit Score', value: avgScore, icon: Crown, color: 'text-cyber-gold', border: 'border-cyber-gold/30' },
    { label: 'Processing', value: 'Idle', icon: Radio, color: 'text-cyber-purple', border: 'border-cyber-purple/30' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card key={i} className={cn("group hover:translate-y-[-2px] transition-transform", stat.border)}>
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-transparent to-current opacity-5 blur-2xl ${stat.color}`} />
            <CardContent className="p-3 flex items-center justify-between relative z-10">
              <div className="min-w-0 flex-1">
                <p className="text-slate-400 text-[10px] font-mono uppercase tracking-wide mb-0.5 truncate">{stat.label}</p>
                <h3 className={cn("text-lg md:text-xl font-black font-mono", stat.color)}>{stat.value}</h3>
              </div>
              <div className={cn("p-2 rounded-lg bg-white/5 border border-white/10 shrink-0", stat.color)}>
                <Icon className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Advanced Chart Widget with Cross-Filtering
export const AdvancedChartWidget = ({ analyses }) => {
  const [chartType, setChartType] = useState('bar');
  const [filterBy, setFilterBy] = useState('all');

  // Process data for charts
  const processData = () => {
    let data = analyses;
    
    // Filter
    if (filterBy === 'high_score') {
      data = data.filter(a => (a.hit_score || 0) > 80);
    } else if (filterBy === 'recent') {
      data = data.slice(0, 10);
    }

    // Transform for chart (mock transformation)
    return data.slice(0, 10).map((a, i) => ({
      name: a.track_name.substring(0, 10) + '...',
      score: a.hit_score || 0,
      energy: Math.floor(Math.random() * 100),
      engagement: Math.floor(Math.random() * 100)
    }));
  };

  const chartData = processData();

  return (
    <Card className="border border-white/10 bg-black/40 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
          <h3 className="text-white font-bold text-sm md:text-base flex items-center gap-2 font-mono uppercase tracking-wide">
            <BarChart3 className="w-4 h-4 text-cyber-purple" /> Analytics
          </h3>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
               <button 
                 onClick={() => setChartType('bar')}
                 className={cn("p-2 rounded transition-colors", chartType === 'bar' ? 'bg-cyber-purple text-white' : 'text-slate-400 hover:text-white')}
               >
                 <BarChartIcon className="w-4 h-4" />
               </button>
               <button 
                 onClick={() => setChartType('line')}
                 className={cn("p-2 rounded transition-colors", chartType === 'line' ? 'bg-cyber-purple text-white' : 'text-slate-400 hover:text-white')}
               >
                 <LineChartIcon className="w-4 h-4" />
               </button>
               <button 
                 onClick={() => setChartType('area')}
                 className={cn("p-2 rounded transition-colors", chartType === 'area' ? 'bg-cyber-purple text-white' : 'text-slate-400 hover:text-white')}
               >
                 <PieChart className="w-4 h-4" />
               </button>
            </div>

            <div className="flex items-center gap-2 bg-black/40 rounded-lg px-3 py-1 border border-white/10">
               <Filter className="w-3 h-3 text-slate-400" />
               <select 
                 value={filterBy} 
                 onChange={(e) => setFilterBy(e.target.value)}
                 className="bg-transparent border-none text-xs text-white focus:ring-0 cursor-pointer"
               >
                 <option value="all">All Data</option>
                 <option value="high_score">High Score {'>'} 80</option>
                 <option value="recent">Recent Only</option>
               </select>
            </div>
          </div>
        </div>

        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', color: '#fff' }} />
                <Bar dataKey="score" fill="#bd00ff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="energy" fill="#00f3ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', color: '#fff' }} />
                <Line type="monotone" dataKey="score" stroke="#bd00ff" strokeWidth={2} dot={{r: 4}} />
                <Line type="monotone" dataKey="energy" stroke="#00f3ff" strokeWidth={2} dot={{r: 4}} />
              </LineChart>
            ) : (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', color: '#fff' }} />
                <Area type="monotone" dataKey="score" stroke="#bd00ff" fill="#bd00ff" fillOpacity={0.3} />
                <Area type="monotone" dataKey="energy" stroke="#00f3ff" fill="#00f3ff" fillOpacity={0.3} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Recent Analyses
export const RecentAnalyses = ({ analyses, onViewDetails }) => {
  return (
    <div className="space-y-3">
      {analyses.slice(0, 5).map((analysis) => (
        <Card key={analysis.id} className="hover:bg-white/5 cursor-pointer group border-l-4 border-l-transparent hover:border-l-cyber-cyan transition-all" onClick={() => onViewDetails(analysis)}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded bg-cyber-panel border border-white/10 flex items-center justify-center group-hover:border-cyber-cyan/50 transition-colors">
                  <Music className="w-5 h-5 text-slate-400 group-hover:text-cyber-cyan" />
                </div>
                {analysis.status === 'completed' && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-cyber-green rounded-full border-2 border-cyber-black" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-slate-200 group-hover:text-white transition-colors">{analysis.track_name}</h4>
                <p className="text-xs text-slate-500 font-mono">{analysis.artist_name} • {analysis.bpm || 0} BPM</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
               <div className="hidden md:block text-right">
                  <span className="text-xs text-slate-500 font-mono block">SCORE</span>
                  <span className={cn("text-lg font-bold font-mono", (analysis.hit_score || 0) > 80 ? "text-cyber-gold" : "text-cyber-cyan")}>
                    {analysis.hit_score}
                  </span>
               </div>
               <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                 <ArrowUpRight className="w-4 h-4" />
               </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Top Tracks (Simplified Visualization)
export const TopTracks = ({ analyses, onTrackClick }) => {
  return (
    <div className="space-y-2">
      {analyses.slice(0, 4).map((track, i) => (
        <div 
          key={track.id} 
          className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-all"
          onClick={() => onTrackClick && onTrackClick(track)}
        >
          <div className="text-sm font-bold text-slate-600 font-mono w-6">
            0{i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center gap-2">
              <h4 className="font-semibold text-sm text-white truncate">{track.track_name}</h4>
              <span className="text-xs font-mono text-cyber-gold shrink-0">{track.hit_score}%</span>
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-gradient-to-r from-cyber-gold to-cyber-purple" 
                style={{ width: `${track.hit_score}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Category Filters
export const CategoryFilters = ({ onFilterChange, selectedCategory }) => {
  const categories = [
    { id: 'all', label: 'ALL SYSTEMS' },
    { id: 'track_analysis', label: 'TRACKS' },
    { id: 'rhythm_analysis', label: 'RHYTHM' },
    { id: 'dsp_algorithms', label: 'DSP' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onFilterChange(cat.id)}
          className={cn(
            "px-4 py-2 rounded-sm text-xs font-bold font-mono tracking-widest transition-all clip-path-slant border",
            selectedCategory === cat.id
              ? "bg-cyber-cyan text-cyber-black border-cyber-cyan shadow-[0_0_15px_rgba(0,243,255,0.3)]"
              : "bg-transparent text-slate-400 border-slate-800 hover:border-cyber-cyan/50 hover:text-cyber-cyan"
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
};