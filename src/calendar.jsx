import React from 'react';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function Calendar({ className }) {
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const dates = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className={cn("p-3 w-full max-w-[300px]", className)}>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map(d => (
          <div key={d} className="text-center text-xs text-slate-500 font-mono">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {dates.map(d => (
          <div 
            key={d} 
            className={cn(
              "h-8 flex items-center justify-center text-xs rounded hover:bg-white/10 cursor-pointer transition-colors text-slate-300",
              d === 15 ? "bg-cyber-gold text-black font-bold shadow-[0_0_10px_rgba(255,215,0,0.5)]" : ""
            )}
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  );
}