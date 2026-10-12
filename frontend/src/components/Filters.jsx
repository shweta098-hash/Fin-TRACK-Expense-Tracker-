import { CATEGORIES } from '../utils/constants.js'

// A "controlled" filter bar: it owns no state. The parent passes the current
// filters and an onChange callback, so the parent can compute the filtered list.
function Filters({ filters, onChange }) {
  function update(field, value) {
    onChange({ ...filters, [field]: value }) // copy the object, change one field
  }

  return (
    <section className="filters">
      <input
        type="search"
        placeholder="Search by title..."
        value={filters.search}
        onChange={(e) => update('search', e.target.value)}
      />
      <select value={filters.type} onChange={(e) => update('type', e.target.value)}>
        <option value="all">All types</option>
        <option value="expense">Expenses</option>
        <option value="income">Income</option>
      </select>
      <select value={filters.category} onChange={(e) => update('category', e.target.value)}>
        <option value="all">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <input type="month" value={filters.month} onChange={(e) => update('month', e.target.value)} />
      <select value={filters.sort} onChange={(e) => update('sort', e.target.value)}>
        <option value="date-desc">Newest first</option>
        <option value="date-asc">Oldest first</option>
        <option value="amount-desc">Amount: high to low</option>
        <option value="amount-asc">Amount: low to high</option>
      </select>
    </section>
  )
}

export default Filters
