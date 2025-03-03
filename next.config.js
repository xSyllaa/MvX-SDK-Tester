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
};

module.exports = nextConfig; 