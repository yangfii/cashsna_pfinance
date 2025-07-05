import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  FolderOpen, 
  BarChart3, 
  Settings,
  Menu,
  X,
  LogOut,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "ការសង្ខេបហិរញ្ញវត្ថុ", key: "dashboard" },
  { to: "/transactions", icon: ArrowLeftRight, label: "ប្រតិបត្តិការ", key: "transactions" },
  { to: "/categories", icon: FolderOpen, label: "ប្រភេទចំណូល/ចំណាយ", key: "categories" },
  { to: "/reports", icon: BarChart3, label: "របាយការណ៍ហិរញ្ញវត្ថុ", key: "reports" },
  { to: "/settings", icon: Settings, label: "ការកំណត់", key: "settings" }
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();

  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
      navigate('/auth');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Mobile Header */}
      <header className="lg:hidden bg-card/80 backdrop-blur-md border-b border-border/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="p-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gradient">Cashsnap Finances Tracking</h1>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-card/60 backdrop-blur-md border-r border-border/50 h-screen sticky top-0">
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            <h1 className="text-xl font-bold text-gradient">Cashsnap Finances Tracking</h1>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={handleSignOut} title="Sign Out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.key}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-xl transition-smooth font-medium",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-foreground/80 hover:bg-accent hover:text-accent-foreground"
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <aside className="w-80 bg-card h-full border-r border-border/50 animate-slide-in-right">
              <div className="flex items-center justify-between p-6 border-b border-border/50">
                <h1 className="text-xl font-bold text-gradient">Cashsnap Finances Tracking</h1>
                <Button variant="ghost" size="sm" onClick={closeSidebar} className="p-2">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <nav className="px-4 py-6 space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.key}
                    to={item.to}
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center space-x-3 px-4 py-3 rounded-xl transition-smooth font-medium",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-soft"
                          : "text-foreground/80 hover:bg-accent hover:text-accent-foreground"
                      )
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
              
              <div className="px-4 py-4 border-t border-border/50 mt-auto">
                <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-accent/50">
                  <User className="h-4 w-4 text-accent-foreground" />
                  <span className="text-sm text-accent-foreground truncate">
                    {user?.email}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full justify-start mt-2 text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="container mx-auto px-4 py-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}