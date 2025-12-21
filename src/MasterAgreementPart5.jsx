
import React from 'react';
import { Article } from './MasterAgreementPart1';

export const MasterAgreementPart5 = () => (
  <>
    {/* Page 5: Sections 97 - 120 */}
    {[...Array(24)].map((_, i) => (
      <div key={i} className="mb-12 border-l-8 border-black pl-6 py-2">
        <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION {['XCVII', 'XCVIII', 'XCIX', 'C', 'CI', 'CII', 'CIII', 'CIV', 'CV', 'CVI', 'CVII', 'CVIII', 'CIX', 'CX', 'CXI', 'CXII', 'CXIII', 'CXIV', 'CXV', 'CXVI', 'CXVII', 'CXVIII', 'CXIX', 'CXX'][i]}: {['INTERNATIONAL TRADE COMPLIANCE', 'EXPORT CONTROL REGULATIONS', 'ECONOMIC SANCTIONS', 'CURRENCY CONVERSION RISKS', 'PAYMENT DISPUTE RESOLUTION', 'REFUND POLICY SPECIFICS', 'SUBSCRIPTION CANCELLATION', 'ACCOUNT RECOVERY PROTOCOLS', 'PASSWORD SECURITY STANDARDS', '2FA REQUIREMENTS', 'SOCIAL LOGIN RISKS', 'DEVICE AUTHORIZATION', 'SESSION MANAGEMENT', 'COOKIE POLICY & TRACKING', 'TRACKER TRANSPARENCY', 'DO NOT TRACK SIGNALS', 'CALIFORNIA PRIVACY RIGHTS', 'GDPR DATA SPECIFICS', 'DATA PORTABILITY RIGHTS', 'RIGHT TO BE FORGOTTEN', 'DATA BREACH NOTIFICATION', 'SECURITY AUDIT RIGHTS', 'PENETRATION TESTING POLICY', 'BUG BOUNTY PROGRAM'][i]}</h2>
        <Article title={`${97 + i}.1 REGULATORY COMPLIANCE`}>
          <p>The User agrees to comply with all applicable laws and regulations regarding this section. The Company actively monitors for compliance using automated tools. "Security must be up to date" to prevent unauthorized access.</p>
        </Article>
        <Article title={`${97 + i}.2 DATA LEARNING MANDATE`}>
          <p>Usage data related to this section is processed under the "AI Learns From My Data" mandate to enhance system security and feature reliability.</p>
        </Article>
      </div>
    ))}
  </>
);
