'use client';

import { createContext, useContext, useState, useEffect, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import { type Message } from '@/app/actions';

type ChatContextType = {
  isChatVisible: boolean;
  chatWidth: number;
  context?: string;
  toggleChat: () => void;
  showChat: () => void;
  hideChat: () => void;
  startResizing: (e: React.MouseEvent) => void;
  setContext: (context: string) => void;
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const MIN_CHAT_WIDTH = 300;
const MAX_CHAT_WIDTH = 800;
const DEFAULT_CHAT_WIDTH = 400;

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [chatWidth, setChatWidth] = useState(DEFAULT_CHAT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [context, setContext] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);

    try {
      const userMessage = { role: 'user' as const, content: input.trim() };
      setMessages(prev => [...prev, userMessage]);
      setInput("");

      // Simuler une réponse de l'assistant (à remplacer par votre logique d'API)
      setTimeout(() => {
        const assistantMessage = {
          role: 'assistant' as const,
          content: "Je suis là pour vous aider avec l'analyse des SDKs."
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
      setIsLoading(false);
    }
  };

  const updateContext = (newContext: string) => {
    if (newContext !== context) {
      setContext(newContext);
      setMessages([]);
    }
  };

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
      context,
      toggleChat,
      showChat,
      hideChat,
      startResizing,
      setContext: updateContext,
      messages,
      setMessages,
      input,
      setInput,
      handleInputChange,
      handleSubmit,
      isLoading,
      setIsLoading,
      error,
      setError
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