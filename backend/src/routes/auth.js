import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db.js'
import requireAuth from '../middleware/auth.js'

const router = Router()

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

function isValidEmail(email) {
  return typeof email === 'string' && /^\S+@\S+\.\S+$/.test(email)
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' })
    if (!isValidEmail(email)) return res.status(400).json({ error: 'A valid email is required' })
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail])
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' })
    }

    // Never store plain passwords. bcrypt hashes with a random salt.
    const passwordHash = await bcrypt.hash(password, 10)
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name.trim(), normalizedEmail, passwordHash],
    )
    const user = result.rows[0]
    res.status(201).json({ token: signToken(user.id), user })
  } catch (err) {
    next(err)
  }
})

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!isValidEmail(email) || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const result = await pool.query(
      'SELECT id, name, email, password_hash FROM users WHERE email = $1',
      [email.trim().toLowerCase()],
    )
    const row = result.rows[0]
    // Same message for "no such user" and "wrong password" so attackers can't probe emails.
    const ok = row && (await bcrypt.compare(password, row.password_hash))
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' })

    res.json({
      token: signToken(row.id),
      user: { id: row.id, name: row.name, email: row.email },
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/auth/me  (used by the frontend to restore a session on page load)
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [req.userId])
    if (result.rows.length === 0) return res.status(401).json({ error: 'User no longer exists' })
    res.json({ user: result.rows[0] })
  } catch (err) {
    next(err)
  }
})

export default router
