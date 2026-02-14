import { useState } from "react";
import { currentUser } from "../../data/posts";

function PostCreation({ onCreatePost }) {
  const [postContent, setPostContent] = useState("");

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const content = postContent.trim();
      if (content === "") return;

      const newPost = {
        id: Date.now(),
        person: currentUser,
        content: content,
        reactions: [],
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        comments: {
          numberOfComments: 0,
        },
        reposts: 0,
      };

      onCreatePost(newPost);
      setPostContent("");
    }
  };

  return (
    <div className="card p-3 px-4">
      <div className="flex items-center gap-2 mb-3">
        <img
          src={currentUser.profilePicture}
          alt="Profile"
          className="w-profile-pic-md h-profile-pic-md rounded-full"
        />
        <input
          type="text"
          placeholder="Start a post"
          className="grow py-3 px-4 border border-border-color rounded-full text-sm outline-none transition-colors focus:border-primary"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          onKeyDown={handleKeyPress}
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
  );
}

export default PostCreation;
