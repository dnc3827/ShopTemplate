import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

// Import routes — MODULE 2A
import templatesRouter    from './routes/templates.js'
import categoriesRouter   from './routes/categories.js'
import purchasesRouter    from './routes/purchases.js'
import accountRouter      from './routes/account.js'

// Import routes — MODULE 2B
import authRouter         from './routes/auth.js'
import checkoutRouter     from './routes/checkout.js'
import webhookRouter      from './routes/webhook.js'

// Import routes — MODULE 2C (Admin)
import adminTemplatesRouter   from './routes/admin/templates.js'
import adminCategoriesRouter  from './routes/admin/categories.js'
import adminPromotionsRouter  from './routes/admin/promotions.js'
import adminUsersRouter       from './routes/admin/users.js'
import adminOrdersRouter      from './routes/admin/orders.js'
import adminStatsRouter       from './routes/admin/stats.js'

const app = express()

// Trust proxy — Railway/Render dùng reverse proxy, cần set để rate limiter đọc đúng IP
// Fix: ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
app.set('trust proxy', 1)

// CORS: đọc từ env ALLOWED_ORIGINS — KHÔNG hardcode domain
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || ['http://localhost:5173']

app.use(cors({
  origin: (origin, callback) => {
    // Cho phép requests không có origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error(`CORS: Origin ${origin} not allowed`))
  },
  credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Mount routes — MODULE 2A
app.use('/api/templates',    templatesRouter)
app.use('/api/categories',   categoriesRouter)
app.use('/api/purchases',    purchasesRouter)
app.use('/api/account',      accountRouter)

// Mount routes — MODULE 2B
app.use('/api/auth',     authRouter)
app.use('/api/checkout', checkoutRouter)
app.use('/api/webhook',  webhookRouter)

// Mount routes — MODULE 2C (Admin)
app.use('/api/admin/templates',  adminTemplatesRouter)
app.use('/api/admin/categories', adminCategoriesRouter)
app.use('/api/admin/promotions', adminPromotionsRouter)
app.use('/api/admin/users',      adminUsersRouter)
app.use('/api/admin/orders',     adminOrdersRouter)
app.use('/api/admin/stats',      adminStatsRouter)

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`EZTemplate server running on port ${PORT}`)
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`)
})

export default app
