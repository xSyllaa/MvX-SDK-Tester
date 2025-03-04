-- Création des tables d'authentification
BEGIN;

-- Table des utilisateurs
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

-- Table des méthodes d'authentification
CREATE TABLE IF NOT EXISTS auth_methods (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  icon_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0
);

-- Table de liaison entre utilisateurs et méthodes d'authentification
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

-- Table des sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address VARCHAR(50),
  user_agent TEXT
);

-- Table des liens entre comptes
CREATE TABLE IF NOT EXISTS account_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  linked_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  link_type VARCHAR(50) NOT NULL,
  UNIQUE(primary_user_id, linked_user_id)
);

-- Initialiser les méthodes d'authentification
INSERT INTO auth_methods (name, display_name, priority) VALUES
('email_password', 'Email & Password', 10),
('google', 'Google', 20),
('github', 'GitHub', 30),
('xportal', 'xPortal Wallet', 40),
('anonymous', 'Guest Access', 100)
ON CONFLICT (name) DO NOTHING;

COMMIT; 