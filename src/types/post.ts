import { User } from './user'

export type ReactionType = 'thumbs-up' | 'heart' | 'lightbulb' | 'celebrate' | 'support' | 'insightful'

export interface Reaction {
  type: ReactionType
  count: number
}

export interface Person {
  name: string
  profilePicture: string
  title: string
}

export interface Post {
  id: string | number
  content: string
  reactions?: Reaction[]
  commentsCount?: number
  repostsCount?: number
  createdAt?: string

  // API response format
  user?: User

  // Static data format (legacy)
  person?: Person
  date?: string
  time?: string
  comments?: {
    numberOfComments: number
  }
  reposts?: number
}

export interface PostsResponse {
  posts: Post[]
  total?: number
  page?: number
  limit?: number
}

export interface CreatePostPayload {
  content: string
  reactions?: Reaction[]
  commentsCount?: number
  repostsCount?: number
}
