import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL || '');

export async function GET(
  request: NextRequest
) {
  try {
    // Extraire l'ID utilisateur directement depuis l'URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const userId = pathParts[pathParts.length - 1]; // L'ID est le dernier segment

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const favorites = await sql`
      SELECT sdk_name
      FROM sdk_favorites
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json(favorites);
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
} 