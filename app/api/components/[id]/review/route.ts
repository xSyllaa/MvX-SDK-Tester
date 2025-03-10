import { NextResponse } from 'next/server';

// Cette route permet de mettre à jour le statut "is_reviewed" d'un composant
export async function POST(
  request: Request
) {
  try {
    // Récupérer l'ID du composant depuis l'URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const componentId = pathParts[pathParts.length - 2]; // L'ID est l'avant-dernier segment
    
    if (!componentId) {
      return NextResponse.json(
        { error: 'Component ID is required' },
        { status: 400 }
      );
    }
    
    // Récupérer les données de la requête
    const data = await request.json();
    const isReviewed = data.isReviewed === true;
    const status = data.status || 'pending'; // pending, approved, rejected
    
    // Mise à jour du composant
    const mcpResponse = await fetch('http://localhost:8765/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          UPDATE "components"
          SET 
            "is_reviewed" = ${isReviewed},
            "status" = '${status.replace(/'/g, "''")}'
          WHERE "id" = '${componentId}'
        `
      })
    });
    
    const mcpResult = await mcpResponse.json();
    
    if (!mcpResponse.ok) {
      console.error('MCP server error:', mcpResult);
      return NextResponse.json(
        { error: 'Failed to update component' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Component ${isReviewed ? 'reviewed' : 'unreviewed'} successfully`
    });
  } catch (error) {
    console.error('Error updating component review status:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 