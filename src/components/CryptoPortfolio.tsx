import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCryptoData } from "@/hooks/useCryptoData";
import AddHoldingDialog from "@/components/crypto/AddHoldingDialog";
import PriceAlertsDialog from "@/components/crypto/PriceAlertsDialog";
import DataImportExport from "@/components/crypto/DataImportExport";
import CurrencySettings, { CurrencyRates } from "@/components/crypto/CurrencySettings";
import CryptoChart from "@/components/crypto/CryptoChart";

// Asset color mapping for consistent colored circles
const getAssetColor = (symbol: string) => {
  const colors = {
    'BTC': '#f7931a',
    'ETH': '#627eea',
    'USDC': '#2775ca',
    'USDT': '#26a17b',
    'TROG': '#7c3aed',
    'TRUMP': '#dc2626',
    'MATIC': '#8247e5',
    'GUA': '#65a30d',
    'RIO': '#1f2937',
    'INJ': '#0ea5e9',
    'WFI': '#fbbf24',
    'ADA': '#0033ad',
    'DOT': '#e6007a',
    'SOL': '#14f195',
    'LINK': '#375bd2',
    'UNI': '#ff007a',
    'AVAX': '#e84142',
    'ALGO': '#000000',
    'ATOM': '#6f7390',
    'XRP': '#23292f'
  };
  return colors[symbol] || '#6b7280';
};

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
    calculateTotalGainLoss,
    bulkAddHoldings
  } = useCryptoData();

  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState<CurrencyRates>({ USD: 1 });

  const formatCurrency = (amount: number) => {
    const convertedAmount = amount * (exchangeRates[selectedCurrency] || 1);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency
    }).format(convertedAmount);
  };

  const handleCurrencyChange = (currency: string, rates: CurrencyRates) => {
    setSelectedCurrency(currency);
    setExchangeRates(rates);
  };

  const handleImportHoldings = async (importedHoldings: any[]) => {
    try {
      await bulkAddHoldings(importedHoldings);
    } catch (error) {
      console.error('Error importing holdings:', error);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    }
    return num.toFixed(4);
  };

  const formatHoldings = (amount: number, symbol: string) => {
    return `${formatNumber(amount)} ${symbol}`;
  };

  const getHoldingCurrentValue = (holding: any) => {
    const currentPrice = prices[holding.symbol]?.price || 0;
    return currentPrice * holding.amount;
  };

  const getHoldingPercentChange = (holding: any) => {
    const currentPrice = prices[holding.symbol]?.price || 0;
    return prices[holding.symbol]?.price_change_24h || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading portfolio...</div>
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8 text-muted-foreground">
          <div className="space-y-4">
            <p>No crypto holdings yet</p>
            <p className="text-sm">Add your first cryptocurrency to start tracking your portfolio</p>
            <div className="flex justify-center gap-2">
              <AddHoldingDialog onAddHolding={addHolding} />
              <PriceAlertsDialog 
                holdings={holdings}
                alerts={alerts}
                onAddAlert={addAlert}
                onRefreshAlerts={fetchAlerts}
              />
              <DataImportExport 
                holdings={holdings}
                onImportHoldings={handleImportHoldings}
              />
              <CurrencySettings onCurrencyChange={handleCurrencyChange} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="portfolio" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-muted/20">
          <TabsTrigger value="portfolio" className="text-xs font-medium">PORTFOLIO</TabsTrigger>
          <TabsTrigger value="holdings" className="text-xs font-medium">HOLDINGS BY CHAIN</TabsTrigger>
          <TabsTrigger value="archive" className="text-xs font-medium">PORTFOLIO ARCHIVE</TabsTrigger>
          <TabsTrigger value="balances" className="text-xs font-medium">BALANCES HISTORY</TabsTrigger>
          <TabsTrigger value="token-balances" className="text-xs font-medium">TOKEN BALANCES HISTORY</TabsTrigger>
          <TabsTrigger value="profit-loss" className="text-xs font-medium">PROFIT & LOSS</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-background/95">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50">
                      <TableHead className="text-muted-foreground font-medium">ASSET</TableHead>
                      <TableHead className="text-muted-foreground font-medium">PRICE</TableHead>
                      <TableHead className="text-muted-foreground font-medium">HOLDINGS</TableHead>
                      <TableHead className="text-muted-foreground font-medium">VALUE</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holdings.map((holding) => {
                      const currentPrice = prices[holding.symbol]?.price || 0;
                      const currentValue = getHoldingCurrentValue(holding);
                      const percentChange = getHoldingPercentChange(holding);
                      const isPositive = percentChange >= 0;
                      const assetColor = getAssetColor(holding.symbol);
                      
                      return (
                        <TableRow key={holding.id} className="border-b border-border/30 hover:bg-muted/10">
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                style={{ backgroundColor: assetColor }}
                              >
                                {holding.symbol.charAt(0)}
                              </div>
                              <span className="font-medium text-foreground">{holding.symbol}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-foreground">{formatCurrency(currentPrice)}</span>
                              <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                {isPositive ? '+' : ''}{percentChange.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="text-foreground">{formatHoldings(holding.amount, holding.symbol)}</span>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-foreground">{formatCurrency(currentValue)}</span>
                              <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                {isPositive ? '+' : ''}{percentChange.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <div className="space-y-4">
              <CryptoChart holdings={holdings} prices={prices} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="holdings">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Holdings by Chain</h3>
              <p className="text-muted-foreground">Chain-specific holdings view coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archive">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Portfolio Archive</h3>
              <p className="text-muted-foreground">Historical portfolio snapshots coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balances">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Balances History</h3>
              <p className="text-muted-foreground">Balance history charts coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="token-balances">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Token Balances History</h3>
              <p className="text-muted-foreground">Token balance tracking coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit-loss">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Profit & Loss</h3>
              <p className="text-muted-foreground">P&L analysis coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <AddHoldingDialog onAddHolding={addHolding} />
        <PriceAlertsDialog 
          holdings={holdings}
          alerts={alerts}
          onAddAlert={addAlert}
          onRefreshAlerts={fetchAlerts}
        />
        <DataImportExport 
          holdings={holdings}
          onImportHoldings={handleImportHoldings}
        />
        <CurrencySettings onCurrencyChange={handleCurrencyChange} />
      </div>
    </div>
  );
}