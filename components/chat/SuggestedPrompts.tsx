'use client';

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChat } from "./chat-provider";
import { SUGGESTED_PROMPTS, type SuggestedPrompt } from "@/data/suggested-prompts";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export function SuggestedPrompts() {
  const { handleSend } = useChat();
  const pathname = usePathname();

  // Déterminer la catégorie en fonction du chemin
  const getCategory = (path: string): 'landing' | 'analyzer' | 'repo' => {
    if (path.includes('/analyzer')) return 'analyzer';
    if (path.includes('/repo')) return 'repo';
    return 'landing';
  };

  const category = getCategory(pathname);

  // Sélectionner les prompts à afficher
  const selectedPrompts = useMemo(() => {
    // Filtrer les prompts par catégorie
    const categoryPrompts = SUGGESTED_PROMPTS.filter(prompt => prompt.category === category);
    
    // Sélectionner les prompts principaux
    const mainPrompts = categoryPrompts.filter(prompt => prompt.isMain);
    
    // Sélectionner un prompt aléatoire parmi les non-principaux
    const otherPrompts = categoryPrompts.filter(prompt => !prompt.isMain);
    const randomPrompt = otherPrompts[Math.floor(Math.random() * otherPrompts.length)];
    
    // Combiner les prompts principaux avec le prompt aléatoire
    return [...mainPrompts, randomPrompt].slice(0, 3);
  }, [category]);

  const handlePromptClick = async (prompt: SuggestedPrompt) => {
    await handleSend(prompt.text);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-4">
      {selectedPrompts.map((prompt, index) => (
        <Button
          key={index}
          variant="outline"
          className={cn(
            "h-auto py-2 px-3 text-sm text-left whitespace-normal",
            "hover:bg-primary hover:text-primary-foreground transition-colors"
          )}
          onClick={() => handlePromptClick(prompt)}
        >
          {prompt.text}
        </Button>
      ))}
    </div>
  );
} 