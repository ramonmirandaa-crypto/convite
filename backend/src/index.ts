import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import rsvpRoutes from './routes/rsvp'
import giftRoutes from './routes/gifts'
import contactRoutes from './routes/contact'
import contributionRoutes from './routes/contributions'
import eventRoutes from './routes/event'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiting: 100 requests per 15 min per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api', limiter)

// Routes
app.use('/api/rsvp', rsvpRoutes)
app.use('/api/gifts', giftRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/contributions', contributionRoutes)
app.use('/api/event', eventRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API está funcionando' })
})

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Algo deu errado!' })
})

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
