import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

// Connexion à la base de données Supabase
const sql = postgres(process.env.DATABASE_URL || '');

export async function GET(request: NextRequest) {
  try {
    const counts = await sql`
      SELECT sdk_name, COUNT(*) as favorite_count
      FROM sdk_favorites
      GROUP BY sdk_name
      ORDER BY favorite_count DESC
    `;

    console.log('Raw counts data:', JSON.stringify(counts, null, 2));

    // Transformer les données en format attendu
    const formattedCounts = counts.map(row => ({
      sdk_name: row.sdk_name,
      favorite_count: Number(row.favorite_count)
    }));

    return NextResponse.json(formattedCounts);
  } catch (error) {
    console.error('Error fetching favorite counts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorite counts' },
      { status: 500 }
    );
  }
} 