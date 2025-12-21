
import React from 'react';
import { Article } from './MasterAgreementPart1';

export const MasterAgreementPart7 = () => (
  <>
    {/* Page 7: Sections 145 - 168 */}
    {[...Array(24)].map((_, i) => (
      <div key={i} className="mb-12 border-l-8 border-black pl-6 py-2">
        <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION {['CXLV', 'CXLVI', 'CXLVII', 'CXLVIII', 'CXLIX', 'CL', 'CLI', 'CLII', 'CLIII', 'CLIV', 'CLV', 'CLVI', 'CLVII', 'CLVIII', 'CLIX', 'CLX', 'CLXI', 'CLXII', 'CLXIII', 'CLXIV', 'CLXV', 'CLXVI', 'CLXVII', 'CLXVIII'][i]}: {['MOBILE DEVICE MANAGEMENT', 'PUSH NOTIFICATION SETTINGS', 'SMS ALERT PROTOCOLS', 'EMAIL PREFERENCE CENTER', 'MARKETING OPT-OUT', 'SERVICE ANNOUNCEMENTS', 'EMERGENCY ALERT SYSTEM', 'LEGAL NOTICE DELIVERY', 'ARBITRATION PROCEDURES', 'VENUE SELECTION', 'CHOICE OF LAW', 'JURY WAIVER', 'CLASS ACTION WAIVER', 'LIMITATION OF LIABILITY', 'DISCLAIMER OF WARRANTIES', 'INDEMNIFICATION PROCEDURES', 'SEVERABILITY CLAUSES', 'ASSIGNMENT OF RIGHTS', 'NO WAIVER PROVISION', 'FORCE MAJEURE EVENTS', 'ENTIRE AGREEMENT CLAUSE', 'AMENDMENT PROCEDURES', 'ELECTRONIC SIGNATURES', 'EFFECTIVE DATE PROTOCOLS'][i]}</h2>
        <Article title={`${145 + i}.1 LEGAL BINDING`}>
          <p>This section constitutes a legally binding agreement between the User and the Company. By continuing to use the Service, the User accepts these terms unequivocally.</p>
        </Article>
        <Article title={`${145 + i}.2 JURISDICTIONAL APPLICABILITY`}>
          <p>These terms apply globally, regardless of the User's physical location. The laws of the State of Arizona govern interpretation.</p>
        </Article>
      </div>
    ))}
  </>
);
