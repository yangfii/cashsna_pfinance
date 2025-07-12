import { useEffect } from "react";
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
  LogOut,
  User,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "ការសង្ខេបហិរញ្ញវត្ថុ", key: "dashboard" },
  { to: "/transactions", icon: ArrowLeftRight, label: "ប្រតិបត្តិការ", key: "transactions" },
  { to: "/categories", icon: FolderOpen, label: "ប្រភេទចំណូល/ចំណាយ", key: "categories" },
  { to: "/planning", icon: Target, label: "ការរៀបចំគំរោង", key: "planning" },
  { to: "/reports", icon: BarChart3, label: "របាយការណ៍ហិរញ្ញវត្ថុ", key: "reports" },
  { to: "/settings", icon: Settings, label: "ការកំណត់", key: "settings" }
];

function AppSidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
      navigate('/auth');
    }
  };

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LayoutDashboard className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-foreground">
              Cashsnap
            </span>
            <span className="truncate text-xs text-muted-foreground">
              Finance Tracker
            </span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.to}
                    tooltip={item.label}
                  >
                    <NavLink to={item.to}>
                      <item.icon />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-1">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted">
                <User className="size-4" />
              </div>
              {state === "expanded" && (
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-foreground">
                    {user?.email?.split('@')[0]}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              )}
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} tooltip="Sign Out">
              <LogOut />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function Layout() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-primary/5">
        <AppSidebar />
        
        {/* Header */}
        <div className="flex-1 flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-card/50 backdrop-blur-md px-4 lg:px-6">
            <SidebarTrigger />
            <div className="flex-1" />
            <ThemeToggle />
          </header>
          
          {/* Main Content */}
          <main className="flex-1">
            <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8 max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}