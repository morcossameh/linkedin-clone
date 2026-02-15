import { useState } from "react"
import { createPost } from "../services/postsService"
import { getStoredUser } from "../services/authService"
import type { Post } from '../types'

interface PostCreationProps {
  onCreatePost: (post: Post) => void
}

function PostCreation({ onCreatePost }: PostCreationProps) {
  const [postContent, setPostContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentUser = getStoredUser()

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()

      const content = postContent.trim()
      if (content === "" || isSubmitting) return

      setIsSubmitting(true)
      setError(null)

      try {
        const newPost = await createPost(`<p>${content}</p>`, [], 0, 0)
        onCreatePost(newPost)
        setPostContent("")
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create post')
        console.error('Error creating post:', err)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="card p-3 px-4">
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      <div className="flex items-center gap-2 mb-3">
        <img
          src={currentUser?.profilePicture || "https://via.placeholder.com/48"}
          alt="Profile"
          className="w-profile-pic-md h-profile-pic-md rounded-full"
        />
        <input
          type="text"
          placeholder={isSubmitting ? "Posting..." : "Start a post (press Enter to post)"}
          className="grow py-3 px-4 border border-border-color rounded-full text-sm outline-none transition-colors focus:border-primary disabled:opacity-50"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isSubmitting}
        />
      </div>
      <div className="flex justify-around divider pt-2">
        <button className="action-btn">
          <span className="fas fa-video text-base"></span>
          <span>Video</span>
        </button>
        <button className="action-btn">
          <span className="fas fa-image text-base"></span>
          <span>Photo</span>
        </button>
        <button className="action-btn">
          <span className="fas fa-newspaper text-base"></span>
          <span>Write article</span>
        </button>
      </div>
    </div>
  )
}

export default PostCreation
