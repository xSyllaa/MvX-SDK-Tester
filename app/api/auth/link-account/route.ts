import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';
import { createHash } from 'crypto';
import { customAlphabet } from 'nanoid';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Spécifier le runtime Node.js
export const runtime = 'nodejs';

// Utiliser notre module db.js centralisé pour éviter de multiplier les connexions
import sql from '@/lib/db';

// Configurer nanoid pour générer des identifiants
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);

// Fonction pour hacher le mot de passe avec SHA-256 (identique à login/register)
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authMethod, anonymousToken, data } = body;

    console.log('[link-account] Request body:', { authMethod, hasAnonymousToken: !!anonymousToken, data });

    if (!authMethod || !anonymousToken) {
      console.error('[link-account] Missing required fields:', { authMethod, anonymousToken });
      return NextResponse.json(
        { success: false, message: 'Anonymous token is required' },
        { status: 400 }
      );
    }

    // Vérifier et décoder le jeton anonyme
    let anonymousUserId;
    
    try {
      // Vérifier que le jeton anonyme est valide et récupérer l'ID de l'utilisateur
      const decoded = jwt.verify(anonymousToken, process.env.JWT_SECRET as string) as { userId: string };
      anonymousUserId = decoded.userId;
      
      console.log('[link-account] Decoded anonymous token:', decoded);
    } catch (error) {
      console.error('[link-account] Invalid anonymous token:', error);
      return NextResponse.json(
        { success: false, message: 'Invalid anonymous token' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur anonyme existe
    const anonymousUsers = await sql`
      SELECT * FROM "users" WHERE id = ${anonymousUserId} AND is_anonymous = true
    `;

    if (anonymousUsers.length === 0) {
      console.error('[link-account] Anonymous user not found or not anonymous');
      return NextResponse.json(
        { success: false, message: 'Anonymous user not found' },
        { status: 404 }
      );
    }

    const anonymousUser = anonymousUsers[0];

    // Selon la méthode d'authentification, créer ou trouver l'utilisateur non anonyme
    let userId: string;
    
    if (authMethod === 'credentials') {
      // Extraire les données nécessaires
      const { email, password, username, displayName } = data;
      
      if (!email || !password) {
        console.error('[link-account] Missing email or password for credentials auth');
        return NextResponse.json(
          { success: false, message: 'Email and password are required' },
          { status: 400 }
        );
      }

      // Vérifier si un utilisateur avec cet email ou username existe déjà
      const existingUsers = await sql`
        SELECT * FROM "users" 
        WHERE (email = ${email} OR username = ${username || ''})
        AND is_anonymous = false
      `;

      if (existingUsers.length > 0) {
        console.error('[link-account] User with this email or username already exists:', { email, username });
        return NextResponse.json(
          { success: false, message: 'User with this email or username already exists' },
          { status: 400 }
        );
      }

      // Hacher le mot de passe avec SHA-256 (comme dans register)
      const hashedPassword = hashPassword(password);

      // Mettre à jour l'utilisateur anonyme pour le convertir en utilisateur complet
      await sql`
        UPDATE "users"
        SET 
          email = ${email},
          username = ${username || `user_${nanoid()}`},
          display_name = ${displayName || email.split('@')[0]},
          is_anonymous = false,
          is_verified = false,
          updated_at = NOW()
        WHERE id = ${anonymousUserId}
      `;
      
      userId = anonymousUserId;
      
      // Récupérer l'ID de la méthode d'authentification par email/password
      const authMethods = await sql`
        SELECT id FROM "auth_methods" WHERE name = 'email_password'
      `;
      
      if (authMethods.length === 0) {
        console.error('[link-account] Auth method not found:', 'email_password');
        return NextResponse.json(
          { success: false, message: 'Authentication method not found' },
          { status: 400 }
        );
      }
      
      const authMethodId = authMethods[0].id;
      
      // Créer l'entrée user_auth_methods avec le format compatible avec login/register
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
          ${email}, 
          ${JSON.stringify({ password: hashedPassword })}, 
          true,
          NOW(),
          NOW()
        )
      `;
      
      console.log('[link-account] User auth method created with email_password');
    } else {
      // Gérer d'autres méthodes d'authentification si nécessaire
      console.error('[link-account] Unsupported auth method:', authMethod);
      return NextResponse.json(
        { success: false, message: 'Unsupported authentication method' },
        { status: 400 }
      );
    }
    
    // Créer un jeton JWT pour l'utilisateur mis à jour
    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );
    
    // Récupérer les données de l'utilisateur mis à jour
    const updatedUsers = await sql`
      SELECT * FROM "users" WHERE id = ${userId}
    `;
    
    if (updatedUsers.length === 0) {
      console.error('[link-account] User not found after linking:', userId);
      return NextResponse.json(
        { success: false, message: 'User not found after linking' },
        { status: 500 }
      );
    }
    
    const user = updatedUsers[0];
    
    // Créer une entrée dans la table account_links pour lier les comptes
    await sql`
      INSERT INTO "account_links" (
        primary_user_id,
        linked_user_id,
        created_at,
        link_type
      )
      VALUES (
        ${userId},
        ${anonymousUserId},
        NOW(),
        'anonymous_upgrade'
      )
    `;
    
    // Créer une session pour l'utilisateur
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Expire dans 30 jours
    
    const ipAddress = request.headers.get('x-forwarded-for') || '';
    const userAgent = request.headers.get('user-agent') || '';
    
    await sql`
      INSERT INTO "sessions" (
        user_id,
        token,
        expires_at,
        created_at,
        ip_address,
        user_agent
      )
      VALUES (
        ${userId},
        ${token},
        ${expiresAt.toISOString()},
        NOW(),
        ${ipAddress},
        ${userAgent}
      )
    `;
    
    // Créer la réponse avec les informations utilisateur et le token
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        isVerified: user.is_verified,
        isAnonymous: user.is_anonymous
      },
      token,
      expiresAt: expiresAt.toISOString()
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
  } catch (error) {
    console.error('[link-account] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to link account' },
      { status: 500 }
    );
  }
} 