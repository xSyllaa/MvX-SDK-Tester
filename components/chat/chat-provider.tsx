'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type ChatContextType = {
  isChatVisible: boolean;
  toggleChat: () => void;
  showChat: () => void;
  hideChat: () => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isChatVisible, setIsChatVisible] = useState(true);

  // Ajuster la marge du contenu principal en fonction de la visibilité du chat
  useEffect(() => {
    const content = document.querySelector('.flex-1.flex.justify-center');
    if (content) {
      content.classList.toggle('lg:pr-[400px]', isChatVisible);
    }
  }, [isChatVisible]);

  const toggleChat = () => setIsChatVisible(prev => !prev);
  const showChat = () => setIsChatVisible(true);
  const hideChat = () => setIsChatVisible(false);

  return (
    <ChatContext.Provider value={{ isChatVisible, toggleChat, showChat, hideChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
} 