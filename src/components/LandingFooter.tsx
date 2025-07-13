export default function LandingFooter() {
  return (
    <footer className="text-center text-xs text-white/70 py-6 mt-auto">
      <div className="space-y-1">
        <p>© {new Date().getFullYear()} Cashsnap Finance. All rights reserved.</p>
        <p className="text-white/50">Version 1.2.0</p>
      </div>
    </footer>
  );
}