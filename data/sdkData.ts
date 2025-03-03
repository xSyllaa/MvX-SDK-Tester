export interface SDK {
  name: string;
  fullName: string;
  description: string;
  github_link: string;
  tags: Tag[];
  language?: string;
  size?: string;
  last_updated?: string;
  totalFiles?: number;
  stars?: number;
  forks?: number;
  visibility?: string;
  structure?: string;
  readme?: string;
}

export interface Tag {
  name: string;
  category: TagCategory;
}

export enum TagCategory {
  PURPOSE = "Purpose",           // 1er - Le but principal
  LANGUAGE = "Language",         // 2ème - Le langage utilisé
  FRAMEWORK = "Framework",       // 3ème - Le framework
  TECHNOLOGY = "Technology",     // 4ème - Les technologies utilisées
  PLATFORM = "Platform",         // 5ème - Les plateformes supportées
  OWNER = "Owner",              // 6ème - Le propriétaire
  OTHER = "Other"               // 7ème - Autres informations
}

// Ajouter un ordre de priorité pour le tri
export const tagCategoryPriority: { [key in TagCategory]: number } = {
  [TagCategory.PURPOSE]: 1,
  [TagCategory.LANGUAGE]: 2,
  [TagCategory.FRAMEWORK]: 3,
  [TagCategory.TECHNOLOGY]: 4,
  [TagCategory.PLATFORM]: 5,
  [TagCategory.OWNER]: 6,
  [TagCategory.OTHER]: 7
};

// Fonction utilitaire pour trier les tags
export function sortTagsByPriority(tags: Tag[]): Tag[] {
  return [...tags].sort((a, b) => 
    tagCategoryPriority[a.category] - tagCategoryPriority[b.category]
  );
}

// Descriptions for each tag category
export const tagCategoryDescriptions: { [key in TagCategory]: string } = {
  [TagCategory.LANGUAGE]: "Programming language used",
  [TagCategory.PURPOSE]: "Main objective or use case",
  [TagCategory.FRAMEWORK]: "Framework or library used",
  [TagCategory.PLATFORM]: "Compatible platform or environment",
  [TagCategory.TECHNOLOGY]: "Integrated technology or tool",
  [TagCategory.OTHER]: "Other relevant information",
  [TagCategory.OWNER]: "Owner of the SDK or repository",
};

export interface TagCategoryStyle {
  base: string;      // Couleur de base
  light: string;     // Version claire pour les backgrounds
  dark: string;      // Version foncée pour le hover
}

// Modification de la définition des couleurs
export const tagCategoryColors: { [key in TagCategory]: TagCategoryStyle } = {
  [TagCategory.LANGUAGE]: {
    base: "#29ABE2",
    light: "#29ABE220",
    dark: "#1A8AB3"
  },
  [TagCategory.PURPOSE]: {
    base: "#8E44AD",
    light: "#8E44AD20",
    dark: "#6C3382"
  },
  [TagCategory.FRAMEWORK]: {
    base: "#27AE60",
    light: "#27AE6020",
    dark: "#1E8449"
  },
  [TagCategory.PLATFORM]: {
    base: "#F39C12",
    light: "#F39C1220",
    dark: "#B37A0E"
  },
  [TagCategory.TECHNOLOGY]: {
    base: "#D35400",
    light: "#D3540020",
    dark: "#A04000"
  },
  [TagCategory.OTHER]: {
    base: "#7F8C8D",
    light: "#7F8C8D20",
    dark: "#626C6D"
  },
  [TagCategory.OWNER]: {
    base: "#34495E",
    light: "#34495E20",
    dark: "#283848"
  }
};

export const sdkList: SDK[] = [
  {
    name: "MultiversX Playground",
    fullName: "MultiversX Playground",
    description:
      "Development containers for GitHub Codespaces or Visual Studio Code, including tools like Rust, mxpy, sc-meta, etc.",
    github_link: "https://github.com/multiversx/mx-sdk-playground",
    tags: [
      { name: "Development", category: TagCategory.PURPOSE },
      { name: "Containers", category: TagCategory.TECHNOLOGY },
      { name: "Rust", category: TagCategory.LANGUAGE },
      { name: "mxpy", category: TagCategory.TECHNOLOGY },
      { name: "sc-meta", category: TagCategory.TECHNOLOGY },
      { name: "Rust-analyzer", category: TagCategory.TECHNOLOGY },
      { name: "MultiversX SDKs (Python and JavaScript)", category: TagCategory.OTHER },
      { name: "multiversx", category: TagCategory.OWNER },
    ],
    language: "Rust",
    size: "1.2MB",
    last_updated: "2023-04-15",
    totalFiles: 12,
    stars: 100,
    forks: 20,
    visibility: "public",
    structure: "monorepo",
    readme: "README.md"
  },
  {
    name: "JavaScript SDK",
    fullName: "JavaScript SDK",
    description:
      "The sdk-core package is a unification of the previous packages (multiversx/sdk-wallet and multiversx/sdk-network-providers into multiversx/sdk-core). It has basic components for interacting with the blockchain and with smart contracts.",
    github_link: "https://github.com/multiversx/mx-sdk-js-core",
    tags: [
      { name: "JavaScript", category: TagCategory.LANGUAGE },
      { name: "TypeScript", category: TagCategory.LANGUAGE },
      { name: "Blockchain Interaction", category: TagCategory.PURPOSE },
      { name: "Smart Contract Interaction", category: TagCategory.PURPOSE },
      { name: "API", category: TagCategory.TECHNOLOGY },
      { name: "multiversx", category: TagCategory.OWNER },
    ],
    language: "JavaScript",
    size: "1.5MB",
    last_updated: "2023-04-15",
    totalFiles: 15,
    stars: 80,
    forks: 15,
    visibility: "public",
    structure: "monorepo",
    readme: "README.md"
  },
  {
    name: "Python SDK",
    fullName: "Python SDK",
    description: "Used to interact with the MultiversX blockchain and smart contracts.",
    github_link: "https://github.com/multiversx/mx-sdk-py",
    tags: [
      { name: "Python", category: TagCategory.LANGUAGE },
      { name: "API", category: TagCategory.TECHNOLOGY },
      { name: "Smart Contract Interaction", category: TagCategory.PURPOSE },
      { name: "multiversx", category: TagCategory.OWNER },
    ],
    language: "Python",
    size: "1MB",
    last_updated: "2023-04-15",
    totalFiles: 10,
    stars: 70,
    forks: 10,
    visibility: "public",
    structure: "monorepo",
    readme: "README.md"
  },
  {
    name: "NextJS SDK",
    fullName: "NextJS SDK",
    description: "Utilities for the MultiversX microservices ecosystem, relies on @multiversX SDKs and NestJS.",
    github_link: "https://github.com/multiversx/mx-sdk-js",
    tags: [
      { name: "NextJS", category: TagCategory.FRAMEWORK },
      { name: "Typescript", category: TagCategory.LANGUAGE },
      { name: "API", category: TagCategory.TECHNOLOGY },
      { name: "Utilities", category: TagCategory.PURPOSE },
      { name: "multiversx", category: TagCategory.OWNER },
    ],
    language: "JavaScript",
    size: "1.2MB",
    last_updated: "2023-04-15",
    totalFiles: 12,
    stars: 60,
    forks: 10,
    visibility: "public",
    structure: "monorepo",
    readme: "README.md"
  },
  {
    name: "dApp SDK",
    fullName: "dApp SDK",
    description: "A library that holds the core functional & signing logic of a dapp on the MultiversX Network, designed for React applications.",
    github_link: "https://github.com/multiversx/mx-sdk-dapp",
    tags: [
      { name: "dApp", category: TagCategory.PURPOSE },
      { name: "React", category: TagCategory.FRAMEWORK },
      { name: "Typescript", category: TagCategory.LANGUAGE },
      { name: "API", category: TagCategory.TECHNOLOGY },
      { name: "Signing Logic", category: TagCategory.PURPOSE },
      { name: "MultiversX Network", category: TagCategory.OTHER },
      { name: "multiversx", category: TagCategory.OWNER },
    ],
    language: "JavaScript",
    size: "1.5MB",
    last_updated: "2023-04-15",
    totalFiles: 15,
    stars: 50,
    forks: 5,
    visibility: "public",
    structure: "monorepo",
    readme: "README.md"
  },
  {
    name: "PHP SDK",
    fullName: "PHP SDK",
    description: "Used to interact with the MultiversX blockchain and smart contracts.",
    github_link: "https://github.com/PeerMeHQ/mx-sdk-laravel",
    tags: [
      { name: "PHP", category: TagCategory.LANGUAGE },
      { name: "API", category: TagCategory.TECHNOLOGY },
      { name: "Smart Contract Interaction", category: TagCategory.PURPOSE },
      { name: "PeerMeHQ", category: TagCategory.OWNER },
    ],
    language: "PHP",
    size: "0.8MB",
    last_updated: "2023-04-15",
    totalFiles: 8,
    stars: 40,
    forks: 5,
    visibility: "public",
    structure: "monorepo",
    readme: "README.md"
  },
  {
    name: "SA SDK GO",
    fullName: "SA SDK GO",
    description: "Set of tools and Go packages to interact with the MultiversX blockchain and its smart contracts.",
    github_link: "https://github.com/multiversx/mx-sdk-go",
    tags: [
      { name: "Go", category: TagCategory.LANGUAGE },
      { name: "API", category: TagCategory.TECHNOLOGY },
      { name: "Community Champions", category: TagCategory.OTHER },
      { name: "multiversx", category: TagCategory.OWNER },
    ],
    language: "Go",
    size: "0.5MB",
    last_updated: "2023-04-15",
    totalFiles: 5,
    stars: 30,
    forks: 5,
    visibility: "public",
    structure: "monorepo",
    readme: "README.md"
  },
  {
    name: "XOXNO SDK",
    fullName: "XOXNO SDK",
    description: "A JavaScript library that simplifies the interaction with the XOXNO Protocol for developers. It includes helper functions and modules to fetch, filter, and interact with data from the XOXNO Protocol and its NFT marketplace.",
    github_link: "https://github.com/XOXNO/sdk-js",
    tags: [
      { name: "JavaScript", category: TagCategory.LANGUAGE },
      { name: "NFT Marketplace", category: TagCategory.PURPOSE },
      { name: "API", category: TagCategory.TECHNOLOGY },
      { name: "XOXNO Protocol", category: TagCategory.OTHER },
      { name: "XOXNO", category: TagCategory.OWNER },
    ],
    language: "JavaScript",
    size: "1MB",
    last_updated: "2023-04-15",
    totalFiles: 10,
    stars: 20,
    forks: 3,
    visibility: "public",
    structure: "monorepo",
    readme: "README.md"
  },
  {
    name: "Liquid Staking Smart Contract",
    fullName: "Liquid Staking Smart Contract",
    description: "A smart contract that allows users to stake EGLD in return for lsEGLD, a fungible ESDT that can be used in multiple ways in the MultiversX ecosystem, all while retaining the standard staking rewards.",
    github_link: "https://github.com/multiversx/mx-liquid-staking-sc",
    tags: [
      { name: "Rust", category: TagCategory.LANGUAGE },
      { name: "Smart Contract", category: TagCategory.TECHNOLOGY },
      { name: "Liquid Staking", category: TagCategory.PURPOSE },
      { name: "DeFi", category: TagCategory.PURPOSE },
      { name: "ESDT", category: TagCategory.TECHNOLOGY },
      { name: "multiversx", category: TagCategory.OWNER },
    ],
    language: "Rust",
    size: "0.2MB",
    last_updated: "2023-04-15",
    totalFiles: 2,
    stars: 10,
    forks: 2,
    visibility: "public",
    structure: "monorepo",
    readme: "README.md"
  },
  {
    name: "sdk-exchange",
    fullName: "sdk-exchange",
    description: "Utilities modules for xExchange interactions.",
    github_link: "https://github.com/multiversx/mx-sdk-js-exchange",
    tags: [
      { name: "JavaScript", category: TagCategory.LANGUAGE },
      { name: "TypeScript", category: TagCategory.LANGUAGE },
      { name: "Utilities", category: TagCategory.PURPOSE },
      { name: "xExchange", category: TagCategory.OTHER },
      { name: "multiversx", category: TagCategory.OWNER },
    ],
    language: "JavaScript",
    size: "0.5MB",
    last_updated: "2023-04-15",
    totalFiles: 5,
    stars: 5,
    forks: 1,
    visibility: "public",
    structure: "monorepo",
    readme: "README.md"
  },
  {
    name: "sdk-hw-provider",
    fullName: "sdk-hw-provider",
    description: "Sign using the hardware wallet (Ledger).",
    github_link: "https://github.com/multiversx/mx-sdk-js-hw-provider",
    tags: [
      { name: "JavaScript", category: TagCategory.LANGUAGE },
      { name: "TypeScript", category: TagCategory.LANGUAGE },
      { name: "Hardware Wallet", category: TagCategory.TECHNOLOGY },
      { name: "Ledger", category: TagCategory.TECHNOLOGY },
      { name: "Signing Provider", category: TagCategory.PURPOSE },
      { name: "multiversx", category: TagCategory.OWNER },
    ],
    language: "JavaScript",
    size: "0.3MB",
    last_updated: "2023-04-15",
    totalFiles: 3,
    stars: 3,
    forks: 1,
    visibility: "public",
    structure: "monorepo",
    readme: "README.md"
  },
  {
    name: "sdk-wallet-connect-provider",
    fullName: "sdk-wallet-connect-provider",
    description: "Sign using WalletConnect.",
    github_link: "https://github.com/multiversx/mx-sdk-js-wallet-connect-provider",
    tags: [
      { name: "JavaScript", category: TagCategory.LANGUAGE },
      { name: "TypeScript", category: TagCategory.LANGUAGE },
      { name: "WalletConnect", category: TagCategory.TECHNOLOGY },
      { name: "Signing Provider", category: TagCategory.PURPOSE },
      { name: "multiversx", category: TagCategory.OWNER },
    ],
    language: "JavaScript",
    size: "0.3MB",
    last_updated: "2023-04-15",
    totalFiles: 3,
    stars: 2,
    forks: 1,
    visibility: "public",
    structure: "monorepo",
    readme: "README.md"
  },
  {
    name: "sdk-extension-provider",
    fullName: "sdk-extension-provider",
    description: "Sign using the MultiversX DeFi Wallet (browser extension).",
    github_link: "https://github.com/multiversx/mx-sdk-js-extension-provider",
    tags: [
      { name: "JavaScript", category: TagCategory.LANGUAGE },
      { name: "TypeScript", category: TagCategory.LANGUAGE },
      { name: "Browser Extension", category: TagCategory.TECHNOLOGY },
      { name: "Signing Provider", category: TagCategory.PURPOSE },
      { name: "MultiversX DeFi Wallet", category: TagCategory.OTHER },
      { name: "multiversx", category: TagCategory.OWNER },
    ],
    language: "JavaScript",
    size: "0.3MB",
    last_updated: "2023-04-15",
    totalFiles: 3,
    stars: 2,
    forks: 1,
    visibility: "public",
    structure: "monorepo",
    readme: "README.md"
  },
  {
    name: "sdk-web-wallet-provider",
    fullName: "sdk-web-wallet-provider",
    description: "Sign using the MultiversX web wallet, using webhooks (DEPRECATED).",
    github_link: "https://github.com/multiversx/mx-sdk-js-web-wallet-provider",
    tags: [
      { name: "JavaScript", category: TagCategory.LANGUAGE },
      { name: "TypeScript", category: TagCategory.LANGUAGE },
      { name: "Web Wallet", category: TagCategory.TECHNOLOGY },
      { name: "Signing Provider", category: TagCategory.PURPOSE },
      { name: "Deprecated", category: TagCategory.OTHER },
    ],
    language: "JavaScript",
    size: "0.3MB",
    last_updated: "2023-04-15",
    totalFiles: 3,
    stars: 1,
    forks: 0,
    visibility: "public",
    structure: "monorepo",
    readme: "README.md"
  },
  {
    name: "mx-sdk-js-web-wallet-cross-window-provider",
    fullName: "mx-sdk-js-web-wallet-cross-window-provider",
    description: "Sign using the MultiversX web wallet, by opening the wallet in a new tab.",
    github_link: "https://github.com/multiversx/mx-sdk-js-web-wallet-cross-window-provider",
    tags: [
      { name: "JavaScript", category: TagCategory.LANGUAGE },
      { name: "TypeScript", category: TagCategory.LANGUAGE },
      { name: "Web Wallet", category: TagCategory.TECHNOLOGY },
      { name: "Signing Provider", category: TagCategory.PURPOSE },
      { name: "Cross-Window", category: TagCategory.TECHNOLOGY },
      { name: "multiversx", category: TagCategory.OWNER },
    ],
    language: "JavaScript",
    size: "0.3MB",
    last_updated: "2023-04-15",
    totalFiles: 3,
    stars: 1,
    forks: 0,
    visibility: "public",
    structure: "monorepo",
    readme: "README.md"
  },
  {
    name: "mx-sdk-js-metamask-proxy-provider",
    fullName: "mx-sdk-js-metamask-proxy-provider",
    description: "Sign using the Metamask wallet, by using web wallet as a proxy widget in iframe.",
    github_link: "https://github.com/multiversx/mx-sdk-js-metamask-proxy-provider",
    tags: [
      { name: "JavaScript", category: TagCategory.LANGUAGE },
      { name: "TypeScript", category: TagCategory.LANGUAGE },
      { name: "Metamask", category: TagCategory.TECHNOLOGY },
      { name: "Signing Provider", category: TagCategory.PURPOSE },
      { name: "Proxy", category: TagCategory.TECHNOLOGY },
      { name: "Iframe", category: TagCategory.TECHNOLOGY },
      { name: "multiversx", category: TagCategory.OWNER },
    ],
    language: "JavaScript",
    size: "0.3MB",
    last_updated: "2023-04-15",
    totalFiles: 3,
    stars: 1,
    forks: 0,
    visibility: "public",
    structure: "monorepo",
    readme: "README.md"
  },
  {
    name: "sdk-guardians-provider",
    fullName: "sdk-guardians-provider",
    description: "Helper library for integrating a co-signing provider (Guardian) into dApps.",
    github_link: "https://github.com/multiversx/mx-sdk-js-guardians-provider",
    tags: [
      { name: "JavaScript", category: TagCategory.LANGUAGE },
      { name: "TypeScript", category: TagCategory.LANGUAGE },
      { name: "Co-Signing", category: TagCategory.PURPOSE },
      { name: "Guardian", category: TagCategory.TECHNOLOGY },
      { name: "dApp Integration", category: TagCategory.PURPOSE },
      { name: "multiversx", category: TagCategory.OWNER },
    ],
    language: "JavaScript",
    size: "0.3MB",
    last_updated: "2023-04-15",
    totalFiles: 3,
    stars: 1,
    forks: 0,
    visibility: "public",
    structure: "monorepo",
    readme: "README.md"
  },
  {
    name: "sdk-native-auth-client",
    fullName: "sdk-native-auth-client",
    description: "Native Authenticator - client-side components.",
    github_link: "https://github.com/multiversx/mx-sdk-js-native-auth-client",
    tags: [
      { name: "JavaScript", category: TagCategory.LANGUAGE },
      { name: "TypeScript", category: TagCategory.LANGUAGE },
      { name: "Authentication", category: TagCategory.PURPOSE },
      { name: "Client-Side", category: TagCategory.TECHNOLOGY },
      { name: "multiversx", category: TagCategory.OWNER },
    ],
    language: "JavaScript",
    size: "0.3MB",
    last_updated: "2023-04-15",
    totalFiles: 3,
    stars: 1,
    forks: 0,
    visibility: "public",
    structure: "monorepo",
    readme: "README.md"
  },
  {
    name: "sdk-native-auth-server",
    fullName: "sdk-native-auth-server",
    description: "Native Authenticator - server-side components.",
    github_link: "https://github.com/multiversx/mx-sdk-js-native-auth-server",
    tags: [
      { name: "JavaScript", category: TagCategory.LANGUAGE },
      { name: "TypeScript", category: TagCategory.LANGUAGE },
      { name: "Authentication", category: TagCategory.PURPOSE },
      { name: "Server-Side", category: TagCategory.TECHNOLOGY },
      { name: "multiversx", category: TagCategory.OWNER },
    ],
    language: "JavaScript",
    size: "0.3MB",
    last_updated: "2023-04-15",
    totalFiles: 3,
    stars: 1,
    forks: 0,
    visibility: "public",
    structure: "monorepo",
    readme: "README.md"
  },
  {
    name: "transaction-decoder",
    fullName: "transaction-decoder",
    description: "Decodes transaction metadata from a given transaction.",
    github_link: "https://github.com/multiversx/mx-sdk-js-transaction-decoder",
    tags: [
      { name: "JavaScript", category: TagCategory.LANGUAGE },
      { name: "TypeScript", category: TagCategory.LANGUAGE },
      { name: "Transaction Decoder", category: TagCategory.PURPOSE },
      { name: "Utilities", category: TagCategory.PURPOSE },
      { name: "multiversx", category: TagCategory.OWNER },
    ],
    language: "JavaScript",
    size: "0.3MB",
    last_updated: "2023-04-15",
    totalFiles: 3,
  },
  {
    name: "SpaceKit",
    fullName: "SpaceKit",
    description: "The first smart contract framework built for Swift, bringing a powerful, intuitive, and high-level approach to blockchain development.",
    github_link: "https://github.com/gfusee/SpaceKit",
    tags: [
      { name: "Swift", category: TagCategory.LANGUAGE },
      { name: "Smart Contracts", category: TagCategory.PURPOSE },
      { name: "Framework", category: TagCategory.TECHNOLOGY },
      { name: "Blockchain", category: TagCategory.TECHNOLOGY },
      { name: "macOS", category: TagCategory.TECHNOLOGY },
      { name: "Linux", category: TagCategory.TECHNOLOGY },
      { name: "Windows", category: TagCategory.TECHNOLOGY },
      { name: "SpaceVM", category: TagCategory.TECHNOLOGY },
      { name: "gfusee", category: TagCategory.OWNER }
    ]
  }
];
