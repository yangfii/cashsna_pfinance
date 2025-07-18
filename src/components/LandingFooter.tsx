import { Link } from 'react-router-dom';

export default function LandingFooter() {
  return (
    <footer className="text-center text-xs text-white/70 py-6 mt-auto">
      <div className="space-y-2">
        <div className="flex justify-center space-x-4">
          <Link to="/privacy-policy" className="text-white/70 hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms-of-service" className="text-white/70 hover:text-white transition-colors">
            Terms of Service
          </Link>
        </div>
        <p>© {new Date().getFullYear()} Cashsnap Finance. All rights reserved.</p>
        <p className="text-white/50">Version 1.2.0</p>
      </div>
    </footer>
  );
}