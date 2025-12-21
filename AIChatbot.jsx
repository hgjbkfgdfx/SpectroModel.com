import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { X, Send, MessageCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

// More precise offensive content patterns - avoid false positives
const OFFENSIVE_PATTERNS = [
  // Explicit racial slurs only (full words, not substrings)
  /\bn[i1!|]gg[a@e3]r?s?\b/gi,
  /\bch[i1!|]nk?s?\b/gi,
  /\bsp[i1!|][ck]s?\b/gi,
  /\bk[i1!|]k[e3]s?\b/gi,
  /\b[ck][o0][o0]n?s?\b/gi,
  
  // Explicit profanity (full words only)
  /\bf[u*][ck]k/gi,
  /\bsh[i*]t\b/gi,
  /\bb[i*]tch\b/gi,
  /\bc[u*]nt\b/gi,
  
  // Homophobic slurs (full words)
  /\bf[a@4]gg?[o0]t?s?\b/gi,
  
  // Other explicit slurs (full words)
  /\br[e3]t[a@]rd\b/gi,
];

const containsOffensiveContent = (text) => {
  if (!text) return false;
  const normalizedText = text.toLowerCase().trim();
  
  for (const pattern of OFFENSIVE_PATTERNS) {
    if (pattern.test(normalizedText)) {
      console.warn('Offensive content detected');
      return true;
    }
  }
  
  return false;
};

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: '👋 Hi! I\'m your SpectroModel AI assistant. I can help you with music production tips, analysis insights, platform features, and technical questions about audio processing, transcription, and restoration. What would you like to know?'
      }]);
    }
  }, [isOpen, messages.length]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    // Check for offensive content in user input
    if (containsOffensiveContent(inputMessage)) {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: inputMessage },
        { role: 'assistant', content: "I'm unable to help you with that." }
      ]);
      setInputMessage('');
      return;
    }

    const userMsg = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsProcessing(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a helpful AI assistant for SpectroModel, a music analysis and audio restoration platform.

CRITICAL CONTENT POLICY:
- If the user's message contains explicit profanity, slurs, or harassment, respond ONLY with: "I'm unable to help you with that."
- Technical terms like "transcription", "script", "recording" are NOT offensive
- Maintain professional, respectful communication at all times

User message: ${userMsg}

Provide helpful, concise responses about:
- Music production and audio restoration
- Platform features (transcription, mixing, mastering, restoration)
- General music industry insights
- Technical audio questions
- How the audio transcription feature works
- Troubleshooting audio processing issues

Keep responses friendly and under 3 paragraphs.`,
        add_context_from_internet: false
      });

      // Check AI response for offensive content
      if (containsOffensiveContent(response)) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "I'm unable to help you with that." 
        }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      }

    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again or contact support if the issue persists.' 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 rounded-full w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg z-50"
        aria-label="Open AI Chatbot"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-3rem)] bg-slate-900/95 border-purple-500/50 shadow-2xl z-50 flex flex-col">
      <CardHeader className="border-b border-slate-700/50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-400" />
            AI Assistant
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-800 text-slate-200'
              }`}
            >
              {msg.role === 'assistant' ? (
                <ReactMarkdown className="prose prose-sm prose-invert max-w-none">
                  {msg.content}
                </ReactMarkdown>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="border-t border-slate-700/50 p-4 flex-shrink-0">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            disabled={isProcessing}
            className="flex-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
          <Button
            onClick={handleSend}
            disabled={isProcessing || !inputMessage.trim()}
            className="bg-gradient-to-r from-purple-500 to-blue-500"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2 text-center">
          Ask about audio restoration, transcription, and more!
        </p>
      </div>
    </Card>
  );
}