import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, Wallet, Plus, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for demo
const mockTransactions = [
  { id: 1, type: "income", amount: 1500, category: "ប្រាក់ខែ", date: "2024-07-01", note: "ប្រាក់ខែខុបម្ភៈ" },
  { id: 2, type: "expense", amount: 50, category: "អាហារ", date: "2024-07-02", note: "អាហារពេលល្ងាច" },
  { id: 3, type: "expense", amount: 30, category: "ឆេះប្រេង", date: "2024-07-02", note: "ចាក់ប្រេងម៉ូតូ" },
  { id: 4, type: "income", amount: 200, category: "បន្ថែម", date: "2024-07-03", note: "ចំណូលបន្ថែម" },
  { id: 5, type: "expense", amount: 25, category: "ដឹកជញ្ជូន", date: "2024-07-03", note: "តាក់ស៊ី" },
];

export default function Dashboard() {
  const [currentMonth] = useState("កក្កដា ២០២៤");
  
  // Calculate totals
  const totalIncome = mockTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = mockTransactions
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
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">ការសង្ខេបហិរញ្ញវត្ថុ</h1>
          <p className="text-muted-foreground">
            ស្ថានភាពហិរញ្ញវត្ថុរបស់អ្នកសម្រាប់ខែ {currentMonth}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            ប្រែប្រួលខែ
          </Button>
          <Button className="gap-2 bg-gradient-primary border-0 hover:shadow-glow transition-smooth">
            <Plus className="h-4 w-4" />
            បន្ថែមប្រតិបត្តិការ
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Income */}
        <Card className="income-card stat-card animate-bounce-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              ចំណូលសរុប
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">
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
            <div className="text-2xl font-bold text-red-800 dark:text-red-300">
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
              "text-2xl font-bold",
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
            <div className="text-2xl font-bold">
              {mockTransactions.length}
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
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">ប្រតិបត្តិការថ្មីៗ</CardTitle>
            <Button variant="outline" size="sm">
              មើលទាំងអស់
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTransactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth"
              >
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "w-2 h-8 rounded-full",
                    transaction.type === "income" ? "bg-gradient-income" : "bg-gradient-expense"
                  )} />
                  <div>
                    <p className="font-medium">{transaction.category}</p>
                    <p className="text-sm text-muted-foreground">{transaction.note}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={transaction.type === "income" ? "secondary" : "destructive"}
                    className={cn(
                      transaction.type === "income" 
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" 
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    )}
                  >
                    {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{transaction.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
        <Card className="stat-card hover:shadow-glow transition-smooth cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-income rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">បន្ថែមចំណូល</h3>
                <p className="text-sm text-muted-foreground">កត់ត្រាចំណូលថ្មី</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card hover:shadow-glow transition-smooth cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-expense rounded-xl">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">បន្ថែមចំណាយ</h3>
                <p className="text-sm text-muted-foreground">កត់ត្រាចំណាយថ្មី</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}