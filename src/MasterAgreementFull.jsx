
import React from 'react';
import { MasterAgreementPartA } from './MasterAgreementPartA';
import { MasterAgreementPartB } from './MasterAgreementPartB';
import { MasterAgreementPartC } from './MasterAgreementPartC';
import { MasterAgreementPartD } from './MasterAgreementPartD';

export const MasterAgreementFull = () => (
  <div className="legal-agreement-full" style={{ textShadow: 'none', WebkitFontSmoothing: 'antialiased', color: '#000000', fontWeight: '700' }}>
    <MasterAgreementPartA />
    <MasterAgreementPartB />
    <MasterAgreementPartC />
    <MasterAgreementPartD />
  </div>
);
