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

Project Structure
expense-tracker/
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── db.js
│   │   └── server.js
│   ├── schema.sql
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
