import { useEffect, useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  FolderOpen, 
  BarChart3, 
  Settings,
  LogOut,
  User,
  Target,
  Brain,
  X,
  Coins
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AIAssistant from "@/components/AIAssistant";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "ការសង្ខេបហិរញ្ញវត្ថុ", key: "dashboard" },
  { to: "/dashboard/transactions", icon: ArrowLeftRight, label: "ប្រតិបត្តិការ", key: "transactions" },
  { to: "/dashboard/categories", icon: FolderOpen, label: "ប្រភេទចំណូល/ចំណាយ", key: "categories" },
  { to: "/dashboard/portfolio", icon: Coins, label: "Crypto Portfolio", key: "portfolio" },
  { to: "/dashboard/planning", icon: Target, label: "ការរៀបចំគំរោង", key: "planning" },
  { to: "/dashboard/reports", icon: BarChart3, label: "របាយការណ៍ហិរញ្ញវត្ថុ", key: "reports" },
  { to: "/dashboard/settings", icon: Settings, label: "ការកំណត់", key: "settings" }
];

function AppSidebar() {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();

  const handleSignOut = async () => {
    try {
      console.log('Starting sign out process...');
      const { error } = await signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast.error(`Error signing out: ${error.message || 'Unknown error'}`);
      } else {
        console.log('Sign out successful');
        toast.success('Signed out successfully');
        navigate('/auth');
      }
    } catch (err) {
      console.error('Unexpected sign out error:', err);
      toast.error('Unexpected error during sign out');
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
            <SidebarMenuButton asChild tooltip="Profile">
              <NavLink to="/dashboard/settings" className={cn("flex items-center gap-3 p-3", location.pathname === "/dashboard/settings" ? "bg-accent" : "")}>
                <Avatar className="size-10">
                  <AvatarImage src={profile?.avatar_url || undefined} alt="Profile picture" />
                  <AvatarFallback className="bg-gradient-primary text-white">
                    <User className="size-5" />
                  </AvatarFallback>
                </Avatar>
                {state === "expanded" && (
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-foreground">
                      {user?.email?.split('@')[0]}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      View Profile
                    </span>
                  </div>
                )}
              </NavLink>
            </SidebarMenuButton>
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

function AIAssistantFloating() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-primary hover:shadow-glow transition-smooth z-50 shadow-lg"
          title="AI Assistant"
        >
          <Brain className="h-6 w-6 text-white" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">AI Financial Assistant</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <AIAssistant />
        </div>
      </DialogContent>
    </Dialog>
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
        
        {/* Floating AI Assistant */}
        <AIAssistantFloating />
      </div>
    </SidebarProvider>
  );
}