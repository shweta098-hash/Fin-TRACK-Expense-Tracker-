import ExpenseItem from './ExpenseItem.jsx'

function ExpenseList({ expenses, totalCount, onEdit, onDelete }) {
  // Empty state 1: the user has no transactions at all.
  if (totalCount === 0) {
    return (
      <div className="empty">
        <p>No transactions yet.</p>
        <p>Click "Add transaction" to record your first one.</p>
      </div>
    )
  }

  // Empty state 2: transactions exist, but filters hide all of them.
  if (expenses.length === 0) {
    return (
      <div className="empty">
        <p>No transactions match your filters.</p>
      </div>
    )
  }

  return (
    <ul className="expense-list">
      {expenses.map((expense) => (
        // key lets React track which item is which when the list changes
        <ExpenseItem key={expense.id} expense={expense} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </ul>
  )
}

export default ExpenseList
