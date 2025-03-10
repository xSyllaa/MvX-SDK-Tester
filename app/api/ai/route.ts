import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from './middleware';

// Le runtime Node.js est configuré globalement dans next.config.js
// export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // Vérifier le rate limit
  const rateLimitResponse = await rateLimit(req);
  
  // Si le middleware renvoie une réponse, c'est que la limite a été atteinte
  if (rateLimitResponse.status !== 200) {
    return rateLimitResponse;
  }
  
  try {
    const data = await req.json();
    const { prompt } = data;
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt parameter' },
        { status: 400 }
      );
    }
    
    // Ici, vous intégreriez l'appel à votre API d'IA
    // Par exemple, OpenAI, HuggingFace, etc.
    
    // Exemple de réponse simulée
    const aiResponse = {
      message: "This is a simulated AI response. In a real implementation, you would integrate with an AI service API.",
      prompt: prompt,
      generated: new Date().toISOString()
    };
    
    return NextResponse.json(aiResponse);
  } catch (error) {
    console.error('AI request error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Pour l'endpoint GET, nous pouvons renvoyer des informations sur le quota d'utilisation
  const rateLimitResponse = await rateLimit(req);
  
  // Si le middleware renvoie une réponse, c'est que la limite a été atteinte
  if (rateLimitResponse.status !== 200) {
    return rateLimitResponse;
  }
  
  return NextResponse.json({
    message: "AI API is operational",
    rate_limit: {
      max_requests_per_day: 10,
      note: "Use POST method with a 'prompt' parameter to interact with the AI"
    }
  });
} 