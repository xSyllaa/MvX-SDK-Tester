import { NextRequest, NextResponse } from 'next/server';

interface ComponentSubmission {
  title: string;
  description: string;
  category: string;
  tags: string[];
  githubUrl: string;
  isPublic: boolean;
  authorId?: string; // Optionnel si l'utilisateur est connecté
}

interface Component {
  id: string;
  title: string;
  description: string;
  category: string;
  github_url: string;
  is_public: boolean;
  author_id?: string;
  created_at: string;
  updated_at: string;
  status: string;
  downloads: number;
  is_reviewed: boolean;
}

export async function GET(request: NextRequest) {
  try {
    // L'URL peut contenir des paramètres (ex: /api/components?status=approved)
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'any';
    const isReviewed = searchParams.get('isReviewed');
    
    // Construire la requête pour récupérer les composants
    let query = `SELECT * FROM "components"`;
    
    // Ajouter des conditions si nécessaire
    const conditions = [];
    
    if (status !== 'any') {
      conditions.push(`"status" = '${status.replace(/'/g, "''")}'`);
    }
    
    if (isReviewed === 'true') {
      conditions.push(`"is_reviewed" = TRUE`);
    } else if (isReviewed === 'false') {
      conditions.push(`"is_reviewed" = FALSE`);
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    // Ajouter l'ordre par date de création
    query += ` ORDER BY "created_at" DESC`;
    
    // Appeler le serveur MCP pour exécuter la requête
    const componentsResponse = await fetch('http://localhost:8765/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    });
    
    const componentsResult = await componentsResponse.json();
    
    if (!componentsResponse.ok) {
      console.error('MCP server error:', componentsResult);
      return NextResponse.json(
        { error: 'Failed to fetch components' },
        { status: 500 }
      );
    }
    
    // Récupérer les composants
    const components: Component[] = componentsResult.results || [];
    
    // Pour chaque composant, récupérer ses tags
    const componentsWithTags = await Promise.all(components.map(async (component) => {
      // Requête pour récupérer les tags
      const tagsQuery = `
        SELECT "tag" FROM "component_tags" 
        WHERE "component_id" = '${component.id}'
      `;
      
      const tagsResponse = await fetch('http://localhost:8765/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: tagsQuery })
      });
      
      const tagsResult = await tagsResponse.json();
      
      // Extraire les tags
      const tags = tagsResult.results ? tagsResult.results.map((tag: any) => tag.tag) : [];
      
      // Retourner le composant avec ses tags
      return {
        ...component,
        tags
      };
    }));
    
    return NextResponse.json(componentsWithTags);
  } catch (error) {
    console.error('Error fetching components:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Récupérer les données de la requête
    const data: ComponentSubmission = await request.json();
    
    // Validation de base des données
    if (!data.title || !data.description || !data.category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!data.githubUrl) {
      return NextResponse.json(
        { error: 'GitHub URL is required' },
        { status: 400 }
      );
    }

    // Appeler le serveur MCP pour interagir avec Supabase
    const mcpResponse = await fetch('http://localhost:8765/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          WITH component_insert AS (
            INSERT INTO "components" (
              "title", "description", "category", "github_url", 
              "is_public", "author_id"
            ) VALUES (
              '${data.title.replace(/'/g, "''")}', 
              '${data.description.replace(/'/g, "''")}', 
              '${data.category.replace(/'/g, "''")}', 
              '${data.githubUrl.replace(/'/g, "''")}', 
              ${data.isPublic}, 
              ${data.authorId ? `'${data.authorId}'` : 'NULL'}
            )
            RETURNING "id"
          )
          SELECT "id" FROM component_insert
        `
      })
    });

    const mcpResult = await mcpResponse.json();
    
    if (!mcpResponse.ok) {
      console.error('MCP server error:', mcpResult);
      return NextResponse.json(
        { error: 'Failed to save component' },
        { status: 500 }
      );
    }

    const componentId = mcpResult.results[0]?.id;

    // Insérer les tags si présents
    if (data.tags && data.tags.length > 0 && componentId) {
      const tagsInsertPromises = data.tags.map(tag => {
        return fetch('http://localhost:8765/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              INSERT INTO "component_tags" ("component_id", "tag")
              VALUES ('${componentId}', '${tag.replace(/'/g, "''")}')
            `
          })
        });
      });

      await Promise.all(tagsInsertPromises);
    }

    return NextResponse.json({
      success: true,
      message: 'Component submitted successfully',
      componentId
    });
  } catch (error) {
    console.error('Error submitting component:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 