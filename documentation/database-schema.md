# Structure de Base de Données - MvX SDK Tester

## 1. Authentification et Utilisateurs

### 1.1 Tables Principales

```sql
-- Table principale des utilisateurs
-- Cette table stocke les informations de base des utilisateurs. Seul l'ID est obligatoire, 
-- les autres champs peuvent être remplis progressivement via la page account.
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name VARCHAR(100),                    -- Nom d'affichage public
    username VARCHAR(50) UNIQUE,                  -- Username optionnel pour login
    email VARCHAR(255) UNIQUE,                    -- Email optionnel pour login/notifications
    avatar_url TEXT,                             -- URL de l'avatar
    xportal_address VARCHAR(255) UNIQUE,         -- Adresse XPortal pour login/paiements
    github_username VARCHAR(100) UNIQUE,          -- Username GitHub pour login/intégrations
    is_verified BOOLEAN DEFAULT FALSE,           -- Vérification du compte
    subscription_plan VARCHAR(20) DEFAULT 'free', -- Plan de souscription actuel
    preferences JSONB DEFAULT '{}',              -- Préférences utilisateur (notifications, thème, etc.)
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Méthodes d'authentification disponibles
-- Cette table définit les différentes méthodes d'authentification supportées par l'application
-- avec leur configuration et statut
CREATE TABLE auth_providers (
    id VARCHAR(20) PRIMARY KEY,                -- 'github', 'gmail', 'xportal', 'credentials'
    display_name VARCHAR(50) NOT NULL,         -- Nom affiché dans l'UI
    is_active BOOLEAN DEFAULT TRUE,            -- Permet de désactiver temporairement une méthode
    icon_url TEXT,                             -- Icône pour l'UI
    priority INTEGER DEFAULT 0,                -- Ordre d'affichage dans l'UI
    config JSONB,                              -- Configuration spécifique au provider
    required_fields JSONB,                     -- Champs requis pour cette méthode
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Liens entre utilisateurs et méthodes d'auth
-- Cette table associe les utilisateurs à leurs méthodes d'authentification,
-- permettant plusieurs méthodes par utilisateur
CREATE TABLE user_auth_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider_id VARCHAR(20) REFERENCES auth_providers(id),
    provider_user_id TEXT,                     -- ID externe (ex: ID GitHub)
    auth_data JSONB,                          -- Données spécifiques au provider
    is_primary BOOLEAN DEFAULT FALSE,          -- Méthode principale de connexion
    last_used_at TIMESTAMP WITH TIME ZONE,     -- Dernière utilisation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, provider_id)
);

-- Sessions utilisateurs
-- Cette table gère les sessions actives des utilisateurs avec un système
-- de refresh token pour la sécurité
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,                -- Token principal
    refresh_token TEXT UNIQUE,                 -- Token de rafraîchissement
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    device_info JSONB,                         -- Informations sur l'appareil
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Table de vérification
-- Cette table gère les codes de vérification pour les différentes actions
-- (vérification email, réinitialisation mot de passe, etc.)
CREATE TABLE verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,                 -- 'email', 'password_reset', etc.
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 1.2 Index et Contraintes

```sql
-- Index pour optimiser les recherches
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_refresh ON sessions(refresh_token);
CREATE INDEX idx_user_auth_provider ON user_auth_methods(user_id, provider_id);

-- Trigger pour mise à jour automatique
CREATE TRIGGER update_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## 2. Gestion des SDKs et Components

### 2.1 Tables Principales

```sql
-- Catégories de tags
-- Cette table définit les différentes catégories de tags (language, framework, etc.)
-- permettant une meilleure organisation et filtrage des SDKs et components
CREATE TABLE tag_categories (
    id VARCHAR(30) PRIMARY KEY,                -- 'language', 'framework', 'platform', etc.
    display_name VARCHAR(50) NOT NULL,         -- Nom affiché dans l'UI
    color VARCHAR(7) NOT NULL,                 -- Code couleur HEX pour l'UI
    description TEXT,                          -- Description de la catégorie
    priority INTEGER DEFAULT 0                 -- Ordre d'affichage
);

-- Tags disponibles
-- Cette table contient tous les tags possibles, organisés par catégories
-- pour classifier les SDKs et components
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id VARCHAR(30) REFERENCES tag_categories(id),
    name VARCHAR(50) NOT NULL,                 -- Identifiant technique
    display_name VARCHAR(50),                  -- Nom affiché dans l'UI
    icon_url TEXT,                            -- Icône optionnelle
    UNIQUE(category_id, name)
);

-- SDKs
-- Table principale des SDKs disponibles dans la plateforme
-- avec leurs métadonnées et statistiques
CREATE TABLE sdks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,         -- Nom unique du SDK
    description TEXT NOT NULL,                 -- Description détaillée
    github_url TEXT NOT NULL,                 -- Lien vers le repo GitHub
    documentation_url TEXT,                    -- Lien vers la documentation
    version VARCHAR(20),                       -- Version actuelle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    stars_count INTEGER DEFAULT 0,             -- Nombre d'étoiles GitHub
    downloads_count INTEGER DEFAULT 0,         -- Nombre de téléchargements
    is_official BOOLEAN DEFAULT FALSE,         -- SDK officiel ou communautaire
    maintainer_id UUID REFERENCES users(id),   -- Responsable du SDK
    status VARCHAR(20) DEFAULT 'active'        -- 'active', 'deprecated', 'beta'
);

-- Association SDKs-Tags
-- Table de liaison permettant d'associer plusieurs tags à chaque SDK
CREATE TABLE sdk_tags (
    sdk_id UUID REFERENCES sdks(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (sdk_id, tag_id)
);

-- Components créés par les utilisateurs
-- Cette table stocke les components de la bibliothèque communautaire
-- avec leur métadonnées et statuts de modération
CREATE TABLE components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,               -- Titre du component
    description TEXT NOT NULL,                 -- Description détaillée
    author_id UUID REFERENCES users(id),       -- Créateur du component
    github_url TEXT NOT NULL,                 -- Lien vers le code source
    live_demo_url TEXT,                       -- Lien vers la démo
    is_public BOOLEAN DEFAULT FALSE,          -- Visibilité publique
    is_approved BOOLEAN DEFAULT FALSE,        -- Approuvé par modération
    sdk_version_support JSONB,                -- Versions SDK supportées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    downloads_count INTEGER DEFAULT 0,         -- Statistiques d'utilisation
    average_rating DECIMAL(3,2),              -- Note moyenne
    status VARCHAR(20) DEFAULT 'pending'       -- 'pending', 'approved', 'rejected'
);

-- Association Components-Tags
-- Table de liaison pour les tags des components
CREATE TABLE component_tags (
    component_id UUID REFERENCES components(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (component_id, tag_id)
);

-- Évaluations des components
-- Système de notation et commentaires pour les components
CREATE TABLE component_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_id UUID REFERENCES components(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5), -- Note de 1 à 5
    comment TEXT,                                 -- Commentaire optionnel
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_verified_user BOOLEAN DEFAULT FALSE,       -- Utilisateur vérifié
    UNIQUE(component_id, user_id)
);
```

## 3. Suivi des Requêtes Chatbot

### 3.1 Tables Principales

```sql
-- Configuration des limites par plan
-- Définit les limites d'utilisation pour chaque plan de souscription
CREATE TABLE subscription_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_name VARCHAR(20) NOT NULL UNIQUE,      -- 'free', 'premium', 'enterprise'
    daily_message_limit INTEGER,                -- Limite de messages par jour
    weekly_message_limit INTEGER,               -- Limite de messages par semaine
    monthly_message_limit INTEGER,              -- Limite de messages par mois
    max_tokens_per_message INTEGER,             -- Limite de tokens par message
    max_tokens_per_day INTEGER,                 -- Limite de tokens par jour
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Données initiales pour les limites
INSERT INTO subscription_limits 
(plan_name, daily_message_limit, weekly_message_limit, monthly_message_limit, max_tokens_per_message, max_tokens_per_day)
VALUES
('free', 10, 50, 100, 1000, 10000),
('premium', 50, 250, 1000, 2000, 50000),
('enterprise', NULL, NULL, NULL, 4000, NULL);  -- NULL signifie illimité

-- Messages du chatbot
-- Stocke tous les messages avec leur contexte et leur groupement en conversations
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,              -- ID de groupement des messages d'une même conversation
    user_id UUID REFERENCES users(id),          -- Utilisateur concerné
    content TEXT NOT NULL,                      -- Contenu du message
    role VARCHAR(20) NOT NULL,                  -- 'user', 'assistant', 'system'
    tokens_used INTEGER,                        -- Nombre de tokens utilisés
    parent_message_id UUID REFERENCES chat_messages(id), -- Pour le threading des réponses
    metadata JSONB DEFAULT '{}',                -- Métadonnées (titre conversation, contexte, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_archived BOOLEAN DEFAULT FALSE           -- Pour le nettoyage des vieilles conversations
);

-- Index pour optimiser les recherches fréquentes
CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at);

-- Suivi d'utilisation quotidienne
-- Cette table enregistre l'utilisation QUOTIDIENNE du chat par utilisateur
-- Elle est mise à jour via trigger à chaque nouveau message
CREATE TABLE chat_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,    -- Date du suivi (une ligne par jour)
    tokens_used INTEGER DEFAULT 0,              -- Total tokens utilisés ce jour
    requests_count INTEGER DEFAULT 0,           -- Nombre de requêtes ce jour
    subscription_tier VARCHAR(20),              -- Tier de l'utilisateur ce jour-là
    UNIQUE(user_id, date)
);

-- Vue pour le suivi agrégé
-- Cette vue calcule automatiquement les totaux sur différentes périodes
-- Elle utilise les données de chat_usage pour calculer les statistiques
CREATE VIEW user_chat_usage_summary AS
SELECT 
    user_id,
    -- Statistiques du jour
    SUM(CASE WHEN date = CURRENT_DATE 
        THEN requests_count ELSE 0 END) as today_requests,
    SUM(CASE WHEN date = CURRENT_DATE 
        THEN tokens_used ELSE 0 END) as today_tokens,
    
    -- Statistiques de la semaine en cours
    SUM(CASE WHEN date >= date_trunc('week', CURRENT_DATE) 
        THEN requests_count ELSE 0 END) as current_week_requests,
    SUM(CASE WHEN date >= date_trunc('week', CURRENT_DATE) 
        THEN tokens_used ELSE 0 END) as current_week_tokens,
    
    -- Statistiques du mois en cours
    SUM(CASE WHEN date >= date_trunc('month', CURRENT_DATE) 
        THEN requests_count ELSE 0 END) as current_month_requests,
    SUM(CASE WHEN date >= date_trunc('month', CURRENT_DATE) 
        THEN tokens_used ELSE 0 END) as current_month_tokens,
    
    -- Pour référence : totaux sur 7 et 30 jours glissants
    SUM(CASE WHEN date >= CURRENT_DATE - INTERVAL '7 days' 
        THEN requests_count ELSE 0 END) as rolling_7days_requests,
    SUM(CASE WHEN date >= CURRENT_DATE - INTERVAL '30 days' 
        THEN requests_count ELSE 0 END) as rolling_30days_requests
FROM chat_usage
GROUP BY user_id;

-- Fonction améliorée pour vérifier les limites d'utilisation
CREATE OR REPLACE FUNCTION check_chat_limits(
    p_user_id UUID,
    p_subscription_plan VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
    v_limit_reached BOOLEAN;
    v_limits RECORD;
BEGIN
    -- Récupère les limites du plan
    SELECT * INTO v_limits 
    FROM subscription_limits 
    WHERE plan_name = p_subscription_plan;

    -- Récupère l'utilisation actuelle
    SELECT EXISTS (
        SELECT 1 
        FROM user_chat_usage_summary u
        WHERE u.user_id = p_user_id
        AND (
            -- Vérifie les limites quotidiennes
            (v_limits.daily_message_limit IS NOT NULL 
             AND u.today_requests >= v_limits.daily_message_limit)
            OR
            -- Vérifie les limites hebdomadaires
            (v_limits.weekly_message_limit IS NOT NULL 
             AND u.current_week_requests >= v_limits.weekly_message_limit)
            OR
            -- Vérifie les limites mensuelles
            (v_limits.monthly_message_limit IS NOT NULL 
             AND u.current_month_requests >= v_limits.monthly_message_limit)
        )
    ) INTO v_limit_reached;
    
    RETURN NOT v_limit_reached;
END;
$$ LANGUAGE plpgsql;
```

## 4. Gestion de la Waitlist

```sql
-- Table de gestion de la liste d'attente
-- Stocke les demandes d'accès aux fonctionnalités premium/enterprise
CREATE TABLE waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,        -- Email de contact
    full_name VARCHAR(100),                    -- Nom complet
    company_name VARCHAR(100),                 -- Pour les demandes enterprise
    subscription_tier VARCHAR(20) NOT NULL,    -- 'premium' ou 'enterprise'
    wallet_address VARCHAR(255),               -- Pour les paiements crypto
    status VARCHAR(20) DEFAULT 'pending',      -- 'pending', 'approved', 'rejected'
    notes TEXT,                               -- Notes internes
    metadata JSONB DEFAULT '{}',              -- Données additionnelles
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,     -- Date de traitement
    processed_by UUID REFERENCES users(id)     -- Admin ayant traité la demande
);

-- Index pour la recherche
CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_status ON waitlist(status);
```

## 5. Politiques de Sécurité (RLS)

```sql
-- Exemple pour les components
ALTER TABLE components ENABLE ROW LEVEL SECURITY;

CREATE POLICY components_view_policy ON components
    FOR SELECT
    USING (
        is_public = true 
        OR author_id = auth.uid()
    );

CREATE POLICY components_modify_policy ON components
    FOR ALL
    USING (author_id = auth.uid());

-- Exemple pour les conversations
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY chat_conversations_policy ON chat_conversations
    FOR ALL
    USING (user_id = auth.uid());
```

## 6. Triggers d'Automatisation

```sql
-- Mise à jour des compteurs de chat
CREATE OR REPLACE FUNCTION update_chat_usage()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO chat_usage (user_id, date, tokens_used, requests_count)
    VALUES (NEW.user_id, CURRENT_DATE, NEW.tokens_used, 1)
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        tokens_used = chat_usage.tokens_used + NEW.tokens_used,
        requests_count = chat_usage.requests_count + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_chat_message
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_usage();

-- Nettoyage automatique des sessions expirées
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM sessions
    WHERE expires_at < NOW();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_sessions
    AFTER INSERT OR UPDATE ON sessions
    EXECUTE FUNCTION cleanup_expired_sessions();
```

## 7. Recommandations Additionnelles

1. **Monitoring et Logging**
   - Créer une table `audit_logs` pour suivre les opérations importantes
   - Mettre en place des alertes sur les limites d'utilisation

2. **Performance**
   - Implémenter le partitionnement pour `chat_messages` et `chat_usage`
   - Mettre en place un système de cache avec Redis

3. **Backup et Maintenance**
   - Configurer des backups automatiques quotidiens
   - Mettre en place une stratégie de rétention des données

4. **Sécurité**
   - Chiffrer les données sensibles
   - Mettre en place une rotation des clés de session 

## 8. API Endpoints

### 8.1 Authentification et Utilisateurs

```typescript
// Types communs
interface AuthResponse {
  user: User;
  session: Session;
  tokens: {
    access_token: string;
    refresh_token: string;
  };
}

// POST /api/auth/login
// Connexion avec différentes méthodes d'authentification
interface LoginRequest {
  provider: 'github' | 'gmail' | 'xportal' | 'credentials';
  credentials?: {
    email?: string;
    username?: string;
    password?: string;
  };
  providerToken?: string;  // Pour OAuth ou XPortal
}

// POST /api/auth/register
// Inscription d'un nouvel utilisateur
interface RegisterRequest {
  provider: 'credentials' | 'xportal';
  email?: string;
  username?: string;
  password?: string;
  xportalAddress?: string;
}

// POST /api/auth/logout
// Déconnexion et invalidation de session
// Requiert: Authorization header

// GET /api/auth/me
// Récupération des informations de l'utilisateur connecté
// Requiert: Authorization header

// PUT /api/auth/profile
// Mise à jour du profil utilisateur
interface UpdateProfileRequest {
  display_name?: string;
  avatar_url?: string;
  preferences?: Record<string, any>;
}

// POST /api/auth/verify
// Vérification d'email ou autre action nécessitant vérification
interface VerifyRequest {
  type: 'email' | 'password_reset';
  token: string;
}
```

### 8.2 Gestion des SDKs

```typescript
// GET /api/sdks
// Liste des SDKs avec filtrage et pagination
interface GetSDKsQuery {
  search?: string;
  tags?: string[];
  category?: string;
  page?: number;
  limit?: number;
  sort?: 'downloads' | 'stars' | 'recent';
}

// GET /api/sdks/:id
// Détails d'un SDK spécifique
// Retourne: SDK avec tags et statistiques

// POST /api/sdks/:id/download
// Enregistre un téléchargement de SDK
// Requiert: Authorization header

// GET /api/sdks/categories
// Liste des catégories de tags disponibles

// GET /api/sdks/tags
// Liste des tags disponibles avec leur catégorie
```

### 8.3 Gestion des Components

```typescript
// GET /api/components
// Liste des components avec filtrage et pagination
interface GetComponentsQuery {
  search?: string;
  tags?: string[];
  sdk?: string;
  author?: string;
  status?: 'pending' | 'approved' | 'rejected';
  is_public?: boolean;
  page?: number;
  limit?: number;
}

// POST /api/components
// Création d'un nouveau component
interface CreateComponentRequest {
  title: string;
  description: string;
  github_url: string;
  live_demo_url?: string;
  tags: string[];
  sdk_version_support: Record<string, string[]>;
  is_public: boolean;
}

// PUT /api/components/:id
// Mise à jour d'un component
// Requiert: Authorization + Propriétaire ou Admin

// POST /api/components/:id/rate
// Notation d'un component
interface RateComponentRequest {
  rating: number;  // 1-5
  comment?: string;
}

// POST /api/components/:id/approve
// Approbation/Rejet d'un component
// Requiert: Authorization + Admin
interface ApproveComponentRequest {
  status: 'approved' | 'rejected';
  notes?: string;
}
```

### 8.4 Gestion du Chatbot

```typescript
// POST /api/chat/messages
// Envoi d'un nouveau message
interface SendMessageRequest {
  conversation_id?: string;  // Optionnel pour nouvelle conversation
  content: string;
  parent_message_id?: string;  // Pour le threading
  metadata?: {
    title?: string;
    context?: any;
  };
}

// GET /api/chat/messages
// Récupération des messages d'une conversation
interface GetMessagesQuery {
  conversation_id: string;
  limit?: number;
  before?: string;  // Pagination par cursor
}

// GET /api/chat/usage
// Statistiques d'utilisation pour l'utilisateur courant
// Retourne: UserChatUsageSummary

// GET /api/chat/limits
// Récupération des limites du plan actuel
interface ChatLimitsResponse {
  current_usage: {
    today: number;
    week: number;
    month: number;
  };
  limits: {
    daily: number;
    weekly: number;
    monthly: number;
    tokens_per_message: number;
  };
}
```

### 8.5 Gestion de la Waitlist

```typescript
// POST /api/waitlist/join
// Inscription à la waitlist
interface JoinWaitlistRequest {
  email: string;
  full_name?: string;
  company_name?: string;
  subscription_tier: 'premium' | 'enterprise';
  wallet_address?: string;
}

// GET /api/waitlist/status
// Vérification du statut sur la waitlist
// Requiert: Email ou Wallet address

// PUT /api/waitlist/entries/:id
// Mise à jour du statut d'une entrée waitlist
// Requiert: Authorization + Admin
interface UpdateWaitlistEntryRequest {
  status: 'approved' | 'rejected';
  notes?: string;
}
```

### 8.6 Middleware et Sécurité

```typescript
// Middleware d'authentification
interface AuthenticatedRequest extends Request {
  user: User;
  session: Session;
}

// Middleware de limitation de requêtes
const rateLimits = {
  'api/chat/*': {
    free: '10/minute',
    premium: '30/minute',
    enterprise: '100/minute'
  },
  'api/*': {
    anonymous: '30/minute',
    authenticated: '100/minute'
  }
};

// Middleware de validation des limites chat
async function validateChatLimits(req: AuthenticatedRequest) {
  const canSendMessage = await checkChatLimits(
    req.user.id,
    req.user.subscription_plan
  );
  if (!canSendMessage) {
    throw new Error('Chat limits reached');
  }
}
```

### 8.7 Exemples d'Utilisation

```typescript
// Exemple: Création d'une nouvelle conversation
async function startNewConversation() {
  const response = await fetch('/api/chat/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content: "Hello AI!",
      metadata: {
        title: "Nouvelle conversation"
      }
    })
  });
  
  const { message, conversation_id } = await response.json();
  return { message, conversation_id };
}

// Exemple: Récupération des statistiques d'utilisation
async function getChatUsageStats() {
  const response = await fetch('/api/chat/usage', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  const stats = await response.json();
  return stats;
}
```

### 8.8 Bonnes Pratiques API

1. **Gestion des Erreurs**
   ```typescript
   interface APIError {
     code: string;        // ex: 'CHAT_LIMIT_REACHED'
     message: string;     // Message utilisateur
     details?: any;       // Détails techniques
     status: number;      // Code HTTP
   }
   ```

2. **Pagination**
   ```typescript
   interface PaginatedResponse<T> {
     data: T[];
     metadata: {
       total: number;
       page: number;
       limit: number;
       has_more: boolean;
     };
   }
   ```

3. **Versioning**
   - Utiliser le préfixe `/v1/` pour toutes les routes
   - Inclure la version dans le header : `Accept: application/vnd.mvx.v1+json`

4. **Caching**
   ```typescript
   // Headers pour le cache
   {
     'Cache-Control': 'public, max-age=300',
     'ETag': '"hash"',
     'Last-Modified': 'timestamp'
   }
   ```

5. **Rate Limiting**
   ```typescript
   // Headers de rate limit
   {
     'X-RateLimit-Limit': '100',
     'X-RateLimit-Remaining': '95',
     'X-RateLimit-Reset': '1640995200'
   }
   ```

// ... rest of the existing code ... 