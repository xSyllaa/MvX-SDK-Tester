-- Schéma pour suivre les requêtes à l'IA par utilisateur

-- Table pour suivre les quotas des utilisateurs
CREATE TABLE IF NOT EXISTS "ai_usage" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "date" DATE NOT NULL DEFAULT CURRENT_DATE,
  "request_count" INTEGER NOT NULL DEFAULT 1,
  "last_request_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte unique pour s'assurer qu'il y a une seule entrée par utilisateur par jour
  UNIQUE("user_id", "date"),
  
  -- Contrainte de clé étrangère vers la table des utilisateurs
  CONSTRAINT "fk_user" FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Index pour améliorer la performance des requêtes
CREATE INDEX IF NOT EXISTS "idx_ai_usage_user_date" ON "ai_usage"("user_id", "date");

-- Fonction pour incrémenter le compteur de requêtes d'un utilisateur
CREATE OR REPLACE FUNCTION increment_ai_usage(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  -- Insérer ou mettre à jour l'entrée pour l'utilisateur aujourd'hui
  INSERT INTO "ai_usage" ("user_id", "date", "request_count", "last_request_at")
  VALUES (user_uuid, CURRENT_DATE, 1, NOW())
  ON CONFLICT ("user_id", "date") 
  DO UPDATE SET 
    "request_count" = "ai_usage"."request_count" + 1,
    "last_request_at" = NOW()
  RETURNING "request_count" INTO current_count;
  
  RETURN current_count;
END;
$$ LANGUAGE plpgsql; 