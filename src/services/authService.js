import api from './api'

export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password })
  return response.data
}

export const refreshAccessToken = async (refreshToken) => {
  const response = await api.post('/api/auth/refresh-token', { refreshToken })
  return response.data
}

export const logout = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  sessionStorage.removeItem('sessionActive')
}

export const getStoredUser = () => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

export const getAccessToken = () => {
  return localStorage.getItem('accessToken')
}

export const isAuthenticated = () => {
  return !!getAccessToken()
}
