"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Truck,
  Package,
  ShoppingBag,
  Zap,
  HelpCircle
} from 'lucide-react';

interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', text: '👋 Hello! I\'m your Nexis AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    console.log('[Nexis Chat] Sending message:', text);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      console.log('[Nexis Chat] POST →', `${apiUrl}/api/chat`);

      const res = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() })
      });

      console.log('[Nexis Chat] Response status:', res.status);

      if (res.ok) {
        const data = await res.json();
        console.log('[Nexis Chat] Response data:', data);

        // Simulate typing delay for natural feel
        await new Promise(resolve => setTimeout(resolve, 600));

        setMessages(prev => [...prev, { role: 'bot', text: data.reply || 'I received your message but got an empty response.' }]);
      } else {
        console.error('[Nexis Chat] API error:', res.status, res.statusText);
        await new Promise(resolve => setTimeout(resolve, 400));
        setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I couldn't process that request. Please try again." }]);
      }
    } catch (err) {
      console.error('[Nexis Chat] Network error:', err);
      await new Promise(resolve => setTimeout(resolve, 400));
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I couldn't understand. Try again or check your connection." }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'Book Tanker', icon: <Truck size={13} />, cmd: 'Book tanker' },
    { label: 'Show Products', icon: <ShoppingBag size={13} />, cmd: 'Show products' },
    { label: 'Track Order', icon: <Package size={13} />, cmd: 'Track order' },
    { label: 'Help', icon: <HelpCircle size={13} />, cmd: 'Help' }
  ];

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[100] h-14 w-14 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow"
        aria-label="Open chat"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="relative">
              <MessageSquare size={24} />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-400 rounded-full border-2 border-indigo-600" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-24 right-6 z-[100] w-[380px] max-h-[560px] bg-white rounded-2xl shadow-2xl shadow-slate-900/20 border border-slate-200/80 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center gap-3 flex-shrink-0">
              <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold leading-none">Nexis AI Assistant</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-slate-400 font-medium">Online</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 min-h-0">
              {messages.map((m, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[82%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-white'}`}>
                      {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div className={`px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-line ${m.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-md'
                      : 'bg-white text-slate-800 rounded-2xl rounded-tl-md border border-slate-200 shadow-sm'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-2">
                    <div className="h-7 w-7 rounded-lg bg-slate-800 text-white flex items-center justify-center flex-shrink-0">
                      <Bot size={14} />
                    </div>
                    <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-md shadow-sm flex items-center gap-1">
                      <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" />
                      <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex gap-1.5 flex-wrap flex-shrink-0">
              {quickActions.map(qa => (
                <button
                  key={qa.label}
                  onClick={() => handleSend(qa.cmd)}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 rounded-lg border border-slate-200 text-[10px] font-semibold uppercase tracking-wide transition-colors disabled:opacity-50"
                >
                  {qa.icon} {qa.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-4 py-3 bg-white border-t border-slate-100 flex-shrink-0">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  disabled={loading}
                  className="flex-1 bg-slate-100 px-4 py-2.5 rounded-xl text-sm font-medium border-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-white transition-all placeholder:text-slate-400 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </form>
              <p className="text-center text-[9px] text-slate-300 mt-2 font-medium flex items-center justify-center gap-1">
                <Zap size={8} /> Nexis AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
