import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

export default function ExportToPDF({ data, filename = "analysis-data", className = "" }) {
  const [isExporting, setIsExporting] = React.useState(false);

  const generateFile = async () => {
    setIsExporting(true);
    try {
      const exportData = data || [];
      let content;
      
      // Check if this is sheet music data
      const isSheetMusic = data && (data.chord_progression || data.drum_pattern || data.sections);
      
      if (isSheetMusic) {
        // Format sheet music data
        content = `
═══════════════════════════════════════════════════════════════════
                    SPECTROMODEL SHEET MUSIC REPORT
═══════════════════════════════════════════════════════════════════

Title: ${data.title || "Untitled"}
Artist: ${data.artist || "Unknown Artist"}
Generated: ${new Date().toLocaleString()}
Export Format: Text Document (Plain Text)

═══════════════════════════════════════════════════════════════════
                          SONG INFORMATION
═══════════════════════════════════════════════════════════════════

Key: ${data.key || "C"}
Time Signature: ${data.time_signature || "4/4"}
Tempo: ${data.tempo || 120} BPM

═══════════════════════════════════════════════════════════════════
                        CHORD PROGRESSIONS
═══════════════════════════════════════════════════════════════════

${data.chord_progression ? Object.entries(data.chord_progression).map(([section, chords]) => 
  `${section.toUpperCase()}: ${Array.isArray(chords) ? chords.join(' - ') : 'N/A'}`
).join('\n') : 'No chord progressions available'}

═══════════════════════════════════════════════════════════════════
                          DRUM PATTERN
═══════════════════════════════════════════════════════════════════

${data.drum_pattern ? Object.entries(data.drum_pattern).map(([drum, pattern]) => 
  `${drum.toUpperCase()}: ${Array.isArray(pattern) ? pattern.join(' | ') : 'N/A'}`
).join('\n\n') : 'No drum patterns available'}

═══════════════════════════════════════════════════════════════════
                         SONG STRUCTURE
═══════════════════════════════════════════════════════════════════

${data.sections && Array.isArray(data.sections) ? data.sections.map((section, idx) => {
  let sectionText = `\n[${idx + 1}] ${section.name || 'Section'}\n${'─'.repeat(60)}\n`;
  
  if (section.measures && Array.isArray(section.measures)) {
    section.measures.forEach((measure, mIdx) => {
      sectionText += `\nMeasure ${mIdx + 1}:\n`;
      sectionText += `  Chord: ${measure.chord || 'N/A'}\n`;
      sectionText += `  Melody: ${Array.isArray(measure.melody) ? measure.melody.join(', ') : 'N/A'}\n`;
      sectionText += `  Duration: ${Array.isArray(measure.duration) ? measure.duration.join(', ') : 'N/A'}\n`;
      sectionText += `  Bass: ${Array.isArray(measure.bass) ? measure.bass.join(', ') : 'N/A'}\n`;
    });
  }
  
  return sectionText;
}).join('\n') : 'No sections available'}

═══════════════════════════════════════════════════════════════════
                       © ${new Date().getFullYear()} SpectroModel
                  AI-Powered Music Analytics Platform
                       https://spectromodel.com
═══════════════════════════════════════════════════════════════════
`;
      } else {
        // Handle non-sheet-music data (original functionality)
        const hasData = Array.isArray(exportData) && exportData.length > 0;
        const recordCount = hasData ? exportData.length : 0;
        
        if (!hasData) {
          content = `
═══════════════════════════════════════════════════════════════════
                    SPECTROMODEL ANALYSIS REPORT
═══════════════════════════════════════════════════════════════════

Report Title: ${filename}
Generated: ${new Date().toLocaleString()}
Export Format: Text Document (Plain Text)
Status: NO DATA FOUND

═══════════════════════════════════════════════════════════════════
                          NO ANALYSES AVAILABLE
═══════════════════════════════════════════════════════════════════

You have not performed any analyses yet.

To get started:
1. Go to Track Analysis in the navigation menu
2. Upload your audio file
3. Complete the analysis
4. Return to Dashboard to view and export your results

═══════════════════════════════════════════════════════════════════
                       © ${new Date().getFullYear()} SpectroModel
                  AI-Powered Music Analytics Platform
                       https://spectromodel.com
═══════════════════════════════════════════════════════════════════
`;
        } else {
          content = `
═══════════════════════════════════════════════════════════════════
                    SPECTROMODEL ANALYSIS REPORT
═══════════════════════════════════════════════════════════════════

Report Title: ${filename}
Generated: ${new Date().toLocaleString()}
Export Format: Text Document (Plain Text)
Total Records: ${recordCount}

═══════════════════════════════════════════════════════════════════
                          ANALYSIS DATA
═══════════════════════════════════════════════════════════════════

${JSON.stringify(exportData, null, 2)}

═══════════════════════════════════════════════════════════════════
                       © ${new Date().getFullYear()} SpectroModel
                  AI-Powered Music Analytics Platform
                       https://spectromodel.com
═══════════════════════════════════════════════════════════════════
`;
        }
      }

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      if (isSheetMusic) {
        alert("✓ Sheet music exported successfully!");
      } else if (!Array.isArray(exportData) || exportData.length === 0) {
        alert("✓ Downloaded empty report. Start analyzing tracks to see data!");
      } else {
        alert(`✓ Successfully exported ${exportData.length} analysis record${exportData.length > 1 ? 's' : ''}!`);
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={generateFile}
      disabled={isExporting}
      className={`border-slate-600 text-slate-300 hover:bg-slate-700/50 ${className}`}
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Export
        </>
      )}
    </Button>
  );
}