'use client';

import { createContext, useContext, useState, useEffect, type ReactNode, type ChangeEvent, type FormEvent, type MouseEvent as ReactMouseEvent } from 'react';
import { type Message } from '@/src/types/chat';
import { useUser } from '@/hooks/use-user';

export interface ChatContextType {
  messages: Message[];
  input: string;
  setInput: (input: string) => void;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleSend: (directMessage?: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  context: string;
  setContext: (context: string) => void;
  isChatVisible: boolean;
  chatWidth: number;
  setChatWidth: (width: number) => void;
  isResizing: boolean;
  setIsResizing: (isResizing: boolean) => void;
  hideChat: () => void;
  showChat: () => void;
  startResizing: (e: ReactMouseEvent<HTMLDivElement>) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const MIN_CHAT_WIDTH = 300;
const MAX_CHAT_WIDTH = 800;
const DEFAULT_CHAT_WIDTH = 400;

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState("");
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [chatWidth, setChatWidth] = useState(DEFAULT_CHAT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const { isAuthenticated, userData } = useUser();

  // Gérer le redimensionnement
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculer la nouvelle largeur en fonction de la distance depuis le bord droit de l'écran
      let newWidth = window.innerWidth - e.clientX;
      
      // Limiter la largeur
      if (newWidth < MIN_CHAT_WIDTH) newWidth = MIN_CHAT_WIDTH;
      if (newWidth > MAX_CHAT_WIDTH) newWidth = MAX_CHAT_WIDTH;
      
      setChatWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSend = async (directMessage?: string) => {
    const messageToSend = directMessage || input.trim();
    if (!messageToSend || isLoading) return;

    console.log('[Chat] Attempting to send message. Auth state:', {
      userData,
      isAuthenticated
    });

    if (!isAuthenticated) {
      console.log('[Chat] User not authenticated');
      setError('Vous devez être connecté pour utiliser le chatbot.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      console.log('[Chat] Sending message:', messageToSend);

      // Ajouter le message utilisateur immédiatement
      const userMessage: Message = {
        role: 'user',
        content: messageToSend
      };
      
      setMessages(prev => [...prev, userMessage]);
      if (!directMessage) {
        setInput('');
      }

      // Préparer le corps de la requête avec l'historique complet
      const requestBody = {
        message: messageToSend,
        contextType: context || 'landing',
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content // Utiliser content au lieu de parts
        }))
      };

      console.log('[Chat] Sending request with body:', requestBody);

      // Appeler l'API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de la réponse');
      }

      const data = await response.json();
      
      // Ajouter la réponse de l'assistant
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response
      };

      setMessages(prev => [...prev, assistantMessage]);

      console.log('[Chat] Message sent and response received successfully');

    } catch (err: any) {
      console.error('[Chat] Error:', err);
      setError(err.message || 'Échec de l\'envoi du message. Veuillez réessayer.');
      
      // Retirer le message utilisateur en cas d'erreur
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await handleSend();
  };

  const hideChat = () => setIsChatVisible(false);
  const showChat = () => setIsChatVisible(true);

  const startResizing = (e: ReactMouseEvent<HTMLDivElement>) => {
    setIsResizing(true);
    e.preventDefault();
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        input,
        setInput,
        handleInputChange,
        handleSubmit,
        handleSend,
        isLoading,
        error,
        context,
        setContext,
        isChatVisible,
        chatWidth,
        setChatWidth,
        isResizing,
        setIsResizing,
        hideChat,
        showChat,
        startResizing
      }}
    >
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