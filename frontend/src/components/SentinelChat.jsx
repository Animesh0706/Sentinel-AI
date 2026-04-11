import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, ShieldCheck, Bot, User } from 'lucide-react';
import { sendChatMessage } from '../services/api';

const SentinelChat = ({ scanId, verdict, threatScore, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `I'm Sentinel-AI, your cybersecurity analyst. I've loaded scan **${scanId?.substring(0, 8)}...** (Verdict: **${verdict}**, Score: **${(threatScore * 100).toFixed(0)}%**). Ask me anything about this threat.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;

    const userMsg = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    const response = await sendChatMessage(scanId, trimmed);

    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: response.reply },
    ]);
    setIsThinking(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isMalicious = verdict === 'Malicious';
  const isSuspicious = verdict === 'Suspicious';
  const accentColor = isMalicious ? 'neon-red' : isSuspicious ? 'neon-yellow' : 'neon-green';

  return (
    <div className="bg-[#12141c] border border-cyber-border rounded-2xl h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-cyber-border/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
            <Bot size={18} className="text-neon-cyan" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Sentinel AI Guardian</h3>
            <p className="text-[9px] font-mono text-gray-500 mt-0.5 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full bg-${accentColor} animate-pulse`}></span>
              GROQ • LLaMA 3.3 70B
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg border border-[#232733] flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center border ${
                msg.role === 'assistant'
                  ? 'bg-neon-cyan/10 border-neon-cyan/20'
                  : 'bg-neon-purple/10 border-neon-purple/20'
              }`}
            >
              {msg.role === 'assistant' ? (
                <ShieldCheck size={14} className="text-neon-cyan" />
              ) : (
                <User size={14} className="text-neon-purple" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                msg.role === 'assistant'
                  ? 'bg-[#181a24] border border-[#232733] text-gray-300'
                  : 'bg-neon-purple/10 border border-neon-purple/20 text-gray-200'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Thinking animation */}
        {isThinking && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center bg-neon-cyan/10 border border-neon-cyan/20">
              <ShieldCheck size={14} className="text-neon-cyan" />
            </div>
            <div className="bg-[#181a24] border border-[#232733] rounded-xl px-4 py-3 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-3 border-t border-cyber-border/50 shrink-0">
        <div className="flex items-center gap-2 bg-[#0d0f14] rounded-xl border border-[#232733] px-3 py-1.5 focus-within:border-neon-cyan/30 transition-colors">
          <MessageSquare size={16} className="text-gray-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this threat..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 focus:outline-none font-mono py-1.5"
            disabled={isThinking}
          />
          <button
            onClick={handleSend}
            disabled={isThinking || !input.trim()}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              input.trim() && !isThinking
                ? 'bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30 border border-neon-cyan/30'
                : 'text-gray-600 border border-transparent'
            }`}
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-[9px] font-mono text-gray-600 mt-2 text-center">
          Powered by Groq • Responses are AI-generated and may not be 100% accurate
        </p>
      </div>
    </div>
  );
};

export default SentinelChat;
