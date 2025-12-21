import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, GripVertical, Lock, Unlock } from "lucide-react";

const STORAGE_KEY = 'nav_arrows_position';
const LOCK_KEY = 'nav_arrows_locked';

export default function NavigationArrows() {
  const navigate = useNavigate();
  
  // Load saved position from localStorage or use default
  const getInitialPosition = () => {
    if (typeof window === 'undefined') return { x: 0, y: 0 };
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate position is within bounds
        const maxX = window.innerWidth - 180;
        const maxY = window.innerHeight - 60;
        return {
          x: Math.max(0, Math.min(parsed.x || 0, maxX)),
          y: Math.max(0, Math.min(parsed.y || 0, maxY))
        };
      }
    } catch (e) {
      console.warn('Failed to load nav position:', e);
    }
    
    // Default position: bottom center
    return { 
      x: window.innerWidth / 2 - 90, 
      y: window.innerHeight - 100 
    };
  };

  const getInitialLocked = () => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(LOCK_KEY) === 'true';
    } catch (e) {
      return false;
    }
  };

  const [position, setPosition] = useState(getInitialPosition);
  const [isLocked, setIsLocked] = useState(getInitialLocked);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Save position to localStorage when it changes (not during drag)
  useEffect(() => {
    if (!isDragging && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
      } catch (e) {
        console.warn('Failed to save nav position:', e);
      }
    }
  }, [position, isDragging]);

  // Save lock state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCK_KEY, isLocked.toString());
      } catch (e) {
        console.warn('Failed to save lock state:', e);
      }
    }
  }, [isLocked]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging && !isLocked) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      const maxX = window.innerWidth - 180;
      const maxY = window.innerHeight - 60;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  }, [isDragging, dragOffset, isLocked]);

  const handleTouchMove = useCallback((e) => {
    if (isDragging && !isLocked && e.touches[0]) {
      const touch = e.touches[0];
      const newX = touch.clientX - dragOffset.x;
      const newY = touch.clientY - dragOffset.y;
      
      const maxX = window.innerWidth - 180;
      const maxY = window.innerHeight - 60;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  }, [isDragging, dragOffset, isLocked]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseDown = (e) => {
    if (isLocked) return;
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleTouchStart = (e) => {
    if (isLocked) return;
    if (e.touches[0]) {
      setIsDragging(true);
      setDragOffset({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const handleBack = (e) => {
    e.stopPropagation();
    navigate(-1);
  };

  const handleForward = (e) => {
    e.stopPropagation();
    navigate(1);
  };

  const toggleLock = (e) => {
    e.stopPropagation();
    setIsLocked(!isLocked);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
        pointerEvents: 'auto',
        touchAction: 'none'
      }}
      className={`flex items-center gap-2 bg-slate-900/95 p-2 rounded-full border-2 ${isLocked ? 'border-green-500/50' : 'border-purple-500/50'} shadow-2xl navigation-arrows backdrop-blur-sm`}
    >
      {/* Lock/Unlock Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleLock}
        className={`w-8 h-8 rounded-full ${isLocked ? 'bg-green-600/30 text-green-400' : 'bg-slate-700/50 text-slate-400'} hover:bg-slate-600/50`}
        title={isLocked ? "Unlock position" : "Lock position"}
      >
        {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
      </Button>

      {/* Drag Handle - only active when unlocked */}
      <div 
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`p-1 rounded select-none transition-all ${isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-move hover:bg-slate-700/50'}`}
        style={{ touchAction: 'none' }}
        title={isLocked ? "Position locked" : "Drag to move"}
      >
        <GripVertical className="w-4 h-4 text-purple-400" />
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={handleBack}
        className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 border-none text-white hover:from-purple-700 hover:to-blue-700 shadow-xl transition-all hover:scale-110"
        title="Go Back"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleForward}
        className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 border-none text-white hover:from-purple-700 hover:to-blue-700 shadow-xl transition-all hover:scale-110"
        title="Go Forward"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}