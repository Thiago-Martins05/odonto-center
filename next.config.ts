import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [],
    unoptimized: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false, // Build funcionando, removendo configuração temporária
  },
  // Resolver problema de múltiplos lockfiles
  outputFileTracingRoot: process.cwd(),
  // Desabilitar pré-renderização para páginas que dependem do banco
  experimental: {
    // Desabilitar SSG para páginas que fazem queries no banco
    workerThreads: false,
  },
};

export default nextConfig;
