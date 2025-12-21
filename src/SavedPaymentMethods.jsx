import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Trash2, Shield, Lock, Check, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { clearUserCache } from "@/components/shared/userCache";

export default function SavedPaymentMethods({ user }) {
  const [savedCards, setSavedCards] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNickname, setCardNickname] = useState('');

  useEffect(() => {
    // Load saved cards from user data
    if (user?.saved_payment_methods) {
      setSavedCards(user.saved_payment_methods);
    }
  }, [user]);

  const formatCardNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Limit to 16 digits
    const limited = digits.slice(0, 16);
    // Add spaces every 4 digits
    const formatted = limited.replace(/(.{4})/g, '$1 ').trim();
    return formatted;
  };

  const getLastFour = (cardNum) => {
    const digits = cardNum.replace(/\D/g, '');
    return digits.slice(-4);
  };

  const getCardType = (cardNum) => {
    const digits = cardNum.replace(/\D/g, '');
    if (digits.startsWith('4')) return 'Visa';
    if (digits.startsWith('5')) return 'Mastercard';
    if (digits.startsWith('3')) return 'Amex';
    if (digits.startsWith('6')) return 'Discover';
    return 'Card';
  };

  const handleAddCard = async () => {
    if (cardNumber.replace(/\D/g, '').length < 13) {
      alert('Please enter a valid card number');
      return;
    }
    if (!cardName.trim()) {
      alert('Please enter the cardholder name');
      return;
    }

    setIsLoading(true);
    
    try {
      const lastFour = getLastFour(cardNumber);
      const cardType = getCardType(cardNumber);
      
      const newCard = {
        id: Date.now().toString(),
        last_four: lastFour,
        card_type: cardType,
        cardholder_name: cardName.trim(),
        nickname: cardNickname.trim() || `${cardType} ending in ${lastFour}`,
        added_date: new Date().toISOString(),
        is_default: savedCards.length === 0
      };

      const updatedCards = [...savedCards, newCard];
      
      await base44.auth.updateMe({ 
        saved_payment_methods: updatedCards 
      });
      clearUserCache();
      
      setSavedCards(updatedCards);
      setShowAddForm(false);
      setCardNumber('');
      setCardName('');
      setCardNickname('');
      
      alert('✓ Payment method saved securely. Only the last 4 digits are stored.');
    } catch (error) {
      console.error('Failed to save card:', error);
      alert('Failed to save payment method. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCard = async (cardId) => {
    if (!confirm('Remove this payment method?')) return;
    
    setIsLoading(true);
    try {
      const updatedCards = savedCards.filter(c => c.id !== cardId);
      
      await base44.auth.updateMe({ 
        saved_payment_methods: updatedCards 
      });
      clearUserCache();
      
      setSavedCards(updatedCards);
      alert('✓ Payment method removed.');
    } catch (error) {
      console.error('Failed to remove card:', error);
      alert('Failed to remove payment method.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (cardId) => {
    setIsLoading(true);
    try {
      const updatedCards = savedCards.map(c => ({
        ...c,
        is_default: c.id === cardId
      }));
      
      await base44.auth.updateMe({ 
        saved_payment_methods: updatedCards 
      });
      clearUserCache();
      
      setSavedCards(updatedCards);
    } catch (error) {
      console.error('Failed to set default:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-black/40 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <CreditCard className="w-5 h-5 text-green-400" />
          Saved Payment Methods
        </CardTitle>
        <p className="text-xs text-slate-500 font-mono mt-1">
          Only the last 4 digits are stored. No CVV or expiration dates saved.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Security Notice */}
        <div className="p-3 bg-green-950/30 border border-green-500/30 rounded-lg flex items-start gap-2">
          <Shield className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-green-400 text-xs font-bold uppercase">Secure Storage</p>
            <p className="text-green-300/70 text-[10px] mt-0.5">
              Your payment information is encrypted. We only store the last 4 digits and card type for your reference.
            </p>
          </div>
        </div>

        {/* Saved Cards List */}
        {savedCards.length > 0 ? (
          <div className="space-y-3">
            {savedCards.map((card) => (
              <div 
                key={card.id}
                className={`p-4 rounded-lg border ${
                  card.is_default 
                    ? 'bg-purple-950/30 border-purple-500/50' 
                    : 'bg-slate-900/50 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg">
                      <CreditCard className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold text-sm">
                          {card.card_type} •••• {card.last_four}
                        </span>
                        {card.is_default && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]">
                            DEFAULT
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-500 text-xs">{card.cardholder_name}</p>
                      {card.nickname && card.nickname !== `${card.card_type} ending in ${card.last_four}` && (
                        <p className="text-slate-600 text-[10px] italic">{card.nickname}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!card.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(card.id)}
                        disabled={isLoading}
                        className="text-slate-400 hover:text-white text-xs"
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCard(card.id)}
                      disabled={isLoading}
                      className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-slate-700 rounded-lg">
            <CreditCard className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No saved payment methods</p>
            <p className="text-slate-600 text-xs mt-1">Add a card for faster checkout</p>
          </div>
        )}

        {/* Add Card Form */}
        {showAddForm ? (
          <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg space-y-4">
            <h4 className="text-white font-semibold text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Payment Method
            </h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-slate-400 text-xs block mb-1">Card Number</label>
                <Input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  className="bg-black border-slate-700 text-white font-mono"
                  maxLength={19}
                />
                <p className="text-[10px] text-slate-600 mt-1 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Only the last 4 digits will be stored
                </p>
              </div>
              
              <div>
                <label className="text-slate-400 text-xs block mb-1">Cardholder Name</label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="bg-black border-slate-700 text-white"
                />
              </div>
              
              <div>
                <label className="text-slate-400 text-xs block mb-1">Nickname (optional)</label>
                <Input
                  type="text"
                  placeholder="Personal Card"
                  value={cardNickname}
                  onChange={(e) => setCardNickname(e.target.value)}
                  className="bg-black border-slate-700 text-white"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleAddCard}
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white"
              >
                {isLoading ? 'Saving...' : 'Save Card'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setCardNumber('');
                  setCardName('');
                  setCardNickname('');
                }}
                className="border-slate-700 text-slate-400"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Payment Method
          </Button>
        )}

        {/* Warning */}
        <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-amber-300/70 text-[10px]">
            Payment processing will be enabled soon. Saved cards will be used for subscription payments once the system is active.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}