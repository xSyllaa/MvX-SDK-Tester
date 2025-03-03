import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Vérifier que la clé API est présente
if (!process.env.GOOGLE_AI_API_KEY) {
  throw new Error('GOOGLE_AI_API_KEY is not defined in environment variables');
}

// Initialiser l'API Google AI côté serveur avec la version gratuite
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Configuration du modèle pour la version gratuite
const modelConfig = {
  model: 'gemini-1.0-pro',
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
  },
};

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    // Validation des entrées
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    try {
      // Initialiser le modèle avec la configuration de base
      const model = genAI.getGenerativeModel(modelConfig);

      // Préparer le message avec le contexte si fourni
      const fullMessage = context 
        ? `[Contexte: ${context}]\n\nMessage: ${message}`
        : message;

      // Envoyer le message et obtenir la réponse
      const result = await model.generateContent(fullMessage);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Empty response from AI');
      }

      return NextResponse.json({ response: text });
    } catch (error: any) {
      console.error('Specific error with Google AI API:', error);
      
      // Specific error handling
      if (error.status === 404) {
        return NextResponse.json(
          { error: 'The AI model is currently unavailable' },
          { status: 503 }
        );
      }
      
      throw error; // Rethrow error for general handling
    }
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi du message:', error);
    
    // Retourner une réponse d'erreur appropriée
    return NextResponse.json(
      { 
        error: 'Erreur lors de la communication avec l\'IA',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
} 