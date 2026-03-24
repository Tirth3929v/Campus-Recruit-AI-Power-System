import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Loader2, Bot, User, Copy, Check, Sparkles, 
  History, Plus, MessageSquare, Trash2, ChevronLeft 
} from 'lucide-react';
import axiosInstance from '../pages/axiosInstance';

const ENDPOINT_MAP = {
  text:  '/ai/generate-text',
  code:  '/ai/generate-code',
  image: '/ai/generate-image',
};

const TOOL_META = {
  text:  { label: 'Text Generator',  color: 'from-emerald-500 to-teal-600',  accent: 'emerald',  placeholder: 'Ask me to write anything — an email, essay, summary...' },
  code:  { label: 'Code Generator',  color: 'from-blue-500 to-cyan-600',      accent: 'blue',    placeholder: 'Describe the code you need — function, component, algorithm...' },
};

const CodeBlock = ({ content }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative mt-2 rounded-xl overflow-hidden border border-white/10">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10" style={{ background: 'rgba(0,0,0,0.4)' }}>
        <span className="text-xs text-white/40 font-mono">code</span>
        <button onClick={copy} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors">
          {copied ? <><Check size={12} className="text-emerald-400" /><span className="text-emerald-400">Copied</span></> : <><Copy size={12} /><span>Copy</span></>}
        </button>
      </div>
      <pre className="p-4 text-sm text-green-300 font-mono overflow-x-auto custom-scrollbar whitespace-pre-wrap" style={{ background: 'rgba(0,0,0,0.3)' }}>
        {content}
      </pre>
    </div>
  );
};

const ImageWithLoader = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full aspect-square bg-white/5 flex items-center justify-center overflow-hidden">
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <Loader2 size={24} className="text-pink-500 animate-spin" />
          <span className="text-[10px] text-white/30 font-medium">Painting your imagination...</span>
        </div>
      )}
      <img 
        src={src} 
        alt={alt} 
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover cursor-pointer transition-all duration-700 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
        onClick={() => window.open(src, '_blank')}
      />
    </div>
  );
};

const MessageBubble = ({ msg, accent }) => {
  const isUser = msg.role === 'user';
  const isImage = msg.isImage;
  const accentMap = { emerald: 'from-emerald-500 to-teal-600', blue: 'from-blue-500 to-cyan-600', pink: 'from-pink-500 to-rose-600' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isUser
          ? `bg-gradient-to-br ${accentMap[accent]}`
          : 'border border-white/10'
        }`}
        style={!isUser ? { background: 'rgba(255,255,255,0.06)' } : {}}>
        {isUser ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white/70" />}
      </div>

      {/* Bubble */}
      <div className={`${isImage ? 'max-w-[450px] w-full' : 'max-w-[78%]'} ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <span className="text-[10px] text-white/25 px-1">{isUser ? 'You' : 'AI Assistant'}</span>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? `bg-gradient-to-br ${accentMap[accent]} text-white rounded-tr-sm`
              : 'text-white/85 rounded-tl-sm border border-white/8'
          }`}
          style={!isUser ? { background: 'rgba(255,255,255,0.05)' } : {}}
        >
          {msg.isImage ? (
            <div className="mt-2 rounded-xl overflow-hidden border border-white/10 bg-black/20 min-h-[200px] flex flex-col">
              <ImageWithLoader src={msg.content} alt={msg.prompt || "AI Generated"} />
              <div className="px-3 py-2 flex justify-between items-center bg-black/40 mt-auto">
                <span className="text-[10px] text-white/40 uppercase tracking-widest">ai generated image</span>
                <a 
                  href={msg.content} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[10px] text-pink-400 hover:text-pink-300 transition-colors"
                >
                  View Full Size
                </a>
              </div>
            </div>
          ) : msg.isCode ? (
            <CodeBlock content={msg.content} />
          ) : (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const TypingIndicator = ({ accent }) => {
  const accentColor = { emerald: 'bg-emerald-400', blue: 'bg-blue-400', pink: 'bg-pink-400' }[accent];
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-3">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/10 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <Bot size={14} className="text-white/70" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm border border-white/8 flex items-center gap-1.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
        {[0, 1, 2].map(i => (
          <motion.span key={i} className={`w-1.5 h-1.5 rounded-full ${accentColor}`}
            animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
        ))}
      </div>
    </motion.div>
  );
};

const AIChatInterface = ({ toolType = 'text' }) => {
  const meta = TOOL_META[toolType] || TOOL_META.text;
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Fetch all chats on mount
  useEffect(() => {
    fetchChatHistory();
  }, []);

  // Fetch messages when currentChatId changes
  useEffect(() => {
    if (currentChatId) {
      loadChatMessages(currentChatId);
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  const fetchChatHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data } = await axiosInstance.get(`/ai-chat?type=${toolType}`);
      setChats(data);
    } catch (err) {
      console.error('Failed to fetch chat history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadChatMessages = async (id) => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/ai-chat/${id}`);
      setMessages(data.messages);
    } catch (err) {
      console.error('Failed to load chat messages:', err);
      setError('Failed to load chat messages');
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setError('');
    if (window.innerWidth < 768) setShowHistory(false);
  };

  const deleteChat = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this chat history?')) return;
    try {
      await axiosInstance.delete(`/ai-chat/${id}`);
      setChats(prev => prev.filter(c => c._id !== id));
      if (currentChatId === id) startNewChat();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const prompt = input.trim();
    if (!prompt || loading) return;

    setInput('');
    setError('');
    
    // Optimistic update for user message
    const userMsg = { role: 'user', content: prompt, type: toolType };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // 1. Save user message to backend
      const { data: savedChat } = await axiosInstance.post('/ai-chat/message', {
        chatId: currentChatId,
        role: 'user',
        content: prompt,
        type: toolType
      });

      // Update currentChatId if it was a new chat
      if (!currentChatId) {
        setCurrentChatId(savedChat._id);
        setChats(prev => [savedChat, ...prev]);
      }

      // 2. Get AI response
      const { data } = await axiosInstance.post(ENDPOINT_MAP[toolType], { prompt });
      const aiContent = data.result || data.text || 'No response received.';
      
      // 3. Save AI message to backend
      await axiosInstance.post('/ai-chat/message', {
        chatId: savedChat._id,
        role: 'assistant',
        content: aiContent,
        type: toolType
      });

      // Update messages in UI
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: aiContent,
        isCode: toolType === 'code',
      }]);
      
      // Refresh chat list to update titles/dates
      fetchChatHistory();

    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Please try again.';
      setError(msg);
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const accentRing = { emerald: 'focus:ring-emerald-500/40', blue: 'focus:ring-blue-500/40', pink: 'focus:ring-pink-500/40' }[meta.accent];
  const accentBtn  = { emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/25', blue: 'from-blue-500 to-cyan-600 shadow-blue-500/25', pink: 'from-pink-500 to-rose-600 shadow-pink-500/25' }[meta.accent];

  return (
    <div className="flex h-full min-h-0 gap-6">
      {/* ─── Chat History Sidebar ─── */}
      <AnimatePresence>
        {(showHistory || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ opacity: 0, x: -20, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 280 }}
            exit={{ opacity: 0, x: -20, width: 0 }}
            className="flex flex-col h-full bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/60 font-semibold">
                <History size={16} />
                <span className="text-sm">History</span>
              </div>
              <button 
                onClick={startNewChat}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 transition-colors"
                title="New Chat"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {historyLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={20} className="text-white/20 animate-spin" />
                </div>
              ) : chats.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <p className="text-xs text-white/20">No history yet</p>
                </div>
              ) : (
                chats.map(chat => (
                  <div 
                    key={chat._id}
                    onClick={() => {
                      setCurrentChatId(chat._id);
                      if (window.innerWidth < 1024) setShowHistory(false);
                    }}
                    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                      currentChatId === chat._id 
                        ? 'bg-white/10 text-white' 
                        : 'text-white/40 hover:bg-white/5 hover:text-white/70'
                    }`}
                  >
                    <MessageSquare size={14} className="flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{chat.title}</p>
                      <p className="text-[10px] opacity-40 mt-0.5">
                        {new Date(chat.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <button 
                      onClick={(e) => deleteChat(e, chat._id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/20 text-white/20 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Main Chat Area ─── */}
      <div className="flex-1 flex flex-col h-full min-h-0">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowHistory(p => !p)}
              className="lg:hidden p-2 rounded-xl bg-white/5 text-white/40 hover:text-white transition-colors"
            >
              <History size={18} />
            </button>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-lg`}>
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{meta.label}</h2>
              <p className="text-xs text-white/30">{currentChatId ? 'Active Session' : 'New Chat'}</p>
            </div>
          </div>

          {!currentChatId && messages.length > 0 && (
              <span className="text-[10px] text-amber-400 px-2 py-1 rounded bg-amber-400/10 border border-amber-400/20">
                Unsaved Draft
              </span>
          )}
        </motion.div>

        {/* Message area */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar rounded-2xl border border-white/8 p-5 space-y-5 mb-4"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          {messages.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center gap-4 py-16">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-2xl opacity-60`}>
                <Sparkles size={28} className="text-white" />
              </div>
              <div>
                <p className="text-white/40 text-sm font-medium">Start a conversation</p>
                <p className="text-white/20 text-xs mt-1">Chat history will be saved automatically</p>
              </div>
            </motion.div>
          ) : (
            messages.map((msg, i) => (
              <MessageBubble 
                key={i} 
                msg={{ ...msg, isCode: msg.isCode || msg.type === 'code' }} 
                accent={meta.accent} 
              />
            ))
          )}
          <AnimatePresence>
            {loading && <TypingIndicator key="typing" accent={meta.accent} />}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 flex-shrink-0">
          <textarea
            ref={textareaRef}
            rows={2}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={meta.placeholder}
            disabled={loading}
            className={`flex-1 resize-none px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none focus:ring-2 ${accentRing} transition-all disabled:opacity-50 custom-scrollbar`}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <motion.button
            type="submit"
            disabled={!input.trim() || loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 rounded-xl bg-gradient-to-br ${accentBtn} text-white shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0`}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
};

export default AIChatInterface;
