import { Link } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

export default function LandingHeader() {
  return (
    <header className="w-full px-3 sm:px-6 py-4 bg-transparent flex justify-between items-center z-20">
      <div className="flex items-center gap-3">
        <img 
          src="/lovable-uploads/1e812cad-f8c5-4fa8-a00d-8e4affed926c.png" 
          alt="Cashsnap Finance Logo" 
          className="w-8 h-8 sm:w-10 sm:h-10"
        />
        <h1 className="text-h4 text-primary-foreground">Cashsnap Finance</h1>
      </div>
      <div className="flex items-center gap-4">
        <nav className="hidden sm:flex space-x-4 text-sm">
          <Link to="/dashboard" className="text-primary-foreground hover:underline">Dashboard</Link>
          <a href="#features" className="text-primary-foreground hover:underline">Features</a>
          <Link to="/auth" className="text-primary-foreground hover:underline">Sign In</Link>
        </nav>
        <nav className="sm:hidden flex space-x-2 text-sm">
          <Link to="/dashboard" className="text-primary-foreground hover:underline">Dashboard</Link>
          <Link to="/auth" className="text-primary-foreground hover:underline">Sign In</Link>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}