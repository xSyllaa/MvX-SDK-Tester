'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type ChatContextType = {
  isChatVisible: boolean;
  chatWidth: number;
  toggleChat: () => void;
  showChat: () => void;
  hideChat: () => void;
  startResizing: (e: React.MouseEvent) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const MIN_CHAT_WIDTH = 300;
const MAX_CHAT_WIDTH = 800;
const DEFAULT_CHAT_WIDTH = 400;

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [chatWidth, setChatWidth] = useState(DEFAULT_CHAT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const content = document.querySelector('.flex-1.flex.justify-center');
    if (content && isChatVisible) {
      content.classList.remove('lg:pr-[400px]');
      (content as HTMLElement).style.paddingRight = `${chatWidth}px`;
    } else if (content) {
      content.classList.remove('lg:pr-[400px]');
      (content as HTMLElement).style.paddingRight = '0px';
    }
  }, [isChatVisible, chatWidth]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= MIN_CHAT_WIDTH && newWidth <= MAX_CHAT_WIDTH) {
        setChatWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const toggleChat = () => setIsChatVisible(prev => !prev);
  const showChat = () => setIsChatVisible(true);
  const hideChat = () => setIsChatVisible(false);

  return (
    <ChatContext.Provider value={{ 
      isChatVisible, 
      chatWidth,
      toggleChat, 
      showChat, 
      hideChat,
      startResizing
    }}>
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