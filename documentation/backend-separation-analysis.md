# Analyse de Séparation Backend/Frontend - MvX SDK Tester

## 1. Structure Actuelle

### 1.1 Routes API Existantes
- `/api/ai` : Gestion des interactions avec l'IA
- `/api/auth` : Authentification
- `/api/waitlist` : Gestion de la liste d'attente
- `/api/components` : Gestion des composants
- `/api/favorites` : Gestion des favoris
- `/api/db` : Opérations de base de données
- `/api/chat` : Gestion des conversations
- `/api/repo-proxy` : Proxy pour les interactions avec les repos

### 1.2 Points d'Attention
1. **Authentification** : Actuellement mélangée entre front et back
2. **Gestion des Sessions** : À centraliser côté backend
3. **Interactions Chatbot** : À déplacer entièrement côté backend
4. **Accès Base de Données** : À isoler dans le backend

## 2. Routes API Nécessaires pour le Backend Séparé

### 2.1 Authentication & Users `/api/auth`
- POST `/register` : Inscription utilisateur
- POST `/login` : Connexion utilisateur
- POST `/logout` : Déconnexion
- GET `/me` : Informations utilisateur courant
- PUT `/me` : Mise à jour profil utilisateur
- GET `/session` : Vérification session

### 2.2 SDK Management `/api/sdk`
- GET `/list` : Liste des SDKs disponibles
- GET `/:id` : Détails d'un SDK
- POST `/analyze` : Analyser un nouveau SDK
- PUT `/:id` : Mettre à jour les informations d'un SDK
- GET `/:id/stats` : Statistiques d'utilisation

### 2.3 Repository Integration `/api/repo`
- GET `/structure/:owner/:repo` : Structure du repo
- GET `/content/:owner/:repo/:path` : Contenu d'un fichier
- POST `/validate` : Validation d'un repo
- GET `/metadata/:owner/:repo` : Métadonnées du repo

### 2.4 AI Integration `/api/ai`
- POST `/chat` : Envoi message au chatbot
- GET `/history` : Historique des conversations
- POST `/analyze-code` : Analyse de code
- POST `/generate-example` : Génération d'exemples

### 2.5 Analytics `/api/analytics`
- POST `/track` : Tracking d'événements
- GET `/usage` : Statistiques d'utilisation
- GET `/popular` : SDKs populaires

### 2.6 Favorites `/api/favorites`
- GET `/list` : Liste des favoris
- POST `/add` : Ajouter aux favoris
- DELETE `/remove` : Retirer des favoris

## 3. Composants Frontend Concernés

### 3.1 Components d'Authentification
- `LoginForm`
- `RegisterForm`
- `UserProfile`
- `AuthProvider`

### 3.2 Components SDK
- `SDKList`
- `SDKDetails`
- `SDKAnalyzer`
- `RepoExplorer`

### 3.3 Components AI
- `ChatInterface`
- `CodeAnalyzer`
- `ExampleGenerator`

### 3.4 Components Utilitaires
- `FavoriteButton`
- `AnalyticsTracker`
- `SessionManager`

## 4. Recommandations

### 4.1 Priorités de Migration
1. Authentification et gestion des sessions
2. Accès base de données
3. Intégration AI
4. Analytics et tracking

### 4.2 Sécurité
- Implémenter JWT pour l'authentification
- Valider toutes les entrées côté backend
- Mettre en place rate limiting
- Sécuriser les routes sensibles

### 4.3 Performance
- Mettre en cache les réponses fréquentes
- Optimiser les requêtes base de données
- Implémenter la pagination
- Utiliser des websockets pour le chat

### 4.4 Maintenance
- Documenter toutes les routes API
- Mettre en place des tests automatisés
- Monitorer les performances
- Gérer les versions API

## 5. Analyse Détaillée des Points Critiques

### 5.1 Système d'Authentification

#### État Actuel
1. **Gestion Hybride** :
   - Frontend : `AuthContext` gère l'état local et les interactions
   - Backend : Routes `/api/auth/*` pour les opérations d'authentification
   - Duplication de logique entre front et back

2. **Points Problématiques** :
   - Validation côté client redondante
   - Gestion des tokens dispersée
   - Logique de session dupliquée

3. **Routes Actuelles** :
   - `/api/auth/login`
   - `/api/auth/register`
   - `/api/auth/logout`
   - `/api/auth/me`
   - `/api/auth/anonymous`
   - `/api/auth/link-account`

#### Recommandations
1. **Centralisation Backend** :
   - Déplacer toute la logique d'authentification vers le backend
   - Utiliser JWT avec refresh tokens
   - Implémenter une validation centralisée

2. **Simplification Frontend** :
   - Réduire `AuthContext` à un simple gestionnaire d'état
   - Utiliser des hooks personnalisés pour les opérations auth
   - Supprimer la logique de validation dupliquée

### 5.2 Système de Chat et IA

#### État Actuel
1. **Architecture** :
   - Route unique `/api/chat`
   - Intégration Google AI dans le backend
   - Suivi d'utilisation dans Supabase

2. **Points Problématiques** :
   - Pas de gestion de session de chat
   - Pas de persistance des conversations
   - Limites d'utilisation gérées par requête

3. **Fonctionnalités Manquantes** :
   - Historique des conversations
   - Contexte persistant
   - Gestion des erreurs côté client

#### Recommandations
1. **Nouvelle Architecture Chat** :
   ```
   /api/chat
   ├── /sessions
   │   ├── POST /create
   │   ├── GET /:id
   │   └── PUT /:id/messages
   ├── /history
   │   ├── GET /user/:userId
   │   └── DELETE /:sessionId
   └── /usage
       └── GET /limits
   ```

2. **Améliorations Backend** :
   - Implémenter un système de sessions de chat
   - Stocker l'historique des conversations
   - Gérer les limites d'utilisation par session

3. **Optimisations Frontend** :
   - Créer un `ChatContext` pour la gestion d'état
   - Implémenter la mise en cache locale
   - Ajouter la gestion offline

### 5.3 Suivi des Requêtes

#### État Actuel
1. **Tables Existantes** :
   - `api_requests` : Log des requêtes
   - `user_api_usage_summary` : Compteurs d'utilisation

2. **Points Problématiques** :
   - Mise à jour synchrone des compteurs
   - Pas de nettoyage automatique
   - Performance potentiellement impactée

#### Recommandations
1. **Optimisation Base de Données** :
   - Utiliser des triggers pour les compteurs
   - Implémenter un système de nettoyage
   - Ajouter des index appropriés

2. **Nouvelle Architecture Analytics** :
   - Séparer le tracking des requêtes
   - Utiliser une queue pour les mises à jour
   - Implémenter un système de cache 

## 6. Structure de la Base de Données

### 6.1 Tables Principales

#### Users et Authentication
```sql
users
├── id: string (PK)
├── email: string?
├── username: string?
├── display_name: string?
├── avatar_url: string?
├── is_anonymous: boolean?
├── is_verified: boolean?
├── subscription_plan: string?
├── last_login: timestamp?
└── created_at: timestamp?

sessions
├── id: string (PK)
├── user_id: string (FK -> users.id)
├── token: string
├── expires_at: timestamp
├── last_used: timestamp?
└── created_at: timestamp?

user_auth_methods
├── id: string (PK)
├── user_id: string (FK -> users.id)
├── auth_method_id: number (FK -> auth_methods.id)
├── auth_provider_id: string
├── is_primary: boolean?
└── auth_data: json?
```

#### SDK et Components
```sql
components
├── id: string (PK)
├── title: string
├── description: string
├── category: string
├── author_id: string (FK -> users.id)
├── github_url: string?
├── downloads: number?
├── is_public: boolean?
└── is_reviewed: boolean?

component_tags
├── component_id: string (FK -> components.id)
└── tag: string

sdk_favorites
├── id: number (PK)
├── user_id: string (FK -> users.id)
├── sdk_name: string
└── created_at: timestamp?
```

#### Analytics et Usage
```sql
api_requests
├── id: string (PK)
├── user_id: string
├── request_type: string
├── request_data: json?
├── subscription_plan: string?
└── timestamp: timestamp?

user_api_usage_summary (View)
├── user_id: string
├── today_count: number
├── week_count: number
└── month_count: number
```

### 6.2 Mapping Routes API / Tables

#### Authentication `/api/auth`
- **POST `/register`**
  - Tables: `users`, `user_auth_methods`
  - Opérations: INSERT dans les deux tables
  
- **POST `/login`**
  - Tables: `users`, `sessions`
  - Opérations: SELECT user, INSERT session
  
- **POST `/logout`**
  - Tables: `sessions`
  - Opérations: DELETE session
  
- **GET `/me`**
  - Tables: `users`, `user_auth_methods`
  - Opérations: SELECT avec JOIN

#### SDK Management `/api/sdk`
- **GET `/list`**
  - Tables: `components`, `component_tags`
  - Opérations: SELECT avec JOIN
  
- **GET `/:id`**
  - Tables: `components`, `component_tags`
  - Opérations: SELECT avec WHERE

#### Analytics `/api/analytics`
- **POST `/track`**
  - Tables: `api_requests`
  - Opérations: INSERT
  
- **GET `/usage`**
  - Tables: `user_api_usage_summary`
  - Opérations: SELECT avec WHERE

### 6.3 Fonctions Base de Données

```sql
-- Fonctions existantes
log_api_request(
  p_user_id: string,
  p_request_type: string,
  p_request_data: json?,
  p_subscription_plan: string?
) returns string

get_user_api_usage(
  p_user_id: string
) returns record
```

### 6.4 Recommandations Base de Données

1. **Optimisations Indexation**
   ```sql
   -- Ajouter pour les recherches fréquentes
   CREATE INDEX idx_api_requests_user_timestamp ON api_requests(user_id, timestamp);
   CREATE INDEX idx_components_author ON components(author_id);
   CREATE INDEX idx_sessions_token ON sessions(token);
   ```

2. **Nouvelles Fonctions à Ajouter**
   ```sql
   -- Gestion des sessions
   create_user_session(p_user_id: string) returns record;
   validate_session(p_token: string) returns record;
   
   -- Analytics
   get_sdk_usage_stats(p_sdk_name: string) returns record;
   get_user_activity(p_user_id: string) returns record;
   ```

3. **Triggers Recommandés**
   ```sql
   -- Mise à jour automatique des compteurs
   CREATE TRIGGER update_api_usage_counts
   AFTER INSERT ON api_requests
   FOR EACH ROW
   EXECUTE FUNCTION update_usage_summary();
   
   -- Nettoyage automatique des sessions expirées
   CREATE TRIGGER cleanup_expired_sessions
   AFTER INSERT ON sessions
   EXECUTE FUNCTION remove_expired_sessions();
   ```

### 6.5 Migration Proposée

1. **Phase 1: Sécurisation**
   - Implémenter RLS (Row Level Security) sur toutes les tables
   - Créer des policies de sécurité
   - Mettre en place le chiffrement des données sensibles

2. **Phase 2: Optimisation**
   - Créer les index recommandés
   - Implémenter les nouvelles fonctions
   - Mettre en place les triggers

3. **Phase 3: Nettoyage**
   - Supprimer les tables non utilisées
   - Normaliser les schémas existants
   - Mettre à jour les contraintes 