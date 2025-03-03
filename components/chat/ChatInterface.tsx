'use client';

import { useState, useRef, useEffect, type RefObject, type Dispatch, type SetStateAction } from 'react';
import { Message, continueConversation } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Bot, Send, User, Loader2, Minimize2, X, Info, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { readStreamableValue } from 'ai/rsc';
import { useChat } from './chat-provider';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { rust } from '@codemirror/lang-rust';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { php } from '@codemirror/lang-php';
import { sql } from '@codemirror/lang-sql';
import { xml } from '@codemirror/lang-xml';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { EditorView } from '@codemirror/view';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

export function ChatInterface() {
  const { 
    messages, 
    setMessages, 
    input, 
    setInput, 
    handleInputChange, 
    handleSubmit, 
    isLoading,
    setIsLoading,
    error,
    setError,
    context,
    isChatVisible,
    chatWidth,
    hideChat,
    startResizing
  } = useChat();
  const [isOpen, setIsOpen] = useState(true);
  const [currentContext, setCurrentContext] = useState<string>();
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [hasAddedContext, setHasAddedContext] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mettre à jour le contexte local quand le contexte global change
  useEffect(() => {
    setCurrentContext(context);
  }, [context]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    try {
      setError(null);
      setIsLoading(true);
      
      // Créer le message utilisateur
      const userMessage = { 
        role: 'user' as const, 
        content: trimmedInput 
      };
      
      // Préparer les messages pour l'API avec le contexte si nécessaire
      let messagesToSend = [...messages, userMessage];
      if (context && !hasAddedContext) {
        messagesToSend = [
          { role: 'system' as const, content: context },
          ...messagesToSend
        ];
        setHasAddedContext(true);
      }

      // Mettre à jour l'UI avec le message utilisateur et vider l'input
      setInput('');
      setMessages(prev => [...prev, userMessage]);

      // Obtenir la réponse de l'IA avec streaming
      const { newMessage } = await continueConversation(messagesToSend);
      
      let textContent = '';
      let lastUpdate = Date.now();
      const assistantMessage = { role: 'assistant' as const, content: '' };
      setMessages(prev => [...prev, assistantMessage]);

      for await (const delta of readStreamableValue(newMessage)) {
        textContent = `${textContent}${delta}`;
        
        // Limiter les mises à jour de l'UI à une fois toutes les 100ms pour de meilleures performances
        const now = Date.now();
        if (now - lastUpdate > 100) {
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

  // Reset hasAddedContext when context changes
  useEffect(() => {
    setHasAddedContext(false);
  }, [context]);

  const contextDisplay = context ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <Info className="h-3.5 w-3.5" />
            <span className="font-bold">Context:</span>
            <span className="truncate max-w-[200px]">{context.slice(0, 50)}...</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[500px] max-h-[300px] overflow-y-auto p-4 bg-secondary z-[200]">
          <p className="text-sm whitespace-pre-wrap">{context}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : null;

  // Mobile floating interface
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
          <Bot className="h-12 w-12 dark:text-black text-white" />
        </Button>
      ) : (
        <Card className="flex flex-col h-full shadow-lg">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <div className="rounded-full dark:bg-white bg-black">
                  <Bot className="h-5 w-5 m-1.5 dark:text-black text-white" />
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

  // Desktop integrated interface
  const desktopInterface = isChatVisible && (
    <div className={cn(
      "hidden lg:flex flex-col border bg-background shadow-lg",
      "fixed top-[4rem] right-0 bottom-0",
      "transition-transform duration-300 z-50",
      !isChatVisible && "translate-x-full"
    )}
    style={{ width: `${chatWidth}px` }}
    >
      <div 
        className="absolute left-[-6px] top-0 bottom-0 w-3 cursor-ew-resize hover:bg-primary/20 group z-[50]"
        onMouseDown={startResizing}
      >
        <div className="absolute left-[5px] top-0 bottom-0 w-[2px] bg-border group-hover:bg-primary/50 group-active:bg-primary" />
      </div>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <div className="rounded-full dark:bg-white bg-black">
              <Bot className="h-5 w-5 m-1.5 dark:text-black text-white" />
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
      {contextDisplay}
      <div className="flex-1 overflow-hidden border-t">
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

// Chat content component
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
            <Bot className="h-16 w-16 mx-auto mb-3 dark:text-black text-white dark:bg-white bg-black rounded-full p-3" />
            <p>How can I help you with the SDK?</p>
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
                "rounded-full dark:bg-white bg-black"
              )}>
                {message.role === 'user' 
                  ? <User className="h-6 w-6 m-1 dark:text-black text-white" />
                  : <Bot className="h-6 w-6 m-1 dark:text-black text-white" />
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
              {message.role === 'user' ? (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      pre: ({ children }) => <>{children}</>,
                      code: (props) => {
                        const { className, children } = props;
                        const match = /language-(\w+)/.exec(className || '');
                        const language = match ? match[1] : undefined;
                        const isInline = !className;
                        
                        if (isInline) {
                          return <code className="bg-secondary px-1 py-0.5 rounded text-sm">{children}</code>;
                        }
                        
                        return <CodeBlock code={String(children).replace(/\n$/, '')} language={language} />;
                      }
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-center space-x-2.5">
            <Avatar className="h-8 w-8">
              <div className="rounded-full dark:bg-white bg-black">
                <Bot className="h-6 w-6 m-1 dark:text-black text-white" />
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

// Input component
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
          placeholder={isLoading ? "Sending..." : "Ask a question about the SDK..."}
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

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getLanguageExtension = (lang?: string) => {
    switch (lang?.toLowerCase()) {
      case 'javascript':
      case 'js':
        return javascript();
      case 'typescript':
      case 'ts':
        return javascript({ typescript: true });
      case 'python':
      case 'py':
        return python();
      case 'rust':
        return rust();
      case 'cpp':
      case 'c++':
        return cpp();
      case 'java':
        return java();
      case 'php':
        return php();
      case 'sql':
        return sql();
      case 'xml':
      case 'html':
        return xml();
      case 'json':
        return json();
      case 'markdown':
      case 'md':
        return markdown();
      default:
        return javascript();
    }
  };

  return (
    <div className="rounded-md overflow-hidden my-2 border border-border">
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
        <div className="text-sm text-muted-foreground">
          {language || 'javascript'}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleCopy}
        >
          {isCopied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="p-4 bg-muted/50">
        <CodeMirror
          value={code}
          height="auto"
          theme="dark"
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: false,
            highlightActiveLine: false,
            foldGutter: false,
          }}
          editable={false}
          extensions={[
            getLanguageExtension(language),
            EditorView.lineWrapping,
            EditorView.theme({
              "&": {
                backgroundColor: "transparent !important"
              },
              ".cm-gutters": {
                backgroundColor: "transparent !important",
                border: "none"
              }
            })
          ]}
        />
      </div>
    </div>
  );
}