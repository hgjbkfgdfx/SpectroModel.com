/**
 * CODE PROTECTION SYSTEM
 * Blocks all attempts to view source code, inspect elements, or copy code
 * Disables Ctrl+U, F12, right-click, and other developer shortcuts
 */

import { useEffect } from 'react';

export default function CodeProtection() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Block keyboard shortcuts
    const handleKeyDown = (e) => {
      // Block Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      
      // Block Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      
      // Block Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      
      // Block Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      
      // Block F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      
      // Block Ctrl+S (Save Page)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      
      // Block Ctrl+Shift+S (Save As)
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      
      // Block Ctrl+P (Print - can reveal source)
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Block right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Block text selection on sensitive elements
    const handleSelectStart = (e) => {
      if (e.target.closest('pre, code, script')) {
        e.preventDefault();
        return false;
      }
    };

    // Block drag events that could be used to extract content
    const handleDragStart = (e) => {
      if (e.target.closest('pre, code, script, img')) {
        e.preventDefault();
        return false;
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('selectstart', handleSelectStart, true);
    document.addEventListener('dragstart', handleDragStart, true);

    // Disable copy on code elements
    const handleCopy = (e) => {
      if (e.target.closest('pre, code, script')) {
        e.preventDefault();
        return false;
      }
    };
    document.addEventListener('copy', handleCopy, true);

    // Console warning disabled for compatibility

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('selectstart', handleSelectStart, true);
      document.removeEventListener('dragstart', handleDragStart, true);
      document.removeEventListener('copy', handleCopy, true);
    };
  }, []);

  return null;
}