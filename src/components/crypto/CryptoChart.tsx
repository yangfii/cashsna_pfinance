import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";
import { CryptoHolding, CryptoPrice } from "@/hooks/useCryptoData";
import { TrendingUp, TrendingDown, DollarSign, Percent, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import DonutChartLegend from "./DonutChartLegend";
import { useIsMobile } from "@/hooks/use-mobile";

interface CryptoChartProps {
  holdings: CryptoHolding[];
  prices: Record<string, CryptoPrice>;
  activeTab?: string;
}

export default function CryptoChart({
  holdings,
  prices,
  activeTab = "overview"
}: CryptoChartProps) {
  const isMobile = useIsMobile();
  // Debug logging
  console.log('CryptoChart Debug - Holdings:', holdings);
  console.log('CryptoChart Debug - Prices:', prices);
  console.log('CryptoChart Debug - Holdings length:', holdings.length);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Map symbols to CoinGecko IDs (same as in hook)
  const symbolToId: Record<string, string> = {
    'btc': 'bitcoin',
    'bitcoin': 'bitcoin',
    'eth': 'ethereum',
    'ethereum': 'ethereum',
    'ada': 'cardano',
    'cardano': 'cardano',
    'sol': 'solana',
    'solana': 'solana',
    'dot': 'polkadot',
    'polkadot': 'polkadot',
    'bnb': 'binancecoin',
    'binancecoin': 'binancecoin',
    'usdt': 'tether',
    'tether': 'tether',
    'usdc': 'usd-coin',
    'xrp': 'ripple',
    'ripple': 'ripple',
    'matic': 'polygon',
    'polygon': 'polygon',
    'avax': 'avalanche-2',
    'avalanche': 'avalanche-2'
  };

  // Calculate data for charts
  const portfolioData = holdings.map(holding => {
    const currentPrice = prices[holding.symbol]?.price || 0;
    const priceChange24h = prices[holding.symbol]?.price_change_24h || 0;
    const currentValue = holding.amount * currentPrice;
    const initialValue = holding.amount * holding.purchase_price;
    const gainLoss = currentValue - initialValue;
    const gainLossPercent = initialValue > 0 ? (currentValue - initialValue) / initialValue * 100 : 0;
    
    console.log(`Portfolio calculation for ${holding.symbol}:`, {
      symbol: holding.symbol,
      amount: holding.amount,
      currentPrice,
      currentValue,
      initialValue,
      priceData: prices[holding.symbol]
    });
    
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
  
  console.log('Final portfolio data for charts:', portfolioData);
  
  const totalValue = portfolioData.reduce((sum, item) => sum + item.value, 0);
  const totalGainLoss = portfolioData.reduce((sum, item) => sum + item.gainLoss, 0);
  const totalInitialValue = portfolioData.reduce((sum, item) => sum + item.initialValue, 0);
  const totalGainLossPercent = totalInitialValue > 0 ? (totalValue - totalInitialValue) / totalInitialValue * 100 : 0;

  // Professional crypto-specific color palette
  const cryptoColorPalette = [
    '#F7931A', // Bitcoin Orange
    '#627EEA', // Ethereum Blue  
    '#0033AD', // Cardano Blue
    '#9945FF', // Solana Purple
    '#E6007A', // Polkadot Pink
    '#00D4AA', // Tether Green
    '#F3BA2F', // Binance Coin Yellow
    '#26A17B', // USDC Green
    '#FF6B35', // Additional Orange
    '#8B5CF6', // Additional Purple
    '#06B6D4', // Additional Cyan
    '#F59E0B'  // Additional Amber
  ];

  // Function to get professional color for crypto
  const getCryptoColor = (symbol: string, index: number) => {
    const symbolLower = symbol.toLowerCase();

    // Assign brand-specific colors for known cryptocurrencies
    const cryptoColors: Record<string, string> = {
      'btc': '#F7931A', // Bitcoin Orange
      'bitcoin': '#F7931A',
      'eth': '#627EEA', // Ethereum Blue
      'ethereum': '#627EEA',
      'ada': '#0033AD', // Cardano Blue
      'cardano': '#0033AD',
      'sol': '#9945FF', // Solana Purple
      'solana': '#9945FF',
      'dot': '#E6007A', // Polkadot Pink
      'polkadot': '#E6007A',
      'usdt': '#00D4AA', // Tether Green
      'tether': '#00D4AA',
      'bnb': '#F3BA2F', // Binance Coin Yellow
      'binance': '#F3BA2F',
      'usdc': '#26A17B', // USDC Green
      'xrp': '#23292F', // XRP Black
      'ripple': '#23292F',
      'matic': '#8247E5', // Polygon Purple
      'polygon': '#8247E5',
      'avax': '#E84142', // Avalanche Red
      'avalanche': '#E84142'
    };

    // Return specific color if found, otherwise use palette rotation
    return cryptoColors[symbolLower] || cryptoColorPalette[index % cryptoColorPalette.length];
  };

  // Prepare data for donut chart legend
  const prepareDonutChartData = () => {
    // Sort by value descending
    const sortedData = [...portfolioData].sort((a, b) => b.value - a.value);
    
    // Calculate percentages
    const dataWithPercent = sortedData.map((item, index) => ({
      name: item.name,
      symbol: item.symbol,
      value: item.value,
      percent: totalValue > 0 ? (item.value / totalValue) * 100 : 0,
      color: getCryptoColor(item.symbol, index)
    }));

    // Split into top 5 and overflow
    const topTokens = dataWithPercent.slice(0, 5);
    const overflowTokens = dataWithPercent.slice(5);

    return { topTokens, overflowTokens, sortedData: dataWithPercent };
  };

  const { topTokens, overflowTokens, sortedData } = prepareDonutChartData();

  // Enhanced historical data with ROI tracking
  const performanceData = [
    {
      date: 'Jan',
      value: totalValue * 0.7,
      invested: totalInitialValue * 0.7,
      roi: (totalValue * 0.7 - totalInitialValue * 0.7) / (totalInitialValue * 0.7) * 100
    },
    {
      date: 'Feb',
      value: totalValue * 0.75,
      invested: totalInitialValue * 0.75,
      roi: (totalValue * 0.75 - totalInitialValue * 0.75) / (totalInitialValue * 0.75) * 100
    },
    {
      date: 'Mar',
      value: totalValue * 0.8,
      invested: totalInitialValue * 0.8,
      roi: (totalValue * 0.8 - totalInitialValue * 0.8) / (totalInitialValue * 0.8) * 100
    },
    {
      date: 'Apr',
      value: totalValue * 0.85,
      invested: totalInitialValue * 0.85,
      roi: (totalValue * 0.85 - totalInitialValue * 0.85) / (totalInitialValue * 0.85) * 100
    },
    {
      date: 'May',
      value: totalValue * 0.9,
      invested: totalInitialValue * 0.9,
      roi: (totalValue * 0.9 - totalInitialValue * 0.9) / (totalInitialValue * 0.9) * 100
    },
    {
      date: 'Jun',
      value: totalValue * 0.95,
      invested: totalInitialValue * 0.95,
      roi: (totalValue * 0.95 - totalInitialValue * 0.95) / (totalInitialValue * 0.95) * 100
    },
    {
      date: 'Jul',
      value: totalValue,
      invested: totalInitialValue,
      roi: totalGainLossPercent
    }
  ];

  // Sample depth chart data
  const depthData = portfolioData.map((item, index) => ({
    price: item.currentPrice * (0.95 + index * 0.02),
    buyVolume: Math.random() * 1000,
    sellVolume: Math.random() * 1000,
    symbol: item.symbol
  })).sort((a, b) => a.price - b.price);

  // Render the specific chart based on activeTab
  const renderChart = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center h-full">
            {/* Donut Chart */}
            <div className="relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={sortedData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {sortedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Value']}
                    labelFormatter={(label) => `${label}`}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="text-center">
                   <p className="text-stat-label">Total</p>
                   <p className="text-h5 font-bold">{formatCurrency(totalValue)}</p>
                 </div>
              </div>
            </div>
            
            {/* Custom Legend - Hidden on mobile */}
            {!isMobile && (
              <DonutChartLegend 
                topTokens={topTokens}
                overflowTokens={overflowTokens}
                totalValue={totalValue}
              />
            )}
          </div>
        );

      case "performance":
        return (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={value => formatCurrency(value)} />
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
        );

      case "distribution":
        return (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={portfolioData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {portfolioData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getCryptoColor(entry.symbol, index)} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        );

      case "comparison":
        return (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={portfolioData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="symbol" />
              <YAxis tickFormatter={value => formatCurrency(value)} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'value' ? 'Current Value' : 'Initial Investment'
                ]}
              />
               <Bar dataKey="value" fill="hsl(var(--primary))" name="Current Value" />
               <Bar dataKey="initialValue" fill="hsl(var(--secondary))" name="Initial Investment" />
            </BarChart>
          </ResponsiveContainer>
        );

      case "depth":
        return (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={depthData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="price" tickFormatter={value => `$${value.toFixed(2)}`} />
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
        );

      default:
        return (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={value => formatCurrency(value)} />
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
        );
    }
  };

  if (portfolioData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-primary/60" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Plus className="w-3 h-3 text-primary/70" />
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">No portfolio data yet</h3>
          <p className="text-sm text-muted-foreground max-w-[280px]">
            Start building your portfolio to see analytics and charts
          </p>
          <div className="pt-2">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add assets
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-auto h-full">
      {renderChart()}
    </div>
  );
}
