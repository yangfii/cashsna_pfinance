import { useEffect, useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { LayoutDashboard, ArrowLeftRight, FolderOpen, BarChart3, Settings, LogOut, User, Target, Coins, Brain, Bug } from "lucide-react";
import logoImage from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReportDialog } from "@/components/ReportDialog";
const getNavItems = (t: (key: string) => string) => [{
  to: "/dashboard",
  icon: LayoutDashboard,
  label: t("nav.dashboard"),
  key: "dashboard"
}, {
  to: "/dashboard/transactions",
  icon: ArrowLeftRight,
  label: t("nav.transactions"),
  key: "transactions"
}, {
  to: "/dashboard/categories",
  icon: FolderOpen,
  label: t("nav.categories"),
  key: "categories"
}, {
  to: "/dashboard/portfolio",
  icon: Coins,
  label: "Exchange Portfolio",
  key: "portfolio"
}, {
  to: "/dashboard/assistant",
  icon: Brain,
  label: t("nav.assistant"),
  key: "assistant"
}, {
  to: "/dashboard/planning",
  icon: Target,
  label: t("nav.planning"),
  key: "planning"
}, {
  to: "/dashboard/reports",
  icon: BarChart3,
  label: t("nav.reports"),
  key: "reports"
}, {
  to: "/dashboard/settings",
  icon: Settings,
  label: t("nav.settings"),
  key: "settings"
}];
function AppSidebar() {
  const {
    user,
    signOut
  } = useAuth();
  const {
    profile
  } = useProfile();
  const {
    t
  } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    state
  } = useSidebar();
  const navItems = getNavItems(t);
  const handleSignOut = async () => {
    try {
      console.log('Starting sign out process...');
      const {
        error
      } = await signOut();
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
  return <Sidebar variant="inset" collapsible="icon" className="py-0 my-0 mx-px px-0">
      <SidebarHeader className="mx-0 px-0 py-[7px] my-0">
        <div className="flex items-center gap-2 py-1 my-0 mx-[4px] px-[12px]">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground overflow-hidden">
            <img src={logoImage} alt="Logo" className="size-full object-cover rounded-lg" />
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
      
      <SidebarContent className="mx-[6px]">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.to} tooltip={item.label}>
                    <NavLink to={item.to}>
                      <item.icon />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="px-0 mx-0 my-[14px] py-0">
            <SidebarMenuButton asChild tooltip="Profile">
              <NavLink to="/dashboard/settings" className={cn("flex items-center gap-3 p-3", location.pathname === "/dashboard/settings" ? "bg-accent" : "")}>
                <Avatar className="size-10">
                  <AvatarImage src={profile?.avatar_url || undefined} alt="Profile picture" />
                  <AvatarFallback className="bg-gradient-primary text-white">
                    <User className="size-5" />
                  </AvatarFallback>
                </Avatar>
                {state === "expanded" && <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-foreground">
                      {user?.email?.split('@')[0]}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {t("nav.profile")}
                    </span>
                  </div>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <ReportDialog trigger={<SidebarMenuButton tooltip="Report to developers">
                  <Bug />
                  <span>Report to developers</span>
                </SidebarMenuButton>} />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} tooltip={t("nav.signOut")}>
              <LogOut />
              <span>{t("nav.signOut")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>;
}
export default function Layout() {
  const navigate = useNavigate();
  const {
    t
  } = useLanguage();
  const {
    user,
    loading
  } = useAuth();
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>;
  }
  if (!user) {
    return null;
  }
  return <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-primary/5">
        <AppSidebar />
        
        {/* Header */}
        <div className="flex-1 flex flex-col">
          <header className="flex h-16 lg:h-18 items-center gap-3 sm:gap-4 border-b bg-card/50 backdrop-blur-md px-4 sm:px-6 lg:px-8">
            <SidebarTrigger />
            <div className="flex-1" />
            <ThemeToggle />
          </header>
          
          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="w-full max-w-[1800px] mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-10 xl:py-12">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>;
}