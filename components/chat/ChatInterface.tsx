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
import { SuggestedPrompts } from "./SuggestedPrompts";
import { getLandingContext, getAnalyzerContext, getRepoContext, generateFullContext } from "@/data/chat-contexts";
import { usePathname } from "next/navigation";

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
    handleSend,
    isLoading,
    setIsLoading,
    error,
    setError,
    context,
    isChatVisible,
    chatWidth,
    hideChat,
    showChat,
    startResizing
  } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  // Set chat width CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--chat-width',
      isChatVisible ? `${chatWidth}px` : '0px'
    );
    return () => {
      document.documentElement.style.removeProperty('--chat-width');
    };
  }, [isChatVisible, chatWidth]);

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

  const contextDisplay = (
    <div className="px-4 py-2 border-b">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              role="button"
              tabIndex={0}
              className="w-full flex items-center justify-start gap-2 text-xs text-muted-foreground hover:text-foreground py-2 cursor-pointer"
            >
              <Info className="h-3.5 w-3.5 shrink-0" />
              <span className="font-bold shrink-0">Context:</span>
              <span className="truncate">{context || "No context"}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent 
            side="bottom" 
            sideOffset={5}
            className="max-w-[500px] max-h-[300px] overflow-y-auto p-4 bg-popover border-2 border-border shadow-lg z-[200]"
          >
            <p className="text-sm whitespace-pre-wrap">{context || "No context defined"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  // Mobile floating interface
  const mobileInterface = (
    <div className={cn(
      "lg:hidden fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out",
      isMobileExpanded ? "w-[calc(100%-2rem)] h-[80vh]" : "w-[60px]"
    )}>
      {!isMobileExpanded ? (
        <Button
          onClick={() => {
            setIsMobileExpanded(true);
            showChat();
          }}
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
            <SuggestedPrompts />
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
                      pre: ({ children }) => <div className="border border-border rounded-md overflow-hidden my-2">{children}</div>,
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
                    {message.content || (isLoading && message.role === 'assistant' ? '...' : '') || ''}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
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