# Expense Tracker (React + Express + PostgreSQL)

A full-stack expense manager. Users register, log in, and manage their own income and expenses with search, filters, sorting, totals and charts.

## Architecture

```
Browser (React + Vite)  --HTTP/JSON-->  Express API  --SQL-->  PostgreSQL
  pages, state, UI                      auth, validation        users, expenses
```

- The **frontend** never talks to the database. It calls the API with `fetch`.
- The **backend** checks the JWT on every expense request and always filters by `user_id`, so users only see their own data.
- The **database** is the permanent store.

## Setup

You need Node 20+ and PostgreSQL installed.

### 1. Database
```bash
createdb expense_tracker
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env      # then edit DATABASE_URL and JWT_SECRET
npm run db:init           # creates the tables from schema.sql
npm run dev               # API on http://localhost:4000
```
If `npm run db:init` fails because `$DATABASE_URL` is not set in your shell, run `psql "<your connection string>" -f schema.sql` directly.

Check it works: open http://localhost:4000/api/health. You should see `{"status":"ok"}`.

### 3. Frontend (in a second terminal)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev               # http://localhost:5173
```

Register an account, then add a few transactions.

## Folder guide

### backend/
| File | What it does |
|---|---|
| `schema.sql` | Defines the `users` and `expenses` tables. `expenses.user_id` links each row to its owner. |
| `src/server.js` | Creates the Express app, adds CORS and JSON parsing, mounts the routes, and has the central error handler. |
| `src/db.js` | A PostgreSQL connection pool shared by all routes. |
| `src/middleware/auth.js` | Reads the `Authorization: Bearer <token>` header, verifies the JWT, and sets `req.userId`. |
| `src/routes/auth.js` | `register`, `login`, `me`. Passwords are hashed with bcrypt, and the token is a JWT valid for 7 days. |
| `src/routes/expenses.js` | CRUD for expenses. Validates input, uses parameterized queries (`$1`, `$2`) against SQL injection, and scopes every query by `user_id`. |

### frontend/src/
| File | What it does |
|---|---|
| `main.jsx` | Entry point. Wraps the app in `BrowserRouter` and `AuthProvider`. |
| `App.jsx` | Defines the routes. `/` is wrapped in `ProtectedRoute`. |
| `api/client.js` | One `request()` helper that adds headers and the token, and throws readable errors. All API calls live here. |
| `context/AuthContext.jsx` | Holds `user`, `login`, `register`, `logout`. Restores the session on page load using the saved token. |
| `components/ProtectedRoute.jsx` | Redirects logged-out users to `/login`. |
| `pages/DashboardPage.jsx` | The main "smart" component. Owns the expenses and filter state, fetches data, and computes the filtered, sorted list and totals. |
| `components/ExpenseForm.jsx` | Controlled form used for both add and edit, with validation. |
| `components/Filters.jsx` | Search, type, category, month and sort controls. |
| `components/ExpenseList.jsx` / `ExpenseItem.jsx` | Render the list, including both empty states. |
| `components/SummaryCards.jsx` | Income, expenses and balance. |
| `components/MonthlyChart.jsx` / `CategoryChart.jsx` | Charts built with plain CSS, no chart library. |
| `utils/` | Formatting helpers and the category list. |

## Key concepts to study (and be ready to explain)

1. **State and re-rendering.** `DashboardPage` keeps `expenses`, `filters` and `formState` in `useState`. Calling a setter makes React re-run the component and update the screen.
2. **Derived data.** `visibleExpenses` and `totals` are computed from state with `useMemo`. They are not stored separately, so they can never go out of sync.
3. **Immutable updates.** `setExpenses(prev => prev.map(...))` and `[expense, ...prev]` create new arrays instead of changing the old one. React detects changes by comparing references.
4. **`useEffect`.** Loads the expenses once after the first render, and restores the login session in `AuthContext`.
5. **Controlled inputs.** Each input's `value` comes from state and `onChange` updates it.
6. **Lifting state up.** `Filters` and `ExpenseForm` hold no shared data. The parent passes values and callbacks as props.
7. **Context.** `AuthContext` avoids passing `user` through every component.
8. **JWT auth flow.** Login returns a token, the frontend stores it, `client.js` sends it on every request, and the middleware verifies it.
9. **Authorization.** `WHERE id = $1 AND user_id = $2` is what stops one user touching another user's rows.
10. **Why `key` on `ExpenseForm`.** It forces a fresh form state when you switch between "add" and "edit this item".

## Known limitations and ideas to extend

- The JWT is in `localStorage`. This is simple and common for learning projects. An httpOnly cookie is safer against XSS, and a good upgrade to discuss.
- No pagination. Fine for personal use, but a large dataset would need it on the API.
- No automated tests yet. Good next steps are API tests with Supertest and component tests with Vitest.
- Deployment idea: frontend on Vercel or Netlify, backend on Render or Railway, database on Neon or Supabase. Set `VITE_API_URL`, `CLIENT_ORIGIN`, `DATABASE_URL` and `JWT_SECRET` in each service's settings.

## Interview questions to practice

- Why a pool of DB connections instead of one per request?
- What happens between clicking "Add" and the new row appearing?
- Why hash passwords, and why can't bcrypt be "decrypted"?
- Why must the server check `user_id` even though the frontend only shows your data?
- Why is `balance` computed instead of stored?
