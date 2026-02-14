function RightSidebar() {
  const suggestions = [
    {
      name: "Irina Stanescu",
      badge: true,
      description:
        "Engineering Leader • High Performance Coach in Tech • Ex-...",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Mohamed Hammad",
      badge: false,
      description: "Chief Software Architect at Softec International",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "GitHub",
      badge: false,
      description: "Company • Software Development",
      image:
        "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    },
  ];

  return (
    <aside className="flex flex-col gap-4">
      {/* Today's Puzzle */}
      <div className="card p-3">
        <h3 className="text-base font-bold mb-3">Today's puzzle</h3>
        <div className="flex items-center gap-3 p-2 rounded cursor-pointer transition-colors hover:bg-neutral-bg">
          <div className="w-puzzle-icon h-puzzle-icon bg-gradient-to-br from-gradient-start to-gradient-end rounded flex items-center justify-center text-white text-lg">
            <span className="fas fa-puzzle-piece"></span>
          </div>
          <div>
            <h4 className="text-sm font-bold mb-0.5">Zip - a quick brain teaser</h4>
            <p className="text-small-neutral">Solve in 60s or less!</p>
            <p className="text-small-neutral">27 connections played</p>
          </div>
          <span className="fas fa-chevron-right"></span>
        </div>
      </div>

      {/* Add to your feed */}
      <div className="card p-3">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-bold">Add to your feed</h3>
          <span className="fas fa-info-circle"></span>
        </div>

        {suggestions.map((suggestion, index) => (
          <div key={index} className="flex gap-2 py-2 border-b border-border-color">
            <img
              src={suggestion.image}
              alt={suggestion.name}
              className="profile-pic-small"
            />
            <div>
              <h4 className="text-sm font-semibold mb-0.5">
                {suggestion.name}
              </h4>
              <p className="text-small-neutral mb-2">{suggestion.description}</p>
              <button className="btn-follow">
                <span className="fas fa-plus"></span>
                Follow
              </button>
            </div>
          </div>
        ))}

        <a href="#" className="block text-center text-text-neutral no-underline text-sm mt-3 p-2 rounded transition-colors hover:bg-neutral-bg">
          View all recommendations →
        </a>
      </div>

      {/* Ad Section */}
      <div className="card p-3 text-center">
        <div className="flex justify-between items-center mb-2 text-small-neutral">
          <span>Ad</span>
          <span className="fas fa-ellipsis-h"></span>
        </div>
        <p className="text-xs">Target those who matter most to your business on LinkedIn Ads</p>
        <div className="my-3">
          <img
            src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=300&fit=crop"
            alt="LinkedIn Ad"
            className="w-full rounded"
          />
        </div>
        <p className="text-sm font-semibold text-black">
          Reach your ideal companies and key decision makers
        </p>
        <button className="btn-primary mt-3">Start now</button>
      </div>
    </aside>
  );
}

export default RightSidebar;
