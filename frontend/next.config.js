/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    // `images.domains` nao suporta wildcard de forma confiavel.
    // `remotePatterns` cobre URLs do Supabase Storage (e opcionalmente Vercel preview domains).
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Caso use URLs assinadas em algum momento.
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/sign/**',
      },
      {
        protocol: 'https',
        hostname: '**.vercel.app',
        pathname: '/**',
      },
    ],
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
