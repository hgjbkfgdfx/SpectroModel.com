
import React from 'react';
import { Article } from './MasterAgreementPart1';

export const MasterAgreementPart8 = () => (
  <>
    {/* Page 8: Sections 169 - 192 */}
    {[...Array(24)].map((_, i) => (
      <div key={i} className="mb-12 border-l-8 border-black pl-6 py-2">
        <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION {['CLXIX', 'CLXX', 'CLXXI', 'CLXXII', 'CLXXIII', 'CLXXIV', 'CLXXV', 'CLXXVI', 'CLXXVII', 'CLXXVIII', 'CLXXIX', 'CLXXX', 'CLXXXI', 'CLXXXII', 'CLXXXIII', 'CLXXXIV', 'CLXXXV', 'CLXXXVI', 'CLXXXVII', 'CLXXXVIII', 'CLXXXIX', 'CXC', 'CXCI', 'CXCII'][i]}: {['CORPORATE GOVERNANCE', 'SHAREHOLDER RIGHTS', 'INVESTOR RELATIONS', 'MEDIA INQUIRY POLICY', 'PRESS RELEASE GUIDELINES', 'BRAND USAGE GUIDELINES', 'LOGO USAGE RESTRICTIONS', 'COLOR PALETTE STANDARDS', 'TYPOGRAPHY STANDARDS', 'TONE OF VOICE POLICY', 'COMMUNITY MANAGEMENT', 'MODERATOR AUTHORITY', 'USER APPEAL PROCESS', 'BAN DURATION MATRIX', 'SUSPENSION TYPES', 'ACCOUNT RESTORATION', 'DATA RECOVERY FEES', 'SUPPORT SLA TERMS', 'PRIORITY SUPPORT', 'ENTERPRISE SLA', 'CUSTOM DEVELOPMENT', 'WHITE LABELING TERMS', 'RESELLER PROGRAMS', 'AFFILIATE COMMISSIONS'][i]}</h2>
        <Article title={`${169 + i}.1 OPERATIONAL GUIDELINES`}>
          <p>The Company operates under strict guidelines to ensure brand integrity and community safety. Users must adhere to these standards in all public-facing interactions.</p>
        </Article>
        <Article title={`${169 + i}.2 DISPUTE RESOLUTION`}>
          <p>Disputes regarding this section will be handled by the Company's internal review board. Decisions are final and non-negotiable.</p>
        </Article>
      </div>
    ))}
  </>
);
