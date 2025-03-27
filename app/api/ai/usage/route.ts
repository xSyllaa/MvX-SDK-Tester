import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { SubscriptionPlanType, getPlanLimits } from '@/lib/subscription-plans';

// Le runtime Node.js est configuré globalement dans next.config.js
export const runtime = 'nodejs';

// Fonction pour obtenir l'utilisateur actuel à partir du cookie d'authentification
async function getCurrentUser(request: NextRequest) {
  try {
    console.log('🔍 Vérification de l\'authentification...');
    
    // Récupérer le token d'authentification depuis les cookies de la requête
    const authToken = request.cookies.get('sb-access-token')?.value;
    
    if (!authToken) {
      console.log('⚠️ Aucun token d\'authentification trouvé');
      return null;
    }
    
    console.log('✅ Token d\'authentification trouvé');
    
    // Récupérer l'utilisateur directement depuis Supabase avec le token
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(authToken);
    
    if (userError || !user) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur:', userError);
      return null;
    }
    
    console.log(`✅ Utilisateur identifié: ${user.id}`);
    
    // Récupérer le plan d'abonnement de l'utilisateur
    const { data: userData, error: subscriptionError } = await supabaseAdmin
      .from('users')
      .select('subscription_plan')
      .eq('id', user.id)
      .single();
    
    if (subscriptionError) {
      console.error('⚠️ Erreur lors de la récupération du plan d\'abonnement:', subscriptionError);
      return { 
        id: user.id, 
        subscriptionPlan: 'free' as SubscriptionPlanType
      };
    }
    
    return { 
      id: user.id, 
      subscriptionPlan: (userData?.subscription_plan || 'free') as SubscriptionPlanType
    };
  } catch (error) {
    console.error('❌ Erreur générale lors de la récupération de l\'utilisateur:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Obtenir l'utilisateur actuel
    const userInfo = await getCurrentUser(request);

    if (!userInfo || !userInfo.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Récupérer les limites du plan
    const planLimits = getPlanLimits(userInfo.subscriptionPlan);

    // Récupérer l'utilisation actuelle
    const { data: usageData, error: usageError } = await supabaseAdmin
      .from('user_api_usage_summary')
      .select('*')
      .eq('user_id', userInfo.id)
      .single();

    if (usageError && usageError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Erreur lors de la récupération des données d\'utilisation:', usageError);
      return NextResponse.json(
        { error: 'Failed to fetch usage data' },
        { status: 500 }
      );
    }

    // Si aucune donnée d'utilisation n'existe, retourner des compteurs à 0
    const usage = usageData || {
      today_count: 0,
      week_count: 0,
      month_count: 0,
      last_request_at: null
    };

    return NextResponse.json({
      plan: userInfo.subscriptionPlan,
      limits: planLimits,
      usage: {
        today: usage.today_count,
        week: usage.week_count,
        month: usage.month_count,
        lastRequest: usage.last_request_at
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des données d\'utilisation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 