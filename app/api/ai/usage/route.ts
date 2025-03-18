import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { Session } from 'next-auth';
import { SubscriptionPlanType, getPlanLimits } from '@/lib/subscription-plans';

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
    
    // Récupérer le forfait de l'utilisateur
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
    
    // Récupérer l'utilisation de l'IA pour cet utilisateur
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
      console.error('Error fetching AI usage:', result);
      return NextResponse.json(
        { error: 'Failed to fetch API usage data' },
        { status: 500 }
      );
    }
    
    const usage = result.results?.[0];
    
    // Récupérer les limites du forfait de l'utilisateur
    const limits = getPlanLimits(userPlan as SubscriptionPlanType);
    
    // Calculer les temps de réinitialisation
    const now = new Date();
    
    // Réinitialisation quotidienne (fin de la journée)
    const dailyReset = new Date(now);
    dailyReset.setHours(23, 59, 59, 999);
    
    // Réinitialisation hebdomadaire (midi de dimanche prochain)
    const weeklyReset = new Date(now);
    const daysUntilSunday = 7 - weeklyReset.getDay();
    weeklyReset.setDate(weeklyReset.getDate() + daysUntilSunday);
    weeklyReset.setHours(23, 59, 59, 999);
    
    // Réinitialisation mensuelle (premier jour du mois suivant)
    const monthlyReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    monthlyReset.setHours(0, 0, 0, 0);
    
    // Si aucune utilisation n'est enregistrée
    if (!usage) {
      return NextResponse.json({
        plan: userPlan,
        usage: {
          daily: 0,
          weekly: 0,
          monthly: 0
        },
        limits: limits,
        reset: {
          daily: dailyReset.toISOString(),
          weekly: weeklyReset.toISOString(),
          monthly: monthlyReset.toISOString()
        }
      });
    }
    
    // Renvoyer les données d'utilisation avec les limites
    return NextResponse.json({
      plan: userPlan,
      usage: {
        daily: usage.daily_count || 0,
        weekly: usage.weekly_count || 0,
        monthly: usage.monthly_count || 0
      },
      limits: limits,
      reset: {
        daily: dailyReset.toISOString(),
        weekly: weeklyReset.toISOString(),
        monthly: monthlyReset.toISOString()
      }
    });
  } catch (error) {
    console.error('API usage error:', error);
    return NextResponse.json(
      { error: 'Failed to process API usage request' },
      { status: 500 }
    );
  }
} 