import api from './api'
import type { LoginResponse, RefreshTokenResponse, User } from '../types'

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/api/auth/login', { email, password })
  return response.data
}

export const refreshAccessToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
  const response = await api.post<RefreshTokenResponse>('/api/auth/refresh-token', { refreshToken })
  return response.data
}

export const logout = (): void => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  sessionStorage.removeItem('sessionActive')
}

export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) as User : null
}

export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken')
}

export const isAuthenticated = (): boolean => {
  return !!getAccessToken()
}
