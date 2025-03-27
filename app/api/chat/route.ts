import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
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

// Initialiser l'API Google AI côté serveur
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

// Configuration du modèle
const modelConfig = {
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 2048,
  },
};

interface UserInfo {
  id: string;
  subscriptionPlan: SubscriptionPlanType;
}

// Vérifier l'authentification et récupérer les informations de l'utilisateur
async function authenticateUser(request: NextRequest): Promise<UserInfo> {
  // Vérifier d'abord si le cookie d'authentification existe
  const authToken = request.cookies.get('auth_token')?.value;
  
  if (!authToken) {
    throw new Error('Authentication required');
  }
  
  // Vérifier le token dans notre base de données
  const { data: sessions, error: sessionError } = await supabaseAdmin
    .from('sessions')
    .select('user_id')
    .eq('token', authToken)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (sessionError || !sessions) {
    throw new Error('Invalid authentication token');
  }

  const userId = sessions.user_id;
  
  // Vérifier que l'utilisateur existe dans notre table users
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('subscription_plan, email')
    .eq('id', userId)
    .single();
    
  if (userError || !userData || !userData.email) {
    throw new Error('User account not found');
  }
  
  return {
    id: userId,
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
  
  console.log(`[API] Logging chat request for user ${userId}`);
  
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
    console.error('[API] Failed to log request in api_requests:', insertError);
    throw new Error('Failed to log request');
  }
  
  console.log('[API] Successfully logged request in api_requests');
}

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Received chat request');
    console.log('[API] Cookies:', request.cookies.getAll());
    
    // 1. Authentifier l'utilisateur
    const userInfo = await authenticateUser(request);
    console.log('[API] User authenticated:', userInfo);
    
    // 2. Vérifier le corps de la requête
    const body = await request.json();
    console.log('[API] Request body:', body);
    const { message, contextType = 'landing', messages = [] } = body;
    
    if (!message) {
      console.log('[API] Error: Message is required');
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    
    // 3. Vérifier les limites d'utilisation
    const usageData = await checkUsageLimits(userInfo.id, userInfo.subscriptionPlan);
    console.log('[API] Usage limits checked:', usageData);
    
    // 4. Enregistrer la requête AVANT de générer la réponse
    await logApiRequest(userInfo.id, message, userInfo.subscriptionPlan);
    
    // 5. Générer le contexte approprié
    const context = getLandingContext();
    const fullContext = generateFullContext(context);
    
    // 6. Construire l'historique de la conversation
    let conversationHistory = `${fullContext}\n\n`;
    
    // Ajouter l'historique des messages précédents
    messages.forEach((msg: { role: string; content: string }) => {
      conversationHistory += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
    
    // Ajouter le nouveau message
    conversationHistory += `User: ${message}\nAssistant:`;
    
    // 7. Générer la réponse avec l'IA
    console.log('[API] Sending message to AI');
    const model = genAI.getGenerativeModel(modelConfig);

    // Utiliser le format le plus simple
    const result = await model.generateContent(conversationHistory);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      console.log('[API] Error: Empty response from AI');
      throw new Error('Empty response from AI');
    }

    console.log('[API] AI response received');
    
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
    console.error('[API] Error processing chatbot request:', error);
    
    // Retourner des erreurs spécifiques selon le type
    if (error.message === 'Authentication required' || error.message === 'Invalid authentication token') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    if (error.message.includes('limit reached')) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    
    // Erreur générique pour tout autre cas
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 