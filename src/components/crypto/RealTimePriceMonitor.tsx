import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  Wifi,
  WifiOff
} from "lucide-react";
import { CryptoPrice } from "@/hooks/useCryptoData";

interface RealTimePriceMonitorProps {
  prices: CryptoPrice;
  holdings: any[];
  onRefresh: () => void;
  lastUpdate: Date | null;
  updateCount: number;
}

export default function RealTimePriceMonitor({ 
  prices, 
  holdings, 
  onRefresh, 
  lastUpdate, 
  updateCount 
}: RealTimePriceMonitorProps) {
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
    return `${Math.floor(diffSeconds / 3600)}h ago`;
  };

  const isRecentUpdate = lastUpdate && (new Date().getTime() - lastUpdate.getTime()) < 30000;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-Time Prices
          </CardTitle>
          <div className="flex items-center gap-2">
            {isRecentUpdate ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              className="gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Status Bar */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Last: {formatTimeAgo(lastUpdate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRecentUpdate ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-sm">Updates: {updateCount}</span>
            </div>
          </div>
          <Badge variant={isRecentUpdate ? "default" : "secondary"}>
            {isRecentUpdate ? "Live" : "Offline"}
          </Badge>
        </div>

        {/* Price List */}
        <div className="space-y-2">
          {holdings.map((holding) => {
            const priceData = prices[holding.symbol.toLowerCase()];
            const currentPrice = priceData?.usd || 0;
            const change24h = priceData?.usd_24h_change || 0;
            const isPositive = change24h >= 0;

            return (
              <div key={holding.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="font-bold text-sm">{holding.symbol.toUpperCase().slice(0, 2)}</span>
                  </div>
                  <div>
                    <p className="font-medium">{holding.symbol.toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">{holding.name}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{formatCurrency(currentPrice)}</span>
                    {isPositive ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {isPositive ? '+' : ''}{formatPercent(change24h)}
                    </span>
                    <span className="text-xs text-muted-foreground">24h</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {holdings.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No holdings to monitor</p>
            <p className="text-sm">Add some crypto holdings to see real-time prices</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}