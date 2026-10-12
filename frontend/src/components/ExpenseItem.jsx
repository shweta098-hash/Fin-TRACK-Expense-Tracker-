import { formatCurrency, formatDate } from '../utils/format.js'

// Props: expense (object), onEdit and onDelete (callbacks from the parent)
function ExpenseItem({ expense, onEdit, onDelete }) {
  const isIncome = expense.type === 'income'

  return (
    <li className="expense-item">
      <div>
        <p className="expense-title">{expense.title}</p>
        <p className="expense-meta">
          {expense.category} · {formatDate(expense.date)}
        </p>
      </div>
      <div className="expense-right">
        <p className={isIncome ? 'positive' : 'negative'}>
          {isIncome ? '+' : '-'}
          {formatCurrency(expense.amount)}
        </p>
        <div className="expense-actions">
          <button className="btn-link" onClick={() => onEdit(expense)}>
            Edit
          </button>
          <button className="btn-link danger" onClick={() => onDelete(expense)}>
            Delete
          </button>
        </div>
      </div>
    </li>
  )
}

export default ExpenseItem
