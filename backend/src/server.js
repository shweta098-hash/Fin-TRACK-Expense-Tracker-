import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import expenseRoutes from './routes/expenses.js'

if (!process.env.JWT_SECRET || !process.env.DATABASE_URL) {
  console.error('Missing JWT_SECRET or DATABASE_URL. Copy .env.example to .env and fill it in.')
  process.exit(1)
}

const app = express()

// CORS: lets the browser app on another origin (localhost:5173) call this server.
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
// Parses JSON request bodies into req.body.
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRoutes)
app.use('/api/expenses', expenseRoutes)

// Unknown routes
app.use((req, res) => res.status(404).json({ error: 'Not found' }))

// Central error handler: any next(err) from a route ends up here.
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Something went wrong on the server' })
})

const port = process.env.PORT || 4000
app.listen(port, () => console.log(`API running on http://localhost:${port}`))
