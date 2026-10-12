import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import Navbar from '../components/Navbar.jsx'
import SummaryCards from '../components/SummaryCards.jsx'
import Filters from '../components/Filters.jsx'
import ExpenseForm from '../components/ExpenseForm.jsx'
import ExpenseList from '../components/ExpenseList.jsx'
import MonthlyChart from '../components/MonthlyChart.jsx'
import CategoryChart from '../components/CategoryChart.jsx'
import { monthKey } from '../utils/format.js'

const DEFAULT_FILTERS = { search: '', type: 'all', category: 'all', month: '', sort: 'date-desc' }

// The "smart" component: it owns the data and state, and passes pieces down as props.
function DashboardPage() {
  const { logout } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  // formState: null = form hidden, { expense: null } = adding, { expense: {...} } = editing
  const [formState, setFormState] = useState(null)

  // Runs once after the first render: fetch this user's expenses.
  useEffect(() => {
    api
      .getExpenses()
      .then((data) => setExpenses(data.expenses))
      .catch((err) => {
        if (err.status === 401) logout() // token expired -> back to login
        else setLoadError(err.message)
      })
      .finally(() => setLoading(false))
  }, [logout])

  // Derived data: computed from `expenses` + `filters`, never stored in its own state.
  const visibleExpenses = useMemo(() => {
    const search = filters.search.trim().toLowerCase()
    const list = expenses.filter((e) => {
      if (search && !e.title.toLowerCase().includes(search)) return false
      if (filters.type !== 'all' && e.type !== filters.type) return false
      if (filters.category !== 'all' && e.category !== filters.category) return false
      if (filters.month && monthKey(e.date) !== filters.month) return false
      return true
    })

    // sort() mutates, but `list` is already a fresh array from filter(), so this is safe.
    list.sort((a, b) => {
      switch (filters.sort) {
        case 'date-asc':
          return a.date.localeCompare(b.date) || a.id - b.id
        case 'amount-desc':
          return b.amount - a.amount
        case 'amount-asc':
          return a.amount - b.amount
        default:
          return b.date.localeCompare(a.date) || b.id - a.id
      }
    })
    return list
  }, [expenses, filters])

  const totals = useMemo(() => {
    let income = 0
    let spent = 0
    for (const e of visibleExpenses) {
      if (e.type === 'income') income += e.amount
      else spent += e.amount
    }
    return { income, spent }
  }, [visibleExpenses])

  async function handleSave(data) {
    if (formState.expense) {
      const { expense } = await api.updateExpense(formState.expense.id, data)
      // Immutable update: build a NEW array, replacing only the edited item.
      setExpenses((prev) => prev.map((e) => (e.id === expense.id ? expense : e)))
    } else {
      const { expense } = await api.createExpense(data)
      setExpenses((prev) => [expense, ...prev])
    }
    setFormState(null)
  }

  async function handleDelete(expense) {
    if (!window.confirm(`Delete "${expense.title}"?`)) return
    try {
      await api.deleteExpense(expense.id)
      setExpenses((prev) => prev.filter((e) => e.id !== expense.id))
    } catch (err) {
      alert(err.message)
    }
  }

  const hasActiveFilters = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS)

  return (
    <>
      <Navbar />
      <main className="container">
        {loading && <p className="center-message">Loading your transactions...</p>}

        {loadError && (
          <div className="error-box">
            <p>{loadError}</p>
            <button className="btn btn-secondary" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        )}

        {!loading && !loadError && (
          <>
            <SummaryCards income={totals.income} expenses={totals.spent} />

            <div className="toolbar">
              <h2>Transactions</h2>
              {!formState && (
                <button className="btn btn-primary" onClick={() => setFormState({ expense: null })}>
                  + Add transaction
                </button>
              )}
            </div>

            {formState && (
              <ExpenseForm
                // key forces a fresh form (fresh state) when switching between add / edit targets
                key={formState.expense?.id ?? 'new'}
                initial={formState.expense}
                onSubmit={handleSave}
                onCancel={() => setFormState(null)}
              />
            )}

            <Filters filters={filters} onChange={setFilters} />
            {hasActiveFilters && (
              <button className="btn-link" onClick={() => setFilters(DEFAULT_FILTERS)}>
                Clear filters
              </button>
            )}

            <ExpenseList
              expenses={visibleExpenses}
              totalCount={expenses.length}
              onEdit={(expense) => setFormState({ expense })}
              onDelete={handleDelete}
            />

            <div className="charts">
              <MonthlyChart expenses={expenses} />
              <CategoryChart expenses={visibleExpenses} />
            </div>
          </>
        )}
      </main>
    </>
  )
}

export default DashboardPage
