'use client';

import { memo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SUGGESTED_PROMPTS } from '@/data/suggested-prompts';
import { useChat } from './chat-provider';
import { usePathname } from 'next/navigation';

export const SuggestedPrompts = memo(function SuggestedPrompts() {
  const { handleSend } = useChat();
  const pathname = usePathname();
  const [selectedPrompts, setSelectedPrompts] = useState<typeof SUGGESTED_PROMPTS>([]);

  useEffect(() => {
    // Filtrer les prompts en fonction de la page actuelle
    const currentPrompts = SUGGESTED_PROMPTS.filter(prompt => {
      if (pathname === '/') return prompt.category === 'landing';
      if (pathname.includes('/analyzer')) return prompt.category === 'analyzer';
      if (pathname.includes('/repo')) return prompt.category === 'repo';
      return false;
    });

    // Sélectionner 3 prompts aléatoires
    const randomPrompts = [...currentPrompts]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    setSelectedPrompts(randomPrompts);
  }, [pathname]);

  // Afficher un état initial vide pendant le rendu côté serveur
  if (selectedPrompts.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-2 mt-4 px-4">
      <div className="grid grid-cols-1 gap-2 max-w-[80%]">
        {selectedPrompts.map((prompt, index) => (
          <Button
            key={`${pathname}-${prompt.text}-${index}`}
            variant="outline"
            className="text-sm text-left h-auto py-2 px-3 whitespace-normal break-words"
            onClick={() => handleSend(prompt.text)}
          >
            {prompt.text}
          </Button>
        ))}
      </div>
    </div>
  );
}); 