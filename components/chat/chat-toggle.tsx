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
      className="fixed bottom-4 right-4 w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
      size="icon"
      variant="default"
    >
      <Bot className="h-6 w-6" />
    </Button>
  );
} 