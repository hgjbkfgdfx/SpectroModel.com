/**
 * CLICK RELIABILITY FIX
 * Ensures all clicks work on first attempt
 * Prevents double-click requirements
 * Fixes z-index and event propagation issues
 */

import { useEffect } from 'react';

export function useReliableClicks() {
  useEffect(() => {
    const makeClicksReliable = () => {
      document.querySelectorAll('button, [role="button"], a').forEach(element => {
        element.style.pointerEvents = 'auto';
        element.style.userSelect = 'none';
        element.style.webkitTapHighlightColor = 'transparent';
        
        const hasClick = element.onclick || element.getAttribute('onclick');
        if (!hasClick && !element.closest('[data-reliable-click]')) {
          element.setAttribute('data-reliable-click', 'true');
          
          element.addEventListener('mousedown', (e) => {
            e.stopPropagation();
          }, { passive: true });
          
          element.addEventListener('touchstart', (e) => {
            e.stopPropagation();
          }, { passive: true });
        }
      });
    };

    makeClicksReliable();
    
    const observer = new MutationObserver(makeClicksReliable);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, []);
}

export function fixZIndexIssues() {
  if (typeof document === 'undefined') return;
  
  const style = document.createElement('style');
  style.textContent = `
    button, [role="button"] {
      position: relative;
      pointer-events: auto !important;
      touch-action: manipulation;
    }
    
    button:active, [role="button"]:active {
      transform: scale(0.98);
    }
    
    .vibrant-nav-button {
      z-index: 9999 !important;
      position: relative;
    }
    
    .z-base {
      z-index: 10 !important;
      position: relative;
    }
    
    .z-cards {
      z-index: 1 !important;
      position: relative;
    }
  `;
  
  if (!document.querySelector('#click-reliability-fix')) {
    style.id = 'click-reliability-fix';
    document.head.appendChild(style);
  }
}

if (typeof window !== 'undefined') {
  fixZIndexIssues();
}

export default { useReliableClicks, fixZIndexIssues };