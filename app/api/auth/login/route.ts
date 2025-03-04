import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import postgres from 'postgres';

// Connexion à la base de données Supabase
const sql = postgres(process.env.DATABASE_URL || '');

// Fonction pour hacher le mot de passe
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

// Générer un token de session (expirant dans 30 jours)
function generateSessionToken(): string {
  return uuidv4();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validation des données
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Vérifier l'identifiant de l'utilisateur (email ou username)
    const users = await sql`
      SELECT u.* FROM "users" u
      WHERE u.email = ${email} OR u.username = ${email}
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = users[0];

    // Récupérer les informations d'authentification
    const authMethods = await sql`
      SELECT uam.* FROM "user_auth_methods" uam
      JOIN "auth_methods" am ON uam.auth_method_id = am.id
      WHERE uam.user_id = ${user.id} AND am.name = 'email_password'
    `;

    if (authMethods.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const authMethod = authMethods[0];
    const storedPassword = authMethod.auth_data?.password;

    // Vérifier le mot de passe
    const hashedInputPassword = hashPassword(password);
    if (storedPassword !== hashedInputPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Créer une session
    const token = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Expire dans 30 jours

    const ipAddress = req.headers.get('x-forwarded-for') || req.ip || '';
    const userAgent = req.headers.get('user-agent') || '';

    // Enregistrer la session dans la base de données
    await sql`
      INSERT INTO "sessions" (user_id, token, expires_at, ip_address, user_agent)
      VALUES (${user.id}, ${token}, ${expiresAt.toISOString()}, ${ipAddress}, ${userAgent})
    `;

    // Mettre à jour la date de dernière connexion
    await sql`
      UPDATE "users" SET last_login = NOW() WHERE id = ${user.id}
    `;

    // Mettre à jour la date de dernière utilisation de la méthode d'authentification
    await sql`
      UPDATE "user_auth_methods" SET last_used = NOW() WHERE id = ${authMethod.id}
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
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
} 