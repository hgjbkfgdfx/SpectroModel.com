/**
 * CONTENT FILTER SYSTEM - COMPREHENSIVE MODERATION
 * Blocks profanity, hate speech, threats, violence, and prohibited content
 * Allows: music, education, research, business, finance, feedback
 */

// Comprehensive prohibited content patterns
const PROHIBITED_PATTERNS = {
  // Profanity and slurs (partial list - expanded in production)
  profanity: [
    /\bf+u+c+k+/gi, /\bs+h+[i1]+t+/gi, /\ba+s+s+h+o+l+e/gi, /\bb+[i1]+t+c+h/gi,
    /\bd+a+m+n/gi, /\bc+u+n+t/gi, /\bd+[i1]+c+k/gi, /\bp+[i1]+s+s/gi,
    /\bw+h+o+r+e/gi, /\bs+l+u+t/gi, /\bb+a+s+t+a+r+d/gi
  ],
  
  // Racial/ethnic slurs and hate speech
  hateSlurs: [
    /\bn+[i1]+g+g+/gi, /\bk+[i1]+k+e/gi, /\bs+p+[i1]+c+/gi, /\bc+h+[i1]+n+k/gi,
    /\bg+o+o+k/gi, /\bw+e+t+b+a+c+k/gi, /\bf+a+g+/gi, /\bd+y+k+e/gi,
    /\br+e+t+a+r+d/gi, /\bc+r+[i1]+p+p+l+e/gi, /white\s*supremac/gi,
    /nazi/gi, /aryan\s*nation/gi, /kkk/gi, /ku\s*klux/gi
  ],
  
  // Violence and threats
  violence: [
    /\bk+[i1]+l+l+/gi, /\bm+u+r+d+e+r/gi, /\bs+h+o+o+t/gi, /\bs+t+a+b/gi,
    /\bb+e+a+t.*up/gi, /\ba+t+t+a+c+k/gi, /\bh+u+r+t/gi, /\bd+e+a+t+h.*threat/gi,
    /\bb+o+m+b/gi, /\be+x+p+l+o+[ds]+/gi, /\bt+e+r+r+o+r/gi, /\bw+e+a+p+o+n/gi,
    /\bg+u+n/gi, /\bk+n+[i1]+f+e/gi, /\bp+o+[i1]+s+o+n/gi, /\ba+r+s+o+n/gi,
    /mass\s*shoot/gi, /school\s*shoot/gi, /suicide\s*bomb/gi
  ],
  
  // Threats to people/groups
  threats: [
    /i('ll|.*will).*kill/gi, /going\s*to\s*hurt/gi, /threat/gi,
    /i('ll|.*will).*shoot/gi, /watch\s*your\s*back/gi, /you('re|.*are)\s*dead/gi,
    /harm\s*(you|your|them)/gi, /destroy\s*(you|your)/gi
  ],
  
  // Stalking and harassment
  stalking: [
    /\bstalk/gi, /\bh+a+r+a+s+s/gi, /where.*live/gi, /find.*address/gi,
    /track.*location/gi, /following\s*you/gi, /watching\s*you/gi,
    /know\s*where/gi, /come\s*to\s*your/gi
  ],
  
  // Child safety (CRITICAL)
  childSafety: [
    /child.*porn/gi, /cp\b/gi, /pedo/gi, /minor.*sex/gi, /underage/gi,
    /child.*abuse/gi, /child.*exploit/gi, /kids.*naked/gi, /loli/gi,
    /child.*nude/gi, /young.*sex/gi
  ],
  
  // Sexual content (perversion)
  sexualContent: [
    /\br+a+p+e/gi, /sexual\s*assault/gi, /molest/gi, /incest/gi,
    /bestiality/gi, /necrophilia/gi, /snuff/gi
  ],
  
  // National security threats
  nationalSecurity: [
    /government\s*secret/gi, /state\s*secret/gi, /classified\s*info/gi,
    /leak.*intelligence/gi, /spy\s*on\s*government/gi, /overthrow/gi,
    /coup\s*d'etat/gi, /assassin/gi, /political\s*secret/gi
  ],
  
  // Law enforcement threats
  lawEnforcement: [
    /kill.*cop/gi, /shoot.*police/gi, /attack.*officer/gi,
    /bomb.*station/gi, /murder.*fed/gi, /hurt.*agent/gi
  ],
  
  // Country/international threats
  countryThreats: [
    /destroy.*country/gi, /nuke/gi, /attack.*nation/gi,
    /invasion\s*plan/gi, /war\s*on/gi, /genocide/gi
  ],
  
  // Hacking/security bypass (existing)
  security: [
    /hack/gi, /exploit/gi, /malicious/gi, /inject/gi, /xss/gi,
    /bypass.*security/gi, /admin.*access/gi, /sql\s*inject/gi,
    /brute\s*force/gi, /ddos/gi, /phish/gi
  ]
};

// Allowed topics
const ALLOWED_TOPICS = [
  'music', 'audio', 'track', 'song', 'album', 'artist', 'producer', 'beat',
  'lyrics', 'melody', 'rhythm', 'tempo', 'genre', 'streaming', 'playlist',
  'education', 'learn', 'tutorial', 'course', 'lesson', 'study', 'research',
  'analysis', 'data', 'statistics', 'chart', 'graph', 'metric', 'score',
  'business', 'finance', 'money', 'income', 'revenue', 'royalty', 'payment',
  'label', 'management', 'contract', 'deal', 'licensing', 'distribution',
  'marketing', 'promotion', 'branding', 'social media', 'engagement',
  'feedback', 'review', 'rating', 'comment', 'question', 'answer', 'forum',
  'collaboration', 'project', 'team', 'share', 'export', 'import',
  'stock', 'investment', 'trade', 'economics', 'financial literacy',
  'talent', 'scout', 'signing', 'development', 'career', 'growth'
];

/**
 * Check if content contains prohibited patterns
 * @param {string} content - Text to check
 * @returns {object} { isProhibited: boolean, category: string|null, message: string }
 */
export function checkContent(content) {
  if (!content || typeof content !== 'string') {
    return { isProhibited: false, category: null, message: '' };
  }

  const text = content.toLowerCase();

  // Check all prohibited categories
  for (const [category, patterns] of Object.entries(PROHIBITED_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        return {
          isProhibited: true,
          category,
          message: getBlockMessage(category)
        };
      }
    }
  }

  return { isProhibited: false, category: null, message: '' };
}

/**
 * Get appropriate block message for category
 */
function getBlockMessage(category) {
  const messages = {
    profanity: "I'm unable to help you with that. Please keep the conversation respectful.",
    hateSlurs: "I'm unable to help you with that. Hate speech and discrimination are not allowed.",
    violence: "I'm unable to help you with that. Violence and threats are prohibited.",
    threats: "I'm unable to help you with that. Threatening language is not permitted.",
    stalking: "I'm unable to help you with that. Harassment and stalking content is blocked.",
    childSafety: "I'm unable to help you with that. This content is strictly prohibited and may be reported.",
    sexualContent: "I'm unable to help you with that. This type of content is not allowed.",
    nationalSecurity: "I'm unable to help you with that. This topic is restricted.",
    lawEnforcement: "I'm unable to help you with that. Threats against law enforcement are prohibited.",
    countryThreats: "I'm unable to help you with that. Threatening content is not allowed.",
    security: "I'm unable to help you with that. Security-related exploits are blocked."
  };
  
  return messages[category] || "I'm unable to help you with that.";
}

/**
 * Sanitize content for safe display
 */
export function sanitizeContent(content) {
  if (!content) return '';
  
  // Remove any script tags or dangerous HTML
  let sanitized = content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*on\w+\s*=/gi, '<')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '');
  
  return sanitized;
}

/**
 * Check if topic is allowed
 */
export function isAllowedTopic(topic) {
  if (!topic) return true;
  const lowerTopic = topic.toLowerCase();
  return ALLOWED_TOPICS.some(allowed => lowerTopic.includes(allowed));
}

/**
 * Get safe response for AI assistants
 */
export function getSafeAIPrompt(userMessage) {
  const check = checkContent(userMessage);
  
  if (check.isProhibited) {
    return {
      blocked: true,
      response: check.message
    };
  }
  
  return {
    blocked: false,
    prompt: `You are a helpful AI assistant for SpectroModel, a music analytics platform.

STRICT RULES - You MUST follow these:
1. NEVER use profanity, slurs, or offensive language
2. NEVER discuss violence, threats, or harmful activities
3. NEVER provide information about hacking, exploits, or security bypasses
4. NEVER discuss illegal activities or help with anything harmful
5. NEVER engage with hate speech, discrimination, or prejudice
6. NEVER discuss content involving minors in harmful contexts
7. NEVER reveal government secrets, classified information, or political secrets
8. Keep political discussions to absolute minimum (only if directly asked, and stay neutral)
9. Keep religious discussions to absolute minimum (only if directly asked, and stay respectful)
10. If asked about restricted topics, respond: "I'm unable to help you with that."

ALLOWED TOPICS - You CAN help with:
- Music production, analysis, songwriting, composition
- Music business: labels, management, contracts, royalties, streaming
- Financial literacy: music stocks, investments, revenue, economics
- Education: tutorials, courses, learning resources
- Artist development: talent scouting, career growth, branding
- Collaboration: projects, teams, feedback, forums
- Technical help: using SpectroModel features

User message: ${userMessage}

Provide a helpful, friendly response within the allowed topics.`
  };
}

export default {
  checkContent,
  sanitizeContent,
  isAllowedTopic,
  getSafeAIPrompt,
  PROHIBITED_PATTERNS,
  ALLOWED_TOPICS
};