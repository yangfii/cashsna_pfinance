import { Link } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

export default function LandingHeader() {
  return (
    <header className="w-full px-3 sm:px-6 py-4 bg-transparent flex justify-between items-center z-20">
      <h1 className="text-xl sm:text-2xl font-bold text-white">Cashsnap Finance</h1>
      <div className="flex items-center gap-4">
        <nav className="hidden sm:flex space-x-4 text-sm">
          <Link to="/dashboard" className="text-white hover:underline">Dashboard</Link>
          <a href="#features" className="text-white hover:underline">Features</a>
          <Link to="/auth" className="text-white hover:underline">Sign In</Link>
        </nav>
        <nav className="sm:hidden flex space-x-2 text-sm">
          <Link to="/dashboard" className="text-white hover:underline">Dashboard</Link>
          <Link to="/auth" className="text-white hover:underline">Sign In</Link>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}