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
  prices: CryptoPrice;
}
export default function CryptoChart({
  holdings,
  prices
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
    const currentPrice = prices[holding.symbol.toLowerCase()]?.usd || 0;
    const priceChange24h = prices[holding.symbol.toLowerCase()]?.usd_24h_change || 0;
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
      priceData: prices[holding.symbol.toLowerCase()]
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
  const cryptoColorPalette = ['#F7931A',
  // Bitcoin Orange
  '#627EEA',
  // Ethereum Blue  
  '#0033AD',
  // Cardano Blue
  '#9945FF',
  // Solana Purple
  '#E6007A',
  // Polkadot Pink
  '#00D4AA',
  // Tether Green
  '#F3BA2F',
  // Binance Coin Yellow
  '#26A17B',
  // USDC Green
  '#FF6B35',
  // Additional Orange
  '#8B5CF6',
  // Additional Purple
  '#06B6D4',
  // Additional Cyan
  '#F59E0B' // Additional Amber
  ];

  // Function to get professional color for crypto
  const getCryptoColor = (symbol: string, index: number) => {
    const symbolLower = symbol.toLowerCase();

    // Assign brand-specific colors for known cryptocurrencies
    const cryptoColors: Record<string, string> = {
      'btc': '#F7931A',
      // Bitcoin Orange
      'bitcoin': '#F7931A',
      'eth': '#627EEA',
      // Ethereum Blue
      'ethereum': '#627EEA',
      'ada': '#0033AD',
      // Cardano Blue
      'cardano': '#0033AD',
      'sol': '#9945FF',
      // Solana Purple
      'solana': '#9945FF',
      'dot': '#E6007A',
      // Polkadot Pink
      'polkadot': '#E6007A',
      'usdt': '#00D4AA',
      // Tether Green
      'tether': '#00D4AA',
      'bnb': '#F3BA2F',
      // Binance Coin Yellow
      'binance': '#F3BA2F',
      'usdc': '#26A17B',
      // USDC Green
      'xrp': '#23292F',
      // XRP Black
      'ripple': '#23292F',
      'matic': '#8247E5',
      // Polygon Purple
      'polygon': '#8247E5',
      'avax': '#E84142',
      // Avalanche Red
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
      percent: totalValue > 0 ? item.value / totalValue * 100 : 0,
      color: getCryptoColor(item.symbol, index)
    }));

    // Split into top 5 and overflow
    const topTokens = dataWithPercent.slice(0, 5);
    const overflowTokens = dataWithPercent.slice(5);
    return {
      topTokens,
      overflowTokens,
      sortedData: dataWithPercent
    };
  };
  const {
    topTokens,
    overflowTokens,
    sortedData
  } = prepareDonutChartData();

  // Enhanced historical data with ROI tracking
  const performanceData = [{
    date: 'Jan',
    value: totalValue * 0.7,
    invested: totalInitialValue * 0.7,
    roi: (totalValue * 0.7 - totalInitialValue * 0.7) / (totalInitialValue * 0.7) * 100
  }, {
    date: 'Feb',
    value: totalValue * 0.75,
    invested: totalInitialValue * 0.75,
    roi: (totalValue * 0.75 - totalInitialValue * 0.75) / (totalInitialValue * 0.75) * 100
  }, {
    date: 'Mar',
    value: totalValue * 0.8,
    invested: totalInitialValue * 0.8,
    roi: (totalValue * 0.8 - totalInitialValue * 0.8) / (totalInitialValue * 0.8) * 100
  }, {
    date: 'Apr',
    value: totalValue * 0.85,
    invested: totalInitialValue * 0.85,
    roi: (totalValue * 0.85 - totalInitialValue * 0.85) / (totalInitialValue * 0.85) * 100
  }, {
    date: 'May',
    value: totalValue * 0.9,
    invested: totalInitialValue * 0.9,
    roi: (totalValue * 0.9 - totalInitialValue * 0.9) / (totalInitialValue * 0.9) * 100
  }, {
    date: 'Jun',
    value: totalValue * 0.95,
    invested: totalInitialValue * 0.95,
    roi: (totalValue * 0.95 - totalInitialValue * 0.95) / (totalInitialValue * 0.95) * 100
  }, {
    date: 'Jul',
    value: totalValue,
    invested: totalInitialValue,
    roi: totalGainLossPercent
  }];

  // Sample depth chart data
  const depthData = portfolioData.map((item, index) => ({
    price: item.currentPrice * (0.95 + index * 0.02),
    buyVolume: Math.random() * 1000,
    sellVolume: Math.random() * 1000,
    symbol: item.symbol
  })).sort((a, b) => a.price - b.price);
  return <div className="space-y-6 overflow-auto">
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
              {totalGainLoss >= 0 ? <TrendingUp className="h-8 w-8 text-green-500" /> : <TrendingDown className="h-8 w-8 text-red-500" />}
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
                <span className="text-sm font-semibold text-primary">{holdings.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      
    </div>;
}