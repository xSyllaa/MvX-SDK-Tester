import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialiser l'API Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Type pour les messages
export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

// Classe pour gérer les conversations
export class AIConversationManager {
  private model;
  private chat;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    this.chat = this.model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });
  }

  async sendMessage(message: string, context?: string): Promise<string> {
    try {
      // Si un contexte est fourni, l'ajouter au message
      const fullMessage = context 
        ? `[Contexte: ${context}]\n\nMessage: ${message}`
        : message;

      const result = await this.chat.sendMessage(fullMessage);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw new Error('Erreur lors de la communication avec l\'IA');
    }
  }
}

// Singleton instance
export const aiManager = new AIConversationManager(); 