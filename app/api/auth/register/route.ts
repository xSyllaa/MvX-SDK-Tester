import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import postgres from 'postgres';
import { v4 as uuidv4 } from 'uuid';

// Utiliser notre module db.js centralisé pour éviter de multiplier les connexions
import sql from '@/lib/db';

// Fonction pour hacher le mot de passe
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, username, displayName } = body;

    // Validation des données
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await sql`
      SELECT * FROM "users" WHERE email = ${email} OR username = ${username}
    `;

    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Créer le nouvel utilisateur
    const hashedPassword = hashPassword(password);
    
    // Transaction pour créer l'utilisateur et sa méthode d'authentification
    await sql.begin(async (sql) => {
      // Créer l'utilisateur
      const newUser = await sql`
        INSERT INTO "users" (email, username, display_name, is_verified)
        VALUES (${email}, ${username}, ${displayName || username}, false)
        RETURNING *
      `;
      
      const userId = newUser[0].id;
      
      // Récupérer l'ID de la méthode d'authentification par email/password
      const authMethod = await sql`
        SELECT id FROM "auth_methods" WHERE name = 'email_password'
      `;
      
      const authMethodId = authMethod[0].id;
      
      // Créer la méthode d'authentification pour cet utilisateur
      await sql`
        INSERT INTO "user_auth_methods" (user_id, auth_method_id, auth_provider_id, auth_data, is_primary)
        VALUES (
          ${userId}, 
          ${authMethodId}, 
          ${email}, 
          ${JSON.stringify({ password: hashedPassword })}, 
          true
        )
      `;
    });

    return NextResponse.json({ success: true, message: 'User registered successfully' }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
} 