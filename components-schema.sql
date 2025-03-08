-- Schéma pour la table des composants

-- Table principale des composants
CREATE TABLE IF NOT EXISTS "components" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" VARCHAR(100) NOT NULL,
  "description" TEXT NOT NULL,
  "category" VARCHAR(50) NOT NULL,
  "github_url" VARCHAR(255),
  "author_id" UUID,
  "is_public" BOOLEAN DEFAULT TRUE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "status" VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  "downloads" INT DEFAULT 0,
  
  -- Contrainte de clé étrangère vers la table des utilisateurs si l'auteur est connecté
  CONSTRAINT "fk_author" FOREIGN KEY("author_id") REFERENCES "users"("id") ON DELETE SET NULL
);

-- Table pour les tags des composants (relation many-to-many)
CREATE TABLE IF NOT EXISTS "component_tags" (
  "component_id" UUID NOT NULL,
  "tag" VARCHAR(50) NOT NULL,
  
  PRIMARY KEY ("component_id", "tag"),
  CONSTRAINT "fk_component" FOREIGN KEY("component_id") REFERENCES "components"("id") ON DELETE CASCADE
);

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS "idx_components_category" ON "components"("category");
CREATE INDEX IF NOT EXISTS "idx_components_status" ON "components"("status");
CREATE INDEX IF NOT EXISTS "idx_components_created_at" ON "components"("created_at");
CREATE INDEX IF NOT EXISTS "idx_component_tags_tag" ON "component_tags"("tag"); 