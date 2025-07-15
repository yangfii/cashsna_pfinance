import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Coins } from "lucide-react";
import { useCryptoData } from "@/hooks/useCryptoData";
import CryptoChart from "@/components/crypto/CryptoChart";
import AddHoldingDialog from "@/components/crypto/AddHoldingDialog";
import PriceAlertsDialog from "@/components/crypto/PriceAlertsDialog";
import HoldingsList from "@/components/crypto/HoldingsList";
import WalletConnectionDialog from "@/components/crypto/WalletConnectionDialog";
import PriceMonitor from "@/components/crypto/PriceMonitor";
import AdvancedAlerts from "@/components/crypto/AdvancedAlerts";
import NotificationSettings from "@/components/crypto/NotificationSettings";
import PortfolioAnalytics from "@/components/crypto/PortfolioAnalytics";
import RealTimePriceMonitor from "@/components/crypto/RealTimePriceMonitor";

export default function CryptoPortfolio() {
  const {
    holdings,
    prices,
    alerts,
    loading,
    addHolding,
    deleteHolding,
    addAlert,
    fetchAlerts,
    fetchCryptoPrices,
    calculatePortfolioValue,
    calculateTotalGainLoss,
    calculatePortfolioMetrics,
    getTopPerformers,
    getWorstPerformers,
    lastPriceUpdate,
    priceUpdateCount
  } = useCryptoData();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleWalletConnection = (connection: { type: string; apiKey?: string; address?: string }) => {
    // In a real implementation, this would:
    // 1. Store the connection details securely
    // 2. Fetch holdings from the connected wallet/exchange
    // 3. Add them to the user's portfolio
    console.log('Wallet connection:', connection);
    
    // For demo purposes, we'll show a success message
    // In production, you'd integrate with exchange APIs or blockchain data
  };

  const handleAdvancedAlert = (alert: any) => {
    // Convert advanced alert to basic alert format for now
    // In production, you'd store the full alert configuration
    const basicAlert = {
      symbol: alert.symbol,
      name: alert.name,
      alert_type: 'price_above' as const,
      target_value: alert.conditions[0]?.value || 0,
      is_active: alert.isActive
    };
    
    addAlert(basicAlert);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Crypto Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Loading portfolio...</div>
        </CardContent>
      </Card>
    );
  }

  const portfolioValue = calculatePortfolioValue();
  const totalGainLoss = calculateTotalGainLoss();
  const isGain = totalGainLoss >= 0;
  const portfolioMetrics = calculatePortfolioMetrics();
  const topPerformers = getTopPerformers();
  const worstPerformers = getWorstPerformers();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Crypto Portfolio
          </CardTitle>
          <div className="flex gap-2">
            <WalletConnectionDialog onConnect={handleWalletConnection} />
            <PriceAlertsDialog 
              holdings={holdings}
              alerts={alerts}
              onAddAlert={addAlert}
              onRefreshAlerts={fetchAlerts}
            />
            <AddHoldingDialog onAddHolding={addHolding} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {holdings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No crypto holdings yet</p>
            <p className="text-sm">Add your first cryptocurrency to start tracking your portfolio</p>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="realtime">Real-time</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="holdings">Holdings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Portfolio Summary */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(portfolioValue)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Gain/Loss</p>
                  <div className="flex items-center gap-1">
                    {isGain ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <p className={`text-2xl font-bold ${isGain ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(Math.abs(totalGainLoss))}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <PriceMonitor 
                  prices={prices} 
                  onRefresh={fetchCryptoPrices}
                  lastUpdate={lastPriceUpdate}
                />
                <AdvancedAlerts 
                  holdings={holdings}
                  onCreateAlert={handleAdvancedAlert}
                />
                <NotificationSettings />
              </div>

              {/* Quick Charts */}
              <CryptoChart holdings={holdings} prices={prices} />
            </TabsContent>

            <TabsContent value="analytics">
              <PortfolioAnalytics 
                metrics={portfolioMetrics}
                topPerformers={topPerformers}
                worstPerformers={worstPerformers}
              />
            </TabsContent>

            <TabsContent value="realtime">
              <RealTimePriceMonitor
                prices={prices}
                holdings={holdings}
                onRefresh={fetchCryptoPrices}
                lastUpdate={lastPriceUpdate}
                updateCount={priceUpdateCount}
              />
            </TabsContent>

            <TabsContent value="charts">
              <CryptoChart holdings={holdings} prices={prices} />
            </TabsContent>

            <TabsContent value="holdings">
              <div>
                <h3 className="text-lg font-semibold mb-4">Your Holdings</h3>
                <HoldingsList holdings={holdings} prices={prices} onDeleteHolding={deleteHolding} />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}