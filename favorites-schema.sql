-- Création de la table des favoris
BEGIN;

-- Table des favoris SDK
CREATE TABLE IF NOT EXISTS sdk_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sdk_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, sdk_name)
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_sdk_favorites_sdk_name ON sdk_favorites(sdk_name);
CREATE INDEX IF NOT EXISTS idx_sdk_favorites_user_id ON sdk_favorites(user_id);

-- Vue pour compter le nombre de favoris par SDK
CREATE OR REPLACE VIEW sdk_favorites_count AS
SELECT 
  sdk_name,
  COUNT(*) as favorite_count
FROM sdk_favorites
GROUP BY sdk_name;

COMMIT; 