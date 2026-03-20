import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LiveSupportChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, text: 'Hi there! I am your AI Placement Assistant. How can I help you today?', isBot: true }
    ]);

    const handleSend = () => {
        if (!message.trim()) return;

        // Add user message
        const newMsg = { id: Date.now(), text: message, isBot: false };
        setMessages([...messages, newMsg]);
        setMessage('');

        // Simulate bot response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: 'I am an AI assistant. This is a mockup response. Once hooked to the Gemini API, I will provide actual placement answers!',
                isBot: true
            }]);
        }, 1000);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 w-80 h-96 glass-panel rounded-2xl flex flex-col overflow-hidden border border-white/10 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-white">
                                <MessageCircle size={20} />
                                <span className="font-semibold">AI Assistant</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-[#0B0F19]/90">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`max-w-[80%] p-3 rounded-2xl ${msg.isBot ? 'bg-white/10 text-gray-200 self-start rounded-tl-sm' : 'bg-blue-600 text-white self-end rounded-tr-sm'}`}>
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-3 border-t border-white/10 bg-[#0B0F19] flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask me anything..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500"
                            />
                            <button
                                onClick={handleSend}
                                className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-full transition-colors flex items-center justify-center"
                            >
                                <Send size={18} className="translate-x-[1px]" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </motion.button>
        </div>
    );
};

export default LiveSupportChat;
