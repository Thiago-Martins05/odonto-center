import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [],
    unoptimized: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Configurações para produção na Vercel
  outputFileTracingRoot: process.cwd(),
  experimental: {
    workerThreads: false,
  },
  // Configurações de build para produção
  compress: true,
  poweredByHeader: false,
  // Configurar porta padrão
  env: {
    PORT: "3000",
  },
  // Configurações para deploy na Vercel
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
