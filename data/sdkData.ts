export interface SDK {
  name: string
  description: string
  github_link: string
  tags: Tag[] // Changed to array of Tag objects
}

export interface Tag {
  name: string;
  category: TagCategory;
}

export enum TagCategory {
  LANGUAGE = "Language",
  PURPOSE = "Purpose",
  FRAMEWORK = "Framework",
  PLATFORM = "Platform",
  TECHNOLOGY = "Technology",
  OTHER = "Other",
  OWNER = "Owner",
}

// You can define colors for each category for styling purposes
export const tagCategoryColors: { [key in TagCategory]: string } = {
  [TagCategory.LANGUAGE]: "#29ABE2", // Light Blue
  [TagCategory.PURPOSE]: "#8E44AD", // Purple
  [TagCategory.FRAMEWORK]: "#27AE60", // Green
  [TagCategory.PLATFORM]: "#F39C12", // Orange
  [TagCategory.TECHNOLOGY]: "#D35400", // Dark Orange
  [TagCategory.OTHER]: "#7F8C8D", // Grey
  [TagCategory.OWNER]: "#34495E"        // Gris foncé pour Owner
};
export const sdkList: SDK[] = [
  {
    name: "MultiversX Playground",
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
  },
  {
    name: "JavaScript SDK",
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
  },
  {
    name: "Python SDK",
    description: "Used to interact with the MultiversX blockchain and smart contracts.",
    github_link: "https://github.com/multiversx/mx-sdk-py",
    tags: [
      { name: "Python", category: TagCategory.LANGUAGE },
      { name: "API", category: TagCategory.TECHNOLOGY },
      { name: "Smart Contract Interaction", category: TagCategory.PURPOSE },
      { name: "multiversx", category: TagCategory.OWNER },
    ],
  },
  {
    name: "NextJS SDK",
    description: "Utilities for the MultiversX microservices ecosystem, relies on @multiversX SDKs and NestJS.",
    github_link: "https://github.com/multiversx/mx-sdk-js",
    tags: [
      { name: "NextJS", category: TagCategory.FRAMEWORK },
      { name: "Typescript", category: TagCategory.LANGUAGE },
      { name: "API", category: TagCategory.TECHNOLOGY },
      { name: "Utilities", category: TagCategory.PURPOSE },
      { name: "multiversx", category: TagCategory.OWNER },
    ],
  },
  {
    name: "dApp SDK",
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
  },
  {
    name: "PHP SDK",
    description: "Used to interact with the MultiversX blockchain and smart contracts.",
    github_link: "https://github.com/PeerMeHQ/mx-sdk-laravel",
    tags: [
      { name: "PHP", category: TagCategory.LANGUAGE },
      { name: "API", category: TagCategory.TECHNOLOGY },
      { name: "Smart Contract Interaction", category: TagCategory.PURPOSE },
      { name: "PeerMeHQ", category: TagCategory.OWNER },
    ],
  },
  {
    name: "SA SDK GO",
    description: "Set of tools and Go packages to interact with the MultiversX blockchain and its smart contracts.",
    github_link: "https://github.com/multiversx/mx-sdk-go",
    tags: [
      { name: "Go", category: TagCategory.LANGUAGE },
      { name: "API", category: TagCategory.TECHNOLOGY },
      { name: "Community Champions", category: TagCategory.OTHER },
      { name: "multiversx", category: TagCategory.OWNER },
    ],
  },
  {
    name: "XOXNO SDK",
    description: "A JavaScript library that simplifies the interaction with the XOXNO Protocol for developers. It includes helper functions and modules to fetch, filter, and interact with data from the XOXNO Protocol and its NFT marketplace.",
    github_link: "https://github.com/XOXNO/sdk-js",
    tags: [
      { name: "JavaScript", category: TagCategory.LANGUAGE },
      { name: "NFT Marketplace", category: TagCategory.PURPOSE },
      { name: "API", category: TagCategory.TECHNOLOGY },
      { name: "XOXNO Protocol", category: TagCategory.OTHER },
      { name: "XOXNO", category: TagCategory.OWNER },
    ],
  },
  {
    name: "Liquid Staking Smart Contract",
    description: "A smart contract that allows users to stake EGLD in return for lsEGLD, a fungible ESDT that can be used in multiple ways in the MultiversX ecosystem, all while retaining the standard staking rewards.",
    github_link: "https://github.com/multiversx/mx-sc-snippets",
    tags: [
      { name: "Rust", category: TagCategory.LANGUAGE },
      { name: "Smart Contract", category: TagCategory.TECHNOLOGY },
      { name: "Liquid Staking", category: TagCategory.PURPOSE },
      { name: "DeFi", category: TagCategory.PURPOSE },
      { name: "ESDT", category: TagCategory.TECHNOLOGY },
      { name: "multiversx", category: TagCategory.OWNER },
    ],
  },
  {
    name: "sdk-exchange",
    description: "Utilities modules for xExchange interactions.",
    github_link: "https://github.com/multiversx/mx-sdk-js-exchange",
    tags: [
      { name: "JavaScript", category: TagCategory.LANGUAGE },
      { name: "TypeScript", category: TagCategory.LANGUAGE },
      { name: "Utilities", category: TagCategory.PURPOSE },
      { name: "xExchange", category: TagCategory.OTHER },
      { name: "multiversx", category: TagCategory.OWNER },
    ],
  },
  {
    name: "sdk-hw-provider",
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
  },
  {
    name: "sdk-wallet-connect-provider",
    description: "Sign using WalletConnect.",
    github_link: "https://github.com/multiversx/mx-sdk-js-wallet-connect-provider",
    tags: [
      { name: "JavaScript", category: TagCategory.LANGUAGE },
      { name: "TypeScript", category: TagCategory.LANGUAGE },
      { name: "WalletConnect", category: TagCategory.TECHNOLOGY },
      { name: "Signing Provider", category: TagCategory.PURPOSE },
      { name: "multiversx", category: TagCategory.OWNER },
    ],
  },
  {
    name: "sdk-extension-provider",
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
  },
  {
    name: "sdk-web-wallet-provider",
    description: "Sign using the MultiversX web wallet, using webhooks (DEPRECATED).",
    github_link: "https://github.com/multiversx/mx-sdk-js-web-wallet-provider",
    tags: [
      { name: "JavaScript", category: TagCategory.LANGUAGE },
      { name: "TypeScript", category: TagCategory.LANGUAGE },
      { name: "Web Wallet", category: TagCategory.TECHNOLOGY },
      { name: "Signing Provider", category: TagCategory.PURPOSE },
      { name: "Deprecated", category: TagCategory.OTHER },
    ],
  },
  {
    name: "mx-sdk-js-web-wallet-cross-window-provider",
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
  },
  {
    name: "mx-sdk-js-metamask-proxy-provider",
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
  },
  {
    name: "sdk-guardians-provider",
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
  },
  {
    name: "sdk-native-auth-client",
    description: "Native Authenticator - client-side components.",
    github_link: "https://github.com/multiversx/mx-sdk-js-native-auth-client",
    tags: [
      { name: "JavaScript", category: TagCategory.LANGUAGE },
      { name: "TypeScript", category: TagCategory.LANGUAGE },
      { name: "Authentication", category: TagCategory.PURPOSE },
      { name: "Client-Side", category: TagCategory.TECHNOLOGY },
      { name: "multiversx", category: TagCategory.OWNER },
    ],
  },
  {
    name: "sdk-native-auth-server",
    description: "Native Authenticator - server-side components.",
    github_link: "https://github.com/multiversx/mx-sdk-js-native-auth-server",
    tags: [
      { name: "JavaScript", category: TagCategory.LANGUAGE },
      { name: "TypeScript", category: TagCategory.LANGUAGE },
      { name: "Authentication", category: TagCategory.PURPOSE },
      { name: "Server-Side", category: TagCategory.TECHNOLOGY },
      { name: "multiversx", category: TagCategory.OWNER },
    ],
  },
  {
    name: "transaction-decoder",
    description: "Decodes transaction metadata from a given transaction.",
    github_link: "https://github.com/multiversx/mx-sdk-js-transaction-decoder",
    tags: [
      { name: "JavaScript", category: TagCategory.LANGUAGE },
      { name: "TypeScript", category: TagCategory.LANGUAGE },
      { name: "Transaction Decoder", category: TagCategory.PURPOSE },
      { name: "Utilities", category: TagCategory.PURPOSE },
      { name: "multiversx", category: TagCategory.OWNER },
    ],
  },
];
