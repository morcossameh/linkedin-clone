function Footer() {
  return (
    <footer className="mt-6 p-6 bg-white divider">
      <div className="max-w-content mx-auto text-center">
        <div className="flex justify-center flex-wrap gap-4 mb-4">
          <a href="#" className="footer-link">About</a>
          <a href="#" className="footer-link">Accessibility</a>
          <a href="#" className="footer-link">Help Center</a>
          <a href="#" className="footer-link">
            Privacy & Terms <span className="fas fa-caret-down"></span>
          </a>
          <a href="#" className="footer-link">Ad Choices</a>
          <a href="#" className="footer-link">Advertising</a>
          <a href="#" className="footer-link">
            Business Services <span className="fas fa-caret-down"></span>
          </a>
          <a href="#" className="footer-link">Get the LinkedIn app</a>
          <a href="#" className="footer-link">More</a>
        </div>
        <div className="text-small-neutral">
          <span>
            <strong>LinkedIn</strong> LinkedIn Corporation © 2025
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
