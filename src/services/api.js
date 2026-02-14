import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: Add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

function clearAndRedirectToLogin() {
  localStorage.clear()
  sessionStorage.clear()
  window.location.href = '/login'
  return Promise.reject(new Error('Session expired. Please login again.'))
}

// Response interceptor: Handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    // Successfully received response
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 403 Forbidden - clear storage and redirect to login
    if (error.response?.status === 403) {
      return clearAndRedirectToLogin()
    }

    // If error is not 401 or request is already retried, format and throw error
    if (error.response?.status !== 401 || originalRequest._retry) {
      // Format error message
      const errorMessage = error.response?.data?.error || error.message || 'An error occurred'
      return Promise.reject(new Error(errorMessage))
    }

    // Mark that we've tried to refresh (prevents infinite loop)
    originalRequest._retry = true

    const refreshToken = localStorage.getItem('refreshToken')

    if (!refreshToken) {
      return clearAndRedirectToLogin()
    }

    try {
      const response = await axios.post(`${API_URL}/api/auth/refresh-token`, {
        refreshToken
      })

      const { accessToken, refreshToken: newRefreshToken } = response.data

      // Update tokens in localStorage
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', newRefreshToken)

      // Update the failed request's authorization header
      originalRequest.headers.Authorization = `Bearer ${accessToken}`

      // Retry the original request with new token
      return api(originalRequest)
    } catch (refreshError) {
      return clearAndRedirectToLogin()
    }
  }
)

export default api
