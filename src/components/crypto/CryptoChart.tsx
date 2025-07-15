import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PieChart, 
  Pie, 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Legend
} from "recharts";
import { CryptoHolding, CryptoPrice } from "@/hooks/useCryptoData";
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";

interface CryptoChartProps {
  holdings: CryptoHolding[];
  prices: CryptoPrice;
}

export default function CryptoChart({ holdings, prices }: CryptoChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Calculate data for charts
  const portfolioData = holdings.map(holding => {
    const currentPrice = prices[holding.symbol.toLowerCase()]?.usd || 0;
    const priceChange24h = prices[holding.symbol.toLowerCase()]?.usd_24h_change || 0;
    const currentValue = holding.amount * currentPrice;
    const initialValue = holding.amount * holding.purchase_price;
    const gainLoss = currentValue - initialValue;
    const gainLossPercent = initialValue > 0 ? ((currentValue - initialValue) / initialValue) * 100 : 0;

    return {
      name: holding.name,
      symbol: holding.symbol.toUpperCase(),
      value: currentValue,
      amount: holding.amount,
      currentPrice,
      purchasePrice: holding.purchase_price,
      gainLoss,
      gainLossPercent,
      priceChange24h,
      initialValue
    };
  });

  const totalValue = portfolioData.reduce((sum, item) => sum + item.value, 0);
  const totalGainLoss = portfolioData.reduce((sum, item) => sum + item.gainLoss, 0);
  const totalInitialValue = portfolioData.reduce((sum, item) => sum + item.initialValue, 0);
  const totalGainLossPercent = totalInitialValue > 0 ? ((totalValue - totalInitialValue) / totalInitialValue) * 100 : 0;

  // Colors for charts
  const colors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffc658', '#82ca9d'];

  // Sample historical data (in a real app, this would come from API)
  const performanceData = [
    { date: 'Jan', value: totalValue * 0.7, volume: 120000 },
    { date: 'Feb', value: totalValue * 0.75, volume: 150000 },
    { date: 'Mar', value: totalValue * 0.8, volume: 180000 },
    { date: 'Apr', value: totalValue * 0.85, volume: 200000 },
    { date: 'May', value: totalValue * 0.9, volume: 220000 },
    { date: 'Jun', value: totalValue * 0.95, volume: 250000 },
    { date: 'Jul', value: totalValue, volume: 280000 },
  ];

  // Sample depth chart data
  const depthData = portfolioData.map((item, index) => ({
    price: item.currentPrice * (0.95 + (index * 0.02)),
    buyVolume: Math.random() * 1000,
    sellVolume: Math.random() * 1000,
    symbol: item.symbol
  })).sort((a, b) => a.price - b.price);

  return (
    <div className="space-y-6">
      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total P&L</p>
                <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(totalGainLoss)}
                </p>
              </div>
              {totalGainLoss >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">P&L Percentage</p>
                <p className={`text-2xl font-bold ${totalGainLossPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatPercent(totalGainLossPercent)}
                </p>
              </div>
              <Percent className={`h-8 w-8 ${totalGainLossPercent >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Holdings</p>
                <p className="text-2xl font-bold">{holdings.length}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{holdings.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="depth">Depth</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={portfolioData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ symbol, percent }) => `${symbol} ${(percent * 100).toFixed(1)}%`}
                    >
                      {portfolioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill="url(#colorValue)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Asset Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Historical Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'value' ? formatCurrency(value) : value.toLocaleString(), 
                      name === 'value' ? 'Portfolio Value' : 'Volume'
                    ]} 
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  />
                  <Bar yAxisId="right" dataKey="volume" fill="hsl(var(--secondary))" opacity={0.3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Holdings Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={portfolioData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="symbol" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatCurrency(value), 
                      name === 'value' ? 'Current Value' : 'Initial Investment'
                    ]} 
                  />
                  <Legend />
                  <Bar dataKey="value" fill="hsl(var(--primary))" name="Current Value" />
                  <Bar dataKey="initialValue" fill="hsl(var(--secondary))" name="Initial Investment" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Depth Tab */}
        <TabsContent value="depth">
          <Card>
            <CardHeader>
              <CardTitle>Market Depth (Simulated)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={depthData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="price" tickFormatter={(value) => `$${value.toFixed(2)}`} />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      value.toFixed(2), 
                      name === 'buyVolume' ? 'Buy Orders' : 'Sell Orders'
                    ]} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="buyVolume" 
                    stackId="1"
                    stroke="#22c55e" 
                    fill="#22c55e" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sellVolume" 
                    stackId="2"
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}