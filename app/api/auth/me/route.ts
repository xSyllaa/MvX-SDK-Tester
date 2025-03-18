import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

// Connexion à la base de données Supabase
// Utiliser notre module db.js centralisé pour éviter de multiplier les connexions
import sql from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Récupérer le token d'authentification depuis le cookie
    const authToken = req.cookies.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized', authenticated: false },
        { status: 401 }
      );
    }

    // Vérifier la validité du token
    const sessions = await sql`
      SELECT s.*, u.id as user_id
      FROM "sessions" s
      JOIN "users" u ON s.user_id = u.id
      WHERE s.token = ${authToken} AND s.expires_at > NOW()
    `;

    if (sessions.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired token', authenticated: false },
        { status: 401 }
      );
    }

    const session = sessions[0];
    const userId = session.user_id;

    // Récupérer les informations de l'utilisateur
    const users = await sql`
      SELECT u.* 
      FROM "users" u
      WHERE u.id = ${userId}
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found', authenticated: false },
        { status: 404 }
      );
    }

    const user = users[0];

    // Récupérer les méthodes d'authentification de l'utilisateur
    const authMethods = await sql`
      SELECT uam.id, am.name as auth_method_name, am.display_name as auth_method_display_name, uam.is_primary
      FROM "user_auth_methods" uam
      JOIN "auth_methods" am ON uam.auth_method_id = am.id
      WHERE uam.user_id = ${userId}
    `;

    // Mettre à jour la date d'expiration de la session pour prolonger sa durée de vie
    // au lieu de mettre à jour la colonne "last_used" qui n'existe pas
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Expire dans 30 jours
    
    await sql`
      UPDATE "sessions" 
      SET expires_at = ${expiresAt.toISOString()}
      WHERE id = ${session.id}
    `;

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        isVerified: user.is_verified,
        isAnonymous: user.is_anonymous,
        createdAt: user.created_at,
        lastLogin: user.last_login
      },
      authMethods: authMethods.map(method => ({
        id: method.id,
        name: method.auth_method_name,
        displayName: method.auth_method_display_name,
        isPrimary: method.is_primary
      })),
      session: {
        id: session.id,
        token: session.token,
        expiresAt: session.expires_at
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Failed to check authentication', authenticated: false },
      { status: 500 }
    );
  }
} 