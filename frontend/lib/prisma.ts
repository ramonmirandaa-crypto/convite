import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configuração do Prisma para funcionar na Vercel
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Função para verificar se as variáveis de ambiente estão configuradas
export function checkDatabaseConfig(): { ok: boolean; error?: string } {
  const requiredVars = ['POSTGRES_PRISMA_URL', 'POSTGRES_URL_NON_POOLING']
  const missing = requiredVars.filter(varName => !process.env[varName])
  
  if (missing.length > 0) {
    return {
      ok: false,
      error: `Variáveis de ambiente não configuradas: ${missing.join(', ')}`
    }
  }
  
  return { ok: true }
}
