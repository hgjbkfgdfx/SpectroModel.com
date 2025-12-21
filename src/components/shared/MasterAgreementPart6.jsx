
import React from 'react';
import { Article } from './MasterAgreementPart1';

export const MasterAgreementPart6 = () => (
  <>
    {/* Page 6: Sections 121 - 144 */}
    {[...Array(24)].map((_, i) => (
      <div key={i} className="mb-12 border-l-8 border-black pl-6 py-2">
        <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION {['CXXI', 'CXXII', 'CXXIII', 'CXXIV', 'CXXV', 'CXXVI', 'CXXVII', 'CXXVIII', 'CXXIX', 'CXXX', 'CXXXI', 'CXXXII', 'CXXXIII', 'CXXXIV', 'CXXXV', 'CXXXVI', 'CXXXVII', 'CXXXVIII', 'CXXXIX', 'CXL', 'CXLI', 'CXLII', 'CXLIII', 'CXLIV'][i]}: {['CONTENT MODERATION STANDARDS', 'HATE SPEECH DEFINITIONS', 'HARASSMENT POLICIES', 'NUDITY & OBSCENITY', 'VIOLENCE & GORE POLICY', 'SELF-HARM PREVENTION', 'MISINFORMATION POLICY', 'IMPERSONATION RULES', 'SPAM & BOTTING', 'API ABUSE PREVENTION', 'SCRAPING PROHIBITIONS', 'INTELLECTUAL PROPERTY THEFT', 'DMCA TAKEDOWN PROCEDURES', 'COUNTER-NOTICE PROTOCOLS', 'REPEAT INFRINGER POLICY', 'TRADEMARK DISPUTES', 'PATENT INFRINGEMENT', 'TRADE SECRET THEFT', 'OPEN SOURCE LICENSES', 'THIRD-PARTY LIBRARIES', 'ATTRIBUTION REQUIREMENTS', 'SOFTWARE DEPENDENCIES', 'SYSTEM REQUIREMENTS', 'BROWSER COMPATIBILITY'][i]}</h2>
        <Article title={`${121 + i}.1 POLICY ENFORCEMENT`}>
          <p>The Company enforces a zero-tolerance policy regarding violations of this section. Automated systems scan for non-compliance. Users found in violation face immediate suspension.</p>
        </Article>
        <Article title={`${121 + i}.2 AI MONITORING`}>
          <p>The "AI Threat Assessment" system actively monitors this domain. The "AI Learns From My Data" protocol is utilized to detect and prevent future violations.</p>
        </Article>
      </div>
    ))}
  </>
);
