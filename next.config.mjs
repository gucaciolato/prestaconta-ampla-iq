/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost', 'ampla.prestaconta.com.br'],
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: [
      'mongodb',
      '@napi-rs/snappy-linux-x64-gnu',
      '@napi-rs/snappy-linux-x64-musl',
      'minio',
      'bcryptjs',
      'jsonwebtoken',
    ],
  },
  webpack: (config) => {
    // Configuração para evitar erros com módulos binários no cliente
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    
    return config;
  },
}

export default nextConfig
