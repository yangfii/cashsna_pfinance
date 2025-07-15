import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, Wallet, Plus, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { WelcomeMessage } from '@/components/WelcomeMessage';
import { ProfileCard } from '@/components/ProfileCard';

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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
  const [currentMonth] = useState("កក្កដា ២០២៤");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

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
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

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
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netBalance = totalIncome - totalExpense;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('km-KH', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Message */}
      <WelcomeMessage />
      
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">ការសង្ខេបហិរញ្ញវត្ថុ</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            ស្ថានភាពហិរញ្ញវត្ថុរបស់អ្នកសម្រាប់ខែ {currentMonth}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">ប្រែប្រួលខែ</span>
          </Button>
          <Button className="gap-2 bg-gradient-primary border-0 hover:shadow-glow transition-smooth w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            <span className="text-sm">បន្ថែមប្រតិបត្តិការ</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Income */}
        <Card className="income-card stat-card animate-bounce-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              ចំណូលសរុប
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-emerald-800 dark:text-emerald-300">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
              +12% ពីខែមុន
            </p>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card className="expense-card stat-card animate-bounce-in" style={{animationDelay: '0.1s'}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">
              ចំណាយសរុប
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-800 dark:text-red-300">
              {formatCurrency(totalExpense)}
            </div>
            <p className="text-xs text-red-600 dark:text-red-500 mt-1">
              -5% ពីខែមុន
            </p>
          </CardContent>
        </Card>

        {/* Net Balance */}
        <Card className="balance-card stat-card animate-bounce-in" style={{animationDelay: '0.2s'}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
              ចំណុះស្មើនឹង
            </CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-xl sm:text-2xl font-bold",
              netBalance >= 0 
                ? "text-blue-800 dark:text-blue-300" 
                : "text-red-800 dark:text-red-300"
            )}>
              {formatCurrency(netBalance)}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
              គោលដៅពីរខែ: $2,000
            </p>
          </CardContent>
        </Card>

        {/* This Month */}
        <Card className="stat-card animate-bounce-in" style={{animationDelay: '0.3s'}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              ប្រតិបត្តិការខែនេះ
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {loading ? "..." : transactions.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              រាយការណ៍ប្រតិបត្តិការ
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="stat-card animate-slide-up">
        <CardHeader>
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <CardTitle className="text-base sm:text-lg">ប្រតិបត្តិការថ្មីៗ</CardTitle>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              មើលទាំងអស់
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>កំពុងទាញយកទិន្នន័យ...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>មិនមានប្រតិបត្តិការនៅឡើយទេ</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth"
              >
                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                  <div className={cn(
                    "w-2 h-8 rounded-full flex-shrink-0",
                    transaction.type === "income" ? "bg-gradient-income" : "bg-gradient-expense"
                  )} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base truncate">{transaction.category}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{transaction.note}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right">
                  <Badge 
                    variant={transaction.type === "income" ? "secondary" : "destructive"}
                    className={cn(
                      "text-xs sm:text-sm",
                      transaction.type === "income" 
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" 
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    )}
                  >
                    {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-0 sm:mt-1">{transaction.date}</p>
                </div>
              </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>


      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 animate-slide-up">
            <Card className="stat-card hover:shadow-glow transition-smooth cursor-pointer">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="p-2 sm:p-3 bg-gradient-income rounded-xl flex-shrink-0">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base">បន្ថែមចំណូល</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">កត់ត្រាចំណូលថ្មី</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card hover:shadow-glow transition-smooth cursor-pointer">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="p-2 sm:p-3 bg-gradient-expense rounded-xl flex-shrink-0">
                    <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base">បន្ថែមចំណាយ</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">កត់ត្រាចំណាយថ្មី</p>
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
    </div>
  );
}