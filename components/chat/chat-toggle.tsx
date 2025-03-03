'use client';

import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import { useChat } from "./chat-provider";
import { cn } from "@/lib/utils";

export function ChatToggle() {
  const { isChatVisible, toggleChat } = useChat();

  return (
    <Button
      onClick={toggleChat}
      size="icon"
      variant="outline"
      className={cn(
        "fixed z-50 transition-all duration-300",
        "h-10 w-10 rounded-full shadow-lg hover:shadow-xl",
        isChatVisible
          ? "bottom-4 right-[420px]"
          : "bottom-4 right-4",
        isChatVisible && "bg-primary hover:bg-primary text-primary-foreground hover:text-primary-foreground"
      )}
    >
      {isChatVisible ? (
        <X className="h-4 w-4" />
      ) : (
        <MessageCircle className="h-4 w-4" />
      )}
    </Button>
  );
} 