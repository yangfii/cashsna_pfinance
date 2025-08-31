import { useEffect, useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { GlobalSearch } from "@/components/GlobalSearch";
import { QRScannerDialog } from "@/components/QRScannerDialog";
import { MotivationalPopup } from "@/components/MotivationalPopup";
import { NotificationCenter } from "@/components/NotificationCenter";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { LayoutDashboard, ArrowLeftRight, FolderOpen, BarChart3, Settings, LogOut, User, Target, Coins, Brain, Bug, QrCode, MessageCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReportDialog } from "@/components/ReportDialog";
import { useWelcomeBack } from "@/hooks/useWelcomeBack";
import { OfflineIndicator } from "@/components/OfflineIndicator";
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
  label: t("nav.portfolio"),
  key: "portfolio"
}, {
  to: "/dashboard/workflow",
  icon: Zap,
  label: t("nav.workflow"),
  key: "workflow"
}, {
  to: "/dashboard/assistant",
  icon: Brain,
  label: t("nav.assistant"),
  key: "assistant"
}, {
  to: "/dashboard/reports",
  icon: BarChart3,
  label: t("nav.reports"),
  key: "reports"
}];
function AppSidebar({
  onPortfolioClick
}: {
  onPortfolioClick?: () => void;
}) {
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
    state,
    toggleSidebar
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
          <button onClick={() => {
          navigate('/dashboard');
          toggleSidebar();
        }} className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 cursor-pointer group">
            <LayoutDashboard className="size-5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-3 hover:animate-pulse active:scale-90 active:rotate-6" />
          </button>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-foreground">
              {t('layout.appTitle')}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {t('layout.appSubtitle')}
            </span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="mx-[6px]">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium">{t('layout.navigation')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.to} tooltip={item.label}>
                    {item.key === "portfolio" ? <button onClick={onPortfolioClick} className="group flex items-center gap-2 w-full text-left">
                        <item.icon className="size-5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-3 hover:animate-pulse active:scale-90 active:rotate-6" />
                        <span className="text-base transition-all duration-300 transform group-hover:tracking-wide group-hover:font-medium">
                          {item.label}
                        </span>
                      </button> : <NavLink to={item.to} className="group">
                        <item.icon className="size-5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-3 hover:animate-pulse active:scale-90 active:rotate-6" />
                        <span className="text-base transition-all duration-300 transform group-hover:tracking-wide group-hover:font-medium">
                          {item.label}
                        </span>
                      </NavLink>}
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === "/dashboard/settings"} tooltip={t("nav.settings")} className="group">
              <NavLink to="/dashboard/settings">
                <Settings className="size-5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-3 hover:animate-pulse active:scale-90 active:rotate-6" />
                <span className="text-base transition-all duration-300 transform group-hover:tracking-wide group-hover:font-medium">
                  {t("nav.settings")}
                </span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} tooltip={t("nav.signOut")} className="group">
              <LogOut className="size-5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-3 hover:animate-pulse active:scale-90 active:rotate-6" />
              <span className="text-base transition-all duration-300 transform group-hover:tracking-wide group-hover:font-medium">
                {t("nav.signOut")}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>;
}
export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    t
  } = useLanguage();
  const {
    user,
    loading
  } = useAuth();
  const {
    profile
  } = useProfile();
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [motivationalPopupOpen, setMotivationalPopupOpen] = useState(false);
  const fullName = profile?.first_name || profile?.last_name ? `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() : user?.email?.split('@')[0] ?? 'User';
  const handlePortfolioClick = () => {
    setMotivationalPopupOpen(true);
    setTimeout(() => {
      navigate('/dashboard/portfolio');
    }, 5000);
  };
  useWelcomeBack(() => setMotivationalPopupOpen(true), {
    enableBrowserNotification: true,
    cooldownHours: 6,
    minAwayMinutes: 10
  });
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
      <div className="min-h-screen flex w-full">
        <AppSidebar onPortfolioClick={handlePortfolioClick} />
        
        {/* Header */}
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-50 flex h-14 sm:h-16 lg:h-18 items-center gap-2 sm:gap-3 lg:gap-4 border-b bg-card/90 backdrop-blur-md px-3 sm:px-4 lg:px-6 xl:px-8 border-border/50">
            <SidebarTrigger />
            <GlobalSearch />
            <OfflineIndicator />
            <div className="flex-1" />
            
            {/* Notifications */}
            <NotificationCenter />
            
            {/* Telegram Support Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => window.open('https://t.me/cashsnapfinance', '_blank')} 
              className="hover:bg-accent" 
              title={t('support.telegramSupport')}
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
            
            {/* QR Scanner Button */}
            <Button variant="ghost" size="icon" onClick={() => setQrScannerOpen(true)} className="hover:bg-accent" title="Scan QR Code for Sign-In">
              <QrCode className="h-5 w-5" />
            </Button>
            
            <NavLink to="/dashboard/settings" className={cn("flex items-center gap-2 p-2 rounded-lg group hover:bg-accent transition-colors", location.pathname === "/dashboard/settings" ? "bg-accent" : "")}>
              <Avatar className="size-8 transition-all duration-300 group-hover:scale-110 group-hover:rotate-2 hover:animate-pulse active:scale-95 ring-2 ring-primary/20">
                <AvatarImage src={profile?.avatar_url || undefined} alt="Profile picture" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <User className="size-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" />
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm text-foreground max-w-[12rem] truncate">{fullName}</span>
            </NavLink>
            <LanguageSelector />
            <ThemeToggle />
          </header>
          
          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-background/20 backdrop-blur-sm">
            <div className="w-full max-w-[1800px] mx-auto px-3 py-4 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:py-12">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      
      <QRScannerDialog open={qrScannerOpen} onOpenChange={setQrScannerOpen} />
      <MotivationalPopup open={motivationalPopupOpen} onOpenChange={setMotivationalPopupOpen} />
    </SidebarProvider>;
}