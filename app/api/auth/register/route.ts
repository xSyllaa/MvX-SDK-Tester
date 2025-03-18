import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import postgres from 'postgres';
import { v4 as uuidv4 } from 'uuid';

// Utiliser notre module db.js centralisé pour éviter de multiplier les connexions
import sql from '@/lib/db';

// Fonction pour hacher le mot de passe
function hashPassword(password: string): string {
  console.log('🔍 [REGISTER] Hashing password with SHA-256');
  console.log(`🔡 [REGISTER] Password string before hashing: "${password}" (length: ${password.length})`);
  const hash = createHash('sha256').update(password).digest('hex');
  console.log(`🔑 [REGISTER] Resulting hash: ${hash}`);
  return hash;
}

export async function POST(req: NextRequest) {
  try {
    console.log('⏳ [REGISTER] Début du processus d\'inscription');
    const body = await req.json();
    const { email, password, username, displayName } = body;
    
    console.log(`📧 [REGISTER] Tentative d'inscription pour: ${email}, username: ${username}`);

    // Validation des données
    if (!email || !password) {
      console.log('❌ [REGISTER] Email ou mot de passe manquant');
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Vérifier si l'utilisateur existe déjà
    console.log(`🔍 [REGISTER] Vérification si l'utilisateur existe déjà: ${email} ou ${username}`);
    const existingUser = await sql`
      SELECT * FROM "users" WHERE email = ${email} OR username = ${username}
    `;

    if (existingUser.length > 0) {
      console.log(`❌ [REGISTER] Utilisateur existe déjà: ${email} ou ${username}`);
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Créer le nouvel utilisateur
    console.log(`🔐 [REGISTER] Hachage du mot de passe pour: ${email}`);
    const hashedPassword = hashPassword(password);
    console.log(`💾 [REGISTER] Mot de passe haché: ${hashedPassword}`);
    
    // Transaction pour créer l'utilisateur et sa méthode d'authentification
    console.log(`📝 [REGISTER] Début de la transaction pour créer l'utilisateur: ${email}`);
    await sql.begin(async (sql) => {
      // Créer l'utilisateur
      console.log(`👤 [REGISTER] Création de l'utilisateur: ${email}`);
      const newUser = await sql`
        INSERT INTO "users" (email, username, display_name, is_verified)
        VALUES (${email}, ${username}, ${displayName || username}, false)
        RETURNING *
      `;
      
      const userId = newUser[0].id;
      console.log(`✅ [REGISTER] Utilisateur créé avec ID: ${userId}`);
      
      // Récupérer l'ID de la méthode d'authentification par email/password
      console.log(`🔍 [REGISTER] Récupération de l'ID de la méthode d'authentification par email/password`);
      const authMethod = await sql`
        SELECT id FROM "auth_methods" WHERE name = 'email_password'
      `;
      
      const authMethodId = authMethod[0].id;
      console.log(`🔑 [REGISTER] ID de la méthode d'authentification: ${authMethodId}`);
      
      // Créer la méthode d'authentification pour cet utilisateur
      console.log(`🔒 [REGISTER] Création de la méthode d'authentification pour l'utilisateur: ${userId}`);
      // Ici le mot de passe est correctement stocké dans auth_data sous forme de JSON,
      // donc lors de la lecture il faudra parser cette chaîne
      const authData = JSON.stringify({ password: hashedPassword });
      console.log(`🔒 [REGISTER] Données d'authentification: ${authData}`);
      await sql`
        INSERT INTO "user_auth_methods" (user_id, auth_method_id, auth_provider_id, auth_data, is_primary)
        VALUES (
          ${userId}, 
          ${authMethodId}, 
          ${email}, 
          ${authData}, 
          true
        )
      `;
      console.log(`✅ [REGISTER] Méthode d'authentification créée avec succès pour l'utilisateur: ${userId}`);
    });

    console.log(`🎉 [REGISTER] Inscription réussie pour: ${email}`);
    return NextResponse.json({ success: true, message: 'User registered successfully' }, { status: 201 });
  } catch (error) {
    console.error('💥 [REGISTER] Erreur lors de l\'inscription:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
} 