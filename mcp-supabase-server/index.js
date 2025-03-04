require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sql = require('./db');

const app = express();
const PORT = process.env.PORT || 8765;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Définition du manifeste MCP
const MANIFEST = {
  schema_version: "v1",
  name_for_human: "Supabase Database Tools",
  name_for_model: "supabase_database",
  description_for_human: "Tools to interact with your Supabase database.",
  description_for_model: "These tools allow interaction with a Supabase PostgreSQL database. Use them to execute queries, manage data, and retrieve information from tables.",
  auth: {
    type: "none"
  },
  api: {
    type: "openapi",
    url: `http://localhost:${PORT}/openapi.json`
  },
  logo_url: "https://supabase.com/favicon/favicon-32x32.png",
  contact_email: "support@example.com",
  legal_info_url: "https://example.com/legal"
};

// Définition de l'OpenAPI pour le MCP
const OPENAPI_SPEC = {
  openapi: "3.0.0",
  info: {
    title: "Supabase Database API",
    description: "API for interacting with Supabase PostgreSQL database",
    version: "1.0.0"
  },
  servers: [
    {
      url: `http://localhost:${PORT}`
    }
  ],
  paths: {
    "/query": {
      post: {
        summary: "Execute a SQL query",
        description: "Execute a SQL query on the Supabase database and return the results",
        operationId: "executeQuery",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "SQL query to execute"
                  }
                },
                required: ["query"]
              }
            }
          }
        },
        responses: {
          200: {
            description: "Query executed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    results: {
                      type: "array",
                      items: {
                        type: "object"
                      }
                    }
                  }
                }
              }
            }
          },
          400: {
            description: "Invalid query"
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/tables": {
      get: {
        summary: "List all tables",
        description: "List all tables in the database",
        operationId: "listTables",
        responses: {
          200: {
            description: "List of tables",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    tables: {
                      type: "array",
                      items: {
                        type: "string"
                      }
                    }
                  }
                }
              }
            }
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/tables/{tableName}/schema": {
      get: {
        summary: "Get table schema",
        description: "Get the schema for a specific table",
        operationId: "getTableSchema",
        parameters: [
          {
            name: "tableName",
            in: "path",
            required: true,
            schema: {
              type: "string"
            },
            description: "Name of the table"
          }
        ],
        responses: {
          200: {
            description: "Table schema",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    columns: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: {
                            type: "string"
                          },
                          type: {
                            type: "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          404: {
            description: "Table not found"
          },
          500: {
            description: "Server error"
          }
        }
      }
    }
  }
};

// Routes MCP
app.get("/.well-known/ai-plugin.json", (req, res) => {
  res.json(MANIFEST);
});

app.get("/openapi.json", (req, res) => {
  res.json(OPENAPI_SPEC);
});

// Route pour l'endpoint SSE (Server-Sent Events)
app.get("/sse", (req, res) => {
  console.log("Nouvelle connexion SSE établie");
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const sendEvent = (eventName, data) => {
    res.write(`event: ${eventName}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };
  
  // Ping pour maintenir la connexion active
  const pingInterval = setInterval(() => {
    sendEvent('ping', { timestamp: new Date().toISOString() });
  }, 30000);
  
  // Envoyer le manifeste initial
  sendEvent('manifest', MANIFEST);
  
  // Gérer la fermeture de la connexion
  req.on('close', () => {
    console.log("Connexion SSE fermée");
    clearInterval(pingInterval);
  });
});

// API routes pour interagir avec la base de données
app.post("/query", async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }
    
    // Exécution de la requête SQL
    const results = await sql.unsafe(query);
    res.json({ results });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/tables", async (req, res) => {
  try {
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    const tables = result.map(row => row.table_name);
    res.json({ tables });
  } catch (error) {
    console.error("Error listing tables:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/tables/:tableName/schema", async (req, res) => {
  try {
    const { tableName } = req.params;
    
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = ${tableName}
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ error: "Table not found" });
    }
    
    const columns = result.map(row => ({
      name: row.column_name,
      type: row.data_type
    }));
    
    res.json({ columns });
  } catch (error) {
    console.error("Error getting table schema:", error);
    res.status(500).json({ error: error.message });
  }
});

// Route racine pour vérifier que le serveur est en cours d'exécution
app.get("/", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "MCP Supabase server is running!", 
    endpoints: {
      sse: "/sse",
      tables: "/tables",
      openapi: "/openapi.json"
    }
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`MCP Supabase server is running on port ${PORT}`);
}); 