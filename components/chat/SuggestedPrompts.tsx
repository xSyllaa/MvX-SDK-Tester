'use client';

import { Button } from "@/components/ui/button";
import { useChat } from "./chat-provider";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function SuggestedPrompts() {
  const { setInput, handleSend } = useChat();
  const pathname = usePathname();
  const [prompts, setPrompts] = useState<string[]>([]);

  // Mettre à jour les prompts en fonction de la page
  useEffect(() => {
    let pagePrompts: string[];
    
    if (pathname.match(/^\/analyzer\/[^/]+$/)) {
      pagePrompts = [
        "Can you explain this SDK's structure?",
        "How do I integrate this SDK?",
        "What are the main features of this SDK?",
        "Show me some code examples",
        "What are the best practices for this SDK?",
        "How do I handle errors with this SDK?"
      ];
    } else if (pathname === '/analyzer') {
      pagePrompts = [
        "What SDKs are available?",
        "How do I choose the right SDK?",
        "What's the difference between SDKs?",
        "Show me the most popular SDKs",
        "How do I get started with MultiversX SDKs?",
        "What are the SDK categories?"
      ];
    } else {
      pagePrompts = [
        "What can this platform do?",
        "How do I analyze an SDK?",
        "Show me how to test endpoints",
        "What features are available?",
        "How do I get started?",
        "Tell me about MultiversX SDKs"
      ];
    }
    
    setPrompts(prompts => {
      // Ne mettre à jour que si les prompts sont différents
      if (JSON.stringify(prompts) !== JSON.stringify(pagePrompts)) {
        return pagePrompts;
      }
      return prompts;
    });
  }, [pathname]);

  // Sélectionner 3 prompts aléatoires
  const selectedPrompts = prompts
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    handleSend();
  };

  return (
    <div className="flex flex-col gap-2 mt-4">
      {selectedPrompts.map((prompt, index) => (
        <Button
          key={`${pathname}-${prompt}-${index}`}
          variant="outline"
          className="text-sm"
          onClick={() => handlePromptClick(prompt)}
        >
          {prompt}
        </Button>
      ))}
    </div>
  );
} 