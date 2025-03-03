'use client';

import { useState, useRef, useEffect, type RefObject, type Dispatch, type SetStateAction } from 'react';
import { Message, continueConversation } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Bot, Send, User, Loader2, Minimize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { readStreamableValue } from 'ai/rsc';
import { useChat } from './chat-provider';

interface ChatContentProps {
  messages: Message[];
  error: string | null;
  isLoading: boolean;
  scrollRef: RefObject<HTMLDivElement>;
}

interface ChatInputProps {
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  handleSend: () => Promise<void>;
  isLoading: boolean;
  inputRef: RefObject<HTMLInputElement>;
}

export function ChatInterface({ context }: { context?: string }) {
  const { isChatVisible, hideChat } = useChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Faire défiler vers le bas lorsque de nouveaux messages arrivent
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Effacer l'erreur après 5 secondes
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    try {
      setError(null);
      setIsLoading(true);
      
      // Ajouter le message de l'utilisateur
      const userMessage: Message = { role: 'user', content: trimmedInput };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput('');

      // Obtenir la réponse de l'IA avec streaming
      const { messages: historyMessages, newMessage } = await continueConversation(updatedMessages);
      
      let textContent = '';
      for await (const delta of readStreamableValue(newMessage)) {
        textContent = `${textContent}${delta}`;
        setMessages([
          ...historyMessages,
          { role: 'assistant', content: textContent }
        ]);
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      setError(error.message || "Une erreur s'est produite");
      
      // Ajouter un message d'erreur dans le chat
      const errorMessage: Message = {
        role: 'assistant',
        content: `⚠️ ${error.message || "Désolé, une erreur s'est produite. Veuillez réessayer."}`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Interface mobile flottante
  const mobileInterface = (
    <div className={cn(
      "lg:hidden fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out",
      isMobileExpanded ? "w-[calc(100%-2rem)] h-[80vh]" : "w-[60px]"
    )}>
      {!isMobileExpanded ? (
        <Button
          onClick={() => setIsMobileExpanded(true)}
          className="w-[60px] h-[60px] rounded-full shadow-lg hover:shadow-xl transition-shadow"
          size="icon"
        >
          <Bot className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="flex flex-col h-full shadow-lg">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <div className="rounded-full bg-gradient-to-br from-violet-500 to-indigo-500">
                  <Bot className="h-5 w-5 text-white m-1.5" />
                </div>
              </Avatar>
              <div>
                <h3 className="font-semibold">Assistant SDK</h3>
                <p className="text-xs text-muted-foreground">Powered by Google AI</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsMobileExpanded(false)}
            >
              <Minimize2 className="h-5 w-5" />
            </Button>
          </div>
          <ChatContent
            messages={messages}
            error={error}
            isLoading={isLoading}
            scrollRef={scrollRef}
          />
          <ChatInput
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            isLoading={isLoading}
            inputRef={inputRef}
          />
        </Card>
      )}
    </div>
  );

  // Interface desktop intégrée
  const desktopInterface = isChatVisible && (
    <div className={cn(
      "hidden lg:flex flex-col border-l bg-background shadow-lg",
      "fixed top-[4rem] right-0 bottom-0 w-[400px]",
      "transition-transform duration-300",
      !isChatVisible && "translate-x-full"
    )}>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <div className="rounded-full bg-gradient-to-br from-violet-500 to-indigo-500">
              <Bot className="h-5 w-5 text-white m-1.5" />
            </div>
          </Avatar>
          <div>
            <h3 className="font-semibold">Assistant SDK</h3>
            <p className="text-xs text-muted-foreground">Powered by Google AI</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={hideChat}
          className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatContent
          messages={messages}
          error={error}
          isLoading={isLoading}
          scrollRef={scrollRef}
        />
      </div>
      <ChatInput
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        isLoading={isLoading}
        inputRef={inputRef}
      />
    </div>
  );

  return (
    <>
      {mobileInterface}
      {desktopInterface}
    </>
  );
}

// Composant pour le contenu du chat
function ChatContent({ messages, error, isLoading, scrollRef }: ChatContentProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-2 rounded">
            {error}
          </div>
        )}
        
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            <Bot className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p>Comment puis-je vous aider avec le SDK ?</p>
          </div>
        )}
        
        {messages.map((message: Message, i: number) => (
          <div
            key={i}
            className={cn(
              "flex items-start space-x-2.5",
              message.role === 'user' ? "flex-row-reverse space-x-reverse" : "flex-row"
            )}
          >
            <Avatar className="h-8 w-8 mt-0.5">
              <div className={cn(
                "rounded-full",
                message.role === 'user' 
                  ? "bg-gradient-to-br from-blue-500 to-cyan-500"
                  : "bg-gradient-to-br from-violet-500 to-indigo-500"
              )}>
                {message.role === 'user' 
                  ? <User className="h-5 w-5 text-white m-1.5" />
                  : <Bot className="h-5 w-5 text-white m-1.5" />
                }
              </div>
            </Avatar>
            <div
              className={cn(
                "rounded-lg px-3 py-2 max-w-[85%]",
                message.role === 'user' 
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-center space-x-2.5">
            <Avatar className="h-8 w-8">
              <div className="rounded-full bg-gradient-to-br from-violet-500 to-indigo-500">
                <Bot className="h-5 w-5 text-white m-1.5" />
              </div>
            </Avatar>
            <div className="rounded-lg px-3 py-2 bg-muted">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

// Composant pour la zone de saisie
function ChatInput({ input, setInput, handleSend, isLoading, inputRef }: ChatInputProps) {
  return (
    <div className="p-4 border-t bg-background">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex space-x-2"
      >
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isLoading ? "Envoi en cours..." : "Posez une question sur le SDK..."}
          disabled={isLoading}
          className={cn(
            "flex-1",
            isLoading && "opacity-50"
          )}
        />
        <Button 
          type="submit" 
          disabled={isLoading || !input.trim()} 
          size="icon"
          className={cn(
            "shrink-0",
            isLoading && "opacity-50"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </form>
    </div>
  );
}