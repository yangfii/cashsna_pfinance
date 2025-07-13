import { Link } from 'react-router-dom';

export default function LandingHeader() {
  return (
    <header className="w-full px-6 py-4 bg-transparent flex justify-between items-center z-20">
      <h1 className="text-2xl font-bold text-white">Cashsnap</h1>
      <nav className="space-x-4 text-sm">
        <Link to="/dashboard" className="text-white hover:underline">Dashboard</Link>
        <a href="#features" className="text-white hover:underline">Features</a>
        <Link to="/auth" className="text-white hover:underline">Sign In</Link>
      </nav>
    </header>
  );
}