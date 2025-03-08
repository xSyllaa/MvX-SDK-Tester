require('dotenv').config();
const fetch = require('node-fetch');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Fonction pour exécuter une requête SQL via l'API MCP
async function executeSql(sql) {
  try {
    const response = await fetch('http://localhost:8765/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`MCP server error: ${JSON.stringify(result)}`);
    }
    
    return result;
  } catch (error) {
    console.error('Erreur:', error);
    return { error: error.message };
  }
}

// Fonction pour afficher les composants en attente de revue
async function listPendingComponents() {
  console.log('Récupération des composants en attente de revue...');
  
  const result = await executeSql(`
    SELECT * FROM "components" 
    WHERE "is_reviewed" = FALSE 
    ORDER BY "created_at" DESC
  `);
  
  if (result.error) {
    console.error('Erreur lors de la récupération des composants:', result.error);
    return [];
  }
  
  const components = result.results || [];
  
  if (components.length === 0) {
    console.log('Aucun composant en attente de revue.');
    return [];
  }
  
  console.log(`\n${components.length} composant(s) en attente de revue :\n`);
  
  components.forEach((component, index) => {
    console.log(`${index + 1}. ${component.title}`);
    console.log(`   ID: ${component.id}`);
    console.log(`   Description: ${component.description}`);
    console.log(`   Catégorie: ${component.category}`);
    console.log(`   GitHub URL: ${component.github_url}`);
    console.log(`   Créé le: ${new Date(component.created_at).toLocaleString()}`);
    console.log('');
  });
  
  return components;
}

// Fonction pour récupérer les tags d'un composant
async function getComponentTags(componentId) {
  const result = await executeSql(`
    SELECT "tag" FROM "component_tags" 
    WHERE "component_id" = '${componentId}'
  `);
  
  if (result.error) {
    console.error('Erreur lors de la récupération des tags:', result.error);
    return [];
  }
  
  return result.results ? result.results.map(tag => tag.tag) : [];
}

// Fonction pour examiner et approuver/rejeter un composant
async function reviewComponent(component) {
  const tags = await getComponentTags(component.id);
  
  console.log(`\nExamen du composant: ${component.title}`);
  console.log(`Description: ${component.description}`);
  console.log(`Catégorie: ${component.category}`);
  console.log(`GitHub URL: ${component.github_url}`);
  console.log(`Tags: ${tags.join(', ') || 'Aucun'}`);
  
  return new Promise((resolve) => {
    rl.question('\nApprouver ce composant ? (y/n): ', async (answer) => {
      const isApproved = answer.toLowerCase() === 'y';
      const status = isApproved ? 'approved' : 'rejected';
      
      const updateResult = await executeSql(`
        UPDATE "components"
        SET 
          "is_reviewed" = TRUE,
          "status" = '${status}'
        WHERE "id" = '${component.id}'
      `);
      
      if (updateResult.error) {
        console.error('Erreur lors de la mise à jour du composant:', updateResult.error);
        resolve(false);
      } else {
        console.log(`Le composant a été ${isApproved ? 'approuvé' : 'rejeté'}.`);
        resolve(true);
      }
    });
  });
}

// Fonction principale
async function main() {
  try {
    console.log('=== OUTIL DE REVUE DES COMPOSANTS ===\n');
    
    const components = await listPendingComponents();
    
    if (components.length === 0) {
      rl.close();
      return;
    }
    
    rl.question('\nEntrez le numéro du composant à examiner (ou "q" pour quitter): ', async (answer) => {
      if (answer.toLowerCase() === 'q') {
        rl.close();
        return;
      }
      
      const index = parseInt(answer) - 1;
      
      if (isNaN(index) || index < 0 || index >= components.length) {
        console.log('Numéro de composant invalide.');
        rl.close();
        return;
      }
      
      const component = components[index];
      await reviewComponent(component);
      
      rl.close();
    });
  } catch (error) {
    console.error('Erreur:', error);
    rl.close();
  }
}

// Point d'entrée
main();

// Gestionnaire de fermeture
rl.on('close', () => {
  console.log('\nAu revoir!');
  process.exit(0);
}); 