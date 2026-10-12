import { useMemo } from 'react'
import { formatCurrency } from '../utils/format.js'

// Horizontal bars showing where expense money went, by category.
function CategoryChart({ expenses }) {
  const rows = useMemo(() => {
    const totals = {}
    for (const e of expenses) {
      if (e.type !== 'expense') continue
      totals[e.category] = (totals[e.category] || 0) + e.amount
    }
    return Object.entries(totals)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)
  }, [expenses])

  if (rows.length === 0) return null

  const max = rows[0].total

  return (
    <section className="panel">
      <h2>Spending by category</h2>
      {rows.map((row) => (
        <div className="hbar-row" key={row.category}>
          <span className="hbar-label">{row.category}</span>
          <div className="hbar-track">
            <div className="hbar-fill" style={{ width: `${(row.total / max) * 100}%` }} />
          </div>
          <span className="hbar-value">{formatCurrency(row.total)}</span>
        </div>
      ))}
    </section>
  )
}

export default CategoryChart
