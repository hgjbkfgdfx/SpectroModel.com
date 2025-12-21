import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, X } from "lucide-react";

export default function SearchHistory({ searches, onSelect, onClear, storageKey }) {
  if (!searches || searches.length === 0) return null;

  const handleClearAll = () => {
    if (window.confirm("Clear all search history?")) {
      localStorage.removeItem(storageKey);
      onClear();
    }
  };

  return (
    <Card className="bg-slate-800/80 border-slate-700/50">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-400" />
          Recent Searches
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="text-slate-400 hover:text-white h-8 px-2"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {searches.map((search, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(search)}
              className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-full text-sm text-purple-300 transition-all hover:scale-105"
              title={`Used ${new Date(search.timestamp).toLocaleDateString()}`}
            >
              {search.track || search.query} {search.artist && `- ${search.artist}`}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}