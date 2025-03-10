"use server";

import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";

export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function continueConversation(history: Message[]) {
  // Directive use server avec options
  "use server";
  
  const stream = createStreamableValue();
  const model = google("models/gemini-1.5-pro-latest");

  console.log('Received messages in continueConversation:', history);

  // Séparer le contexte système des autres messages
  const systemMessage = history.find(msg => msg.role === 'system');
  const conversationMessages = history.filter(msg => msg.role !== 'system');

  // Si nous avons un message système, l'ajouter comme premier message
  const processedMessages = systemMessage 
    ? [systemMessage, ...conversationMessages]
    : conversationMessages;

  console.log('Processed messages:', processedMessages);

  (async () => {
    try {
      const { textStream } = await streamText({
        model: model,
        messages: processedMessages,
      });

      for await (const text of textStream) {
        stream.update(text);
      }
      stream.done();
    } catch (error) {
      console.error('Erreur lors du streaming:', error);
      stream.error(error);
    }
  })().catch(console.error);

  return {
    messages: history,
    newMessage: stream.value,
  };
} 