import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Activity, RefreshCw } from "lucide-react";
import { CryptoPrice } from "@/hooks/useCryptoData";

interface PriceMonitorProps {
  prices: Record<string, CryptoPrice>;
  watchlist?: string[];
  onRefresh: () => void;
  lastUpdate?: Date | null;
}

export default function PriceMonitor({ prices, watchlist = [], onRefresh, lastUpdate }: PriceMonitorProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price > 1 ? 2 : 6
    }).format(price);
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-500";
    if (change < 0) return "text-red-500";
    return "text-muted-foreground";
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const priceData = Object.values(prices);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Prices
          </CardTitle>
          <div className="flex items-center gap-2">
            {lastUpdate && (
              <span className="text-sm text-muted-foreground">
                Updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {priceData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No price data available</p>
            <p className="text-sm">Add some crypto holdings to see prices</p>
          </div>
        ) : (
          <div className="space-y-3">
            {priceData.map((priceInfo) => (
              <div key={priceInfo.symbol} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium capitalize">{priceInfo.symbol}</div>
                    <div className="text-sm text-muted-foreground uppercase">{priceInfo.symbol}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatPrice(priceInfo.price)}</div>
                  <div className={`flex items-center gap-1 text-sm ${getChangeColor(priceInfo.price_change_24h)}`}>
                    {getChangeIcon(priceInfo.price_change_24h)}
                    {Math.abs(priceInfo.price_change_24h).toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span>Prices update every 1 minute automatically</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}