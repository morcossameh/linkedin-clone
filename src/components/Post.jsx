import { getDateString } from "../utils/dateUtils";

function Post({ post }) {
  const totalReactions = post.reactions?.reduce(
    (acc, curr) => acc + curr.count,
    0
  ) || 0;

  const commentsCount = post.commentsCount || 0;
  const repostsCount = post.repostsCount || 0;

  const hasStats =
    commentsCount > 0 ||
    repostsCount > 0 ||
    (post.reactions && post.reactions.length > 0);

  let commentsRepostsStr = "";
  if (commentsCount > 0) {
    commentsRepostsStr += `${commentsCount} comments`;
  }
  if (commentsCount > 0 && repostsCount > 0) {
    commentsRepostsStr += " • ";
  }
  if (repostsCount > 0) {
    commentsRepostsStr += `${repostsCount} reposts`;
  }

  const userName = post.user
    ? `${post.user.firstName} ${post.user.lastName}`
    : post.person?.name || "Unknown User";

  const userTitle = post.user?.headline || post.person?.title || "";
  const profilePicture = post.user?.profilePicture || post.person?.profilePicture || "https://via.placeholder.com/48";

  const postDate = post.createdAt ? new Date(post.createdAt).toISOString().split("T")[0] : post.date;
  const postTime = post.createdAt ? new Date(post.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }) : post.time;

  return (
    <article className="card mb-2">
      <div className="flex items-start gap-2 p-3 px-4">
        <img
          src={profilePicture}
          alt={userName}
          className="profile-pic-small"
        />
        <div className="grow">
          <h3 className="text-sm font-bold mb-0.5">{userName}</h3>
          {userTitle && <p className="text-small-neutral mb-0.5">{userTitle}</p>}
          <p className="text-small-neutral">{getDateString(postDate, postTime)}</p>
        </div>
        <div className="flex gap-2 text-text-neutral cursor-pointer">
          <span className="fas fa-ellipsis-h"></span>
          <span className="fas fa-times"></span>
        </div>
      </div>

      <div
        className="px-4 pb-3 text-sm leading-relaxed [&_ul]:my-2 [&_ul]:pl-5 [&_ul]:list-disc [&_li]:mb-1 [&_p]:mb-1"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <div className="divider py-2 px-4">
        {hasStats && (
          <div className="flex justify-between items-center mb-2 text-small-neutral">
            <div className="flex items-center gap-1">
              {post.reactions && post.reactions.map((reaction, index) => (
                <span key={index} className={`fas fa-${reaction.type}`}></span>
              ))}
              {totalReactions > 0 && <span>{totalReactions}</span>}
            </div>
            <div>{commentsRepostsStr}</div>
          </div>
        )}

        <div className={`flex justify-around ${hasStats ? 'divider pt-2' : ''}`}>
          <button className="action-btn">
            <span className="fas fa-thumbs-up"></span>
            <span>Like</span>
          </button>
          <button className="action-btn">
            <span className="fas fa-comment"></span>
            <span>Comment</span>
          </button>
          <button className="action-btn">
            <span className="fas fa-share"></span>
            <span>Repost</span>
          </button>
          <button className="action-btn">
            <span className="fas fa-paper-plane"></span>
            <span>Send</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default Post;
