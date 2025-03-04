import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { customAlphabet } from 'nanoid';
import jwt from 'jsonwebtoken';

// Configurer nanoid pour générer des identifiants
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);

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
    const anonymousUser = await db.users.findUnique({
      where: { id: anonymousUserId }
    });

    if (!anonymousUser || !anonymousUser.isAnonymous) {
      console.error('[link-account] Anonymous user not found or not anonymous:', anonymousUser);
      return NextResponse.json(
        { success: false, message: 'Anonymous user not found' },
        { status: 404 }
      );
    }

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

      // Vérifier si un utilisateur avec cet email existe déjà
      const existingUser = await db.users.findFirst({
        where: { 
          OR: [
            { email },
            { username: username || undefined }
          ],
          AND: {
            isAnonymous: false
          }
        }
      });

      if (existingUser) {
        console.error('[link-account] User with this email or username already exists:', { email, username });
        return NextResponse.json(
          { success: false, message: 'User with this email or username already exists' },
          { status: 400 }
        );
      }

      // Créer un hash du mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Utiliser les données de l'utilisateur anonyme pour créer le nouvel utilisateur ou mettre à jour l'existant
      const updatedUser = await db.users.update({
        where: { id: anonymousUserId },
        data: {
          email,
          username: username || `user_${nanoid()}`,
          displayName: displayName || email.split('@')[0],
          isAnonymous: false,
          isVerified: false,
          updatedAt: new Date()
        }
      });
      
      userId = updatedUser.id;
      
      // Créer la méthode d'authentification
      const authMethodId = await db.auth_methods.findFirst({
        where: { name: 'email_password' }
      });
      
      if (!authMethodId) {
        console.error('[link-account] Auth method not found:', 'email_password');
        return NextResponse.json(
          { success: false, message: 'Authentication method not found' },
          { status: 400 }
        );
      }
      
      // Créer l'entrée user_auth_methods
      await db.user_auth_methods.create({
        data: {
          userId: userId,
          authMethodId: authMethodId.id,
          identifier: email,
          credential: hashedPassword,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
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
    const user = await db.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        isVerified: true,
        isAnonymous: true
      }
    });
    
    if (!user) {
      console.error('[link-account] User not found after linking:', userId);
      return NextResponse.json(
        { success: false, message: 'User not found after linking' },
        { status: 500 }
      );
    }
    
    // Créer une entrée dans la table account_links pour lier les comptes
    // (même si dans ce cas, c'est le même ID, mais cela peut être utile si on change l'implémentation plus tard)
    await db.account_links.create({
      data: {
        anonymousUserId,
        fullUserId: userId,
        createdAt: new Date()
      }
    });
    
    console.log('[link-account] Account linking successful:', { anonymousUserId, fullUserId: userId });
    
    // Définir le cookie d'authentification
    const response = NextResponse.json(
      { success: true, message: 'Account linked successfully', user, token },
      { status: 200 }
    );
    
    // Supprimer le cookie anonyme (il sera remplacé par le cookie d'authentification complet)
    response.cookies.set('anonymousToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0, // Expiration immédiate
    });
    
    // Définir le cookie d'authentification
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 jours
    });
    
    return response;
  } catch (error) {
    console.error('[link-account] Error linking account:', error);
    return NextResponse.json(
      { success: false, message: 'Error linking account' },
      { status: 500 }
    );
  }
} 