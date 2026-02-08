/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', '*.vercel.app', '*.supabase.co'],
    unoptimized: true,
  },
  // Configuração para Serverless Functions na Vercel
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
}

module.exports = nextConfig
