import { Router } from 'express'
import pool from '../db.js'
import requireAuth from '../middleware/auth.js'

const router = Router()

// Every route in this file requires a logged-in user.
router.use(requireAuth)

const CATEGORIES = ['Food', 'Transport', 'Rent', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Salary', 'Other']

// Validates and cleans the request body. Returns { error } or { value }.
function validate(body) {
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const amount = Number(body.amount)
  const { type, category, date } = body

  if (!title) return { error: 'Title is required' }
  if (!Number.isFinite(amount) || amount <= 0) return { error: 'Amount must be a positive number' }
  if (type !== 'income' && type !== 'expense') return { error: 'Type must be income or expense' }
  if (!CATEGORIES.includes(category)) return { error: 'Invalid category' }
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: 'Date must be in YYYY-MM-DD format' }
  }
  return { value: { title, amount, type, category, date } }
}

// Columns returned to the client. to_char keeps the date as a plain "YYYY-MM-DD" string
// (avoids timezone shifts), and amount is cast to float so JSON gets a number, not a string.
const SELECT_COLUMNS = `id, title, amount::float AS amount, type, category,
  to_char(date, 'YYYY-MM-DD') AS date`

// GET /api/expenses
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT ${SELECT_COLUMNS} FROM expenses WHERE user_id = $1 ORDER BY date DESC, id DESC`,
      [req.userId],
    )
    res.json({ expenses: result.rows })
  } catch (err) {
    next(err)
  }
})

// POST /api/expenses
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = validate(req.body)
    if (error) return res.status(400).json({ error })

    const result = await pool.query(
      `INSERT INTO expenses (user_id, title, amount, type, category, date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${SELECT_COLUMNS}`,
      [req.userId, value.title, value.amount, value.type, value.category, value.date],
    )
    res.status(201).json({ expense: result.rows[0] })
  } catch (err) {
    next(err)
  }
})

// PUT /api/expenses/:id
router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' })

    const { error, value } = validate(req.body)
    if (error) return res.status(400).json({ error })

    // "AND user_id = $7" is what stops one user editing another user's data.
    const result = await pool.query(
      `UPDATE expenses
       SET title = $1, amount = $2, type = $3, category = $4, date = $5
       WHERE id = $6 AND user_id = $7
       RETURNING ${SELECT_COLUMNS}`,
      [value.title, value.amount, value.type, value.category, value.date, id, req.userId],
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Expense not found' })
    res.json({ expense: result.rows[0] })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' })

    const result = await pool.query('DELETE FROM expenses WHERE id = $1 AND user_id = $2', [id, req.userId])
    if (result.rowCount === 0) return res.status(404).json({ error: 'Expense not found' })
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

export default router
