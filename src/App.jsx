import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Feed from './pages/Feed'
import ProtectedRoute from './components/ProtectedRoute'
import { isAuthenticated } from './services/authService'

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated() ? <Navigate to="/feed" replace /> : <Login />
          }
        />
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            isAuthenticated() ? <Navigate to="/feed" replace /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </Router>
  )
}

export default App
