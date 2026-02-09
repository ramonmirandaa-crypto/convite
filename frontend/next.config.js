/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', '*.vercel.app', '*.supabase.co'],
    unoptimized: true,
  },
  // Mantemos `npm run lint` como checagem manual, mas não bloqueamos o build.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configuração para Serverless Functions na Vercel
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
}

module.exports = nextConfig
