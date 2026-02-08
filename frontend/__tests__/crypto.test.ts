import { encrypt, decrypt, generateEncryptionKey } from '../lib/crypto'

describe('Crypto Functions', () => {
  describe('generateEncryptionKey', () => {
    it('should generate a valid base64 key', () => {
      const key = generateEncryptionKey()
      
      // Should be a string
      expect(typeof key).toBe('string')
      
      // Should be valid base64
      expect(() => Buffer.from(key, 'base64')).not.toThrow()
      
      // Should have sufficient length (at least 32 bytes when decoded)
      const decoded = Buffer.from(key, 'base64')
      expect(decoded.length).toBeGreaterThanOrEqual(32)
    })

    it('should generate different keys each time', () => {
      const key1 = generateEncryptionKey()
      const key2 = generateEncryptionKey()
      
      expect(key1).not.toBe(key2)
    })
  })

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt text correctly', () => {
      const originalText = 'Hello, World!'
      
      const encrypted = encrypt(originalText)
      expect(encrypted).not.toBe(originalText)
      expect(typeof encrypted).toBe('string')
      
      const decrypted = decrypt(encrypted)
      expect(decrypted).toBe(originalText)
    })

    it('should handle special characters', () => {
      const specialText = 'Special chars: àáâãäåæçèéêë ñ 中文 🎉'
      
      const encrypted = encrypt(specialText)
      const decrypted = decrypt(encrypted)
      
      expect(decrypted).toBe(specialText)
    })

    it('should handle empty string', () => {
      const emptyText = ''
      
      const encrypted = encrypt(emptyText)
      const decrypted = decrypt(encrypted)
      
      expect(decrypted).toBe(emptyText)
    })

    it('should handle long text', () => {
      const longText = 'A'.repeat(1000)
      
      const encrypted = encrypt(longText)
      const decrypted = decrypt(encrypted)
      
      expect(decrypted).toBe(longText)
    })

    it('should produce different encrypted values for same text', () => {
      const text = 'Same text'
      
      const encrypted1 = encrypt(text)
      const encrypted2 = encrypt(text)
      
      // Due to IV, same text should produce different encrypted values
      expect(encrypted1).not.toBe(encrypted2)
      
      // But both should decrypt to the same value
      expect(decrypt(encrypted1)).toBe(text)
      expect(decrypt(encrypted2)).toBe(text)
    })

    it('should handle CPF-like strings', () => {
      const cpf = '52998224725'
      
      const encrypted = encrypt(cpf)
      const decrypted = decrypt(encrypted)
      
      expect(decrypted).toBe(cpf)
    })

    it('should throw error for invalid encrypted format', () => {
      const invalidEncrypted = 'invalid:base64:data'
      
      expect(() => decrypt(invalidEncrypted)).toThrow()
    })

    it('should throw error for tampered encrypted data', () => {
      const originalText = 'Sensitive data'
      const encrypted = encrypt(originalText)
      
      // Tamper with the encrypted data
      const tampered = encrypted.slice(0, -10) + ' tampered '
      
      expect(() => decrypt(tampered)).toThrow()
    })
  })
})
