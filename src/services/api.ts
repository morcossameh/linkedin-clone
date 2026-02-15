import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import type { AxiosConfigWithRetry, RefreshTokenResponse } from '../types'

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
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

function clearAndRedirectToLogin(): Promise<never> {
  localStorage.clear()
  sessionStorage.clear()
  window.location.href = '/login'
  return Promise.reject(new Error('Session expired. Please login again.'))
}

// Response interceptor: Handle errors and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Successfully received response
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & AxiosConfigWithRetry

    // Handle 403 Forbidden - clear storage and redirect to login
    if (error.response?.status === 403) {
      return clearAndRedirectToLogin()
    }

    // If error is not 401 or request is already retried, format and throw error
    if (error.response?.status !== 401 || originalRequest._retry) {
      // Format error message
      const errorMessage =
        (error.response?.data as { error?: string })?.error ||
        error.message ||
        'An error occurred'
      return Promise.reject(new Error(errorMessage))
    }

    // Mark that we've tried to refresh (prevents infinite loop)
    originalRequest._retry = true

    const refreshToken = localStorage.getItem('refreshToken')

    if (!refreshToken) {
      return clearAndRedirectToLogin()
    }

    try {
      const response = await axios.post<RefreshTokenResponse>(
        `${API_URL}/api/auth/refresh-token`,
        { refreshToken }
      )

      const { accessToken, refreshToken: newRefreshToken } = response.data

      // Update tokens in localStorage
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', newRefreshToken)

      // Update the failed request's authorization header
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
      }

      // Retry the original request with new token
      return api(originalRequest)
    } catch {
      return clearAndRedirectToLogin()
    }
  }
)

export default api
