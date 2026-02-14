function Header() {

  return (
    <header className="bg-white border-b border-border-color fixed top-0 w-full z-50 px-4 h-header shadow-header">
      <div className="max-w-content mx-auto flex items-center h-full">
        <span className="fab fa-linkedin text-primary text-4xl mr-2"></span>
        <div className="relative flex items-center gap-4 bg-search-bg rounded-md px-3 grow h-search transition-colors focus-within:bg-white focus-within:outline focus-within:outline-1 focus-within:outline-primary">
          <span className="fas fa-search text-text-neutral"></span>
          <input
            type="text"
            placeholder="Search"
            className="border-none bg-transparent outline-none w-full text-base placeholder:text-text-neutral"
          />
        </div>

        <nav className="ml-4 flex items-center max-content:hidden">
          <a href="#" className="nav-item-active">
            <span className="fas fa-home"></span>
            <span>Home</span>
          </a>
          <a href="#" className="nav-item">
            <span className="fas fa-user-friends"></span>
            <span>My Network</span>
          </a>
          <a href="#" className="nav-item">
            <span className="fas fa-briefcase"></span>
            <span>Jobs</span>
          </a>
          <a href="#" className="nav-item">
            <span className="fas fa-comment-dots"></span>
            <span>Messaging</span>
          </a>
          <a href="#" className="nav-item">
            <span className="fas fa-bell"></span>
            <span>Notifications</span>
            <span className="absolute top-0.5 right-7 bg-notification text-white text-[10px] font-bold w-4 h-4 rounded-full grid place-content-center">1</span>
          </a>
          <a href="#" className="nav-item">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
              alt="Profile"
              className="profile-pic-small"
            />
            <span>
              Me <span className="fas fa-caret-down"></span>
            </span>
          </a>
          <div className="w-px h-6 bg-border-color mx-2"></div>
          <a href="#" className="nav-item">
            <span className="fas fa-th"></span>
            <span>
              For Business <span className="fas fa-caret-down"></span>
            </span>
          </a>
        </nav>
      </div>
    </header>
  );
}

export default Header;
