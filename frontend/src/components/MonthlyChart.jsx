import { useMemo } from 'react'
import { formatCurrency, formatMonth, monthKey } from '../utils/format.js'

// Income vs expenses for the last 6 months that have data. Plain CSS bars, no chart library.
function MonthlyChart({ expenses }) {
  const months = useMemo(() => {
    const totals = {}
    for (const e of expenses) {
      const key = monthKey(e.date)
      if (!totals[key]) totals[key] = { key, income: 0, expense: 0 }
      totals[key][e.type] += e.amount
    }
    return Object.values(totals)
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6)
  }, [expenses])

  if (months.length === 0) return null

  const max = Math.max(...months.map((m) => Math.max(m.income, m.expense)), 1)

  return (
    <section className="panel">
      <h2>Income vs expenses</h2>
      <div className="legend">
        <span className="dot income" /> Income <span className="dot expense" /> Expenses
      </div>
      <div className="bars">
        {months.map((m) => (
          <div className="bar-group" key={m.key}>
            <div className="bar-pair">
              <div
                className="bar income"
                style={{ height: `${(m.income / max) * 100}%` }}
                title={`Income: ${formatCurrency(m.income)}`}
              />
              <div
                className="bar expense"
                style={{ height: `${(m.expense / max) * 100}%` }}
                title={`Expenses: ${formatCurrency(m.expense)}`}
              />
            </div>
            <p className="bar-label">{formatMonth(m.key)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default MonthlyChart
