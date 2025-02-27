import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  const token = process.env.GITHUB_TOKEN || '';
  
  if (!url) {
    return NextResponse.json({ error: 'URL manquante' }, { status: 400 });
  }
  
  console.log(`🔄 Proxy serveur - Récupération: ${url}`);
  
  try {
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.arrayBuffer();
    
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename=repo.zip'
      }
    });
  } catch (error: any) {
    console.error('❌ Erreur proxy:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 