import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { checkContent, getSafeAIPrompt } from "./ContentFilter";

export default function GlobalAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleToggle = () => setIsOpen(!isOpen);

  useEffect(() => {
    const toggleHandler = () => setIsOpen(prev => !prev);
    window.addEventListener('toggle-ai-assistant', toggleHandler);
    return () => window.removeEventListener('toggle-ai-assistant', toggleHandler);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    
    // Check content against comprehensive filter
    const contentCheck = checkContent(userMessage);
    if (contentCheck.isProhibited) {
      setMessages(prev => [...prev, 
        { role: "user", content: userMessage },
        { role: "assistant", content: contentCheck.message }
      ]);
      setInput("");
      return;
    }

    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsProcessing(true);

    try {
      // Get safe prompt with content guidelines
      const safePrompt = getSafeAIPrompt(userMessage);
      
      if (safePrompt.blocked) {
        setMessages(prev => [...prev, { role: "assistant", content: safePrompt.response }]);
        setIsProcessing(false);
        return;
      }

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: safePrompt.prompt,
        add_context_from_internet: false
      });

      // Double-check response for prohibited content
      const responseCheck = checkContent(response || '');
      const finalResponse = responseCheck.isProhibited 
        ? "I'm here to help with music, education, and business topics!"
        : (response || "I'm here to help with music analysis, education, and business questions!");

      setMessages(prev => [...prev, { role: "assistant", content: finalResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm here to help! Ask me about music analysis, education, or business topics." 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Inline sidebar version - always visible when rendered
  return (
    <div className="w-full bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
      <div className="p-2 flex items-center gap-2 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <MessageCircle className="w-4 h-4 text-purple-600" />
        <span className="text-xs font-bold text-slate-700">AI Assistant</span>
        <span className="text-[8px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded ml-auto">LEARNS</span>
      </div>
      <div className="h-48 overflow-y-auto p-2 space-y-2 bg-white">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 text-xs py-4">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600 text-[10px]">Ask me anything!</p>
            <p className="text-[9px] mt-1 text-slate-400">Music • Education • Business</p>
            <div className="flex items-center justify-center gap-1 mt-2 text-[9px] text-green-500">
              <Shield className="w-2.5 h-2.5" />
              <span>Safe & Moderated</span>
            </div>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-2 rounded-lg text-[10px] break-words ${
              msg.role === 'user' 
                ? 'bg-purple-600 text-white' 
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-slate-100 p-2 rounded-lg border border-slate-200">
              <Loader2 className="w-3 h-3 animate-spin text-purple-500" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-2 border-t border-slate-200 bg-slate-50">
        <div className="flex gap-1">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask..."
            className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 text-xs h-8"
            disabled={isProcessing}
          />
          <Button 
            onClick={handleSend} 
            disabled={isProcessing || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700 shrink-0 h-8 w-8 p-0"
            size="icon"
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}