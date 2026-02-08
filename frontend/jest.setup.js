import '@testing-library/jest-dom'

// Mock window.MercadoPago
global.window.MercadoPago = jest.fn().mockImplementation(() => ({
  createCardToken: jest.fn().mockResolvedValue({ id: 'mock_token_123' }),
  getIdentificationTypes: jest.fn().mockResolvedValue([
    { id: 'CPF', name: 'CPF' },
    { id: 'CNPJ', name: 'CNPJ' }
  ]),
  getPaymentMethods: jest.fn().mockResolvedValue({ results: [] }),
  getInstallments: jest.fn().mockResolvedValue([{ payer_costs: [] }]),
}))

// Mock fetch
global.fetch = jest.fn()

// Mock navigator.clipboard
Object.defineProperty(global.navigator, 'clipboard', {
  value: {
    writeText: jest.fn(),
  },
})

// Mock IntersectionObserver
class IntersectionObserver {
  observe = jest.fn()
  disconnect = jest.fn()
  unobserve = jest.fn()
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
