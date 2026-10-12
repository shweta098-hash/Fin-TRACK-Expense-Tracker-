import pg from 'pg'

// A "pool" keeps several database connections open and reuses them,
// which is much faster than opening a new connection for every request.
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

export default pool
