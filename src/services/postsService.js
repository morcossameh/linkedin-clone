import api from './api'

export const fetchPosts = async () => {
  const response = await api.get('/api/posts')
  return response.data
}

export const createPost = async (content, reactions = [], commentsCount = 0, repostsCount = 0) => {
  const response = await api.post('/api/posts', {
    content,
    reactions,
    commentsCount,
    repostsCount,
  })
  return response.data
}

export const getPostById = async (id) => {
  const response = await api.get(`/api/posts/${id}`)
  return response.data
}

export const updatePost = async (id, updates) => {
  const response = await api.put(`/api/posts/${id}`, updates)
  return response.data
}

export const deletePost = async (id) => {
  await api.delete(`/api/posts/${id}`)
  return true
}
