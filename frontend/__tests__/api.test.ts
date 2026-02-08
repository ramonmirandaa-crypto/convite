import { createPayment, getPaymentStatus, listGifts, createRSVP } from '../lib/api'

describe('API Functions', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('createPayment', () => {
    it('should create payment successfully', async () => {
      const mockResponse = {
        success: true,
        contribution: { id: '123' },
        pix: { qrCode: 'test' }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await createPayment({
        giftId: '123',
        amount: 100,
        payerName: 'Test',
        payerEmail: 'test@test.com',
        payerCPF: '529.982.247-25',
        paymentMethod: 'pix'
      })

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/payments/create'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      )
    })

    it('should throw error on failed payment', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Payment failed' })
      })

      await expect(createPayment({
        giftId: '123',
        amount: 100,
        payerName: 'Test',
        payerEmail: 'test@test.com',
        payerCPF: '529.982.247-25',
        paymentMethod: 'pix'
      })).rejects.toThrow('Payment failed')
    })
  })

  describe('getPaymentStatus', () => {
    it('should return payment status', async () => {
      const mockStatus = {
        contribution: { id: '123', paymentStatus: 'approved' },
        status: 'approved'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus
      })

      const result = await getPaymentStatus('123')
      expect(result).toEqual(mockStatus)
    })
  })

  describe('listGifts', () => {
    it('should return list of gifts', async () => {
      const mockGifts = {
        gifts: [
          { id: '1', title: 'Gift 1', remaining: 100 },
          { id: '2', title: 'Gift 2', remaining: 200 }
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockGifts
      })

      const result = await listGifts()
      expect(result).toEqual(mockGifts)
    })

    it('should throw error on failed request', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Server error' })
      })

      await expect(listGifts()).rejects.toThrow('Server error')
    })
  })

  describe('createRSVP', () => {
    it('should create RSVP successfully', async () => {
      const mockResponse = {
        message: 'Success',
        guest: { id: '123', name: 'Test' }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await createRSVP({
        name: 'Test User',
        email: 'test@test.com',
        guestCount: 2
      })

      expect(result).toEqual(mockResponse)
    })
  })
})

describe('Mercado Pago Integration', () => {
  it('should detect card brands correctly', () => {
    const detectCardBrand = (bin: string): string => {
      if (bin.startsWith('4')) return 'visa'
      if (/^5[1-5]/.test(bin)) return 'mastercard'
      if (/^3[47]/.test(bin)) return 'amex'
      return 'unknown'
    }

    expect(detectCardBrand('4111')).toBe('visa')
    expect(detectCardBrand('5500')).toBe('mastercard')
    expect(detectCardBrand('3715')).toBe('amex')
    expect(detectCardBrand('9999')).toBe('unknown')
  })

  it('should format card number correctly', () => {
    const formatCardNumber = (value: string): string => {
      return value
        .replace(/\D/g, '')
        .replace(/(\d{4})(?=\d)/g, '$1 ')
        .trim()
        .slice(0, 23)
    }

    expect(formatCardNumber('4111111111111111')).toBe('4111 1111 1111 1111')
    expect(formatCardNumber('4111111111111111222')).toBe('4111 1111 1111 1111 222')
  })

  it('should format CPF correctly', () => {
    const formatCPF = (value: string): string => {
      return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        .slice(0, 14)
    }

    expect(formatCPF('52998224725')).toBe('529.982.247-25')
  })
})
