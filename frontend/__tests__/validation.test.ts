import { 
  createRSVPSchema, 
  createGiftSchema, 
  createContributionSchema,
  updateRSVPSchema 
} from '../lib/validation'

describe('Validation Schemas', () => {
  describe('createRSVPSchema', () => {
    it('should validate a valid RSVP', () => {
      const validRSVP = {
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '(11) 99999-9999',
        guestCount: 2,
        dietaryRestrictions: 'Vegetariano',
        suggestedSong: 'All of Me',
        eventId: '123e4567-e89b-12d3-a456-426614174000'
      }

      const result = createRSVPSchema.safeParse(validRSVP)
      expect(result.success).toBe(true)
    })

    it('should fail with invalid email', () => {
      const invalidRSVP = {
        name: 'João Silva',
        email: 'invalid-email',
        guestCount: 1
      }

      const result = createRSVPSchema.safeParse(invalidRSVP)
      expect(result.success).toBe(false)
    })

    it('should fail with negative guest count', () => {
      const invalidRSVP = {
        name: 'João Silva',
        email: 'joao@email.com',
        guestCount: -1
      }

      const result = createRSVPSchema.safeParse(invalidRSVP)
      expect(result.success).toBe(false)
    })

    it('should fail with missing required fields', () => {
      const incompleteRSVP = {
        email: 'joao@email.com'
      }

      const result = createRSVPSchema.safeParse(incompleteRSVP)
      expect(result.success).toBe(false)
    })
  })

  describe('createGiftSchema', () => {
    it('should validate a valid gift', () => {
      const validGift = {
        title: 'Jogo de Cama',
        description: 'Kit casal 400 fios',
        totalValue: 350.00,
        imageUrl: 'https://example.com/image.jpg',
        eventId: '123e4567-e89b-12d3-a456-426614174000'
      }

      const result = createGiftSchema.safeParse(validGift)
      expect(result.success).toBe(true)
    })

    it('should validate with only required fields', () => {
      const minimalGift = {
        title: 'Jogo de Cama',
        totalValue: 350.00
      }

      const result = createGiftSchema.safeParse(minimalGift)
      expect(result.success).toBe(true)
    })

    it('should fail with negative value', () => {
      const invalidGift = {
        title: 'Jogo de Cama',
        totalValue: -100
      }

      const result = createGiftSchema.safeParse(invalidGift)
      expect(result.success).toBe(false)
    })

    it('should fail with empty title', () => {
      const invalidGift = {
        title: '',
        totalValue: 350.00
      }

      const result = createGiftSchema.safeParse(invalidGift)
      expect(result.success).toBe(false)
    })
  })

  describe('createContributionSchema', () => {
    it('should validate a valid contribution', () => {
      const validContribution = {
        giftId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 100.00,
        payerName: 'João Silva',
        payerEmail: 'joao@email.com',
        payerCPF: '529.982.247-25',
        payerPhone: '(11) 99999-9999',
        message: 'Parabéns!',
        isAnonymous: false,
        paymentMethod: 'pix',
        installments: 1
      }

      const result = createContributionSchema.safeParse(validContribution)
      expect(result.success).toBe(true)
    })

    it('should validate anonymous contribution', () => {
      const anonymousContribution = {
        giftId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 50.00,
        payerName: 'João Silva',
        payerEmail: 'joao@email.com',
        payerCPF: '529.982.247-25',
        isAnonymous: true,
        paymentMethod: 'credit_card'
      }

      const result = createContributionSchema.safeParse(anonymousContribution)
      expect(result.success).toBe(true)
    })

    it('should fail with invalid CPF format', () => {
      const invalidContribution = {
        giftId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 100.00,
        payerName: 'João Silva',
        payerEmail: 'joao@email.com',
        payerCPF: '123', // Formato inválido - muito curto
        paymentMethod: 'pix'
      }

      const result = createContributionSchema.safeParse(invalidContribution)
      expect(result.success).toBe(false)
    })

    it('should fail with invalid payment method', () => {
      const invalidContribution = {
        giftId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 100.00,
        payerName: 'João Silva',
        payerEmail: 'joao@email.com',
        payerCPF: '529.982.247-25',
        paymentMethod: 'bitcoin' // método inválido
      }

      const result = createContributionSchema.safeParse(invalidContribution)
      expect(result.success).toBe(false)
    })
  })

  describe('updateRSVPSchema', () => {
    it('should validate partial update', () => {
      const partialUpdate = {
        guestCount: 3,
        dietaryRestrictions: 'Vegano'
      }

      const result = updateRSVPSchema.safeParse(partialUpdate)
      expect(result.success).toBe(true)
    })

    it('should validate empty update', () => {
      const emptyUpdate = {}

      const result = updateRSVPSchema.safeParse(emptyUpdate)
      expect(result.success).toBe(true)
    })

    it('should fail with invalid email in update', () => {
      const invalidUpdate = {
        email: 'not-an-email'
      }

      const result = updateRSVPSchema.safeParse(invalidUpdate)
      expect(result.success).toBe(false)
    })
  })
})
