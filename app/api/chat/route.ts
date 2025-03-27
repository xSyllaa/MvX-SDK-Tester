import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { SubscriptionPlanType, getPlanLimits } from '@/lib/subscription-plans';
import { generateFullContext, getLandingContext } from '@/data/chat-contexts';

// Le runtime Node.js est configuré globalement dans next.config.js
export const runtime = 'nodejs';

// Vérifier que la clé API est présente
if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not defined');
}

// Initialiser l'API Google AI côté serveur avec la version gratuite
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

// Configuration du modèle pour la version gratuite
const modelConfig = {
  model: 'gemini-1.0-pro',
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
  },
};

interface UserInfo {
  id: string;
  subscriptionPlan: SubscriptionPlanType;
}

// Vérifier l'authentification et récupérer les informations de l'utilisateur
async function authenticateUser(request: NextRequest): Promise<UserInfo> {
  // Vérifier d'abord si le cookie d'authentification existe
  const authToken = request.cookies.get('sb-access-token')?.value;
  
  if (!authToken) {
    throw new Error('Authentication required');
  }
  
  // Vérifier le token avec Supabase
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authToken);
  
  if (authError || !user || !user.email) {
    // On vérifie explicitement user.email pour s'assurer que c'est un vrai utilisateur authentifié
    throw new Error('Invalid authentication token');
  }
  
  // Vérifier que l'utilisateur existe dans notre table users
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('subscription_plan, email')
    .eq('id', user.id)
    .single();
    
  if (userError || !userData || !userData.email) {
    throw new Error('User account not found');
  }
  
  return {
    id: user.id,
    subscriptionPlan: (userData.subscription_plan || 'free') as SubscriptionPlanType
  };
}

// Vérifier les limites d'utilisation
async function checkUsageLimits(userId: string, subscriptionPlan: SubscriptionPlanType) {
  const limits = getPlanLimits(subscriptionPlan);
  
  // Récupérer l'utilisation actuelle
  const { data: usage, error: usageError } = await supabaseAdmin
    .from('user_api_usage_summary')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (usageError && usageError.code !== 'PGRST116') {
    throw new Error('Failed to fetch usage data');
  }
  
  const currentUsage = usage || { today_count: 0, week_count: 0, month_count: 0 };
  
  // Vérifier les limites
  if (currentUsage.today_count >= limits.daily) {
    throw new Error('Daily usage limit reached');
  }
  if (currentUsage.week_count >= limits.weekly) {
    throw new Error('Weekly usage limit reached');
  }
  if (currentUsage.month_count >= limits.monthly) {
    throw new Error('Monthly usage limit reached');
  }
  
  return currentUsage;
}

// Enregistrer la requête dans Supabase
async function logApiRequest(userId: string, message: string, subscriptionPlan: SubscriptionPlanType) {
  const timestamp = new Date().toISOString();
  
  // Insérer la requête dans api_requests
  const { error: insertError } = await supabaseAdmin
    .from('api_requests')
    .insert({
      user_id: userId,
      request_type: 'chatbot',
      request_data: { message },
      timestamp,
      subscription_plan: subscriptionPlan
    });
    
  if (insertError) {
    throw new Error('Failed to log request');
  }
  
  // Mettre à jour les compteurs d'utilisation avec upsert
  const { error: updateError } = await supabaseAdmin
    .from('user_api_usage_summary')
    .upsert({
      user_id: userId,
      today_count: 1,
      week_count: 1,
      month_count: 1,
      last_request_at: timestamp
    }, {
      onConflict: 'user_id'
    });
    
  if (updateError) {
    throw new Error('Failed to update usage counters');
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentifier l'utilisateur
    const userInfo = await authenticateUser(request);
    
    // 2. Vérifier le corps de la requête
    const { message, contextType = 'landing' } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    
    // 3. Vérifier les limites d'utilisation
    await checkUsageLimits(userInfo.id, userInfo.subscriptionPlan);
    
    // 4. Enregistrer la requête AVANT de générer la réponse
    await logApiRequest(userInfo.id, message, userInfo.subscriptionPlan);
    
    // 5. Générer le contexte approprié
    const context = getLandingContext();
    const fullContext = generateFullContext(context);
    
    // 6. Générer la réponse avec l'IA en incluant le contexte
    const model = genAI.getGenerativeModel(modelConfig);
    const prompt = `${fullContext}\n\nUser: ${message}\nAssistant:`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error('Empty response from AI');
    }
    
    return NextResponse.json({
      response: text,
      metadata: {
        userId: userInfo.id,
        subscriptionPlan: userInfo.subscriptionPlan,
        timestamp: new Date().toISOString(),
        contextType: contextType
      }
    });
    
  } catch (error: any) {
    console.error('Error processing chatbot request:', error);
    
    // Retourner des erreurs spécifiques selon le type
    if (error.message === 'Authentication required' || error.message === 'Invalid authentication token') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    if (error.message.includes('limit reached')) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    
    // Erreur générique pour tout autre cas
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 