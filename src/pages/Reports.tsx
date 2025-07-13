import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart3, PieChart, Download, Calendar, TrendingUp, TrendingDown, FileText, AlertCircle } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Mock data for charts
const monthlyData = [
  { month: "មករា", income: 1800, expense: 1200 },
  { month: "កុម្ភៈ", income: 2200, expense: 1500 },
  { month: "មីនា", income: 1900, expense: 1300 },
  { month: "មេសា", income: 2100, expense: 1400 },
  { month: "ឧសភា", income: 2400, expense: 1600 },
  { month: "មិថុនា", income: 2000, expense: 1350 },
  { month: "កក្កដា", income: 2300, expense: 1450 }
];

const categoryExpenses = [
  { category: "អាហារ", amount: 450, percentage: 31 },
  { category: "ដឹកជញ្ជូន", amount: 320, percentage: 22 },
  { category: "ការកម្សាន្ត", amount: 280, percentage: 19 },
  { category: "សុខភាព", amount: 200, percentage: 14 },
  { category: "សំលៀកបំពាក់", amount: 150, percentage: 10 },
  { category: "ផ្សេងៗ", amount: 50, percentage: 4 }
];

// Colors for charts
const COLORS = {
  income: 'hsl(var(--chart-1))',
  expense: 'hsl(var(--chart-2))',
  pieChart: ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--chart-6))']
};

// Format data for pie chart
const getPieData = () => {
  const currentMonth = monthlyData[monthlyData.length - 1];
  return [
    { name: 'ចំណូល', value: currentMonth.income, color: COLORS.income },
    { name: 'ចំណាយ', value: currentMonth.expense, color: COLORS.expense }
  ];
};

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("thisMonth");
  const [chartType, setChartType] = useState("bar");
  const [isNewUser, setIsNewUser] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Check if user is new (no real transactions)
  useEffect(() => {
    const transactions = localStorage.getItem('transactions');
    const hasRealTransactions = transactions && JSON.parse(transactions).length > 0;
    setIsNewUser(!hasRealTransactions);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalIncome = monthlyData[monthlyData.length - 1].income;
  const totalExpense = monthlyData[monthlyData.length - 1].expense;
  const savingsRate = ((totalIncome - totalExpense) / totalIncome * 100);

  const handleExportPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const reportData = {
        totalIncome,
        totalExpense,
        savingsRate: savingsRate.toFixed(1),
        monthlyData,
        categoryExpenses,
        period: selectedPeriod
      };

      const { data, error } = await supabase.functions.invoke('generate-pdf-report', {
        body: { reportData, period: selectedPeriod }
      });

      if (error) {
        throw error;
      }

      // Create blob and download
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report-${selectedPeriod}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('PDF នាំចេញបានជោគជ័យ!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('មានបញ្ហាក្នុងការនាំចេញ PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isNewUser ? "របាយការណ៍ហិរញ្ញវត្ថុ" : "របាយការណ៍ហិរញ្ញវត្ថុ"}
          </h1>
          <p className="text-muted-foreground">
            {isNewUser ? "នេះជាគំរូទិន្នន័យហិរញ្ញវត្ថុរបស់អ្នក" : "វិភាគទិន្នន័យហិរញ្ញវត្ថុរបស់អ្នក"}
          </p>
        </div>
        
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisMonth">ខែនេះ</SelectItem>
              <SelectItem value="lastMonth">ខែមុន</SelectItem>
              <SelectItem value="last3Months">៣ខែចុងក្រោយ</SelectItem>
              <SelectItem value="last6Months">៦ខែចុងក្រោយ</SelectItem>
              <SelectItem value="thisYear">ឆ្នាំនេះ</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" onClick={handleExportPDF} disabled={isGeneratingPDF}>
            <Download className="h-4 w-4" />
            {isGeneratingPDF ? 'កំពុងបង្កើត...' : 'នាំចេញ PDF'}
          </Button>
        </div>
      </div>

      {/* New User Financial Statement */}
      {isNewUser && (
        <Card className="stat-card animate-bounce-in border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <FileText className="h-5 w-5" />
              របាយការណ៍ហិរញ្ញវត្ថុរបស់អ្នក
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              នេះជាគំរូទិន្នន័យ - សូមចាប់ផ្តើមបន្ថែមប្រតិបត្តិការរបស់អ្នក
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">ស្ថានភាពហិរញ្ញវត្ថុ</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>ចំណូលសរុប:</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(totalIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ចំណាយសរុប:</span>
                    <span className="font-bold text-red-600">{formatCurrency(totalExpense)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">ចំណូលសុទ្ធ:</span>
                      <span className={`font-bold ${totalIncome - totalExpense >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(totalIncome - totalExpense)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">ការវិភាគ</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>អត្រាសន្សំ:</span>
                    <span className="font-bold text-blue-600">{savingsRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ចំណាយប្រចាំថ្ងៃ:</span>
                    <span className="font-medium">{formatCurrency(totalExpense / 30)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ចំណូលប្រចាំថ្ងៃ:</span>
                    <span className="font-medium">{formatCurrency(totalIncome / 30)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="stat-card income-card animate-bounce-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              ចំណូលប្រចាំខែ
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
              +15% ពីខែមុន
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card expense-card animate-bounce-in" style={{animationDelay: '0.1s'}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">
              ចំណាយប្រចាំខែ
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800 dark:text-red-300">
              {formatCurrency(totalExpense)}
            </div>
            <p className="text-xs text-red-600 dark:text-red-500 mt-1">
              -8% ពីខែមុន
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card balance-card animate-bounce-in" style={{animationDelay: '0.2s'}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
              អត្រាសន្សំ
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">
              {savingsRate.toFixed(1)}%
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
              គោលដៅ: 30%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Chart Section */}
      <Card className="stat-card animate-slide-up border-2 border-primary/10 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 rounded-t-lg border-b border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg shadow-md">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  ទិន្នន័យចំណូល vs ចំណាយ
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  ការវិភាគទិន្នន័យហិរញ្ញវត្ថុប្រចាំខែ
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={chartType === "bar" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("bar")}
                className={`gap-2 transition-all duration-300 ${
                  chartType === "bar" 
                    ? "bg-gradient-primary border-0 shadow-glow" 
                    : "hover:bg-primary/10 hover:border-primary/30"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                របារ
              </Button>
              <Button
                variant={chartType === "pie" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("pie")}
                className={`gap-2 transition-all duration-300 ${
                  chartType === "pie" 
                    ? "bg-gradient-primary border-0 shadow-glow" 
                    : "hover:bg-primary/10 hover:border-primary/30"
                }`}
              >
                <PieChart className="h-4 w-4" />
                វង់
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 bg-gradient-to-b from-transparent to-muted/20">
          <div className="h-96 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 rounded-lg -z-10"></div>
            {chartType === "bar" ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData.slice(-6)} margin={{ top: 20, right: 30, left: 40, bottom: 60 }}>
                  <defs>
                    <linearGradient id="incomeBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={1}/>
                      <stop offset="50%" stopColor="hsl(var(--chart-1))" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.7}/>
                    </linearGradient>
                    <linearGradient id="expenseBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={1}/>
                      <stop offset="50%" stopColor="hsl(var(--chart-2))" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.7}/>
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeOpacity={0.1} 
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="month" 
                    className="text-sm fill-muted-foreground" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    className="text-sm fill-muted-foreground" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                    tickFormatter={(value) => `$${value}`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${formatCurrency(value as number)}`, 
                      name === 'income' ? 'ចំណូល' : 'ចំណាយ'
                    ]}
                    labelFormatter={(label) => `ខែ: ${label}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      color: 'hsl(var(--foreground))',
                      boxShadow: '0 20px 40px -10px hsl(var(--primary) / 0.4)',
                      backdropFilter: 'blur(10px)'
                    }}
                    cursor={{
                      fill: 'hsl(var(--muted))',
                      fillOpacity: 0.1
                    }}
                  />
                  <Bar 
                    dataKey="income" 
                    fill="url(#incomeBar)" 
                    radius={[4, 4, 0, 0]} 
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={0}
                    filter="url(#glow)"
                  />
                  <Bar 
                    dataKey="expense" 
                    fill="url(#expenseBar)" 
                    radius={[4, 4, 0, 0]}
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={0}
                    filter="url(#glow)"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <defs>
                    <linearGradient id="incomeSlice" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={1}/>
                      <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                    </linearGradient>
                    <linearGradient id="expenseSlice" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={1}/>
                      <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                    </linearGradient>
                    <filter id="pieGlow">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <Pie
                    data={getPieData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="hsl(var(--background))"
                    strokeWidth={4}
                    animationBegin={0}
                    animationDuration={1000}
                    filter="url(#pieGlow)"
                  >
                    {getPieData().map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 0 ? "url(#incomeSlice)" : "url(#expenseSlice)"}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [
                      `${formatCurrency(value as number)}`, 
                      name
                    ]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      color: 'hsl(var(--foreground))',
                      boxShadow: '0 20px 40px -10px hsl(var(--primary) / 0.4)',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                  {/* Center text */}
                  <g>
                    <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" 
                          className="text-sm fill-muted-foreground">
                      សរុប
                    </text>
                    <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" 
                          className="text-lg font-bold fill-foreground">
                      {formatCurrency(totalIncome + totalExpense)}
                    </text>
                  </g>
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <Card className="stat-card animate-slide-up">
          <CardHeader>
            <CardTitle>ចំណាយតាមប្រភេទ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryExpenses.map((category, index) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{category.category}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {category.percentage}%
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(category.amount)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-gradient-expense h-2 rounded-full transition-all duration-500"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Comparison */}
        <Card className="stat-card animate-slide-up">
          <CardHeader>
            <CardTitle>ការប្រៀបធៀបរាយខែ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gradient mb-2">
                  {formatCurrency(totalIncome - totalExpense)}
                </div>
                <p className="text-sm text-muted-foreground">ចំណូលសុទ្ធខែនេះ</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                  <span className="text-sm font-medium">ចំណូលខ្ពស់បំផុត</span>
                  <span className="text-emerald-600 font-bold">
                    {formatCurrency(Math.max(...monthlyData.map(d => d.income)))}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-lg bg-red-50 dark:bg-red-950/30">
                  <span className="text-sm font-medium">ចំណាយខ្ពស់បំផុត</span>
                  <span className="text-red-600 font-bold">
                    {formatCurrency(Math.max(...monthlyData.map(d => d.expense)))}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                  <span className="text-sm font-medium">ប្រតិបត្តិការប្រចាំថ្ងៃ</span>
                  <span className="text-blue-600 font-bold">2.3</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card className="stat-card animate-slide-up">
        <CardHeader>
          <CardTitle>នាំចេញទិន្នន័យ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              CSV File
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              PDF Report
            </Button>
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Monthly Summary
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}