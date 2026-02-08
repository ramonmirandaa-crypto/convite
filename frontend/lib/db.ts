// Cliente de banco de dados unificado
// Usa Prisma localmente e Supabase na Vercel (para evitar problemas de IPv6)

import { prisma } from './prisma'
import { supabase } from './supabase'

const isVercel = process.env.VERCEL === '1'

// Wrapper para queries que tenta Prisma primeiro, depois Supabase
export const db = {
  // Event
  async getEvent() {
    if (!isVercel) {
      return prisma.event.findFirst()
    }
    const { data, error } = await supabase.from('events').select('*').single()
    if (error) throw error
    return data
  },

  // Gifts
  async getGifts() {
    if (!isVercel) {
      return prisma.gift.findMany({
        include: { contributions: true }
      })
    }
    const { data, error } = await supabase
      .from('gifts')
      .select('*, contributions(*)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getGiftById(id: string) {
    if (!isVercel) {
      return prisma.gift.findUnique({
        where: { id },
        include: { contributions: true }
      })
    }
    const { data, error } = await supabase
      .from('gifts')
      .select('*, contributions(*)')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  // Guests
  async getGuests() {
    if (!isVercel) {
      return prisma.guest.findMany({
        orderBy: { createdAt: 'desc' }
      })
    }
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getGuestById(id: string) {
    if (!isVercel) {
      return prisma.guest.findUnique({ where: { id } })
    }
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  // Contributions
  async createContribution(data: any) {
    if (!isVercel) {
      return prisma.contribution.create({ data })
    }
    const { data: result, error } = await supabase
      .from('contributions')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    return result
  },

  // Contact Messages
  async createContactMessage(data: any) {
    if (!isVercel) {
      return prisma.contactMessage.create({ data })
    }
    const { data: result, error } = await supabase
      .from('contact_messages')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    return result
  },

  // Photos
  async getPhotos() {
    if (!isVercel) {
      return prisma.photo.findMany({
        orderBy: { order: 'asc' }
      })
    }
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('order', { ascending: true })
    if (error) throw error
    return data
  },

  // Raw query (para migrações/setup)
  async queryRaw(sql: string) {
    if (!isVercel) {
      return prisma.$queryRawUnsafe(sql)
    }
    const { data, error } = await supabase.rpc('exec_sql', { sql })
    if (error) throw error
    return data
  }
}

export { prisma, supabase }
