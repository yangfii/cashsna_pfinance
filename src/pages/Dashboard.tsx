import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DollarSign, TrendingUp, TrendingDown, Wallet, Plus, Calendar, CalendarIcon } from "lucide-react";
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
        
        {/* Enhanced button layout with better spacing and wrapping */}
        <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("gap-3 w-full sm:w-auto h-12 lg:h-14 px-6 lg:px-8", !selectedDate && "text-muted-foreground")}>
                <CalendarIcon className="h-5 w-5 lg:h-6 lg:w-6" />
                <span className="text-sm lg:text-base">
                  {selectedDate ? format(selectedDate, "PPP") : "ពិនិត្យប្រតិបត្តិការ"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
          <Button className="gap-3 bg-gradient-primary border-0 hover:shadow-glow transition-smooth w-full sm:w-auto h-12 lg:h-14 px-6 lg:px-8" onClick={() => navigate('/dashboard/transactions')}>
            <Plus className="h-5 w-5 lg:h-6 lg:w-6" />
            <span className="text-sm lg:text-base">{t("dashboard.addTransaction")}</span>
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards with dreamy glassmorphism */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-4 lg:px-6 relative z-10">
        {/* Total Income */}
        <Card className="income-card stat-card animate-bounce-in hover:scale-105 transition-all duration-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 lg:pb-4">
            <CardTitle className="text-sm lg:text-base font-medium text-muted-foreground">
              {t("dashboard.totalIncome")}
            </CardTitle>
            <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-emerald-600" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-emerald-800 dark:text-emerald-300">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs lg:text-sm text-emerald-600 dark:text-emerald-500 mt-2 lg:mt-3">
              +12% ពីខែមុន
            </p>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card className="expense-card stat-card animate-bounce-in hover:scale-105 transition-all duration-500" style={{
        animationDelay: '0.1s'
      }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 lg:pb-4">
            <CardTitle className="text-sm lg:text-base font-medium text-muted-foreground">
              {t("dashboard.totalExpenses")}
            </CardTitle>
            <TrendingDown className="h-5 w-5 lg:h-6 lg:w-6 text-red-600" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-red-800 dark:text-red-300">
              {formatCurrency(totalExpense)}
            </div>
            <p className="text-xs lg:text-sm text-red-600 dark:text-red-500 mt-2 lg:mt-3">
              -5% ពីខែមុន
            </p>
          </CardContent>
        </Card>

        {/* Net Balance */}
        <Card className="balance-card stat-card animate-bounce-in hover:scale-105 transition-all duration-500" style={{
        animationDelay: '0.2s'
      }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 lg:pb-4">
            <CardTitle className="text-sm lg:text-base font-medium text-muted-foreground">
              {t("dashboard.currentBalance")}
            </CardTitle>
            <Wallet className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className={cn("text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold", netBalance >= 0 ? "text-blue-800 dark:text-blue-300" : "text-red-800 dark:text-red-300")}>
              {formatCurrency(netBalance)}
            </div>
            <p className="text-xs lg:text-sm text-blue-600 dark:text-blue-500 mt-2 lg:mt-3">
              គោលដៅពីរខែ: $2,000
            </p>
          </CardContent>
        </Card>

        {/* This Month */}
        <Card className="stat-card animate-bounce-in hover:scale-105 transition-all duration-500" style={{
        animationDelay: '0.3s'
      }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 lg:pb-4">
            <CardTitle className="text-sm lg:text-base font-medium text-muted-foreground">
              ប្រតិបត្តិការខែនេះ
            </CardTitle>
            <DollarSign className="h-5 w-5 lg:h-6 lg:w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold">
              {loading ? "..." : transactions.length}
            </div>
            <p className="text-xs lg:text-sm text-muted-foreground mt-2 lg:mt-3">
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
              <CardTitle className="text-xl lg:text-2xl xl:text-3xl font-semibold">{t("dashboard.recentTransactions")}</CardTitle>
              <Button variant="outline" size="sm" className="w-full lg:w-auto h-10 lg:h-12 px-4 lg:px-6">
                <span className="text-sm lg:text-base">មើលទាំងអស់</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 animate-slide-up">
            <Card className="glass-panel hover:shadow-2xl hover:scale-105 transition-all duration-500 cursor-pointer group" onClick={() => navigate('/dashboard/transactions', {
            state: {
              filterType: 'income',
              showIncomeOnly: true
            }
          })}>
              <CardContent className="p-8 lg:p-10">
                <div className="flex items-center space-x-4 lg:space-x-6">
                  <div className="p-4 lg:p-5 bg-gradient-income rounded-xl flex-shrink-0 group-hover:scale-125 group-hover:rotate-3 transition-all duration-300 group-active:scale-90">
                    <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-constructive-foreground transition-all duration-300 group-hover:rotate-6 group-hover:animate-pulse" />
                  </div>
                   <div className="min-w-0 flex-1">
                     <h3 className="text-lg lg:text-xl xl:text-2xl font-semibold group-hover:text-constructive transition-colors duration-300">បន្ថែមចំណូល</h3>
                     <p className="text-sm lg:text-base text-muted-foreground">កត់ត្រាចំណូលថ្មី</p>
                   </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel hover:shadow-2xl hover:scale-105 transition-all duration-500 cursor-pointer group" onClick={() => navigate('/dashboard/transactions?type=expense')}>
              <CardContent className="p-8 lg:p-10">
                <div className="flex items-center space-x-4 lg:space-x-6">
                  <div className="p-4 lg:p-5 bg-gradient-expense rounded-xl flex-shrink-0 group-hover:scale-125 group-hover:rotate-3 transition-all duration-300 group-active:scale-90">
                    <TrendingDown className="h-6 w-6 lg:h-8 lg:w-6 text-destructive-foreground transition-all duration-300 group-hover:rotate-6 group-hover:animate-pulse" />
                  </div>
                   <div className="min-w-0 flex-1">
                     <h3 className="text-lg lg:text-xl xl:text-2xl font-semibold group-hover:text-destructive transition-colors duration-300">បន្ថែមចំណាយ</h3>
                     <p className="text-sm lg:text-base text-muted-foreground">កត់ត្រាចំណាយថ្មី</p>
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