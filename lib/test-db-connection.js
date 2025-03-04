import sql from './db'

export async function testDatabaseConnection() {
  try {
    // Test de la connexion en exécutant une requête simple
    const result = await sql`SELECT 1 as test`
    console.log('Connexion à Supabase réussie :', result)
    return { success: true, result }
  } catch (error) {
    console.error('Erreur de connexion à Supabase :', error)
    return { success: false, error: error.message }
  }
} 