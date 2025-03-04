const fetch = require('node-fetch');

// Définition des requêtes SQL pour chaque table
const sqlQueries = {
  // Table des utilisateurs
  createUsersTable: `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE,
      username VARCHAR(100) UNIQUE,
      display_name VARCHAR(255),
      avatar_url TEXT,
      is_anonymous BOOLEAN DEFAULT FALSE,
      is_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_login TIMESTAMP WITH TIME ZONE
    );
  `,
  
  // Table des méthodes d'authentification
  createAuthMethodsTable: `
    CREATE TABLE IF NOT EXISTS auth_methods (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) UNIQUE NOT NULL,
      display_name VARCHAR(100) NOT NULL,
      icon_url TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      priority INTEGER DEFAULT 0
    );
  `,
  
  // Table de liaison entre utilisateurs et méthodes d'authentification
  createUserAuthMethodsTable: `
    CREATE TABLE IF NOT EXISTS user_auth_methods (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      auth_method_id INTEGER NOT NULL REFERENCES auth_methods(id),
      auth_provider_id VARCHAR(255) NOT NULL,
      auth_data JSONB,
      is_primary BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_used TIMESTAMP WITH TIME ZONE,
      UNIQUE(user_id, auth_method_id),
      UNIQUE(auth_method_id, auth_provider_id)
    );
  `,
  
  // Table des sessions
  createSessionsTable: `
    CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(255) UNIQUE NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      ip_address VARCHAR(50),
      user_agent TEXT
    );
  `,
  
  // Table des liens entre comptes
  createAccountLinksTable: `
    CREATE TABLE IF NOT EXISTS account_links (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      primary_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      linked_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      link_type VARCHAR(50) NOT NULL,
      UNIQUE(primary_user_id, linked_user_id)
    );
  `,
  
  // Insérer les méthodes d'authentification prédéfinies
  insertAuthMethods: `
    INSERT INTO auth_methods (name, display_name, priority) VALUES
    ('email_password', 'Email & Password', 10),
    ('google', 'Google', 20),
    ('github', 'GitHub', 30),
    ('xportal', 'xPortal Wallet', 40),
    ('anonymous', 'Guest Access', 100)
    ON CONFLICT (name) DO NOTHING;
  `
};

// Fonction pour exécuter une requête SQL via l'API MCP
async function executeSql(sql, name) {
  try {
    console.log(`Exécution de la requête SQL pour ${name}...`);
    
    const response = await fetch('http://localhost:8765/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });
    
    const result = await response.json();
    
    if (result.error) {
      console.error(`Erreur lors de l'exécution de ${name}:`, result.error);
      return { success: false, error: result.error };
    } else {
      console.log(`✅ ${name} créé avec succès!`);
      return { success: true, result };
    }
  } catch (error) {
    console.error(`Erreur lors de l'exécution de ${name}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Fonction principale pour créer toutes les tables
async function createAllTables() {
  try {
    console.log("=== CRÉATION DES TABLES D'AUTHENTIFICATION ===");
    
    // Créer les tables dans l'ordre (pour respecter les dépendances)
    const operations = [
      { name: "Table des utilisateurs", sql: sqlQueries.createUsersTable },
      { name: "Table des méthodes d'authentification", sql: sqlQueries.createAuthMethodsTable },
      { name: "Table de liaison utilisateurs-méthodes", sql: sqlQueries.createUserAuthMethodsTable },
      { name: "Table des sessions", sql: sqlQueries.createSessionsTable },
      { name: "Table des liens entre comptes", sql: sqlQueries.createAccountLinksTable },
      { name: "Insertion des méthodes d'authentification", sql: sqlQueries.insertAuthMethods }
    ];
    
    // Exécuter chaque opération séquentiellement
    for (const op of operations) {
      const result = await executeSql(op.sql, op.name);
      
      if (!result.success) {
        console.error(`Échec lors de la création de ${op.name}. Arrêt du processus.`);
        return;
      }
    }
    
    console.log("\n✅ Toutes les tables d'authentification ont été créées avec succès dans Supabase!");
  } catch (error) {
    console.error("Erreur globale:", error.message);
  }
}

// Exécuter le script
createAllTables(); 