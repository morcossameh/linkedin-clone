import { useState } from "react";
import { initialPosts } from "../../data/posts";
import Post from "../Post/Post";
import PostCreation from "../PostCreation/PostCreation";

function CenterContent() {
  const [posts, setPosts] = useState(initialPosts);

  const handleCreatePost = (newPost) => {
    setPosts([newPost, ...posts]);
  };

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
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </section>
    </section>
  );
}

export default CenterContent;
