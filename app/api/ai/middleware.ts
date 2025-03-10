import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { Session } from 'next-auth';

// Spécifier que ce middleware doit s'exécuter dans l'environnement Node.js et non Edge
export const runtime = 'nodejs';

// Interface étendue pour la session avec le champ id
interface ExtendedSession extends Session {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: string;
  };
}

// Constantes pour le rate limiting
const MAX_REQUESTS_PER_DAY = 10;
const ANONYMOUS_MAX_REQUESTS_PER_DAY = 3; // Limite plus basse pour les utilisateurs non connectés

// Variables globales pour suivre les utilisateurs anonymes
// Note: Cette approche est simplifiée et sera réinitialisée au redémarrage du serveur
const anonymousIpCounts = new Map<string, number>();

// Middleware pour gérer le rate limiting
export async function rateLimit(req: NextRequest) {
  try {
    // Vérifier si l'utilisateur est authentifié
    const session = await getServerSession(authOptions) as ExtendedSession;
    const userId = session?.user?.id;
    
    // Si l'utilisateur n'est pas connecté, utiliser l'adresse IP pour le tracking (limité)
    if (!userId) {
      // Option 1: Bloquer complètement les utilisateurs anonymes
      // return NextResponse.json({ error: 'Authentication required for AI features' }, { status: 401 });
      
      // Option 2: Permettre un nombre limité de requêtes pour les utilisateurs anonymes
      // Récupérer l'IP de l'utilisateur
      const forwardedFor = req.headers.get('x-forwarded-for');
      const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
      
      // Dans une application réelle, vous voudriez stocker cela dans une base de données/Redis
      const today = new Date().toISOString().split('T')[0];
      const ipKey = `${ip}-${today}`;
      
      const currentCount = (anonymousIpCounts.get(ipKey) || 0) + 1;
      anonymousIpCounts.set(ipKey, currentCount);
      
      if (currentCount > ANONYMOUS_MAX_REQUESTS_PER_DAY) {
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded', 
            message: 'Anonymous users are limited to 3 AI requests per day. Please sign in for more requests.' 
          }, 
          { status: 429 }
        );
      }
      
      // Permettre la requête pour les utilisateurs anonymes sous le seuil
      return NextResponse.next();
    }
    
    // Pour les utilisateurs authentifiés, vérifier le quota dans la base de données
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
      console.error('Error checking rate limit:', result);
      // En cas d'erreur, autoriser la requête par défaut
      return NextResponse.next();
    }
    
    const usage = result.results?.[0];
    
    if (usage && usage.request_count >= MAX_REQUESTS_PER_DAY) {
      // L'utilisateur a atteint sa limite quotidienne
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          message: `You have reached your daily limit of ${MAX_REQUESTS_PER_DAY} AI requests. Please try again tomorrow.`,
          current: usage.request_count,
          limit: MAX_REQUESTS_PER_DAY,
          reset: new Date(new Date().setHours(24, 0, 0, 0)).toISOString()
        }, 
        { status: 429 }
      );
    }
    
    // Incrémenter le compteur pour cet utilisateur
    await fetch('http://localhost:8765/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `SELECT increment_ai_usage('${userId}')`
      })
    });
    
    // Permettre la requête
    return NextResponse.next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    // En cas d'erreur, permettre la requête par défaut
    return NextResponse.next();
  }
} 