import React, { useState, useRef, useEffect } from 'react';
import apiClient from '../services/api';
import { Send, Droplet, User, Bot, Sparkles } from 'lucide-react';

export const ChatAssistantPage = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I am your **Water Quality AI Chatbot**. I can help you understand water parameters, WHO guidelines, and filtration technologies.\n\nTry asking me about pH, Turbidity, Solids (TDS), Chloramines, or purification systems!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input.trim();
    if (!text) return;

    if (!textToSend) setInput('');

    // Append User Message
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setLoading(true);

    try {
      const response = await apiClient.post('/chat', { message: text });
      setMessages(prev => [...prev, { sender: 'bot', text: response.data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: "Sorry, I am having trouble connecting to the chat service. Please make sure the backend is online." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to render markdown-like lists and bold tags in bubbles
  const renderMessageText = (text) => {
    return text.split('\n').map((line, lIdx) => {
      // Bold text replacements **text**
      let parts = line.split('**');
      let elements = parts.map((part, pIdx) => {
        if (pIdx % 2 === 1) return <strong key={pIdx} className="font-extrabold text-slate-800 dark:text-white">{part}</strong>;
        
        // Bullet checks
        if (part.trim().startsWith('*')) {
          return part.replace('*', '•');
        }
        return part;
      });

      return <p key={lIdx} className="mb-1 leading-relaxed text-xs">{elements}</p>;
    });
  };

  const presetPrompts = [
    "What is the WHO limit for pH?",
    "How does high Turbidity affect water safety?",
    "What filter removes Chloramines?",
    "Is boiling water enough for heavy TDS?"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Sparkles className="text-brand-primary" />
          <span>AI Chat Assistant</span>
        </h1>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          Ask questions about WHO standards, water parameters, safety thresholds, and purification filtration systems
        </p>
      </div>

      {/* Chat Box Panel */}
      <div className="glass-card flex-1 flex flex-col justify-between overflow-hidden relative border border-slate-200/50 dark:border-slate-800/50 rounded-3xl">
        
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[50vh] sm:max-h-[60vh] pr-2">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`h-8 w-8 flex items-center justify-center rounded-xl shrink-0 ${
                msg.sender === 'user' 
                  ? 'bg-brand-primary text-white' 
                  : 'bg-brand-primary/10 text-brand-primary'
              }`}>
                {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-slate-700 dark:text-slate-300 ${
                msg.sender === 'user'
                  ? 'bg-brand-primary text-white rounded-tr-none'
                  : 'bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/20 dark:border-slate-800/20 rounded-tl-none'
              }`}>
                {renderMessageText(msg.text)}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                <Bot size={16} />
              </div>
              <div className="rounded-2xl rounded-tl-none px-4 py-3 bg-slate-100/50 dark:bg-slate-900/50 text-slate-500 flex gap-1 items-center">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick presets and input bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white/30 dark:bg-slate-950/30 space-y-3">
          
          {/* Quick presets */}
          <div className="flex flex-wrap gap-2">
            {presetPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                className="text-[10px] font-semibold bg-brand-primary/5 hover:bg-brand-primary/10 border border-brand-primary/15 text-brand-primary px-3 py-1.5 rounded-full transition-all"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about water safety parameters..."
              className="input-field text-xs py-2 flex-1"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-white hover:bg-brand-hover shadow-lg shadow-brand-primary/10 transition-all disabled:opacity-40 shrink-0"
            >
              <Send size={16} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
