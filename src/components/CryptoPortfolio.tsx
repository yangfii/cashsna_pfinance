import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Coins } from "lucide-react";
import { useCryptoData } from "@/hooks/useCryptoData";
import CryptoChart from "@/components/crypto/CryptoChart";
import AddHoldingDialog from "@/components/crypto/AddHoldingDialog";
import PriceAlertsDialog from "@/components/crypto/PriceAlertsDialog";
import HoldingsList from "@/components/crypto/HoldingsList";

export default function CryptoPortfolio() {
  const {
    holdings,
    prices,
    alerts,
    loading,
    addHolding,
    addAlert,
    fetchAlerts,
    calculatePortfolioValue,
    calculateTotalGainLoss
  } = useCryptoData();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Crypto Portfolio
          </CardTitle>
          <div className="flex gap-2">
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
          <div className="space-y-6">
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

            {/* Charts */}
            <CryptoChart holdings={holdings} prices={prices} />

            {/* Holdings List */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Your Holdings</h3>
              <HoldingsList holdings={holdings} prices={prices} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}