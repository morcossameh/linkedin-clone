export interface ApiError {
  error: string
  message?: string
  statusCode?: number
}

export interface AxiosConfigWithRetry {
  _retry?: boolean
}
