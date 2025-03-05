import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

async function getUserFromToken(req: NextRequest) {
  const authToken = req.cookies.get('auth_token')?.value;
  if (!authToken) return null;

  const sessions = await sql`
    SELECT s.*, u.id as user_id
    FROM "sessions" s
    JOIN "users" u ON s.user_id = u.id
    WHERE s.token = ${authToken} AND s.expires_at > NOW()
  `;

  if (sessions.length === 0) return null;
  return { id: sessions[0].user_id };
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { sdkName } = await request.json();
    if (!sdkName) {
      return NextResponse.json(
        { error: 'SDK name is required' },
        { status: 400 }
      );
    }

    await sql`
      INSERT INTO "sdk_favorites" (user_id, sdk_name)
      VALUES (${user.id}, ${sdkName})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { sdkName } = await request.json();
    if (!sdkName) {
      return NextResponse.json(
        { error: 'SDK name is required' },
        { status: 400 }
      );
    }

    await sql`
      DELETE FROM "sdk_favorites"
      WHERE user_id = ${user.id}
      AND sdk_name = ${sdkName}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
} 