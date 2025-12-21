import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function LiveClock({ timezone: propTimezone, showDate = true, className = "" }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userTimezone, setUserTimezone] = useState(propTimezone);

  useEffect(() => {
    // Load user's saved timezone from localStorage if not provided via prop
    const savedTimezone = localStorage.getItem('spectromodel_timezone');
    if (savedTimezone && !propTimezone) {
      setUserTimezone(savedTimezone);
    } else if (propTimezone) {
      setUserTimezone(propTimezone);
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Listen for timezone changes
    const handleStorage = (e) => {
      if (e.key === 'spectromodel_timezone') {
        setUserTimezone(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(timer);
      window.removeEventListener('storage', handleStorage);
    };
  }, [propTimezone]);

  const formatTime = (date, tz) => {
    try {
      // Use provided timezone or default to browser timezone
      const effectiveTimezone = tz && tz.trim() !== '' 
        ? tz 
        : Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      const timeString = date.toLocaleString('en-US', {
        timeZone: effectiveTimezone,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });

      const dateString = date.toLocaleString('en-US', {
        timeZone: effectiveTimezone,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      return { time: timeString, date: dateString };
    } catch (error) {
      console.error("Time formatting error:", error);
      // Fallback to local time
      return { 
        time: date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          second: '2-digit', 
          hour12: true 
        }),
        date: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })
      };
    }
  };

  const { time, date } = formatTime(currentTime, userTimezone);

  return (
    <div className={`flex items-center gap-2 ${className} select-text`}>
      <Clock className="w-4 h-4 text-purple-400 animate-pulse" />
      <div className="flex flex-col">
        <span className="text-white font-mono text-sm font-bold select-text">{time}</span>
        {showDate && (
          <span className="text-slate-400 text-xs select-text">{date}</span>
        )}
      </div>
    </div>
  );
}