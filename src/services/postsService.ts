import api from './api'
import type { Post, PostsResponse, CreatePostPayload, Reaction } from '../types'

export const fetchPosts = async (): Promise<PostsResponse> => {
  const response = await api.get<PostsResponse>('/api/posts')
  return response.data
}

export const createPost = async (
  content: string,
  reactions: Reaction[] = [],
  commentsCount: number = 0,
  repostsCount: number = 0
): Promise<Post> => {
  const payload: CreatePostPayload = {
    content,
    reactions,
    commentsCount,
    repostsCount,
  }
  const response = await api.post<Post>('/api/posts', payload)
  return response.data
}

export const getPostById = async (id: string | number): Promise<Post> => {
  const response = await api.get<Post>(`/api/posts/${id}`)
  return response.data
}

export const updatePost = async (
  id: string | number,
  updates: Partial<Post>
): Promise<Post> => {
  const response = await api.put<Post>(`/api/posts/${id}`, updates)
  return response.data
}

export const deletePost = async (id: string | number): Promise<boolean> => {
  await api.delete(`/api/posts/${id}`)
  return true
}
