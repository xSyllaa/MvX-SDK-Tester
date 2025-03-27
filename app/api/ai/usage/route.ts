import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { SubscriptionPlanType, getPlanLimits } from '@/lib/subscription-plans';

// Le runtime Node.js est configuré globalement dans next.config.js
export const runtime = 'nodejs';

interface UserInfo {
  id: string;
  subscriptionPlan: SubscriptionPlanType;
}

async function authenticateUser(request: NextRequest): Promise<UserInfo> {
  // Récupérer le token d'authentification depuis le cookie
  const authToken = request.cookies.get('auth_token')?.value;

  if (!authToken) {
    throw new Error('Authentication required');
  }

  // Vérifier la validité du token et récupérer l'utilisateur
  const sessions = await sql`
    SELECT s.*, u.id as user_id, u.subscription_plan
    FROM "sessions" s
    JOIN "users" u ON s.user_id = u.id
    WHERE s.token = ${authToken} AND s.expires_at > NOW()
  `;

  if (sessions.length === 0) {
    throw new Error('Invalid authentication token');
  }

  const session = sessions[0];
  return {
    id: session.user_id,
    subscriptionPlan: (session.subscription_plan || 'free') as SubscriptionPlanType
  };
}

async function getUsageStats(userId: string) {
  // Récupérer les statistiques d'utilisation depuis la table user_api_usage_summary
  const usageStats = await sql`
    SELECT 
      today_count,
      week_count,
      month_count,
      last_request_at
    FROM "user_api_usage_summary"
    WHERE user_id = ${userId}
  `;

  // Si aucune donnée n'existe, retourner des valeurs par défaut
  return usageStats[0] || {
    today_count: 0,
    week_count: 0,
    month_count: 0,
    last_request_at: null
  };
}

export async function GET(request: NextRequest) {
  try {
    // 1. Authentifier l'utilisateur
    const userInfo = await authenticateUser(request);

    // 2. Récupérer les limites du plan
    const planLimits = getPlanLimits(userInfo.subscriptionPlan);

    // 3. Récupérer les statistiques d'utilisation
    const usage = await getUsageStats(userInfo.id);

    return NextResponse.json({
      authenticated: true,
      plan: userInfo.subscriptionPlan,
      limits: {
        dailyLimit: planLimits.daily,
        weeklyLimit: planLimits.weekly,
        monthlyLimit: planLimits.monthly
      },
      usage: {
        today: parseInt(usage.today_count),
        week: parseInt(usage.week_count),
        month: parseInt(usage.month_count),
        lastRequest: usage.last_request_at
      }
    });

  } catch (error: any) {
    console.error('Error fetching usage statistics:', error);

    if (error.message === 'Authentication required' || error.message === 'Invalid authentication token') {
      return NextResponse.json(
        { error: error.message, authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch usage statistics', authenticated: false },
      { status: 500 }
    );
  }
} 