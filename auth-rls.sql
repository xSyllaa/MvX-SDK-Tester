-- Ajout des règles de sécurité RLS (Row Level Security)
BEGIN;

-- Activer RLS sur les tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_auth_methods" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "account_links" ENABLE ROW LEVEL SECURITY;

-- Créer un rôle dédié pour l'authentification
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'auth_user') THEN
    CREATE ROLE auth_user;
  END IF;
END
$$;

-- Accorder des permissions à ce rôle
GRANT SELECT ON "auth_methods" TO auth_user;
GRANT SELECT, INSERT, UPDATE ON "users" TO auth_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON "user_auth_methods" TO auth_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON "sessions" TO auth_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON "account_links" TO auth_user;

-- Politique pour la table users
-- Les utilisateurs peuvent voir et modifier leur propre profil
CREATE POLICY "Users can view their own profile"
  ON "users"
  FOR SELECT
  TO auth_user
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON "users"
  FOR UPDATE
  TO auth_user
  USING (id = auth.uid());

-- Les utilisateurs peuvent s'inscrire
CREATE POLICY "Allow new user registration"
  ON "users"
  FOR INSERT
  TO auth_user
  WITH CHECK (true);

-- Politique pour la table user_auth_methods
-- Les utilisateurs peuvent gérer leurs propres méthodes d'authentification
CREATE POLICY "Users can manage their auth methods"
  ON "user_auth_methods"
  FOR ALL
  TO auth_user
  USING (user_id = auth.uid());

-- Politique pour la table sessions
-- Les utilisateurs peuvent gérer leurs propres sessions
CREATE POLICY "Users can manage their sessions"
  ON "sessions"
  FOR ALL
  TO auth_user
  USING (user_id = auth.uid());

-- Politique pour la table account_links
-- Les utilisateurs peuvent gérer leurs liens de compte
CREATE POLICY "Users can manage their account links as primary"
  ON "account_links"
  FOR ALL
  TO auth_user
  USING (primary_user_id = auth.uid());

CREATE POLICY "Users can view their linked accounts"
  ON "account_links"
  FOR SELECT
  TO auth_user
  USING (linked_user_id = auth.uid());

-- Fonction pour la mise à jour du timestamp de mise à jour
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement le timestamp de mise à jour
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON "users"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

COMMIT; 