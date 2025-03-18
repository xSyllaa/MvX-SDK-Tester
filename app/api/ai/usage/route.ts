import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { Session } from 'next-auth';
import { SubscriptionPlanType, getPlanLimits } from '@/lib/subscription-plans';
import { supabaseAdmin } from '@/lib/supabase';

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
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('subscription_plan')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Error fetching user plan:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }
    
    const userPlan = userData?.subscription_plan || SubscriptionPlanType.FREE;
    
    // Récupérer l'utilisation de l'API pour cet utilisateur
    const { data: usageData, error: usageError } = await supabaseAdmin.rpc(
      'get_user_api_usage',
      { p_user_id: userId }
    );
    
    if (usageError) {
      console.error('Error fetching API usage:', usageError);
      return NextResponse.json(
        { error: 'Failed to fetch API usage data' },
        { status: 500 }
      );
    }
    
    const usage = usageData && usageData.length > 0 ? usageData[0] : null;
    
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