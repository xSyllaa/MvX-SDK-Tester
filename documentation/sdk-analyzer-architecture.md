# Architecture du SDK Analyzer MultiversX

## 1. Structure des composants

```
app/
  components/
    sdk-analyzer/
      SDKList/             # Liste des SDKs disponibles
      SDKExplorer/         # Explorateur de SDK
      ABIInteraction/      # Interface d'interaction avec les ABIs
      CodeViewer/          # Visualisation du code avec syntax highlighting
      RepoStructure/       # Vue arborescente des fichiers du SDK
      
    shared/
      TagSystem/          # Système de tags selon la structure définie
      SearchBar/          # Barre de recherche
      
    ui/                   # Composants UI existants
      
  hooks/
    useSDKAnalyzer.ts     # Logique d'analyse des SDKs
    useABIInteraction.ts  # Logique d'interaction avec les ABIs
    useGithubRepo.ts      # Gestion des repos GitHub
    
  types/
    sdk.d.ts             # Types pour les SDKs
    abi.d.ts             # Types pour les ABIs
    tags.d.ts            # Types pour le système de tags

  utils/
    github.ts            # Utilitaires pour l'API GitHub
    parser.ts            # Parseur pour les ABIs et SDKs
```

## 2. Flux de données

1. **Découverte des SDKs**
   - Liste des SDKs disponibles avec leurs tags
   - Filtrage par catégories
   - Recherche par nom/description

2. **Exploration d'un SDK**
   - Chargement de la structure du repo GitHub
   - Affichage du README
   - Navigation dans les fichiers
   - Extraction des fonctions/méthodes

3. **Interaction avec les ABIs**
   - Chargement des ABIs
   - Génération d'interfaces pour les fonctions
   - Exécution des appels
   - Affichage des résultats

## 3. Fonctionnalités clés

### Système de Tags
```typescript
export enum TagCategory {
  LANGUAGE = "Language",
  PURPOSE = "Purpose", 
  FRAMEWORK = "Framework",
  PLATFORM = "Platform",
  TECHNOLOGY = "Technology",
  OTHER = "Other"
}

export interface Tag {
  name: string;
  category: TagCategory;
  color: string;
}
```

### Gestion des SDKs
```typescript
export interface SDK {
  name: string;
  description: string;
  githubUrl: string;
  tags: Tag[];
  readme?: string;
  structure?: RepoStructure;
}

export interface RepoStructure {
  type: 'file' | 'directory';
  name: string;
  path: string;
  children?: RepoStructure[];
}
```

### Interaction ABI
```typescript
export interface ABI {
  contractName: string;
  endpoints: ABIEndpoint[];
}

export interface ABIEndpoint {
  name: string;
  inputs: ABIParameter[];
  outputs: ABIParameter[];
}
```

## 4. Routes principales

```
/                     # Page d'accueil avec liste des SDKs
/sdk/:name           # Page d'exploration d'un SDK
/sdk/:name/abi       # Interface d'interaction avec l'ABI
/key-components      # Documentation des composants clés
```

## 5. Intégrations externes

1. **GitHub API**
   - Récupération des structures de repos
   - Lecture des fichiers
   - Gestion des versions

2. **MultiversX API**
   - Interaction avec les smart contracts
   - Lecture des états
   - Exécution des transactions

## 6. Considérations UI/UX

1. **Design minimaliste**
   - Interface inspirée du "Monospace Web"
   - Utilisation de la police monospace
   - Thème clair/sombre

2. **Navigation intuitive**
   - Structure arborescente claire
   - Recherche rapide
   - Filtres efficaces

3. **Retour utilisateur**
   - États de chargement
   - Messages d'erreur clairs
   - Résultats d'exécution formatés 