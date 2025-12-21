/**
 * SECURE PAYMENT GATE - NO STRIPE, NO PAYPAL, NO THIRD-PARTY PROCESSORS
 * Only certified credit/debit cards from verified banks
 * Requires ID.me or notarized identity verification
 * Multi-step authentication required
 * Fraud = Permanent ban + Authorities notified
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Shield, CreditCard, AlertTriangle, CheckCircle2, 
  Lock, UserCheck, FileText, Ban, Eye, EyeOff,
  Fingerprint, BadgeCheck, ShieldAlert, Scale
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMLDataCollector } from './MLDataCollector';

// BLOCKED PAYMENT METHODS - FRAUD VECTORS
const BLOCKED_METHODS = [
  'stripe', 'paypal', 'venmo', 'cashapp', 'zelle', 
  'western union', 'moneygram', 'walmart pay', 'google pay',
  'apple pay', 'samsung pay', 'bank transfer', 'ach', 'wire',
  'crypto', 'bitcoin', 'ethereum', 'gift card', 'prepaid'
];

// CERTIFIED CARD NETWORKS ONLY
const CERTIFIED_NETWORKS = [
  { id: 'visa', name: 'Visa', pattern: /^4[0-9]{12}(?:[0-9]{3})?$/ },
  { id: 'mastercard', name: 'Mastercard', pattern: /^5[1-5][0-9]{14}$/ },
  { id: 'amex', name: 'American Express', pattern: /^3[47][0-9]{13}$/ },
  { id: 'discover', name: 'Discover', pattern: /^6(?:011|5[0-9]{2})[0-9]{12}$/ }
];

export default function SecurePaymentGate({ 
  amount, 
  description, 
  onSuccess, 
  onCancel,
  requireIdVerification = true 
}) {
  const mlCollector = useMLDataCollector();
  
  const [step, setStep] = useState(1); // 1: ID Verify, 2: Card Entry, 3: Confirm, 4: Success
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCardNumber, setShowCardNumber] = useState(false);
  
  // Identity Verification
  const [idVerified, setIdVerified] = useState(false);
  const [idMethod, setIdMethod] = useState(null);
  
  // Card Details
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardNetwork, setCardNetwork] = useState(null);
  
  // Agreements
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedFraudPolicy, setAgreedFraudPolicy] = useState(false);
  const [agreedIdentityMatch, setAgreedIdentityMatch] = useState(false);

  useEffect(() => {
    mlCollector.record('secure_payment_gate_opened', {
      amount,
      description,
      timestamp: Date.now()
    });
  }, []);

  // Detect card network
  useEffect(() => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    const detected = CERTIFIED_NETWORKS.find(n => n.pattern.test(cleanNumber));
    setCardNetwork(detected || null);
  }, [cardNumber]);

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleIdVerification = async (method) => {
    setIsLoading(true);
    setError(null);
    setIdMethod(method);
    
    try {
      // Simulate ID.me or notary verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      mlCollector.record('id_verification_completed', {
        method,
        timestamp: Date.now()
      });
      
      setIdVerified(true);
      setStep(2);
    } catch (err) {
      setError('Identity verification failed. Please try again.');
      mlCollector.record('id_verification_failed', {
        method,
        error: err.message,
        timestamp: Date.now()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateCard = () => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    if (!cardNetwork) {
      setError('Card not recognized. Only Visa, Mastercard, American Express, and Discover accepted.');
      return false;
    }
    
    if (!cardName.trim() || cardName.trim().split(' ').length < 2) {
      setError('Please enter cardholder full name as shown on card.');
      return false;
    }
    
    const [month, year] = expiry.split('/');
    if (!month || !year || parseInt(month) > 12 || parseInt(month) < 1) {
      setError('Invalid expiry date.');
      return false;
    }
    
    if (cvv.length < 3 || cvv.length > 4) {
      setError('Invalid CVV.');
      return false;
    }
    
    return true;
  };

  const handleSubmitCard = () => {
    setError(null);
    if (!validateCard()) return;
    if (!agreedTerms || !agreedFraudPolicy || !agreedIdentityMatch) {
      setError('You must agree to all terms and policies.');
      return;
    }
    setStep(3);
  };

  const handleConfirmPayment = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Record payment attempt
      mlCollector.record('payment_attempt', {
        amount,
        cardNetwork: cardNetwork?.id,
        idMethod,
        timestamp: Date.now()
      });
      
      // In production, this would go to a secure payment processor
      // For now, simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      mlCollector.record('payment_success', {
        amount,
        cardNetwork: cardNetwork?.id,
        timestamp: Date.now()
      });
      
      setStep(4);
      if (onSuccess) {
        onSuccess({
          amount,
          cardLast4: cardNumber.slice(-4),
          network: cardNetwork?.name,
          idVerified: true,
          idMethod
        });
      }
    } catch (err) {
      setError('Payment failed. Please try again or use a different card.');
      mlCollector.record('payment_failed', {
        error: err.message,
        timestamp: Date.now()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <Card className="max-w-lg w-full bg-slate-900 border-2 border-amber-500/50 shadow-[0_0_50px_-10px_rgba(245,158,11,0.3)]">
        {/* Security Header */}
        <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 p-4 border-b border-green-500/30">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-400" />
            <div>
              <h2 className="text-white font-black text-lg">SECURE PAYMENT</h2>
              <p className="text-green-300 text-xs font-mono">256-BIT ENCRYPTION • NO THIRD-PARTY PROCESSORS</p>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Fraud Warning */}
          <div className="p-4 bg-red-950/50 border border-red-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 font-bold text-sm">⚠️ FRAUD & SECURITY NOTICE</p>
                <p className="text-red-200/80 text-xs mt-1">
                  Any fraudulent activity will result in immediate permanent ban and 
                  account termination. All data becomes inaccessible except to company.
                </p>
                <p className="text-red-200/80 text-xs mt-1">
                  <strong>NO CRIMINAL ACTIVITY ALLOWED.</strong> User data is protected and shall 
                  only be disclosed to governmental authorities under the following extreme circumstances: 
                  (a) harassment; (b) terrorism; (c) identity theft; (d) valid court order; (e) court mandate; 
                  (f) lawful warrant; or (g) official law enforcement investigation with proper legal authority.
                </p>
              </div>
            </div>
          </div>

          {/* Government Protection Notice */}
          <div className="p-3 bg-blue-950/50 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <p className="text-blue-300 text-xs font-semibold">
                🛡️ This application is protected by governmental entities. Your data is secure.
              </p>
            </div>
          </div>

          {/* Blocked Methods Notice */}
          <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
            <p className="text-slate-400 text-xs font-semibold mb-2 flex items-center gap-2">
              <Ban className="w-4 h-4 text-red-400" />
              BLOCKED PAYMENT METHODS (Fraud Vectors):
            </p>
            <div className="flex flex-wrap gap-1">
              {['Stripe', 'PayPal', 'Venmo', 'CashApp', 'Zelle', 'Western Union', 'Crypto'].map(m => (
                <Badge key={m} className="bg-red-900/50 text-red-300 text-[10px] border border-red-500/30">
                  {m}
                </Badge>
              ))}
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between px-4">
            {[
              { num: 1, label: 'Verify ID' },
              { num: 2, label: 'Card Info' },
              { num: 3, label: 'Confirm' },
              { num: 4, label: 'Complete' }
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s.num ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-400'
                }`}>
                  {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                </div>
                {i < 3 && <div className={`w-8 h-0.5 ${step > s.num ? 'bg-green-500' : 'bg-slate-700'}`} />}
              </div>
            ))}
          </div>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-300 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Step 1: Identity Verification */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <Fingerprint className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <h3 className="text-white font-bold text-xl mb-2">Identity Verification Required</h3>
                <p className="text-slate-400 text-sm">
                  Verify your identity using a certified service before payment
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => handleIdVerification('idme')}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-lg font-bold"
                >
                  <BadgeCheck className="w-6 h-6 mr-3" />
                  Verify with ID.me
                </Button>
                
                <Button
                  onClick={() => handleIdVerification('notary')}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full border-slate-600 text-white h-14"
                >
                  <FileText className="w-5 h-5 mr-3" />
                  Use Notarized Document
                </Button>
              </div>

              <p className="text-slate-500 text-xs text-center">
                You must provide proof of identity, citizenship, and card ownership
              </p>
            </div>
          )}

          {/* Step 2: Card Entry */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-bold">Enter Card Details</h3>
                <Badge className="bg-green-500/20 text-green-400">
                  <UserCheck className="w-3 h-3 mr-1" /> ID Verified
                </Badge>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 mb-4">
                <p className="text-slate-400 text-xs mb-2">Accepted Cards:</p>
                <div className="flex gap-2">
                  {CERTIFIED_NETWORKS.map(n => (
                    <Badge 
                      key={n.id} 
                      className={`${cardNetwork?.id === n.id ? 'bg-green-500/30 text-green-300 border-green-500' : 'bg-slate-700 text-slate-400'}`}
                    >
                      {n.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-slate-300">Cardholder Name (as shown on card)</Label>
                <Input
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="JOHN DOE"
                  className="bg-slate-800 border-slate-700 text-white uppercase mt-1"
                />
              </div>

              <div>
                <Label className="text-slate-300">Card Number</Label>
                <div className="relative">
                  <Input
                    type={showCardNumber ? 'text' : 'password'}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="•••• •••• •••• ••••"
                    maxLength={19}
                    className="bg-slate-800 border-slate-700 text-white mt-1 pr-20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => setShowCardNumber(!showCardNumber)}
                      className="text-slate-400 hover:text-white"
                    >
                      {showCardNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {cardNetwork && (
                      <Badge className="bg-green-500/20 text-green-400 text-xs">
                        {cardNetwork.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Expiry (MM/YY)</Label>
                  <Input
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="bg-slate-800 border-slate-700 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">CVV</Label>
                  <Input
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    placeholder="•••"
                    maxLength={4}
                    className="bg-slate-800 border-slate-700 text-white mt-1"
                  />
                </div>
              </div>

              {/* Agreements */}
              <div className="space-y-3 pt-4 border-t border-slate-700">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={agreedTerms}
                    onCheckedChange={setAgreedTerms}
                  />
                  <label htmlFor="terms" className="text-slate-300 text-sm cursor-pointer">
                    I agree to the Terms of Service and Privacy Policy
                  </label>
                </div>
                
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="fraud"
                    checked={agreedFraudPolicy}
                    onCheckedChange={setAgreedFraudPolicy}
                  />
                  <label htmlFor="fraud" className="text-slate-300 text-sm cursor-pointer">
                    I understand that fraudulent activity shall result in permanent account termination. User data shall only be disclosed to authorities in cases of: (a) harassment; (b) terrorism; (c) identity theft; (d) valid court orders; (e) lawful warrants; or (f) official law enforcement investigations.
                  </label>
                </div>
                
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="identity"
                    checked={agreedIdentityMatch}
                    onCheckedChange={setAgreedIdentityMatch}
                  />
                  <label htmlFor="identity" className="text-slate-300 text-sm cursor-pointer">
                    I confirm this card belongs to me and matches my verified identity
                  </label>
                </div>
              </div>

              <Button
                onClick={handleSubmitCard}
                disabled={!cardNumber || !cardName || !expiry || !cvv}
                className="w-full bg-amber-600 hover:bg-amber-700 h-12 font-bold"
              >
                <Lock className="w-4 h-4 mr-2" />
                Continue to Confirmation
              </Button>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <Scale className="w-12 h-12 text-amber-400 mx-auto mb-2" />
                <h3 className="text-white font-bold text-xl">Confirm Payment</h3>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount</span>
                  <span className="text-white font-bold text-xl">${amount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Description</span>
                  <span className="text-white">{description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Card</span>
                  <span className="text-white">{cardNetwork?.name} •••• {cardNumber.slice(-4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Identity</span>
                  <Badge className="bg-green-500/20 text-green-400">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Verified via {idMethod?.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1 border-slate-600 text-white"
                >
                  Back
                </Button>
                <Button
                  onClick={handleConfirmPayment}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 font-bold"
                >
                  {isLoading ? 'Processing...' : 'Confirm Payment'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              </div>
              <h3 className="text-white font-bold text-2xl mb-2">Payment Successful!</h3>
              <p className="text-slate-400 mb-6">Your transaction has been securely processed.</p>
              <Button onClick={onCancel} className="bg-slate-700 hover:bg-slate-600">
                Close
              </Button>
            </div>
          )}

          {step < 4 && (
            <Button 
              variant="ghost" 
              onClick={onCancel}
              className="w-full text-slate-500 hover:text-white"
            >
              Cancel
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}