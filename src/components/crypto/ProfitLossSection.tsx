import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, TrendingUp, TrendingDown, Clock, Target, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ProfitLossSectionProps {
  holdings: any[];
  prices: any[];
  isLoading: boolean;
  formatCurrency: (amount: number) => string;
  totalValue: number;
  totalGainLoss: number;
  roi: number;
  onRefresh: () => Promise<void>;
  lastUpdate: Date | null;
  connectionStatus: string;
}

export default function ProfitLossSection({
  holdings,
  prices,
  isLoading,
  formatCurrency,
  totalValue,
  totalGainLoss,
  roi,
  onRefresh,
  lastUpdate,
  connectionStatus
}: ProfitLossSectionProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
      toast({
        title: "Portfolio Updated",
        description: "Your P&L data has been refreshed successfully!",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Unable to update portfolio data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, toast]);

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return "Never updated";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return format(date, "MMM dd, HH:mm");
  };

  const getConnectionStatus = () => {
    const statusConfig = {
      connected: { color: "bg-green-500", text: "Live" },
      connecting: { color: "bg-yellow-500", text: "Syncing" },
      disconnected: { color: "bg-red-500", text: "Offline" }
    };
    return statusConfig[connectionStatus as keyof typeof statusConfig] || statusConfig.disconnected;
  };

  // Calculate individual holding metrics
  const holdingMetrics = holdings.map(holding => {
    const price = prices.find(p => p.symbol === holding.symbol);
    const currentValue = holding.amount * (price?.price || 0);
    const investedValue = holding.amount * holding.purchase_price;
    const gainLoss = currentValue - investedValue;
    const gainLossPercent = investedValue > 0 ? (gainLoss / investedValue) * 100 : 0;
    
    return {
      ...holding,
      currentValue,
      investedValue,
      gainLoss,
      gainLossPercent,
      currentPrice: price?.price || 0,
      priceChange24h: price?.price_change_24h || 0
    };
  }).sort((a, b) => b.gainLoss - a.gainLoss);

  const topPerformers = holdingMetrics.filter(h => h.gainLoss > 0).slice(0, 3);
  const worstPerformers = holdingMetrics.filter(h => h.gainLoss < 0).slice(-3).reverse();
  
  const totalInvested = holdingMetrics.reduce((sum, h) => sum + h.investedValue, 0);
  const winRate = holdingMetrics.length > 0 ? 
    (holdingMetrics.filter(h => h.gainLoss > 0).length / holdingMetrics.length) * 100 : 0;

  const isGain = totalGainLoss >= 0;
  const status = getConnectionStatus();

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-semibold text-lg lg:text-xl">Profit & Loss Analysis</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${status.color}`} />
            <span className="text-sm text-muted-foreground">
              {status.text} • {formatTimeAgo(lastUpdate)}
            </span>
          </div>
        </div>
        
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing || isLoading}
          size="sm"
          className="w-full sm:w-auto"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh P&L'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total P&L</p>
                <p className={`text-2xl font-bold ${isGain ? 'text-green-500' : 'text-red-500'}`}>
                  {isGain ? '+' : ''}{formatCurrency(Math.abs(totalGainLoss))}
                </p>
              </div>
              {isGain ? 
                <TrendingUp className="h-8 w-8 text-green-500" /> : 
                <TrendingDown className="h-8 w-8 text-red-500" />
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ROI</p>
                <p className={`text-2xl font-bold ${isGain ? 'text-green-500' : 'text-red-500'}`}>
                  {isGain ? '+' : ''}{roi.toFixed(2)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold text-primary">
                  {winRate.toFixed(1)}%
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Portfolio Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalValue)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analysis */}
      {holdingMetrics.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          {topPerformers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-500">
                  <TrendingUp className="h-5 w-5" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topPerformers.map((holding, index) => (
                  <div key={holding.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{holding.symbol}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(holding.investedValue)} invested
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-500">
                        +{formatCurrency(holding.gainLoss)}
                      </p>
                      <p className="text-sm text-green-500">
                        +{holding.gainLossPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Worst Performers */}
          {worstPerformers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <TrendingDown className="h-5 w-5" />
                  Worst Performers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {worstPerformers.map((holding, index) => (
                  <div key={holding.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{holding.symbol}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(holding.investedValue)} invested
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-500">
                        {formatCurrency(holding.gainLoss)}
                      </p>
                      <p className="text-sm text-red-500">
                        {holding.gainLossPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Detailed Holdings Breakdown */}
      {holdingMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Holdings Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {holdingMetrics.map((holding) => {
                const valuePercentage = totalValue > 0 ? (holding.currentValue / totalValue) * 100 : 0;
                const isPositive = holding.gainLoss >= 0;
                
                return (
                  <div key={holding.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{holding.symbol}</span>
                        <Badge variant="outline" className="text-xs">
                          {holding.amount.toFixed(4)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(holding.currentValue)}
                        </p>
                        <p className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                          {isPositive ? '+' : ''}{formatCurrency(holding.gainLoss)} 
                          ({isPositive ? '+' : ''}{holding.gainLossPercent.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={valuePercentage} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground w-12">
                        {valuePercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {holdingMetrics.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              No holdings found. Add some crypto holdings to see your P&L analysis.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}