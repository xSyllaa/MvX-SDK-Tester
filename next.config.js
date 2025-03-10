/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ignorer les modules Node.js côté client
      config.resolve.fallback = {
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        os: false,
      };
    }

    // Ignorer les avertissements de @walletconnect
    config.ignoreWarnings = [
      { module: /@walletconnect/ },
      { module: /@multiversx/ },
      { module: /@ledgerhq/ }
    ];

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.elrond.com',
      },
      {
        protocol: 'https',
        hostname: 'devnet-media.elrond.com',
      },
      {
        protocol: 'https',
        hostname: 'testnet-media.elrond.com',
      },
    ],
  },
  // Configuration pour désactiver le runtime Edge par défaut
  experimental: {
    serverActions: {
      // Utiliser Node.js par défaut pour les Server Actions
      defaultRuntime: 'nodejs',
    },
  },
  // S'assurer que les API routes utilisent Node.js par défaut
  serverRuntimeConfig: {
    defaultRuntime: 'nodejs',
  },
};

module.exports = nextConfig; 