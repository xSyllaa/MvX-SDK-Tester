// Type pour les messages
export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

// Type pour les erreurs de l'API
export type APIError = {
  error: string;
  details?: string;
};

// Classe pour gérer les conversations
export class AIConversationManager {
  private readonly timeout = 30000; // 30 secondes

  async sendMessage(message: string, context?: string): Promise<string> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, context }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData: APIError = await response.json();
        throw new Error(errorData.details || errorData.error || 'Erreur inconnue');
      }

      const data = await response.json();
      
      if (!data.response) {
        throw new Error('Réponse invalide du serveur');
      }

      return data.response;
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message:', error);

      if (error.name === 'AbortError') {
        throw new Error('La requête a pris trop de temps à répondre');
      }

      throw new Error(
        error.message || 'Erreur lors de la communication avec l\'IA'
      );
    }
  }
}

// Singleton instance
export const aiManager = new AIConversationManager(); 