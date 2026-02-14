import { useState, useEffect } from "react";
import Post from "./Post";
import PostCreation from "./PostCreation";
import { fetchPosts } from "../services/postsService";

function CenterContent() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchPosts();
      setPosts(response.posts || []);
    } catch (err) {
      setError(err.message || 'Failed to load posts');
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  if (loading) {
    return (
      <section className="flex flex-col gap-2">
        <PostCreation onCreatePost={handleCreatePost} />
        <div className="card p-8 text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-text-neutral">Loading posts...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex flex-col gap-2">
        <PostCreation onCreatePost={handleCreatePost} />
        <div className="card p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadPosts}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-2">
      <PostCreation onCreatePost={handleCreatePost} />

      <div className="flex items-center gap-2 text-xs text-text-neutral">
        <span>Sort by:</span>
        <select className="border-none bg-transparent pt-0.5 text-xs text-black font-bold cursor-pointer">
          <option>Top</option>
          <option>Recent</option>
        </select>
      </div>

      <section>
        {posts.length === 0 ? (
          <div className="card p-8 text-center text-text-neutral">
            No posts yet. Be the first to share something!
          </div>
        ) : (
          posts.map((post) => (
            <Post key={post.id} post={post} />
          ))
        )}
      </section>
    </section>
  );
}

export default CenterContent;
