'use client';

import { createContext, useContext, useState, useEffect, type ReactNode, type Dispatch, type SetStateAction, type ChangeEvent, type FormEvent, type MouseEvent as ReactMouseEvent } from 'react';
import { type Message } from '@/app/actions';
import { continueConversation } from '@/app/actions';
import { readStreamableValue } from 'ai/rsc';

export interface ChatContextType {
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleSend: (message?: string) => Promise<void>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  context: string;
  setContext: Dispatch<SetStateAction<string>>;
  isChatVisible: boolean;
  chatWidth: number;
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
  const [chatWidth, setChatWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSend = async (directMessage?: string) => {
    const messageToSend = directMessage || input.trim();
    if (!messageToSend || isLoading) return;

    try {
      setError(null);
      setIsLoading(true);
      
      // Créer le message utilisateur
      const userMessage = { 
        role: 'user' as const, 
        content: messageToSend 
      };
      
      // Préparer les messages pour l'API avec le contexte si nécessaire
      let messagesToSend = [...messages];
      
      // Ajouter le contexte au début s'il n'a pas déjà été ajouté
      if (context) {
        messagesToSend = [
          { role: 'system' as const, content: context },
          ...messagesToSend
        ];
      }
      
      // Ajouter le message utilisateur
      messagesToSend.push(userMessage);

      // Mettre à jour l'UI avec le message utilisateur et vider l'input
      if (!directMessage) {
        setInput('');
      }
      setMessages(prev => [...prev, userMessage]);

      // Ajouter un message vide pour l'assistant
      const assistantMessage = { role: 'assistant' as const, content: '' };
      setMessages(prev => [...prev, assistantMessage]);

      // Obtenir la réponse de l'IA avec streaming
      const { newMessage } = await continueConversation(messagesToSend);
      
      let textContent = '';
      let lastUpdate = Date.now();

      for await (const delta of readStreamableValue(newMessage)) {
        textContent = `${textContent}${delta}`;
        
        // Mettre à jour plus fréquemment pour une meilleure fluidité
        const now = Date.now();
        if (now - lastUpdate > 50) {
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              role: 'assistant',
              content: textContent
            };
            return newMessages;
          });
          lastUpdate = now;
        }
      }

      // Mise à jour finale
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'assistant',
          content: textContent
        };
        return newMessages;
      });
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || "An error occurred");
      
      const errorMessage = {
        role: 'assistant' as const,
        content: `⚠️ ${err.message || "Sorry, an error occurred. Please try again."}`
      };
      setMessages(prev => [...prev, errorMessage]);
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
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = chatWidth;

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (!isResizing) return;
      const newWidth = startWidth + (e.clientX - startX);
      setChatWidth(Math.max(300, Math.min(800, newWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
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