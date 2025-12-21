import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Music, Shield, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";
import { validateCSP, blockScriptInjection } from "@/components/shared/SecurityValidator";

export default function MusicUploadZone({ onFileSelect, dragActive, handleDrag, handleDrop }) {
  const fileInputRef = React.useRef(null);
  const mlDataCollector = useMLDataCollector();
  const [securityStatus, setSecurityStatus] = React.useState({ safe: true, threats: 0 });

  React.useEffect(() => {
    try {
      blockScriptInjection();
      const cspResult = validateCSP();
      setSecurityStatus({ safe: cspResult.valid, threats: cspResult.violations?.length || 0 });
      
      mlDataCollector.record('upload_zone_loaded', {
        feature: 'file_upload',
        staticRemoval: true,
        security: { safe: cspResult.valid },
        timestamp: Date.now()
      });
    } catch (err) {
      console.error('Upload zone security init error:', err);
    }
  }, []);

  const handleFileSelectWithTracking = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      mlDataCollector.record('file_selected', {
        feature: 'file_upload',
        fileName: file.name,
        fileSize: (file.size / (1024 * 1024)).toFixed(2),
        fileType: file.type,
        staticRemoval: true,
        timestamp: Date.now()
      });
    }
    onFileSelect(e);
  };

  const handleDropWithTracking = (e) => {
    handleDrop(e);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      mlDataCollector.record('file_dropped', {
        feature: 'file_upload',
        fileName: file.name,
        fileSize: (file.size / (1024 * 1024)).toFixed(2),
        fileType: file.type,
        staticRemoval: true,
        timestamp: Date.now()
      });
    }
  };

  return (
    <Card className="border-none shadow-2xl bg-slate-900/80">
      <CardContent className="p-0">
        {/* Security & AI Learning Status */}
        <div className="p-3 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 bg-green-950/50 border border-green-500/30 rounded-lg">
            <Shield className="w-4 h-4 text-green-400" />
            <div>
              <p className="text-xs text-green-300 font-semibold">Security Active</p>
              <p className="text-xs text-green-400">{securityStatus.safe ? 'Protected' : `${securityStatus.threats} blocked`}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-cyan-950/50 border border-cyan-500/30 rounded-lg">
            <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
            <div>
              <p className="text-xs text-cyan-300 font-semibold">AI Learning</p>
              <p className="text-xs text-cyan-400">Static Removal</p>
            </div>
          </div>
        </div>

        <div
          className={`p-12 border-2 border-dashed rounded-lg transition-all cursor-pointer ${
            dragActive
              ? "border-purple-500 bg-purple-500/10"
              : "border-slate-700 hover:border-purple-500/50 hover:bg-slate-800/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDropWithTracking}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full">
                <Upload className="w-12 h-12 text-purple-400" />
              </div>
            </div>
            <div>
              <p className="text-xl font-semibold text-white mb-2">
                Drop your music file here
              </p>
              <p className="text-slate-400">
                or click to browse
              </p>
              <Badge className="mt-2 bg-purple-600 zero-static-text font-black text-white dark:text-white">Zero-Iteration Static Removal</Badge>
            </div>
            <div className="flex flex-wrap gap-2 justify-center text-xs text-slate-500">
              <span className="px-2 py-1 bg-slate-800 rounded">MP3</span>
              <span className="px-2 py-1 bg-slate-800 rounded">WAV</span>
              <span className="px-2 py-1 bg-slate-800 rounded">M4A</span>
              <span className="px-2 py-1 bg-slate-800 rounded">MP4</span>
              <span className="px-2 py-1 bg-slate-800 rounded">FLAC</span>
              <span className="px-2 py-1 bg-slate-800 rounded">OGG</span>
              <span className="px-2 py-1 bg-slate-800 rounded">AAC</span>
            </div>
            <Button
              type="button"
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 font-bold shadow-lg text-white force-text-white group"
              onClick={(e) => {
                e.stopPropagation();
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
            >
              <Music className="w-4 h-4 mr-2 text-white force-text-white group-hover:text-white" />
              <span className="text-white force-text-white group-hover:text-white">Select File</span>
            </Button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,video/*,.mp3,.wav,.m4a,.mp4,.aac,.ogg,.flac,.wma,.aiff,.ape,.alac,.opus,.webm,.mov,.avi"
          onChange={handleFileSelectWithTracking}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}