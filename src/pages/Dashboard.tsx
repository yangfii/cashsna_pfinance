import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Plus } from "lucide-react";
import { 
  TrendingUpIcon, 
  TrendingDownIcon, 
  WalletIcon, 
  CalendarIcon, 
  AddIcon, 
  DashboardIcon,
  CoinIcon,
  TransactionsIcon 
} from "@/components/ui/action-icons";
import { cn } from "@/lib/utils";
import { WelcomeMessage } from '@/components/WelcomeMessage';
import { ProfileCard } from '@/components/ProfileCard';
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { useIsMobile } from "@/hooks/use-mobile";
type Transaction = {
  id: string;
  user_id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  note: string | null;
  date: string;
  created_at: string;
  updated_at: string;
};
export default function Dashboard() {
  const [currentMonth] = useState("កក្កដា ២០២៥");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const {
    t
  } = useLanguage();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Fetch transactions on mount
  useEffect(() => {
    fetchTransactions();
  }, [user]);
  const fetchTransactions = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const {
        data,
        error
      } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('date', {
        ascending: false
      });
      if (error) throw error;
      setTransactions((data || []).map(item => ({
        ...item,
        type: item.type as "income" | "expense"
      })));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals from real data
  const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('km-KH', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };
  return <div className="w-full container-dashboard space-y-10 lg:space-y-12 animate-fade-in relative">
      {/* Dreamy background overlay */}
      
      
      {/* Welcome Message with enhanced spacing */}
      <div className="px-2 sm:px-4 lg:px-6 relative z-10">
        <WelcomeMessage />
      </div>
      
      {/* Header with improved breathing space */}
      <div className="flex flex-col space-y-6 lg:space-y-8 xl:flex-row xl:items-center xl:justify-between xl:space-y-0 px-2 sm:px-4 lg:px-6 relative z-10">
        <div className="space-y-3 lg:space-y-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground animate-fade-in transition-all duration-500 hover:tracking-wide hover:text-gradient transform hover:scale-105 cursor-default">
            {t("dashboard.title")}
          </h1>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground">
            ស្ថានភាពហិរញ្ញវត្ថុរបស់អ្នកសម្រាប់ខែ {currentMonth}
          </p>
        </div>
        
        {/* Enhanced button layout with proper spacing and animations */}
        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={cn(
                  "gap-3 w-full sm:w-auto h-12 lg:h-14 px-6 lg:px-8",
                  "hover:scale-105 hover:shadow-lg transition-all duration-300",
                  "border-2 hover:border-primary/50 hover:bg-primary/5",
                  "animate-fade-in",
                  !selectedDate && "text-muted-foreground"
                )}
                style={{ animationDelay: '0.1s' }}
              >
                <CalendarIcon size="lg" variant="button" />
                <span className="text-sm lg:text-base font-medium">
                  {selectedDate ? format(selectedDate, "PPP") : "ពិនិត្យប្រតិបត្តិការ"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 animate-scale-in" align="start">
              <CalendarComponent 
                mode="single" 
                selected={selectedDate} 
                onSelect={setSelectedDate} 
                initialFocus 
                className="p-3 pointer-events-auto" 
              />
            </PopoverContent>
          </Popover>
          
          <Button 
            className={cn(
              "gap-3 bg-gradient-primary border-0 hover:shadow-glow transition-all duration-500",
              "w-full sm:w-auto h-12 lg:h-14 px-6 lg:px-8",
              "hover:scale-105 hover:-translate-y-1 active:scale-95",
              "animate-fade-in shadow-elegant",
              "group overflow-hidden relative"
            )}
            style={{ animationDelay: '0.2s' }}
            onClick={() => navigate('/dashboard/transactions')}
          >
            {/* Ripple effect background */}
            <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-lg" />
            <AddIcon size="lg" variant="button" className="relative z-10 group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-sm lg:text-base font-semibold relative z-10">{t("dashboard.addTransaction")}</span>
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards with staggered animations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-4 lg:px-6 relative z-10">
        {/* Total Income */}
        <Card className={cn(
          "income-card stat-card hover:scale-105 transition-all duration-500",
          "animate-fade-in hover:shadow-2xl hover:-translate-y-2",
          "group cursor-pointer relative overflow-hidden"
        )} style={{ animationDelay: '0.3s' }}>
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 lg:pb-4 relative z-10">
            <CardTitle className="text-sm lg:text-base font-medium text-muted-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors duration-300">
              {t("dashboard.totalIncome")}
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              <TrendingUpIcon size="lg" variant="inline" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 relative z-10">
            <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-emerald-800 dark:text-emerald-300 group-hover:scale-105 transition-transform duration-300">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs lg:text-sm text-emerald-600 dark:text-emerald-500 mt-2 lg:mt-3 group-hover:translate-x-1 transition-transform duration-300">
              +12% ពីខែមុន
            </p>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card className={cn(
          "expense-card stat-card hover:scale-105 transition-all duration-500",
          "animate-fade-in hover:shadow-2xl hover:-translate-y-2",
          "group cursor-pointer relative overflow-hidden"
        )} style={{ animationDelay: '0.4s' }}>
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 lg:pb-4 relative z-10">
            <CardTitle className="text-sm lg:text-base font-medium text-muted-foreground group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors duration-300">
              {t("dashboard.totalExpenses")}
            </CardTitle>
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              <TrendingDownIcon size="lg" variant="inline" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 relative z-10">
            <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-red-800 dark:text-red-300 group-hover:scale-105 transition-transform duration-300">
              {formatCurrency(totalExpense)}
            </div>
            <p className="text-xs lg:text-sm text-red-600 dark:text-red-500 mt-2 lg:mt-3 group-hover:translate-x-1 transition-transform duration-300">
              -5% ពីខែមុន
            </p>
          </CardContent>
        </Card>

        {/* Net Balance */}
        <Card className={cn(
          "balance-card stat-card hover:scale-105 transition-all duration-500",
          "animate-fade-in hover:shadow-2xl hover:-translate-y-2",
          "group cursor-pointer relative overflow-hidden"
        )} style={{ animationDelay: '0.5s' }}>
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 lg:pb-4 relative z-10">
            <CardTitle className="text-sm lg:text-base font-medium text-muted-foreground group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300">
              {t("dashboard.currentBalance")}
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              <WalletIcon size="lg" variant="inline" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 relative z-10">
            <div className={cn(
              "text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold group-hover:scale-105 transition-transform duration-300",
              netBalance >= 0 ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"
            )}>
              {formatCurrency(netBalance)}
            </div>
            <p className="text-xs lg:text-sm text-green-600 dark:text-green-500 mt-2 lg:mt-3 group-hover:translate-x-1 transition-transform duration-300">
              គោលដៅពីរខែ: $2,000
            </p>
          </CardContent>
        </Card>

        {/* This Month */}
        <Card className={cn(
          "stat-card hover:scale-105 transition-all duration-500",
          "animate-fade-in hover:shadow-2xl hover:-translate-y-2",
          "group cursor-pointer relative overflow-hidden"
        )} style={{ animationDelay: '0.6s' }}>
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 lg:pb-4 relative z-10">
            <CardTitle className="text-sm lg:text-base font-medium text-muted-foreground group-hover:text-primary transition-colors duration-300">
              ប្រតិបត្តិការខែនេះ
            </CardTitle>
            <div className="p-2 rounded-lg bg-muted group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              <TransactionsIcon size="lg" variant="inline" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 relative z-10">
            <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold group-hover:scale-105 transition-transform duration-300">
              {loading ? (
                <div className="animate-pulse bg-muted rounded w-16 h-8" />
              ) : (
                transactions.length
              )}
            </div>
            <p className="text-xs lg:text-sm text-muted-foreground mt-2 lg:mt-3 group-hover:translate-x-1 transition-transform duration-300">
              រាយការណ៍ប្រតិបត្តិការ
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Recent Transactions with dreamy glassmorphism */}
      <div className="px-2 sm:px-4 lg:px-6 relative z-10">
        <Card className="glass-panel animate-slide-up hover:shadow-2xl transition-all duration-700">
          <CardHeader className="pb-6 lg:pb-8">
            <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle className="text-xl lg:text-2xl xl:text-3xl font-semibold animate-fade-in" style={{ animationDelay: '0.7s' }}>
                {t("dashboard.recentTransactions")}
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                className={cn(
                  "w-full lg:w-auto h-10 lg:h-12 px-4 lg:px-6",
                  "hover:scale-105 hover:shadow-md transition-all duration-300",
                  "border-2 hover:border-primary/50 hover:bg-primary/5",
                  "animate-fade-in"
                )}
                style={{ animationDelay: '0.8s' }}
              >
                <span className="text-sm lg:text-base font-medium">មើលទាំងអស់</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? <div className="text-center py-12 lg:py-16 text-muted-foreground">
                <p className="text-base lg:text-lg">{t("common.loading")}</p>
              </div> : transactions.length === 0 ? <div className="text-center py-12 lg:py-16 text-muted-foreground">
                <p className="text-base lg:text-lg">{t("dashboard.noTransactions")}</p>
              </div> : <div className="space-y-4 lg:space-y-6">
                {transactions.slice(0, 5).map(transaction => <div key={transaction.id} className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between p-6 lg:p-8 transaction-item-glass hover:scale-[1.02] transition-all duration-300">
                  <div className="flex items-center space-x-4 lg:space-x-6 min-w-0 flex-1">
                    <div className={cn("w-2 h-10 lg:h-12 rounded-full flex-shrink-0", transaction.type === "income" ? "bg-gradient-income" : "bg-gradient-expense")} />
                     <div className="min-w-0 flex-1">
                       <p className="text-base lg:text-lg xl:text-xl font-semibold truncate">{transaction.category}</p>
                       <p className="text-sm lg:text-base text-muted-foreground truncate">{transaction.note}</p>
                     </div>
                  </div>
                  <div className="flex items-center justify-between lg:flex-col lg:items-end lg:text-right lg:space-y-2">
                    <Badge variant={transaction.type === "income" ? "secondary" : "destructive"} className={cn("text-sm lg:text-base px-3 py-1 lg:px-4 lg:py-2", transaction.type === "income" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400")}>
                      {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                    </Badge>
                    <p className="text-xs lg:text-sm text-muted-foreground mt-0 lg:mt-1">{transaction.date}</p>
                  </div>
                </div>)}
              </div>}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Main Dashboard Grid with dreamy glassmorphism */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 lg:gap-10 xl:gap-12 px-2 sm:px-4 lg:px-6 relative z-10">
        <div className="xl:col-span-3 space-y-8 lg:space-y-10">
        {/* Enhanced Quick Actions with dreamy glassmorphism */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 animate-fade-in" style={{ animationDelay: '0.9s' }}>
            <Card className={cn(
              "glass-panel hover:shadow-2xl hover:scale-105 transition-all duration-500 cursor-pointer group",
              "relative overflow-hidden border-2 hover:border-emerald-300/50"
            )} onClick={() => navigate('/dashboard/transactions', {
            state: {
              filterType: 'income',
              showIncomeOnly: true
            }
          })}>
              {/* Animated ripple effect */}
              <div className="absolute inset-0 bg-emerald-500/5 scale-0 group-hover:scale-100 transition-transform duration-700 rounded-xl" />
              
              <CardContent className="p-8 lg:p-10 relative z-10">
                <div className="flex items-center space-x-4 lg:space-x-6">
                  <div className="p-4 lg:p-5 bg-gradient-income rounded-xl flex-shrink-0 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 group-active:scale-90 shadow-lg">
                    <TrendingUpIcon size="xl" variant="button" className="transition-all duration-300 group-hover:rotate-12" />
                  </div>
                   <div className="min-w-0 flex-1">
                     <h3 className="text-lg lg:text-xl xl:text-2xl font-semibold group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors duration-300 group-hover:translate-x-1">
                       បន្ថែមចំណូល
                     </h3>
                     <p className="text-sm lg:text-base text-muted-foreground group-hover:translate-x-1 transition-transform duration-300">
                       កត់ត្រាចំណូលថ្មី
                     </p>
                   </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cn(
              "glass-panel hover:shadow-2xl hover:scale-105 transition-all duration-500 cursor-pointer group",
              "relative overflow-hidden border-2 hover:border-red-300/50"
            )} onClick={() => navigate('/dashboard/transactions?type=expense')}>
              {/* Animated ripple effect */}
              <div className="absolute inset-0 bg-red-500/5 scale-0 group-hover:scale-100 transition-transform duration-700 rounded-xl" />
              
              <CardContent className="p-8 lg:p-10 relative z-10">
                <div className="flex items-center space-x-4 lg:space-x-6">
                  <div className="p-4 lg:p-5 bg-gradient-expense rounded-xl flex-shrink-0 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 group-active:scale-90 shadow-lg">
                    <TrendingDownIcon size="xl" variant="button" className="transition-all duration-300 group-hover:rotate-12" />
                  </div>
                   <div className="min-w-0 flex-1">
                     <h3 className="text-lg lg:text-xl xl:text-2xl font-semibold group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors duration-300 group-hover:translate-x-1">
                       បន្ថែមចំណាយ
                     </h3>
                     <p className="text-sm lg:text-base text-muted-foreground group-hover:translate-x-1 transition-transform duration-300">
                       កត់ត្រាចំណាយថ្មី
                     </p>
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Profile Card */}
        <div className="xl:col-span-1">
          <ProfileCard />
        </div>
      </div>
    </div>;
}