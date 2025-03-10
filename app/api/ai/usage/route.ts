import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { Session } from 'next-auth';

// Le runtime Node.js est configuré globalement dans next.config.js
// export const runtime = 'nodejs';

// Interface étendue pour la session avec le champ id
interface ExtendedSession extends Session {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: string;
  };
}

export async function GET(req: NextRequest) {
  try {
    // Vérifier si l'utilisateur est authentifié
    const session = await getServerSession(authOptions) as ExtendedSession;
    const userId = session?.user?.id;
    
    // Si l'utilisateur n'est pas connecté, renvoyer une erreur
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Récupérer l'utilisation de l'IA pour cet utilisateur
    const mcpResponse = await fetch('http://localhost:8765/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          SELECT * FROM "ai_usage" 
          WHERE "user_id" = '${userId}' 
          AND "date" = CURRENT_DATE
        `
      })
    });
    
    const result = await mcpResponse.json();
    
    if (!mcpResponse.ok) {
      console.error('Error fetching AI usage:', result);
      return NextResponse.json(
        { error: 'Failed to fetch AI usage data' },
        { status: 500 }
      );
    }
    
    const usageData = result.results?.[0];
    
    // Si aucune utilisation n'est enregistrée pour aujourd'hui
    if (!usageData) {
      return NextResponse.json({
        current: 0,
        limit: 10,
        reset: new Date(new Date().setHours(24, 0, 0, 0)).toISOString()
      });
    }
    
    // Renvoyer les données d'utilisation
    return NextResponse.json({
      current: usageData.request_count,
      limit: 10,
      reset: new Date(new Date().setHours(24, 0, 0, 0)).toISOString()
    });
  } catch (error) {
    console.error('AI usage error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI usage request' },
      { status: 500 }
    );
  }
} 