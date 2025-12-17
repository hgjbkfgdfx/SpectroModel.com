/**
 * SPECTROMODEL SUBSCRIPTION & ACCESS SYSTEM
 * Implements tiered access logic based on fair market research and ethical pricing.
 * Identity verification required before any payments.
 */

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PRO: 'pro',
  PREMIUM: 'premium'
};

// Market-based ethical pricing (yearly = monthly x 12)
export const PRICING = {
  PRO: {
    monthly: 14.99,
    yearly: 14.99 * 12, // $179.88
    label: "Pro Creator",
    duration_days: 30
  },
  PREMIUM: {
    monthly: 29.99,
    yearly: 29.99 * 12, // $359.88
    label: "Studio Master",
    duration_days: 30
  }
};

// Check if subscription is expired
export const isSubscriptionExpired = (user) => {
  if (!user) return true;
  if (user.subscription_tier === SUBSCRIPTION_TIERS.FREE) return false;
  
  if (!user.subscription_end_date) return true;
  
  const endDate = new Date(user.subscription_end_date);
  const now = new Date();
  
  return now > endDate;
};

// Get days remaining in subscription
export const getDaysRemaining = (user) => {
  if (!user || !user.subscription_end_date) return 0;
  if (user.subscription_tier === SUBSCRIPTION_TIERS.FREE) return Infinity;
  
  const endDate = new Date(user.subscription_end_date);
  const now = new Date();
  
  if (now > endDate) return 0;
  
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Calculate subscription end date from payment confirmation
export const calculateSubscriptionEndDate = (isYearly = false) => {
  const now = new Date();
  const endDate = new Date(now);
  
  if (isYearly) {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setDate(endDate.getDate() + 30);
  }
  
  // Set to midnight
  endDate.setHours(0, 0, 0, 0);
  
  return endDate.toISOString();
};

// Feature Usage Limits per tier (monthly) - PREMIUM RELEASE: UNLIMITED ACCESS
export const LIMITS = {
  [SUBSCRIPTION_TIERS.FREE]: {
    analysis_uploads: 999,
    time_series: 999,
    advanced_analytics: 999,
    market_fit: 999,
    mastering: 999,
    mixing: 999,
    radio_edits: 999,
    sibilance: 999,
    rhythm_analysis: 999,
    sheet_music: 999,
    dsp_analysis: 999,
    lyrics_analyzer: 999,
    genre_predictor: 999,
    track_query: 999,
    emoji_lyrics: 999,
    audio_converter: 999,
    video_generation: 999,
    period: 'monthly'
  },
  [SUBSCRIPTION_TIERS.PRO]: {
    analysis_uploads: 999,
    time_series: 999,
    advanced_analytics: 999,
    market_fit: 999,
    mastering: 999,
    mixing: 999,
    radio_edits: 999,
    sibilance: 999,
    rhythm_analysis: 999,
    sheet_music: 999,
    dsp_analysis: 999,
    lyrics_analyzer: 999,
    genre_predictor: 999,
    track_query: 999,
    emoji_lyrics: 999,
    audio_converter: 999,
    video_generation: 999,
    period: 'monthly'
  },
  [SUBSCRIPTION_TIERS.PREMIUM]: {
    analysis_uploads: 999,
    time_series: 999,
    advanced_analytics: 999,
    market_fit: 999,
    mastering: 999,
    mixing: 999,
    radio_edits: 999,
    sibilance: 999,
    rhythm_analysis: 999,
    sheet_music: 999,
    dsp_analysis: 999,
    lyrics_analyzer: 999,
    genre_predictor: 999,
    track_query: 999,
    emoji_lyrics: 999,
    audio_converter: 999,
    video_generation: 999,
    period: 'monthly'
  }
};

// Feature Access Gates - PREMIUM RELEASE: ALL FEATURES UNLOCKED
export const FEATURE_ACCESS = {
  // ===== ALL TIERS ACCESS (Premium Release - Full Unlock) =====
  LANDING: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  HOME: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  DASHBOARD: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  COMPANY_COPYRIGHT: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  COPYRIGHT_PROTECTION: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  MUSIC_EDUCATION: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  VERSION_HISTORY: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  ACCESSIBILITY: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  SETTINGS: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  TERMS: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  FAQ: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  SUPPORT: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  AFRICAN_RESEARCH: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  TRENDS: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  ADVANCEMENTS: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  SYSTEM_CHECK: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  HAPTIC_FEEDBACK: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  LEGAL_AUDIT: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  TRADEMARKS: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  PATENTS: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  AUDIT_LOG: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  
  // ===== ANALYSIS TOOLS (Unlocked) =====
  TRACK_ANALYSIS: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  DSP_ALGORITHMS: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  LYRICS_RETRIEVAL: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  LYRICS_ANALYZER: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  EMOJI_LYRICS: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  GENRE_PREDICTOR: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  TRACK_QUERY: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  RHYTHM_ANALYSIS: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  SHEET_MUSIC: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  
  // ===== BUSINESS TOOLS (Unlocked) =====
  MONETIZATION: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  MARKET_RESEARCH: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  INDUSTRY_INSIGHTS: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  DISTRIBUTION: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  MARKET_FIT: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  TIME_SERIES: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  
  // ===== CREATIVE TOOLS (Unlocked) =====
  ADVANCED_ANALYTICS: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  ARTIST_VAULT: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  VIDEO_STUDIO: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  VIDEO_GENERATOR: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  SPECTROVERSE: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  PRORES_4K: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  STUDIO_CORRECTOR: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  SIBILANCE_CORRECTOR: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  MASTERING: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  ADVANCED_MIXING: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  AI_VOCAL_ISOLATION: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  GENRE_MASTERING: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  VOCAL_ISOLATION: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  STUDIO_TOOLS: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  
  // ===== COLLABORATION & PROJECTS (Unlocked) =====
  RECENT_ANALYSES: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  PROJECTS: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  
  // ===== UI CUSTOMIZATION (Unlocked) =====
  THEME_CUSTOMIZER: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  PARTICLE_SELECTOR: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  GOLD_THEME: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  BLACK_THEME: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  GOLD_PARTICLES: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  BLACK_PARTICLES: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  
  // ===== UTILITIES (Unlocked) =====
  AUDIO_CONVERTER: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  DASHBOARD_ACTIONS: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  AI_CHATBOT: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  
  // ===== ADVANCED FEATURES (Unlocked) =====
  EMOTIONAL_ANALYSIS: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  BUSINESS_INSIGHTS: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  ML_TRAINING: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  DATA_LEARNING: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  SCENE_GENERATOR: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  AVATAR_CUSTOMIZER: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  PHYSICS_ENGINE: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  MARKETING_ANALYSIS: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  COGNITIVE_ANALYSIS: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM],
  CREATIVE_ANALYSIS: [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM]
};

// Payment verification status check
export const isPaymentVerified = (user) => {
  if (!user) return false;
  return user.payment_verified === true && user.identity_verified === true;
};

// Check if user can access paid features
export const canAccessPaidFeatures = (user, requiredTier) => {
  if (!user) return false;
  
  const userTier = user.subscription_tier || SUBSCRIPTION_TIERS.FREE;
  
  // Free tier doesn't need payment verification
  if (requiredTier === SUBSCRIPTION_TIERS.FREE) return true;
  
  // Check if subscription is expired
  if (isSubscriptionExpired(user)) return false;
  
  // Check if user has required tier AND payment is verified
  if (requiredTier === SUBSCRIPTION_TIERS.PRO) {
    return (userTier === SUBSCRIPTION_TIERS.PRO || userTier === SUBSCRIPTION_TIERS.PREMIUM) && 
           isPaymentVerified(user);
  }
  
  if (requiredTier === SUBSCRIPTION_TIERS.PREMIUM) {
    return userTier === SUBSCRIPTION_TIERS.PREMIUM && isPaymentVerified(user);
  }
  
  return false;
};

// Check if usage should reset (30-day cycle from subscription start)
export const shouldResetUsage = (user) => {
  if (!user) return false;
  if (!user.usage_reset_date) return true; // No reset date set, needs reset
  
  const resetDate = new Date(user.usage_reset_date);
  const now = new Date();
  
  return now >= resetDate;
};

// Calculate next usage reset date (30 days from subscription start)
export const calculateNextResetDate = (user) => {
  const now = new Date();
  const resetDate = new Date(now);
  resetDate.setDate(resetDate.getDate() + 30);
  resetDate.setHours(0, 0, 0, 0); // Midnight
  return resetDate.toISOString();
};

// Get current usage for a feature
export const getFeatureUsage = (user, limitKey) => {
  if (!user) return 0;
  const usage = user.monthly_usage || {};
  return usage[limitKey] || 0;
};

// Check if user is on yearly plan
export const isYearlyPlan = (user) => {
  if (!user) return false;
  return user.subscription_billing_cycle === 'yearly';
};

// Check if a specific feature is locked due to usage limit
export const isFeatureUsageLocked = (user, limitKey) => {
  if (!user) return true;
  
  const userTier = user.subscription_tier || SUBSCRIPTION_TIERS.FREE;
  
  // Check subscription expiration first
  if (userTier !== SUBSCRIPTION_TIERS.FREE && isSubscriptionExpired(user)) {
    return true;
  }
  
  // Check payment verification for paid tiers
  if (userTier !== SUBSCRIPTION_TIERS.FREE && !isPaymentVerified(user)) {
    return true;
  }
  
  const limits = LIMITS[userTier];
  if (!limits || limits[limitKey] === undefined) return false;
  if (limits[limitKey] === 0) return true; // No access for this tier
  
  const usage = user.monthly_usage || {};
  const currentUsage = usage[limitKey] || 0;
  
  // Check if limit reached
  const limitReached = currentUsage >= limits[limitKey];
  
  if (!limitReached) return false;
  
  // YEARLY PLANS: Auto-reset every 30 days without extra payment
  if (isYearlyPlan(user)) {
    // Check if usage should reset (30-day cycle)
    if (shouldResetUsage(user)) {
      return false; // Will reset, not locked
    }
  }
  
  // MONTHLY PLANS: Stay locked until additional payment received
  // Limit reached and no auto-reset for monthly plans
  return true;
};

// Get remaining uploads for a feature
export const getRemainingUploads = (user, limitKey) => {
  if (!user) return 0;
  
  const userTier = user.subscription_tier || SUBSCRIPTION_TIERS.FREE;
  
  if (userTier !== SUBSCRIPTION_TIERS.FREE && isSubscriptionExpired(user)) {
    return 0;
  }
  
  if (userTier !== SUBSCRIPTION_TIERS.FREE && !isPaymentVerified(user)) {
    return 0;
  }
  
  const limits = LIMITS[userTier];
  if (!limits || limits[limitKey] === undefined || limits[limitKey] === 0) return 0;
  
  const usage = user.monthly_usage || {};
  let currentUsage = usage[limitKey] || 0;
  
  // For yearly plans, if reset is due, usage would be 0
  if (isYearlyPlan(user) && shouldResetUsage(user)) {
    currentUsage = 0;
  }
  
  return Math.max(0, limits[limitKey] - currentUsage);
};

// Check if monthly plan needs additional payment to unlock
export const needsAdditionalPayment = (user, limitKey) => {
  if (!user) return false;
  
  const userTier = user.subscription_tier || SUBSCRIPTION_TIERS.FREE;
  if (userTier === SUBSCRIPTION_TIERS.FREE) return false;
  
  // Only monthly plans need additional payment when limit reached
  if (isYearlyPlan(user)) return false;
  
  const limits = LIMITS[userTier];
  if (!limits || limits[limitKey] === undefined || limits[limitKey] === 0) return false;
  
  const usage = user.monthly_usage || {};
  const currentUsage = usage[limitKey] || 0;
  
  return currentUsage >= limits[limitKey];
};

// Get days until usage resets
export const getDaysUntilReset = (user) => {
  if (!user || !user.usage_reset_date) return 0;
  
  const resetDate = new Date(user.usage_reset_date);
  const now = new Date();
  
  if (now >= resetDate) return 0;
  
  const diffTime = resetDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Pages that are under construction - PREMIUM RELEASE: ALL UNLOCKED
export const UNDER_CONSTRUCTION = [];

// Check if user has access to a feature
export const checkFeatureAccess = (userTier, featureKey) => {
  const tier = userTier || SUBSCRIPTION_TIERS.FREE;
  const allowedTiers = FEATURE_ACCESS[featureKey];
  
  if (!allowedTiers) return true; // If not defined, allow access
  if (allowedTiers.length === 0) return false; // Empty array = blocked for all
  return allowedTiers.includes(tier);
};

// Helper - check if feature is locked for user
export const isFeatureLocked = (userTier, featureKey) => {
  return !checkFeatureAccess(userTier, featureKey);
};

// Check if feature is under construction
export const isUnderConstruction = (featureKey) => {
  return UNDER_CONSTRUCTION.includes(featureKey);
};

// Check usage limit
export const checkUsageLimit = (userTier, limitKey, currentUsageCount) => {
  const limits = LIMITS[userTier || 'free'];
  if (!limits) return false;
  
  const limit = limits[limitKey];
  if (limit === undefined) return true; 
  if (limit === 0) return false; // No access
  
  return currentUsageCount < limit;
};

// Get remaining usage
export const getRemainingUsage = (userTier, limitKey, currentUsageCount) => {
  const limits = LIMITS[userTier || 'free'];
  if (!limits || limits[limitKey] === undefined || limits[limitKey] === 0) return 0;
  return Math.max(0, limits[limitKey] - (currentUsageCount || 0));
};

// Get limit for a feature
export const getFeatureLimit = (userTier, limitKey) => {
  const limits = LIMITS[userTier || 'free'];
  if (!limits || limits[limitKey] === undefined) return 0;
  return limits[limitKey];
};

export const getLimitLabel = (userTier, limitKey) => {
  const limits = LIMITS[userTier || 'free'];
  if (!limits || limits[limitKey] === undefined) return "No Access";
  if (limits[limitKey] === 0) return "No Access";
  return `${limits[limitKey]} / ${limits.period}`;
};

// Premium-only theme colors
export const PREMIUM_THEMES = ['gold', 'black'];
export const PREMIUM_PARTICLES = ['gold', 'black'];

// Check if theme is premium-only
export const isPremiumTheme = (themeName) => {
  return PREMIUM_THEMES.includes(themeName?.toLowerCase());
};

// Check if particle color is premium-only
export const isPremiumParticle = (particleName) => {
  return PREMIUM_PARTICLES.includes(particleName?.toLowerCase());
};

// Get allowed themes for tier - PREMIUM RELEASE: ALL THEMES UNLOCKED
export const getAllowedThemes = (userTier) => {
  return ['purple', 'cyan', 'green', 'red', 'blue', 'pink', 'orange', 'gold', 'black'];
};

// Get allowed particles for tier - PREMIUM RELEASE: ALL PARTICLES UNLOCKED
export const getAllowedParticles = (userTier) => {
  return ['purple', 'cyan', 'green', 'red', 'blue', 'pink', 'orange', 'gold', 'black'];
};