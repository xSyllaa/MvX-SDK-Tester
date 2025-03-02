'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, aiManager } from '@/lib/google-ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Bot, Send, User, Loader2, ChevronDown, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatInterface({ context }: { context?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Faire défiler vers le bas lorsque de nouveaux messages arrivent
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    try {
      setIsLoading(true);
      // Ajouter le message de l'utilisateur
      const userMessage: Message = { role: 'user', content: input };
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      // Obtenir la réponse de l'IA
      const response = await aiManager.sendMessage(input, context);
      
      // Ajouter la réponse de l'assistant
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erreur:', error);
      // Ajouter un message d'erreur
      const errorMessage: Message = {
        role: 'assistant',
        content: "Désolé, une erreur s'est produite. Veuillez réessayer."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out",
      isExpanded ? "w-[400px]" : "w-[60px]"
    )}>
      {/* Bouton flottant quand minimisé */}
      {!isExpanded && (
        <Button
          onClick={toggleExpand}
          className="w-[60px] h-[60px] rounded-full shadow-lg hover:shadow-xl transition-shadow"
          size="icon"
        >
          <Bot className="h-6 w-6" />
        </Button>
      )}

      {/* Interface de chat quand développé */}
      {isExpanded && (
        <Card className="flex flex-col h-[600px] shadow-lg">
          {/* En-tête */}
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
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={toggleExpand}
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Zone de messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  <Bot className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p>Comment puis-je vous aider avec le SDK ?</p>
                </div>
              )}
              {messages.map((message, i) => (
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

          {/* Zone de saisie */}
          <div className="p-4 border-t">
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
                placeholder="Posez une question sur le SDK..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={isLoading} 
                size="icon"
                className="shrink-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </Card>
      )}
    </div>
  );
} 