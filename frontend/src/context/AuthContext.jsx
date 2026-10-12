import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, getToken, setToken } from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // true while we check whether a saved token is still valid on first load
  const [loading, setLoading] = useState(Boolean(getToken()))

  // On page load: if a token exists, ask the backend who it belongs to.
  useEffect(() => {
    if (!getToken()) return
    api
      .me()
      .then((data) => setUser(data.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const data = await api.login(email, password)
    setToken(data.token)
    setUser(data.user)
  }

  async function register(name, email, password) {
    const data = await api.register(name, email, password)
    setToken(data.token)
    setUser(data.user)
  }

  // useCallback keeps the same function identity between renders, so components that
  // list `logout` in a useEffect dependency array don't re-run the effect needlessly.
  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook so components can write `const { user } = useAuth()`
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
