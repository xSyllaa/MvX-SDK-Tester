export interface SuggestedPrompt {
  text: string;
  category: 'landing' | 'analyzer' | 'repo';
  isMain: boolean;
}

export const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  // Prompts pour la landing page
  {
    text: "How can I use this SDK testing tool?",
    category: "landing",
    isMain: true
  },
  {
    text: "What are the main features of this platform?",
    category: "landing",
    isMain: true
  },
  {
    text: "How do I start analyzing an SDK?",
    category: "landing",
    isMain: false
  },
  {
    text: "What types of SDKs can I analyze?",
    category: "landing",
    isMain: false
  },
  {
    text: "How do I interpret the analysis results?",
    category: "landing",
    isMain: false
  },
  {
    text: "What are the best practices for SDK analysis?",
    category: "landing",
    isMain: false
  },

  // Prompts pour la page analyzer
  {
    text: "What are the main features of MultiversX SDK?",
    category: "analyzer",
    isMain: true
  },
  {
    text: "How do I initialize the MultiversX SDK?",
    category: "analyzer",
    isMain: true
  },
  {
    text: "Can you show me an example of MultiversX SDK usage?",
    category: "analyzer",
    isMain: false
  },
  {
    text: "What are the available MultiversX endpoints?",
    category: "analyzer",
    isMain: false
  },
  {
    text: "How do I handle MultiversX SDK errors?",
    category: "analyzer",
    isMain: false
  },
  {
    text: "What are the best practices for MultiversX SDK?",
    category: "analyzer",
    isMain: false
  },

  // Prompts pour la page repo
  {
    text: "What are the main features of this SDK?",
    category: "repo",
    isMain: true
  },
  {
    text: "How do I initialize this SDK?",
    category: "repo",
    isMain: true
  },
  {
    text: "Can you show me an example of usage?",
    category: "repo",
    isMain: false
  },
  {
    text: "What are the available endpoints?",
    category: "repo",
    isMain: false
  },
  {
    text: "How do I handle errors?",
    category: "repo",
    isMain: false
  },
  {
    text: "What are the best practices?",
    category: "repo",
    isMain: false
  }
]; 