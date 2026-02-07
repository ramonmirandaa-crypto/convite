import { Request, Response, NextFunction } from 'express'

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin"')
    return res.status(401).json({ error: 'Autenticação necessária' })
  }

  const credentials = Buffer.from(authHeader.slice(6), 'base64').toString()
  const [username, password] = credentials.split(':')

  const adminUser = process.env.ADMIN_USER || 'admin'
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123'

  if (username !== adminUser || password !== adminPass) {
    return res.status(403).json({ error: 'Credenciais inválidas' })
  }

  next()
}
