import React, { createContext, useState, useContext, useEffect } from 'react';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('interviewSessions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse interview sessions", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('interviewSessions', JSON.stringify(sessions));
  }, [sessions]);

  const addSession = (session) => {
    const newSession = { 
      ...session, 
      id: Date.now(), 
      date: new Date().toISOString() 
    };
    setSessions(prev => [newSession, ...prev]);
  };

  const deleteSession = (id) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <ChatContext.Provider value={{ sessions, addSession, deleteSession }}>
      {children}
    </ChatContext.Provider>
  );
};