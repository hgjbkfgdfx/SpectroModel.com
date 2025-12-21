import React, { useState } from 'react';
import { MessageCircle, X, Sparkles, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";

export default function SpectroVerseAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 SpectroVerse AI Assistant\n\n🌐 Scene Generation\n👤 Avatar Customization\n⚡ Physics Engine\n🎯 ML Training\n\nHow can I help?'
    }
  ]);

  const sendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are SpectroVerse AI Assistant - expert in 3D avatars, physics, ML training, and metaverse scenes.\n\nUser: ${input}\n\nProvide concise, helpful answers.`,
        add_context_from_internet: false
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response || 'Error processing request'
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Error. Please try again.'
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 md:bottom-24 md:right-6 z-[9998] w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 shadow-2xl animate-pulse"
          title="SpectroVerse Assistant"
        >
          <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
        </Button>
      )}

      {isOpen && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9998] w-[calc(100vw-2rem)] sm:w-96 max-w-[calc(100vw-2rem)]">
          <Card className="bg-slate-900/95 border-cyan-500/50 shadow-2xl backdrop-blur-xl">
            <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  SpectroVerse AI
                </CardTitle>
                <Button
                  onClick={() => setIsOpen(false)}
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              <div className="h-64 sm:h-80 overflow-y-auto space-y-2 sm:space-y-3 pr-2">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${
                      msg.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-200'
                    }`}>
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="p-2 sm:p-3 rounded-lg bg-slate-800">
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-cyan-400" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask about scenes, avatars..."
                  className="flex-1 bg-slate-800 border-slate-700 text-white resize-none text-xs sm:text-sm"
                  rows={2}
                  disabled={isProcessing}
                />
                <Button
                  onClick={sendMessage}
                  disabled={isProcessing || !input.trim()}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 shrink-0 px-3 sm:px-4 text-xs sm:text-sm"
                >
                  {isProcessing ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : 'Send'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}