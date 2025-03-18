import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import postgres from 'postgres';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

// Utiliser notre module db.js centralisé pour éviter de multiplier les connexions
import sql from '@/lib/db';

// Fonction pour hacher le mot de passe
function hashPassword(password: string): string {
  console.log('🔍 [LOGIN] Hashing password with SHA-256');
  // Affichons la chaîne exacte qui est hachée pour vérifier
  console.log(`🔡 [LOGIN] Password string before hashing: "${password}" (length: ${password.length})`);
  const hash = createHash('sha256').update(password).digest('hex');
  console.log(`🔑 [LOGIN] Resulting hash: ${hash}`);
  return hash;
}

// Fonction de debug pour voir la représentation exacte des chaînes
function inspectString(str: string | undefined, label: string): void {
  if (str === undefined) {
    console.log(`🔎 [LOGIN] ${label}: UNDEFINED`);
    return;
  }
  console.log(`🔎 [LOGIN] ${label} (length: ${str.length}):`);
  console.log(`Raw: "${str}"`);
  console.log(`Hex: ${Buffer.from(str).toString('hex')}`);
}

// Générer un token de session (expirant dans 30 jours)
function generateSessionToken(): string {
  return uuidv4();
}

export async function POST(req: NextRequest) {
  try {
    console.log('⏳ [LOGIN] Début du processus de connexion');
    const body = await req.json();
    const { email, password } = body;
    
    console.log(`📧 [LOGIN] Tentative de connexion pour: ${email}`);

    // Validation des données
    if (!email || !password) {
      console.log('❌ [LOGIN] Email ou mot de passe manquant');
      return NextResponse.json({ 
        success: false,
        message: 'Email and password are required' 
      }, { status: 400 });
    }

    // Vérifier l'identifiant de l'utilisateur (email ou username)
    console.log(`🔍 [LOGIN] Recherche de l'utilisateur avec identifiant: ${email}`);
    const users = await sql`
      SELECT u.* FROM "users" u
      WHERE u.email = ${email} OR u.username = ${email}
    `;

    if (users.length === 0) {
      console.log(`❌ [LOGIN] Utilisateur non trouvé pour l'identifiant: ${email}`);
      return NextResponse.json({ 
        success: false,
        message: 'User not found. Please check your username.' 
      }, { status: 404 });
    }

    const user = users[0];
    console.log(`✅ [LOGIN] Utilisateur trouvé: ${user.id} (${user.username})`);

    // Récupérer les informations d'authentification
    console.log(`🔍 [LOGIN] Recherche de la méthode d'authentification pour l'utilisateur: ${user.id}`);
    const authMethods = await sql`
      SELECT uam.* FROM "user_auth_methods" uam
      JOIN "auth_methods" am ON uam.auth_method_id = am.id
      WHERE uam.user_id = ${user.id} AND am.name = 'email_password'
    `;

    if (authMethods.length === 0) {
      console.log(`❌ [LOGIN] Aucune méthode d'authentification par email/mot de passe trouvée pour l'utilisateur: ${user.id}`);
      return NextResponse.json({ 
        success: false,
        message: 'This account does not use password authentication.' 
      }, { status: 401 });
    }

    const authMethod = authMethods[0];
    console.log(`🔑 [LOGIN] Méthode d'authentification trouvée (ID: ${authMethod.id})`);
    console.log(`🔍 [LOGIN] Structure complète de auth_data:`, JSON.stringify(authMethod.auth_data));
    
    // S'assurer que auth_data est un objet JavaScript
    let authDataObj;
    try {
      // Si auth_data est une chaîne JSON, on la parse
      if (typeof authMethod.auth_data === 'string') {
        console.log(`🔄 [LOGIN] Conversion de auth_data de string vers objet`);
        authDataObj = JSON.parse(authMethod.auth_data);
      } else {
        // Sinon on utilise directement l'objet
        authDataObj = authMethod.auth_data;
      }
      console.log(`🔍 [LOGIN] auth_data après traitement:`, JSON.stringify(authDataObj));
    } catch (error) {
      console.error(`💥 [LOGIN] Erreur de parsing de auth_data:`, error);
      authDataObj = {};
    }
    
    const storedPassword = authDataObj?.password;
    console.log(`💾 [LOGIN] Mot de passe stocké en BDD: ${storedPassword}`);
    
    // Examiner en détail le mot de passe stocké
    inspectString(storedPassword, "Mot de passe stocké");

    // Vérifier le mot de passe
    console.log(`🔐 [LOGIN] Hachage du mot de passe fourni: ${password}`);
    const hashedInputPassword = hashPassword(password);
    console.log(`🔐 [LOGIN] Comparaison des mots de passe:`);
    console.log(`  → Stocké   : ${storedPassword}`);
    console.log(`  → Fourni   : ${hashedInputPassword}`);
    console.log(`  → Identique: ${storedPassword === hashedInputPassword}`);
    
    if (storedPassword !== hashedInputPassword) {
      console.log(`❌ [LOGIN] Les mots de passe ne correspondent pas pour l'utilisateur: ${user.id}`);
      
      // Test d'autres méthodes de hachage (pour le débogage)
      const bcryptHashed = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
      console.log(`🧪 [LOGIN] Test avec bcrypt: ${bcryptHashed}`);
      
      // Test sans trim ou avec trim
      const trimmedPassword = password.trim();
      const hashedTrimmed = createHash('sha256').update(trimmedPassword).digest('hex');
      console.log(`🧪 [LOGIN] Test avec password.trim(): ${hashedTrimmed}`);
      console.log(`🧪 [LOGIN] Correspond au stocké: ${storedPassword === hashedTrimmed}`);
      
      return NextResponse.json({ 
        success: false,
        message: 'Incorrect password. Please try again.' 
      }, { status: 401 });
    }

    console.log(`✅ [LOGIN] Mot de passe vérifié avec succès pour l'utilisateur: ${user.id}`);

    // Créer une session
    const token = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Expire dans 30 jours

    const userAgent = req.headers.get('user-agent') || '';

    // Enregistrer la session dans la base de données
    console.log(`💾 [LOGIN] Création d'une nouvelle session pour l'utilisateur: ${user.id}`);
    await sql`
      INSERT INTO "sessions" (user_id, token, expires_at, user_agent)
      VALUES (${user.id}, ${token}, ${expiresAt.toISOString()}, ${userAgent})
    `;

    // Mettre à jour la date de dernière connexion
    console.log(`📅 [LOGIN] Mise à jour de la date de dernière connexion pour l'utilisateur: ${user.id}`);
    await sql`
      UPDATE "users" SET last_login = NOW() WHERE id = ${user.id}
    `;

    // Mettre à jour la date de dernière utilisation de la méthode d'authentification
    console.log(`📅 [LOGIN] Mise à jour de la dernière utilisation de la méthode d'authentification: ${authMethod.id}`);
    await sql`
      UPDATE "user_auth_methods" SET last_used = NOW() WHERE id = ${authMethod.id}
    `;

    // Créer la réponse avec les informations utilisateur et le token
    console.log(`🎉 [LOGIN] Connexion réussie pour l'utilisateur: ${user.id}`);
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
    console.error('💥 [LOGIN] Erreur lors de la connexion:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
} 