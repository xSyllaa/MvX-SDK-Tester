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
}

// You can define colors for each category for styling purposes
export const tagCategoryColors: { [key in TagCategory]: string } = {
  [TagCategory.LANGUAGE]: "#29ABE2", // Light Blue
  [TagCategory.PURPOSE]: "#8E44AD", // Purple
  [TagCategory.FRAMEWORK]: "#27AE60", // Green
  [TagCategory.PLATFORM]: "#F39C12", // Orange
  [TagCategory.TECHNOLOGY]: "#D35400", // Dark Orange
  [TagCategory.OTHER]: "#7F8C8D", // Grey
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
    ],
  },
  {
    name: "JavaScript SDK",
    description: "Used to interact with the MultiversX blockchain and smart contracts.",
    github_link: "https://github.com/multiversx/mx-sdk-js",
    tags: [
      { name: "JavaScript", category: TagCategory.LANGUAGE },
      { name: "API", category: TagCategory.TECHNOLOGY },
      { name: "Smart Contract Interaction", category: TagCategory.PURPOSE },
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
    ],
  },
  {
    name: "dApp SDK",
    description: "Library to create dApps on the MultiversX network, designed for React applications.",
    github_link: "https://github.com/multiversx/mx-sdk-dapp",
    tags: [
      { name: "dApp", category: TagCategory.PURPOSE },
      { name: "React", category: TagCategory.FRAMEWORK },
      { name: "Typescript", category: TagCategory.LANGUAGE },
      { name: "API", category: TagCategory.TECHNOLOGY },
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
    ],
  },
];

