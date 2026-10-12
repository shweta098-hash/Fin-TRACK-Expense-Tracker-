import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Wraps a page. Logged-out visitors are redirected to /login.
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <p className="center-message">Loading...</p>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default ProtectedRoute
