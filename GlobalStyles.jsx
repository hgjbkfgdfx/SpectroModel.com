import React from "react";

export default function GlobalStyles() {
  return (
    <style>{`
      /* ========================================
         SPECTROMODEL GLOBAL STYLES v3.0
         Cross-browser, Cross-device, Rollout-ready
         ======================================== */
      
      /* Base responsive typography - all browsers */
      html {
        font-size: 16px;
        -webkit-text-size-adjust: 100%;
        -moz-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
        text-size-adjust: 100%;
        scroll-behavior: smooth;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      /* Prevent horizontal overflow on all screens */
      body, #root {
        overflow-x: hidden;
        max-width: 100vw;
        min-height: 100vh;
        min-height: 100dvh; /* Dynamic viewport height for mobile */
        min-height: -webkit-fill-available;
      }
      
      /* Safe area insets for notched devices (iPhone X+, etc) */
      .safe-area-pt { padding-top: env(safe-area-inset-top, 0); }
      .safe-area-pb { padding-bottom: env(safe-area-inset-bottom, 0); }
      .safe-area-pl { padding-left: env(safe-area-inset-left, 0); }
      .safe-area-pr { padding-right: env(safe-area-inset-right, 0); }
      .safe-area-inset { 
        padding: env(safe-area-inset-top, 0) env(safe-area-inset-right, 0) env(safe-area-inset-bottom, 0) env(safe-area-inset-left, 0);
      }
      
      /* Prevent text overflow - Cross browser */
      h1, h2, h3, h4, h5, h6, p, span, div, label, a, button {
        word-wrap: break-word;
        overflow-wrap: break-word;
        word-break: break-word;
        -webkit-hyphens: auto;
        -moz-hyphens: auto;
        -ms-hyphens: auto;
        hyphens: auto;
      }
      
      /* CRITICAL: Force horizontal text - NEVER vertical on any device */
      * {
        writing-mode: horizontal-tb !important;
        -webkit-writing-mode: horizontal-tb !important;
        -ms-writing-mode: lr-tb !important;
        text-orientation: mixed !important;
        -webkit-text-orientation: mixed !important;
      }
      
      /* Responsive text that scales properly */
      .text-responsive {
        font-size: clamp(0.75rem, 2vw, 1rem);
      }
      
      /* Card content must fit */
      .card-content-fit {
        min-width: 0;
        max-width: 100%;
      }
      
      /* Truncate text with ellipsis - Cross browser */
      .text-truncate-safe {
        white-space: nowrap;
        overflow: hidden;
        -o-text-overflow: ellipsis;
        text-overflow: ellipsis;
        max-width: 100%;
        display: block;
      }
      
      /* Flex items that don't overflow */
      .flex-item-safe {
        min-width: 0;
        -webkit-flex-shrink: 1;
        -ms-flex-negative: 1;
        flex-shrink: 1;
      }
      
      /* ========================================
         MOBILE STYLES (< 640px)
         ======================================== */
      @media (max-width: 640px) {
        button, .btn {
          min-height: 44px;
          min-width: 44px;
          -ms-touch-action: manipulation;
          touch-action: manipulation;
        }
        
        /* Smaller text on mobile */
        .mobile-text-xs { font-size: 0.65rem !important; }
        .mobile-text-sm { font-size: 0.75rem !important; }
        
        /* Mobile padding adjustments */
        .mobile-p-2 { padding: 0.5rem !important; }
        .mobile-p-3 { padding: 0.75rem !important; }
        
        /* Hide on mobile */
        .mobile-hidden { display: none !important; }
        
        /* Stack on mobile */
        .mobile-stack { 
          -webkit-flex-direction: column !important; 
          -ms-flex-direction: column !important;
          flex-direction: column !important; 
        }
        
        /* Full width on mobile */
        .mobile-full { width: 100% !important; }
        
        /* Prevent text overflow on mobile */
        .mobile-truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      
      /* ========================================
         TABLET STYLES (641px - 1024px)
         ======================================== */
      @media (min-width: 641px) and (max-width: 1024px) {
        .tablet-text-sm { font-size: 0.875rem !important; }
        .tablet-hidden { display: none !important; }
        
        /* Ensure no vertical text on tablet */
        .tablet-horizontal {
          writing-mode: horizontal-tb !important;
        }
      }
      
      /* ========================================
         DESKTOP STYLES (> 1024px)
         ======================================== */
      @media (min-width: 1025px) {
        .desktop-only { display: block !important; }
        .mobile-only { display: none !important; }
      }
      
      /* ========================================
         ORIENTATION HANDLING
         ======================================== */
      /* Landscape phone - reduce vertical space */
      @media (orientation: landscape) and (max-height: 500px) {
        .landscape-compact {
          padding-top: 0.5rem !important;
          padding-bottom: 0.5rem !important;
        }
        
        .landscape-hidden { display: none !important; }
        
        /* Prevent layout shift on rotation */
        body {
          overflow-y: auto;
        }
      }
      
      /* Portrait mode adjustments */
      @media (orientation: portrait) {
        .portrait-stack {
          -webkit-flex-direction: column !important;
          -ms-flex-direction: column !important;
          flex-direction: column !important;
        }
      }
      
      /* ========================================
         TOUCH DEVICE HANDLING
         ======================================== */
      @media (hover: none) and (pointer: coarse) {
        .touch-target {
          min-height: 44px;
          min-width: 44px;
        }
        
        /* Disable hover effects on touch devices */
        .no-hover-on-touch:hover {
          background-color: inherit !important;
        }
        
        /* Improve tap responsiveness */
        button, a, [role="button"] {
          -webkit-tap-highlight-color: rgba(0,0,0,0.1);
        }
      }
      
      /* Particles animation */
      .particle {
        position: absolute;
        bottom: -10px;
        border-radius: 50%;
        animation: float-up var(--duration, 15s) ease-in-out infinite;
        animation-delay: var(--delay, 0s);
        opacity: 0.6;
      }
      
      @keyframes float-up {
        0% { transform: translateY(100vh) scale(0); opacity: 0; }
        10% { opacity: 0.6; }
        90% { opacity: 0.6; }
        100% { transform: translateY(-100vh) scale(1); opacity: 0; }
      }
      
      /* Glitch text effect */
      .glitch-text {
        position: relative;
      }
      
      /* Prevent layout shift from scrollbars */
      html {
        scrollbar-gutter: stable;
      }
      
      /* Custom scrollbar */
      ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      
      ::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.2);
      }
      
      ::-webkit-scrollbar-thumb {
        background: rgba(139, 92, 246, 0.5);
        border-radius: 3px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(139, 92, 246, 0.7);
      }
      
      /* ========================================
         INPUT & FORM FIXES - ALL BROWSERS
         ======================================== */
      /* Prevents iOS zoom on focus */
      input, select, textarea {
        font-size: 16px !important;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
      }
      
      @media (min-width: 641px) {
        input, select, textarea {
          font-size: inherit !important;
        }
      }
      
      /* Fix for IE/Edge select arrows */
      select::-ms-expand {
        display: none;
      }
      
      /* ========================================
         RESPONSIVE CONTAINERS
         ======================================== */
      .card-responsive {
        width: 100%;
        min-width: 0;
        max-width: 100%;
      }
      
      .grid-responsive {
        display: -ms-grid;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
        gap: 1rem;
      }
      
      /* Container with safe max-width */
      .container-safe {
        width: 100%;
        max-width: 100%;
        padding-left: max(1rem, env(safe-area-inset-left));
        padding-right: max(1rem, env(safe-area-inset-right));
      }
      
      @media (min-width: 640px) {
        .container-safe {
          padding-left: 1.5rem;
          padding-right: 1.5rem;
        }
      }
      
      /* ========================================
         ANIMATIONS
         ======================================== */
      @keyframes skeleton-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      .skeleton {
        -webkit-animation: skeleton-pulse 2s ease-in-out infinite;
        animation: skeleton-pulse 2s ease-in-out infinite;
      }
      
      /* ========================================
         BUTTON FIXES
         ======================================== */
      button span, .btn span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .badge-responsive {
        font-size: 0.6rem;
        padding: 0.125rem 0.375rem;
        white-space: nowrap;
        display: inline-block;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      @media (min-width: 640px) {
        .badge-responsive {
          font-size: 0.7rem;
          padding: 0.25rem 0.5rem;
        }
      }
      
      /* ========================================
         SCROLL & SELECTION FIXES
         ======================================== */
      /* iOS momentum scrolling */
      .scroll-touch {
        -webkit-overflow-scrolling: touch;
        overflow-y: auto;
        overscroll-behavior: contain;
      }
      
      /* Prevent text selection on touch */
      .no-select {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      /* Fix flexbox text overflow */
      .flex-text-fix {
        min-width: 0;
        -webkit-flex: 1 1 0%;
        -ms-flex: 1 1 0%;
        flex: 1 1 0%;
      }
      
      /* ========================================
         BROWSER-SPECIFIC FIXES
         ======================================== */
      /* Firefox */
      @-moz-document url-prefix() {
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(139, 92, 246, 0.5) rgba(0, 0, 0, 0.2);
        }
      }
      
      /* Safari fixes */
      @supports (-webkit-touch-callout: none) {
        body {
          /* Fix for Safari 100vh issue */
          min-height: -webkit-fill-available;
        }
      }
      
      /* ========================================
         PRINT STYLES
         ======================================== */
      @media print {
        * {
          writing-mode: horizontal-tb !important;
          color: black !important;
          background: white !important;
        }
        .no-print { display: none !important; }
      }
      
      /* ========================================
         REDUCED MOTION (Accessibility)
         ======================================== */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          -webkit-animation-duration: 0.01ms !important;
          animation-duration: 0.01ms !important;
          -webkit-animation-iteration-count: 1 !important;
          animation-iteration-count: 1 !important;
          -webkit-transition-duration: 0.01ms !important;
          -o-transition-duration: 0.01ms !important;
          transition-duration: 0.01ms !important;
        }
      }
      
      /* ========================================
         SECURITY INDICATOR STYLES
         ======================================== */
      .security-badge {
        position: fixed;
        bottom: 10px;
        right: 10px;
        z-index: 9999;
        pointer-events: none;
        opacity: 0.3;
      }
    `}</style>
  );
}