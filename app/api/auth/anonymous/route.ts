import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import postgres from 'postgres';

// Connexion à la base de données Supabase
const sql = postgres(process.env.DATABASE_URL || '');

export async function POST(req: NextRequest) {
  console.log('🔑 [API] Début du processus de création d\'un utilisateur anonyme');
  
  // Récupérer les informations du client
  const ipAddress = req.headers.get('x-forwarded-for') || req.ip || '';
  const userAgent = req.headers.get('user-agent') || '';
  
  try {
    // Vérifier si un cookie d'authentification est déjà présent
    const authToken = req.cookies.get('auth_token')?.value;
    
    if (authToken) {
      console.log('🍪 [API] Cookie d\'authentification trouvé, vérification de la validité');
      
      // Vérifier si la session est valide
      const existingSession = await sql`
        SELECT s.*, u.username, u.display_name, u.is_anonymous
        FROM "sessions" s
        JOIN "users" u ON s.user_id = u.id
        WHERE s.token = ${authToken}
          AND s.expires_at > NOW()
      `;
      
      if (existingSession.length > 0) {
        console.log('✅ [API] Session existante trouvée, réutilisation');
        
        // Mettre à jour la date d'expiration de la session
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // Expire dans 30 jours
        
        await sql`
          UPDATE "sessions"
          SET expires_at = ${expiresAt.toISOString()}
          WHERE token = ${authToken}
        `;
        
        // Renvoyer l'utilisateur existant
        const user = existingSession[0];
        console.log(`🎉 [API] Réutilisation de l'utilisateur anonyme: ${user.username}`);
        
        const response = NextResponse.json({
          success: true,
          message: 'Existing anonymous user reused',
          user: {
            id: user.user_id,
            username: user.username,
            displayName: user.display_name,
            isAnonymous: user.is_anonymous
          },
          token: authToken
        });
        
        // Prolonger le cookie
        response.cookies.set('auth_token', authToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 30 * 24 * 60 * 60 // 30 jours
        });
        
        return response;
      }
      
      console.log('⚠️ [API] Session expirée ou invalide, création d\'un nouvel utilisateur anonyme');
    }
    
    // Vérifier si un utilisateur récent existe pour cette IP/user-agent (dans les dernières 24h)
    console.log('🔍 [API] Recherche d\'un utilisateur anonyme récent pour cette IP');
    const recentSession = await sql`
      SELECT s.*, u.username, u.display_name, u.is_anonymous
      FROM "sessions" s
      JOIN "users" u ON s.user_id = u.id
      WHERE s.ip_address = ${ipAddress}
        AND s.user_agent = ${userAgent}
        AND u.is_anonymous = true
        AND s.created_at > NOW() - INTERVAL '24 hours'
      ORDER BY s.created_at DESC
      LIMIT 1
    `;
    
    if (recentSession.length > 0) {
      console.log('✅ [API] Utilisateur anonyme récent trouvé pour cette IP, réutilisation');
      
      // Générer un nouveau token pour la session
      const token = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Expire dans 30 jours
      
      // Créer une nouvelle session pour cet utilisateur existant
      await sql`
        INSERT INTO "sessions" (
          user_id, 
          token, 
          expires_at, 
          ip_address, 
          user_agent,
          created_at
        )
        VALUES (
          ${recentSession[0].user_id}, 
          ${token}, 
          ${expiresAt.toISOString()}, 
          ${ipAddress}, 
          ${userAgent},
          NOW()
        )
      `;
      
      console.log(`✅ [API] Nouvelle session créée pour l'utilisateur anonyme existant: ${recentSession[0].username}`);
      
      const user = recentSession[0];
      const response = NextResponse.json({
        success: true,
        message: 'Recent anonymous user reused',
        user: {
          id: user.user_id,
          username: user.username,
          displayName: user.display_name,
          isAnonymous: user.is_anonymous
        },
        token
      });
      
      // Définir le cookie d'authentification
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 30 * 24 * 60 * 60 // 30 jours
      });
      
      return response;
    }
    
    // Aucune session trouvée, créer un nouvel utilisateur anonyme
    // Générer un identifiant unique pour l'utilisateur anonyme
    const anonymousId = uuidv4();
    const username = `guest_${anonymousId.substring(0, 8)}`;
    const displayName = `Guest User ${anonymousId.substring(0, 4)}`;
    
    console.log(`🧩 [API] Création d'un nouvel utilisateur anonyme avec username: ${username}`);
    
    // Transaction pour créer l'utilisateur anonyme et sa méthode d'authentification
    let userId;
    let token = '';
    
    await sql.begin(async (sql) => {
      // Créer l'utilisateur anonyme
      console.log('🔍 [API] Insertion de l\'utilisateur anonyme dans la base de données');
      const newUser = await sql`
        INSERT INTO "users" (
          username, 
          display_name, 
          is_anonymous, 
          is_verified, 
          created_at, 
          updated_at, 
          last_login
        )
        VALUES (
          ${username}, 
          ${displayName}, 
          true, 
          false, 
          NOW(), 
          NOW(), 
          NOW()
        )
        RETURNING *
      `;
      
      userId = newUser[0].id;
      console.log(`✅ [API] Utilisateur anonyme créé avec succès, ID: ${userId}`);
      
      // Récupérer l'ID de la méthode d'authentification anonyme
      console.log('🔍 [API] Récupération de la méthode d\'authentification anonyme');
      const authMethod = await sql`
        SELECT id FROM "auth_methods" WHERE name = 'anonymous'
      `;
      
      if (authMethod.length === 0) {
        console.error('❌ [API] Méthode d\'authentification anonyme non trouvée dans la base de données');
        throw new Error('Anonymous auth method not found');
      }
      
      const authMethodId = authMethod[0].id;
      console.log(`✅ [API] Méthode d'authentification trouvée, ID: ${authMethodId}`);
      
      // Créer la méthode d'authentification pour cet utilisateur
      console.log('🔍 [API] Liaison de l\'utilisateur avec la méthode d\'authentification anonyme');
      await sql`
        INSERT INTO "user_auth_methods" (
          user_id, 
          auth_method_id, 
          auth_provider_id, 
          auth_data, 
          is_primary,
          created_at,
          last_used
        )
        VALUES (
          ${userId}, 
          ${authMethodId}, 
          ${anonymousId}, 
          ${JSON.stringify({ type: 'anonymous' })}, 
          true,
          NOW(),
          NOW()
        )
      `;
      console.log('✅ [API] Méthode d\'authentification créée avec succès');
      
      // Créer une session pour l'utilisateur anonyme
      console.log('🔍 [API] Création d\'une session pour l\'utilisateur anonyme');
      token = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Expire dans 30 jours
      
      await sql`
        INSERT INTO "sessions" (
          user_id, 
          token, 
          expires_at, 
          ip_address, 
          user_agent,
          created_at
        )
        VALUES (
          ${userId}, 
          ${token}, 
          ${expiresAt.toISOString()}, 
          ${ipAddress}, 
          ${userAgent},
          NOW()
        )
      `;
      console.log(`✅ [API] Session créée avec succès, Token: ${token.substring(0, 8)}...`);
    });
    
    // Retourner les informations de l'utilisateur anonyme
    console.log('🎉 [API] Processus d\'authentification anonyme terminé avec succès');
    const response = NextResponse.json({
      success: true,
      message: 'Anonymous user created successfully',
      user: {
        id: userId,
        username,
        displayName,
        isAnonymous: true
      },
      token
    });
    
    // Définir le cookie d'authentification
    console.log('🍪 [API] Définition du cookie d\'authentification');
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 jours
    });
    
    return response;
  } catch (error) {
    console.error('❌ [API] Erreur lors de la création d\'un utilisateur anonyme:', error);
    return NextResponse.json({ error: 'Failed to create anonymous user' }, { status: 500 });
  }
} 