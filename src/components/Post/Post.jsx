import { getDateString } from "../../utils/dateUtils";

function Post({ post }) {
  const totalReactions = post.reactions.reduce(
    (acc, curr) => acc + curr.count,
    0
  );

  const hasStats =
    post.comments.numberOfComments > 0 ||
    post.reposts > 0 ||
    post.reactions.length > 0;

  let commentsRepostsStr = "";
  if (post.comments.numberOfComments > 0) {
    commentsRepostsStr += `${post.comments.numberOfComments} comments`;
  }
  if (post.comments.numberOfComments > 0 && post.reposts > 0) {
    commentsRepostsStr += " • ";
  }
  if (post.reposts > 0) {
    commentsRepostsStr += `${post.reposts} reposts`;
  }

  return (
    <article className="card mb-2">
      <div className="flex items-start gap-2 p-3 px-4">
        <img
          src={post.person.profilePicture}
          alt={post.person.name}
          className="profile-pic-small"
        />
        <div className="grow">
          <h3 className="text-sm font-bold mb-0.5">{post.person.name}</h3>
          <p className="text-small-neutral mb-0.5">{post.person.title}</p>
          <p className="text-small-neutral">{getDateString(post.date, post.time)}</p>
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
              {post.reactions.map((reaction, index) => (
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
