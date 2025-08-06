import { Link } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

export default function LandingHeader() {
  return (
    <header className="w-full spacing-container py-3 sm:py-4 bg-transparent flex justify-between items-center z-20">
      <div className="flex items-center gap-2 sm:gap-3">
        <img 
          src="/lovable-uploads/1e812cad-f8c5-4fa8-a00d-8e4affed926c.png" 
          alt="Cashsnap Finance Logo" 
          className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10"
        />
        <h1 className="text-h6 sm:text-h4 text-primary-foreground">Cashsnap Finance</h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <nav className="hidden sm:flex space-x-3 lg:space-x-4 text-sm">
          <Link to="/dashboard" className="text-primary-foreground hover:underline touch-target">Dashboard</Link>
          <a href="#features" className="text-primary-foreground hover:underline touch-target">Features</a>
          <Link to="/auth" className="text-primary-foreground hover:underline touch-target">Sign In</Link>
        </nav>
        <nav className="sm:hidden flex space-x-1 text-xs">
          <Link to="/dashboard" className="text-primary-foreground hover:underline touch-target">Dashboard</Link>
          <Link to="/auth" className="text-primary-foreground hover:underline touch-target">Sign In</Link>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}