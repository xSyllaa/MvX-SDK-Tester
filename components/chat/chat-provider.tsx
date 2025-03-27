'use client';

import { createContext, useContext, useState, useEffect, type ReactNode, type ChangeEvent, type FormEvent, type MouseEvent as ReactMouseEvent, Dispatch, SetStateAction } from 'react';
import { type Message } from '@/src/types/chat';
import { useUser } from '@/hooks/use-user';

export interface ChatContextType {
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleSend: (directMessage?: string) => Promise<void>;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
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
      e.preventDefault();
      const newWidth = window.innerWidth - e.clientX;
      
      // Limiter la largeur
      const clampedWidth = Math.max(MIN_CHAT_WIDTH, Math.min(MAX_CHAT_WIDTH, newWidth));
      
      // Mettre à jour la largeur du chat
      setChatWidth(clampedWidth);
      
      // Mettre à jour la variable CSS pour le padding du contenu principal
      document.documentElement.style.setProperty('--content-padding-right', `${clampedWidth}px`);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    // Appliquer les styles pendant le redimensionnement
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  // Mettre à jour le padding du contenu principal quand le chat est visible/caché
  useEffect(() => {
    const padding = isChatVisible ? `${chatWidth}px` : '0px';
    document.documentElement.style.setProperty('--content-padding-right', padding);
    
    return () => {
      document.documentElement.style.removeProperty('--content-padding-right');
    };
  }, [isChatVisible, chatWidth]);

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

      // Ajouter un message vide pour l'assistant
      const assistantMessage: Message = {
        role: 'assistant',
        content: ''
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Préparer le corps de la requête avec l'historique complet
      const requestBody = {
        message: messageToSend,
        contextType: context || 'landing',
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      };

      console.log('[Chat] Sending request with body:', requestBody);

      // Appeler l'API avec streaming
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

      // Lire le stream de la réponse
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }

          // Décoder le chunk et l'ajouter à la réponse accumulée
          const chunk = decoder.decode(value, { stream: true });
          accumulatedResponse += chunk;

          // Mettre à jour le dernier message (celui de l'assistant)
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              role: 'assistant',
              content: accumulatedResponse
            };
            return newMessages;
          });
        }
      }

      console.log('[Chat] Message sent and response received successfully');

    } catch (err: any) {
      console.error('[Chat] Error:', err);
      setError(err.message || 'Échec de l\'envoi du message. Veuillez réessayer.');
      
      // Retirer les messages en cas d'erreur
      setMessages(prev => prev.slice(0, -2));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await handleSend();
  };

  const hideChat = () => {
    setIsChatVisible(false);
  };

  const showChat = () => {
    setIsChatVisible(true);
  };

  const startResizing = (e: ReactMouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsResizing(true);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        input,
        setInput,
        handleInputChange,
        handleSubmit,
        handleSend,
        isLoading,
        setIsLoading,
        error,
        setError,
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