-- Configuration de toutes les tables et fonctions pour MvxLib
-- Pour exécuter: Allez dans l'interface Supabase, SQL Editor, puis collez ce script

-- Table pour les inscriptions à la liste d'attente
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255),
  wallet_address VARCHAR(255),
  subscription_tier VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status VARCHAR(50) DEFAULT 'pending',
  
  -- Contraintes
  CONSTRAINT waitlist_contact_check CHECK (
    (email IS NOT NULL AND wallet_address IS NULL) OR
    (email IS NULL AND wallet_address IS NOT NULL)
  ),
  CONSTRAINT waitlist_tier_check CHECK (
    subscription_tier IN ('premium', 'enterprise')
  )
);

-- Index pour améliorer les performances des recherches
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_waitlist_wallet ON waitlist(wallet_address) WHERE wallet_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_waitlist_tier ON waitlist(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at);

-- Fonction pour ajouter un utilisateur à la liste d'attente
CREATE OR REPLACE FUNCTION add_to_waitlist(
  p_email TEXT DEFAULT NULL,
  p_wallet_address TEXT DEFAULT NULL,
  p_subscription_tier TEXT DEFAULT 'premium',
  p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  -- Vérifier si un contact similaire existe déjà
  IF p_email IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM waitlist WHERE email = p_email AND subscription_tier = p_subscription_tier) THEN
      RAISE EXCEPTION 'Email is already on the waitlist for this tier';
    END IF;
  ELSIF p_wallet_address IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM waitlist WHERE wallet_address = p_wallet_address AND subscription_tier = p_subscription_tier) THEN
      RAISE EXCEPTION 'Wallet address is already on the waitlist for this tier';
    END IF;
  END IF;

  -- Insérer la nouvelle entrée dans la liste d'attente
  INSERT INTO waitlist (email, wallet_address, subscription_tier, notes)
  VALUES (p_email, p_wallet_address, p_subscription_tier, p_notes)
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Table pour le suivi des requêtes API
CREATE TABLE IF NOT EXISTS api_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  request_type VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  request_data JSONB DEFAULT '{}'::jsonb,
  subscription_plan VARCHAR(50) DEFAULT 'free',
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Index pour améliorer les performances des requêtes sur api_requests
CREATE INDEX IF NOT EXISTS idx_api_requests_user_id ON api_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_api_requests_timestamp ON api_requests(timestamp);
CREATE INDEX IF NOT EXISTS idx_api_requests_type ON api_requests(request_type);

-- Fonction pour obtenir l'utilisation de l'API par un utilisateur
CREATE OR REPLACE FUNCTION get_user_api_usage(p_user_id UUID) 
RETURNS TABLE (
  daily_count BIGINT,
  weekly_count BIGINT,
  monthly_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE timestamp > current_date) AS daily_count,
    COUNT(*) FILTER (WHERE timestamp > (current_date - interval '7 days')) AS weekly_count,
    COUNT(*) FILTER (WHERE timestamp > (current_date - interval '30 days')) AS monthly_count
  FROM
    api_requests
  WHERE
    user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour journaliser une requête API
CREATE OR REPLACE FUNCTION log_api_request(
  p_user_id UUID,
  p_request_type VARCHAR(50),
  p_request_data JSONB DEFAULT '{}'::jsonb,
  p_subscription_plan VARCHAR(50) DEFAULT 'free'
) RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO api_requests (user_id, request_type, request_data, subscription_plan)
  VALUES (p_user_id, p_request_type, p_request_data, p_subscription_plan)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vue pour résumer l'utilisation de l'API par utilisateur
CREATE OR REPLACE VIEW user_api_usage_summary AS
SELECT
  user_id,
  COUNT(*) FILTER (WHERE timestamp > current_date) AS today_count,
  COUNT(*) FILTER (WHERE timestamp > (current_date - interval '7 days')) AS week_count,
  COUNT(*) FILTER (WHERE timestamp > (current_date - interval '30 days')) AS month_count
FROM
  api_requests
GROUP BY
  user_id;

-- Fonction pour exécuter des requêtes SQL dynamiques depuis l'API
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Important pour la sécurité
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Exécuter la requête dynamiquement et stocker le résultat en JSON
  EXECUTE 'SELECT json_agg(t) FROM (' || sql_query || ') t' INTO result;
  RETURN COALESCE(result, '[]'::jsonb);
EXCEPTION WHEN OTHERS THEN
  -- En cas d'erreur, retourner les détails
  RETURN jsonb_build_object(
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$;

-- Ajouter une colonne subscription_plan aux utilisateurs si elle n'existe pas déjà
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name = 'subscription_plan'
  ) THEN
    ALTER TABLE "users" ADD COLUMN subscription_plan VARCHAR(50) DEFAULT 'free';
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Ignorer les erreurs si la colonne existe déjà
END $$; 