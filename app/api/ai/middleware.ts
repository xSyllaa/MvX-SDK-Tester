import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import sql from '@/lib/db';
import { SubscriptionPlanType, getPlanLimits, checkLimitsExceeded } from '@/lib/subscription-plans';
import { supabaseAdmin } from '@/lib/supabase';

// Le runtime Node.js est configuré globalement dans next.config.js
// export const runtime = 'nodejs';

// Middleware pour gérer le rate limiting
export async function rateLimit(req: NextRequest) {
  try {
    const authToken = req.cookies.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Vérifier la session
    const sessions = await sql`
      SELECT s.*, u.id as user_id, u.is_anonymous
      FROM "sessions" s
      JOIN "users" u ON s.user_id = u.id
      WHERE s.token = ${authToken} AND s.expires_at > NOW()
    `;

    if (sessions.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const session = sessions[0];
    const userId = session.user_id;
    
    // Pour les utilisateurs authentifiés, récupérer l'utilisation de l'API
    const { data: usageData, error: usageError } = await supabaseAdmin.rpc(
      'get_user_api_usage', 
      { p_user_id: userId }
    );
    
    if (usageError) {
      console.error('Error checking rate limit:', usageError);
      // En cas d'erreur, autoriser la requête par défaut
      return NextResponse.next();
    }
    
    // Récupérer le plan d'abonnement de l'utilisateur
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('subscription_plan')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Error fetching user data:', userError);
      // En cas d'erreur, autoriser la requête par défaut
      return NextResponse.next();
    }
    
    const userPlan = userData?.subscription_plan || SubscriptionPlanType.FREE;
    const usage = usageData && usageData.length > 0 ? usageData[0] : null;
    
    if (!usage) {
      // Pas encore d'enregistrement d'utilisation, autoriser la requête
      return NextResponse.next();
    }
    
    // Vérifier si l'utilisateur a dépassé les limites
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
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        resetTime = endOfDay.toISOString();
      } else if (limitStatus.weekly) {
        message = `You have reached your weekly limit of ${limits.weekly} AI requests.`;
        
        // Calculer le début de la semaine prochaine (dimanche prochain)
        const now = new Date();
        const daysUntilSunday = 7 - now.getDay();
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + daysUntilSunday);
        nextWeek.setHours(23, 59, 59, 999);
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
    
    // Enregistrer cette requête avant de l'autoriser
    const requestData = {
      path: req.nextUrl.pathname,
      method: req.method
    };
    
    await supabaseAdmin.rpc('log_api_request', {
      p_user_id: userId,
      p_request_type: 'ai',
      p_request_data: requestData,
      p_subscription_plan: userPlan
    });
    
    // Permettre la requête
    return NextResponse.next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    // En cas d'erreur, permettre la requête par défaut
    return NextResponse.next();
  }
}

export async function withAuth(req: NextRequest) {
  try {
    const authToken = req.cookies.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Vérifier la session
    const sessions = await sql`
      SELECT s.*, u.id as user_id, u.is_anonymous
      FROM "sessions" s
      JOIN "users" u ON s.user_id = u.id
      WHERE s.token = ${authToken} AND s.expires_at > NOW()
    `;

    if (sessions.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const session = sessions[0];
    return { userId: session.user_id, isAnonymous: session.is_anonymous };

  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
} 