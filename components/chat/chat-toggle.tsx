'use client';

import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { useChat } from "./chat-provider";

export function ChatToggle() {
  const { isChatVisible, showChat } = useChat();

  if (isChatVisible) return null;

  return (
    <Button
      onClick={showChat}
      className="fixed bottom-4 right-4 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-white bg-black p-0 flex items-center justify-center"
      size="icon"
      variant="default"
    >
      <Bot className="!h-8 !w-8 dark:text-black text-white" strokeWidth={2} />
    </Button>
  );
} 