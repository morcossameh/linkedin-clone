function LeftSidebar() {
  return (
    <aside className="flex flex-col gap-2">
      <div className="card overflow-hidden relative">
        <div className="h-banner bg-[url('https://images.unsplash.com/photo-1558293842-c0fd3db86157?q=80&w=1322&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),linear-gradient(135deg,#667eea,#764ba2)] bg-cover bg-center"></div>
        <div className="px-3 pb-4 text-center">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
            alt="Profile"
            className="w-profile-pic-lg h-profile-pic-lg rounded-full absolute top-profile-offset left-1/2 -translate-x-1/2 border-2 border-white"
          />
          <h2 className="pt-10 text-base font-bold mb-0.5">John Doe</h2>
          <p className="text-small-neutral mb-1">Software Engineer at Meta</p>
          <p className="text-small-neutral">California, United States</p>
          <div className="flex items-center justify-center gap-1 mt-2 text-small-neutral">
            <span className="fas fa-building"></span>
            <span>Meta</span>
          </div>
        </div>
        <div className="divider p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-small-neutral">Profile viewers</span>
            <span className="stat-number">51</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-small-neutral">Post impressions</span>
            <span className="stat-number">16</span>
          </div>
        </div>
        <div className="divider p-3">
          <p className="text-small-neutral mb-2">Access exclusive tools & insights</p>
          <div className="flex items-center gap-1 text-xs text-premium font-bold">
            <span className="fas fa-square text-premium"></span>
            <span>Retry Premium for EGP0</span>
          </div>
        </div>
        <div className="divider p-3">
          <a className="menu-item">
            <span className="fas fa-bookmark"></span>
            <span>Saved items</span>
          </a>
          <div className="menu-item">
            <span className="fas fa-users"></span>
            <span>Groups</span>
          </div>
          <div className="menu-item">
            <span className="fas fa-newspaper"></span>
            <span>Newsletters</span>
          </div>
          <div className="menu-item">
            <span className="fas fa-calendar"></span>
            <span>Events</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default LeftSidebar
