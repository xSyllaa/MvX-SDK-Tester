import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';
import { Session } from 'next-auth';
import { SubscriptionPlanType, getPlanLimits, checkLimitsExceeded } from '@/lib/subscription-plans';

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

// Middleware pour gérer le rate limiting
export async function rateLimit(req: NextRequest) {
  try {
    // Vérifier si l'utilisateur est authentifié
    const session = await getServerSession(authOptions) as ExtendedSession;
    const userId = session?.user?.id;
    
    // Si l'utilisateur n'est pas connecté, bloquer l'accès aux fonctionnalités AI
    if (!userId) {
      return NextResponse.json({ 
        error: 'Authentication required', 
        message: 'You need to be logged in to use AI features.'
      }, { status: 401 });
    }
    
    // Pour les utilisateurs authentifiés, vérifier le quota dans la base de données
    const mcpResponse = await fetch('http://localhost:8765/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          SELECT * FROM get_user_api_usage('${userId}')
        `
      })
    });
    
    const result = await mcpResponse.json();
    
    if (!mcpResponse.ok) {
      console.error('Error checking rate limit:', result);
      // En cas d'erreur, autoriser la requête par défaut
      return NextResponse.next();
    }
    
    // Récupérer le plan d'abonnement de l'utilisateur
    const userPlanResponse = await fetch('http://localhost:8765/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          SELECT subscription_plan FROM "users" WHERE id = '${userId}'
        `
      })
    });
    
    const planResult = await userPlanResponse.json();
    const userPlan = planResult?.results?.[0]?.subscription_plan || SubscriptionPlanType.FREE;
    
    const usage = result.results?.[0];
    
    if (!usage) {
      // Pas encore d'enregistrement d'utilisation, autoriser la requête
      return NextResponse.next();
    }
    
    // Vérifier si l'utilisateur a dépassé toutes les limites
    const usageStats = {
      daily: usage.daily_count || 0,
      weekly: usage.weekly_count || 0,
      monthly: usage.monthly_count || 0
    };
    
    const limits = getPlanLimits(userPlan as SubscriptionPlanType);
    const limitStatus = checkLimitsExceeded(usageStats, userPlan as SubscriptionPlanType);
    
    if (limitStatus.exceeded) {
      // Déterminer quelle limite a été dépassée pour le message d'erreur
      let message = '';
      let resetTime = '';
      
      if (limitStatus.daily) {
        message = `You have reached your daily limit of ${limits.daily} AI requests.`;
        resetTime = new Date(new Date().setHours(24, 0, 0, 0)).toISOString();
      } else if (limitStatus.weekly) {
        message = `You have reached your weekly limit of ${limits.weekly} AI requests.`;
        
        // Calculer le début de la semaine prochaine (à partir d'aujourd'hui + 7 jours)
        const now = new Date();
        const daysUntilNextWeek = 7 - now.getDay();
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + daysUntilNextWeek);
        nextWeek.setHours(0, 0, 0, 0);
        resetTime = nextWeek.toISOString();
      } else if (limitStatus.monthly) {
        message = `You have reached your monthly limit of ${limits.monthly} AI requests.`;
        
        // Calculer le début du mois prochain
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        resetTime = nextMonth.toISOString();
      }
      
      // Si l'utilisateur a besoin de plus de requêtes, suggérer de passer à Premium
      if (userPlan === SubscriptionPlanType.FREE) {
        message += ' Consider upgrading to Premium for more requests.';
      }
      
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          message: message,
          usage: usageStats,
          limits: limits,
          reset: resetTime
        }, 
        { status: 429 }
      );
    }
    
    // Log cette requête avant de permettre la requête
    await fetch('http://localhost:8765/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `SELECT log_api_request('${userId}', 'ai', '${JSON.stringify({
          path: req.nextUrl.pathname,
          method: req.method
        }).replace(/'/g, "''")}', '${userPlan}')`
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