import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  Target, 
  PieChart,
  DollarSign,
  Percent
} from "lucide-react";

interface PortfolioAnalyticsProps {
  metrics: {
    totalValue: number;
    totalGainLoss: number;
    roi: number;
    holdingMetrics: any[];
    lastUpdate: Date | null;
    updateCount: number;
  };
  topPerformers: any[];
  worstPerformers: any[];
}

export default function PortfolioAnalytics({ 
  metrics, 
  topPerformers, 
  worstPerformers 
}: PortfolioAnalyticsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const totalInvested = metrics.holdingMetrics.reduce((sum, holding) => sum + holding.purchaseValue, 0);
  const profitableHoldings = metrics.holdingMetrics.filter(h => h.gainLoss > 0).length;
  const totalHoldings = metrics.holdingMetrics.length;

  return (
    <div className="space-y-6">
      {/* Real-time Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Portfolio Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Last Update: {formatTimeAgo(metrics.lastUpdate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Updates: {metrics.updateCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm">Live Feed Active</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalValue)}</p>
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
                <p className={`text-2xl font-bold ${metrics.totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(metrics.totalGainLoss)}
                </p>
              </div>
              {metrics.totalGainLoss >= 0 ? (
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
                <p className="text-sm text-muted-foreground">ROI</p>
                <p className={`text-2xl font-bold ${metrics.roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatPercent(metrics.roi)}
                </p>
              </div>
              <Percent className={`h-8 w-8 ${metrics.roi >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold">{formatPercent(totalHoldings > 0 ? (profitableHoldings / totalHoldings) * 100 : 0)}</p>
              </div>
              <PieChart className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investment Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Invested</span>
                <span className="text-sm font-medium">{formatCurrency(totalInvested)}</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Current Value</span>
                <span className="text-sm font-medium">{formatCurrency(metrics.totalValue)}</span>
              </div>
              <Progress 
                value={totalInvested > 0 ? (metrics.totalValue / totalInvested) * 100 : 0} 
                className="h-2" 
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Profitable Holdings</span>
                <span className="text-sm font-medium">{profitableHoldings}/{totalHoldings}</span>
              </div>
              <Progress 
                value={totalHoldings > 0 ? (profitableHoldings / totalHoldings) * 100 : 0} 
                className="h-2" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top & Worst Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((holding, index) => (
                <div key={holding.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-constructive rounded-full flex items-center justify-center text-constructive-foreground font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{holding.symbol.toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">{holding.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-green-600">
                      +{formatPercent(holding.gainLossPercent)}
                    </Badge>
                    <p className="text-sm text-green-600 mt-1">
                      +{formatCurrency(holding.gainLoss)}
                    </p>
                  </div>
                </div>
              ))}
              {topPerformers.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No profitable holdings yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Worst Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {worstPerformers.map((holding, index) => (
                <div key={holding.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{holding.symbol.toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">{holding.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive" className="text-red-600">
                      {formatPercent(holding.gainLossPercent)}
                    </Badge>
                    <p className="text-sm text-red-600 mt-1">
                      {formatCurrency(holding.gainLoss)}
                    </p>
                  </div>
                </div>
              ))}
              {worstPerformers.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No losing holdings</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset Allocation */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.holdingMetrics.map((holding, index) => (
              <div key={holding.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{holding.symbol.toUpperCase()}</span>
                    <span className="text-sm text-muted-foreground">{holding.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">{formatPercent(holding.allocation)}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {formatCurrency(holding.currentValue)}
                    </span>
                  </div>
                </div>
                <Progress 
                  value={holding.allocation} 
                  className="h-2" 
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}