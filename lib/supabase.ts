import { createClient } from '@supabase/supabase-js';

// Vérifier que les variables d'environnement sont définies
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

// Client Supabase pour l'utilisation côté serveur avec la clé de service
// À utiliser uniquement dans les API routes et les server components
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Client Supabase pour l'utilisation côté client avec la clé anonyme
// À utiliser dans les composants client
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);

// Fonction utilitaire pour exécuter une requête SQL via la fonction RPC
export async function executeSQL(query: string) {
  try {
    const { data, error } = await supabaseAdmin.rpc('execute_sql', { sql_query: query });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Supabase SQL execution error:', error);
    return { data: null, error };
  }
}

// Type helper for SQL query results
export type SqlQueryResult<T> = {
  data: T | null;
  error: Error | null;
}; 