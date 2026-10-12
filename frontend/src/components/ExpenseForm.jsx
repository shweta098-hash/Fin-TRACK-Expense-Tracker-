import { useState } from 'react'
import { CATEGORIES } from '../utils/constants.js'
import { todayISO } from '../utils/format.js'

// Used for both adding and editing.
// Props:
//   initial  - an existing expense when editing, or null when adding
//   onSubmit - async function(expenseData) provided by the parent
//   onCancel - closes the form
function ExpenseForm({ initial, onSubmit, onCancel }) {
  // Controlled inputs: React state is the single source of truth for each field.
  const [title, setTitle] = useState(initial?.title ?? '')
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [type, setType] = useState(initial?.type ?? 'expense')
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0])
  const [date, setDate] = useState(initial?.date ?? todayISO())
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    const next = {}
    if (!title.trim()) next.title = 'Title is required'
    const num = Number(amount)
    if (!amount || !Number.isFinite(num) || num <= 0) next.amount = 'Enter an amount greater than 0'
    if (!date) next.date = 'Date is required'
    return next
  }

  async function handleSubmit(event) {
    event.preventDefault() // stop the browser's default full-page form submit
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    setSubmitError('')
    try {
      await onSubmit({ title: title.trim(), amount: Number(amount), type, category, date })
    } catch (err) {
      setSubmitError(err.message)
      setSubmitting(false)
    }
    // On success the parent closes the form, so there is nothing else to reset.
  }

  return (
    <form className="panel form" onSubmit={handleSubmit} noValidate>
      <h2>{initial ? 'Edit transaction' : 'Add transaction'}</h2>

      <div className="field">
        <label htmlFor="title">Title</label>
        <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Groceries" />
        {errors.title && <p className="field-error">{errors.title}</p>}
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="amount">Amount (₹)</label>
          <input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {errors.amount && <p className="field-error">{errors.amount}</p>}
        </div>

        <div className="field">
          <label htmlFor="type">Type</label>
          <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="date">Date</label>
          <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          {errors.date && <p className="field-error">{errors.date}</p>}
        </div>
      </div>

      {submitError && <p className="form-error">{submitError}</p>}

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : initial ? 'Save changes' : 'Add'}
        </button>
      </div>
    </form>
  )
}

export default ExpenseForm
