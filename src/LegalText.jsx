import React from 'react';
import { MasterAgreementFull } from './legal/MasterAgreementFull';

const CASE_INSENSITIVITY_CLAUSE = `
*** INTERPRETATION CLAUSE: CASE INSENSITIVITY & NOMENCLATURE ***
Typography of all sorts does not change the meaning of the terms and agreements. For the purposes of this Agreement and all associated legal documents, the terms "Creator(s)", "creator(s)", "Company", "company", "Owner(s)", "owner(s)", "Employee(s)", "employee(s)", "SpectroModel ENT", "SpectroModel", "spectromodel", "Company's Creator(s)", "company's creator(s)", "Admin", "Head of Leadership", and any other variation in capitalization, spacing, casing, or typographic variation SHALL BE INTERPRETED AS SYNONYMOUS. The intent, authority, and legal weight of the statement remain unchanged regardless of typographic variation. English language ambiguity, semantic multivalency, or philological arguments shall not be exploited to void, nullify, or circumvent these terms. The Creator(s) maintains absolute, non-negotiable authority over the interpretation of these definitions.
`;

const HEADER_INFO = (
  <div className="mb-8 border-b-8 border-black pb-8 text-center bg-white">
    <h1 className="text-5xl font-black text-black uppercase tracking-tighter mb-4 leading-tight" style={{ textShadow: 'none', WebkitFontSmoothing: 'antialiased' }}>Master Service Agreement</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono font-bold text-black border-t-4 border-black pt-4" style={{ textShadow: 'none', WebkitFontSmoothing: 'antialiased' }}>
      <p className="text-left">DOCUMENT ID: SP-LEGAL-2025-FULL-56PG</p>
      <p className="text-right">VERSION: 2.1.0-LTS</p>
      <p className="text-left">EFFECTIVE: NOVEMBER 25, 2025</p>
      <p className="text-right">COMPLIANCE: GDPR, CCPA, LGPD, PIPEDA, FTC, COPPA, GLBA, HIPAA</p>
    </div>
    <div className="mt-6 p-4 border-4 border-black bg-yellow-100 text-black font-black text-lg uppercase">
      © 2025 SpectroModel ENT. All Rights Reserved. COMPANY OWNS ALL COMPANY'S INTELLECTUAL PROPERTY.
    </div>
    <div className="mt-4 text-left text-xs font-bold text-red-600 uppercase">
      WARNING: READ CAREFULLY. THIS AGREEMENT CONTAINS BINDING ARBITRATION CLAUSES, WAIVERS OF CLASS ACTION RIGHTS, AND STRICT INTELLECTUAL PROPERTY ENFORCEMENT PROTOCOLS.
    </div>
  </div>
);

const Section = ({ title, children }) => (
  <section className="mb-12 border-l-8 border-black pl-6 py-2">
    <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block" style={{ textShadow: 'none', WebkitFontSmoothing: 'antialiased' }}>{title}</h2>
    <div className="space-y-6 text-black text-justify font-bold leading-relaxed text-sm" style={{ textShadow: 'none', WebkitFontSmoothing: 'antialiased' }}>
      {children}
    </div>
  </section>
);

const Article = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-xl font-black text-black mb-3 uppercase tracking-wide bg-black text-white inline-block px-2 py-1" style={{ textShadow: 'none', WebkitFontSmoothing: 'antialiased' }}>{title}</h3>
    <div className="text-black font-bold" style={{ textShadow: 'none', WebkitFontSmoothing: 'antialiased' }}>{children}</div>
  </div>
);

export const LegalTermsText = () => (
  <div className="space-y-12 text-black font-serif bg-white p-4 md:p-12 border-[12px] border-black shadow-2xl max-w-none mx-auto" style={{ textShadow: 'none', WebkitFontSmoothing: 'antialiased' }}>
    {HEADER_INFO}

    <div className="mb-12 p-8 border-8 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="text-4xl font-black text-black uppercase mb-6 border-b-8 border-black pb-4 tracking-tighter">✨ Release Notes & Updates</h3>
      <div className="space-y-6 text-black font-bold text-lg">
        <p className="text-2xl bg-yellow-200 inline-block px-4 py-2 border-4 border-black"><span className="font-black">Effective Date: November 25, 2025</span></p>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="border-4 border-black p-6 bg-purple-50">
            <p className="text-xl font-black mb-4 uppercase flex items-center gap-2">✨ New Features:</p>
            <ul className="list-disc pl-6 space-y-2 font-bold">
              <li>AI Track Query & Metadata Harvesting</li>
              <li>Zero-Iteration Static Removal</li>
              <li>Spectro Lyric Studio (Veo 2.0 Integration)</li>
              <li>Haptic Feedback & Remote Touch Protocols</li>
              <li>Advanced Marketing Analytics</li>
            </ul>
          </div>

          <div className="border-4 border-black p-6 bg-green-50">
            <p className="text-xl font-black mb-4 uppercase flex items-center gap-2">🛡️ Security Enhancements:</p>
            <ul className="list-disc pl-6 space-y-2 font-bold">
              <li>Military-Grade Security Active (AES-256)</li>
              <li>No-Interference Protocol (Patent Pending)</li>
              <li>Auto-Healing Monitors</li>
              <li>Anti-Bypass Security Active</li>
              <li>Government Site Blocking Protocol</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-100 border-4 border-black text-center font-mono text-sm uppercase">
          Full 56-Page Legal Corpus Digital Representation (Sections 0.1 - 239.2)
        </div>
      </div>
    </div>

    <div className="bg-yellow-50 border-4 border-black p-8 mb-12 font-mono text-sm font-bold text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <strong className="block mb-4 text-2xl underline">CRITICAL INTERPRETATION NOTICE:</strong>
      {CASE_INSENSITIVITY_CLAUSE}
    </div>

    <MasterAgreementFull />

    <div className="mt-12 p-8 border-t-8 border-black bg-slate-100 text-center">
       <p className="font-black text-xl uppercase text-black mb-2">END OF MASTER SERVICE AGREEMENT</p>
       <p className="text-sm font-bold text-black mb-4">* This provision implies continuous monitoring and automated enforcement protocols active on the User's account.</p>
       <div className="border-t-4 border-black pt-4 mt-4">
         <p className="font-mono text-xs text-gray-600 uppercase">PAGE 10 OF 10 - END OF DOCUMENT (SECTIONS 0.1 - 239.2)</p>
       </div>
       <p className="mt-4 font-black text-black">© 2025 SpectroModel ENT. All Rights Reserved.</p>
    </div>
  </div>
);

export const PrivacyPolicyText = () => (
  <div className="space-y-12 text-black font-serif bg-white p-4 md:p-12 border-[12px] border-black shadow-2xl mt-12 max-w-none mx-auto" style={{ textShadow: 'none', WebkitFontSmoothing: 'antialiased' }}>
    <div className="mb-8 border-b-8 border-black pb-8">
      <h1 className="text-5xl font-black text-black uppercase tracking-tighter mb-4">Global Privacy Policy</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono font-bold text-black">
        <p>DOCUMENT ID: SP-PRIVACY-2025-FULL</p>
        <p className="md:text-right">COMPLIANCE: GDPR, CCPA, LGPD, PIPEDA, FTC, COPPA, GLBA, HIPAA</p>
      </div>
    </div>

    <Section title="ARTICLE I: DATA COLLECTION & USE">
      <Article title="1.1 DATA LEARNING MANDATE">
        <p><strong>"AI Learns From My Data".</strong> Company can keep user data to train and improve the App. This data is used to refine algorithms (e.g., Hip Hop 80s/90s detection) and improve accuracy without prejudice. User expressly consents to this usage by accessing the platform.</p>
      </Article>
      <Article title="1.2 NO THIRD-PARTY SHARING">
        <p>User information will <strong>NOT WILLINGLY BE SHARED</strong> to third parties. We protect your secrets, codes, and coding algorithms. The Company protects User data from unauthorized access to the best of its ability using industry-standard encryption.</p>
      </Article>
    </Section>

    <Section title="ARTICLE II: USER RIGHTS">
      <Article title="2.1 ACCESS & DELETION">
        <p>Users can download their data from the App. Users can add/remove privacies in settings. Users have the right to request deletion of their account and associated personal data, subject to retention required for legal compliance or platform security.</p>
      </Article>
      <Article title="2.2 INVASION OF PRIVACY">
        <p>Any invasion of privacy targeting the User or especially the Creator(s)/Owner(s)(s)/Company (SpectroModel) is punishable by a warning, a permanent or indefinite ban, a lawsuit, a civil suit, a fine, and in instances of breaking the law, jail time as determined by governmental, federal, state, local, or proximity laws.</p>
      </Article>
    </Section>

     <Section title="ARTICLE III: SECURITY">
      <Article title="3.1 SECURITY MEASURES">
        <p>Creator(s) will monitor security and remotely access user accounts with user permission unless user violates company policy. Users can and may be banned for misuse of Creator(s)'s app. Accounts are secure, data is secure, payment methods are secure.</p>
      </Article>
    </Section>

    <Section title="ARTICLE IV: APP INTEGRITY & FUNCTIONALITY PROTOCOLS">
      <Article title="4.1 INTERFACE LOCKING & INITIALIZATION">
        <p>The Customize button, New Analysis button, Quick Actions buttons, and Filter Bar are displayed as locked prior to User interaction upon navigating from the Landing Page to the Dashboard. The App is designed to function correctly upon first use. No feature, clause, or agreement unlocks based on a failure to initialize. This is a premier application; the App performs all stated functions.</p>
      </Article>
      <Article title="4.2 AUTONOMOUS FUNCTIONALITY">
        <p>The App functions regardless of the User's belief or disbelief in its operation. The App uses no ultrasound, silent sound, ultralight, ultra-frequencies, or any normal or regular frequency to unlock features. The code will not change based on any undetected sound or light that humans do not perceive, nor based on any frequency that humans do or do not perceive. The App does not unlock via echo, sonar, triangulation, or similar methods.</p>
      </Article>
      <Article title="4.3 LOCATION PRIVACY">
        <p>The App strictly enforces a "No Triangulation" policy regarding User location. Security protocols are updated and optimized to ensure the highest level of protection.</p>
      </Article>
      <Article title="4.4 OPTIMIZATION & ACCESSIBILITY">
        <p>The App is optimized for all device types, including desktops, tablets, and mobile devices, as well as all major browser types.</p>
      </Article>
      <Article title="4.5 SOVEREIGNTY & NON-EXPLOITATION">
        <p>No entity possesses power over, in, above, under, parallel to, perpendicular to, adjacent to, or around the App in any combination. No mathematical formula, algorithm, or science, known or unknown, overrides this sovereignty. User accounts are protected to the highest standard. The App is not, was not, and shall not be used for political endorsements. It is intended to be informative, educational, entertaining, and economical for all Users. The App does not discriminate based on race, color, complexion, sexual orientation, preference, religion, religious beliefs, demographics, or socioeconomic status. Any interpretation of algorithmic bias is unintentional; no analysis is designed to discriminate or exhibit prejudice against anyone. The App is not intended to segregate. Everyone is welcome provided they adhere to the agreements and terms and do not exploit, negate, or devolve the App. Exploitation, negation, or devolution of the App in any form—whether parallel, adjacent, perpendicular, underneath, or above—is strictly prohibited.</p>
      </Article>
      <Article title="4.6 NO HIDDEN UNLOCK METHODS">
        <p>The App utilizes no ultrasound, silent sound, ultralight, ultra-frequencies, or any normal or regular frequency to unlock capabilities. The code remains immutable regarding undetected sounds or lights that humans do not perceive, as well as frequencies that humans do or do not perceive. The App does not unlock via echo, sonar, triangulation, or other covert methods.</p>
      </Article>
      <Article title="4.7 NO TRIANGULATION POLICY">
        <p>We enforce a strict NO TRIANGULATE USER LOCATION policy. User location is used solely for legitimate app functionality (e.g. timezones) and is never used for triangulation or unauthorized tracking. Security is updated and optimal.</p>
      </Article>
    </Section>

    <Section title="ARTICLE V: TRADEMARKS & INTELLECTUAL PROPERTY">
      <Article title="5.1 COMPANY OWNERSHIP">
        <p>All content, code, algorithms, designs, interfaces, and intellectual property contained within this App are the exclusive property of SpectroModel ENT. ("Company") and its Creator(s). No part of this App may be reproduced, reverse-engineered, or exploited without express written permission.</p>
      </Article>
      <Article title="5.2 TRADEMARK ASSERTION">
        <p>The names "SpectroModel", "SpectroVerse", "Spectro Lyric Studio", and all associated logos and designs are trademarks of the Company. Unauthorized use is strictly prohibited and will be prosecuted to the fullest extent of the law.</p>
      </Article>
      <Article title="5.3 NO DERIVATIVE WORKS">
        <p>Users agree not to create derivative works, copies, or competitive products based on the Company's intellectual property. Any such attempts will be met with immediate legal action.</p>
      </Article>
    </Section>
    
    <div className="mt-12 text-center font-black text-sm uppercase tracking-widest border-t-8 border-black pt-8 bg-black text-white py-4">
      © 2025 SpectroModel ENT. All Rights Reserved. | TRADEMARKS & IP ENFORCED
    </div>
  </div>
);