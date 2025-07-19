import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Share, Bell, Plus, MoreHorizontal, Twitter, Link2, Settings } from "lucide-react";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import CryptoChart from "@/components/crypto/CryptoChart";
import AddHoldingDialog from "@/components/crypto/AddHoldingDialog";
import PriceAlertsDialog from "@/components/crypto/PriceAlertsDialog";
import ExchangeIntegration from "@/components/crypto/ExchangeIntegration";
import CurrencySettings, { CurrencyRates } from "@/components/crypto/CurrencySettings";
export default function CryptoPortfolio() {
  const {
    user
  } = useAuth();
  const {
    profile
  } = useProfile();
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
    lastPriceUpdate,
    bulkAddHoldings
  } = useCryptoData();
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState<CurrencyRates>({
    USD: 1
  });
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
  const calculatePercentageChange = (currentValue: number, originalValue: number) => {
    return (currentValue - originalValue) / originalValue * 100;
  };
  const getHoldingCurrentValue = (holding: any) => {
    const currentPrice = prices[holding.symbol]?.price || 0;
    return currentPrice * holding.amount;
  };
  const getHoldingGainLoss = (holding: any) => {
    const currentValue = getHoldingCurrentValue(holding);
    const originalValue = holding.purchase_price * holding.amount;
    return currentValue - originalValue;
  };
  const getHoldingPercentChange = (holding: any) => {
    const currentValue = getHoldingCurrentValue(holding);
    const originalValue = holding.purchase_price * holding.amount;
    return calculatePercentageChange(currentValue, originalValue);
  };
  if (loading) {
    return <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading portfolio...</div>
      </div>;
  }
  const portfolioValue = calculatePortfolioValue();
  const totalGainLoss = calculateTotalGainLoss();
  const isGain = totalGainLoss >= 0;
  const portfolioPercentChange = portfolioValue > 0 ? calculatePercentageChange(portfolioValue, portfolioValue - totalGainLoss) : 0;
  return <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mx-0 my-[32px] py-0 px-[2px]">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 lg:h-16 lg:w-16">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="text-sm lg:text-lg">
              {profile?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <h1 className="text-xl sm:text-2xl font-bold">
                {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : user?.email?.split('@')[0] || 'Portfolio'}
              </h1>
              <Badge variant="secondary" className="text-xs w-fit">
                Verified
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
              <span className="text-2xl lg:text-3xl font-bold">{formatCurrency(portfolioValue)}</span>
              <div className={`flex items-center gap-1 ${isGain ? 'text-green-500' : 'text-red-500'}`}>
                {isGain ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span className="text-sm font-medium">
                  {isGain ? '+' : ''}{portfolioPercentChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs lg:text-sm">
            <Bell className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Create Alert</span>
            <span className="sm:hidden">Alert</span>
          </Button>
          <Button variant="outline" size="sm" className="text-xs lg:text-sm">
            <Link2 className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Trace Entity</span>
            <span className="sm:hidden">Trace</span>
          </Button>
          <Button variant="outline" size="sm" className="text-xs lg:text-sm">
            <Share className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Share</span>
            <span className="sm:hidden">Share</span>
          </Button>
          <Button variant="outline" size="sm" className="text-xs lg:text-sm">
            <Twitter className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Tweet</span>
            <span className="sm:hidden">Tweet</span>
          </Button>
          <Button variant="outline" size="sm" className="text-xs lg:text-sm">
            <MoreHorizontal className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">MORE</span>
            <span className="sm:hidden">More</span>
          </Button>
        </div>
      </div>

      {/* Portfolio Tags */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Key Opinion Leader</Badge>
        <Badge variant="outline">Individual</Badge>
        <Badge variant="outline">High Transacting</Badge>
        <Badge variant="outline">Owner</Badge>
      </div>

      {holdings.length === 0 ? <Card>
          <CardContent className="text-center py-8 text-muted-foreground">
            <div className="space-y-4 mx-0 my-0 py-0 px-0">
              <p>No crypto holdings yet</p>
              <p className="text-sm">Add your first cryptocurrency to start tracking your portfolio</p>
              <AddHoldingDialog onAddHolding={addHolding} />
            </div>
          </CardContent>
        </Card> : <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1">
            <TabsTrigger value="portfolio" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">PORTFOLIO</span>
              <span className="sm:hidden">PORT</span>
            </TabsTrigger>
            <TabsTrigger value="holdings" className="text-xs sm:text-sm">
              <span className="hidden lg:inline">HOLDINGS BY CHAIN</span>
              <span className="lg:hidden">HOLDINGS</span>
            </TabsTrigger>
            <TabsTrigger value="archive" className="text-xs sm:text-sm">
              <span className="hidden lg:inline">PORTFOLIO ARCHIVE</span>
              <span className="lg:hidden">ARCHIVE</span>
            </TabsTrigger>
            <TabsTrigger value="balances" className="text-xs sm:text-sm">
              <span className="hidden lg:inline">BALANCES HISTORY</span>
              <span className="lg:hidden">BALANCES</span>
            </TabsTrigger>
            <TabsTrigger value="tokens" className="text-xs sm:text-sm">
              <span className="hidden lg:inline">TOKEN BALANCES HISTORY</span>
              <span className="lg:hidden">TOKENS</span>
            </TabsTrigger>
            <TabsTrigger value="profit" className="text-xs sm:text-sm">
              <span className="hidden lg:inline">PROFIT & LOSS</span>
              <span className="lg:hidden">P&L</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Portfolio Table */}
              <div className="xl:col-span-2">
                <Card>
                  <CardContent className="p-0 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-8 sm:w-12 text-xs sm:text-sm">#</TableHead>
                          <TableHead className="text-xs sm:text-sm">ASSET</TableHead>
                          <TableHead className="text-xs sm:text-sm hidden sm:table-cell">PRICE</TableHead>
                          <TableHead className="text-xs sm:text-sm">HOLDINGS</TableHead>
                          <TableHead className="text-xs sm:text-sm">VALUE</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {holdings.map((holding, index) => {
                      const currentPrice = prices[holding.symbol]?.price || 0;
                      const currentValue = getHoldingCurrentValue(holding);
                      const percentChange = getHoldingPercentChange(holding);
                      const isPositive = percentChange >= 0;
                      return <TableRow key={holding.id}>
                              <TableCell className="font-medium text-xs sm:text-sm">{index + 1}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="text-xs font-bold">
                                      {holding.symbol.charAt(0)}
                                    </span>
                                  </div>
                                  <span className="font-medium text-xs sm:text-sm">{holding.symbol}</span>
                                </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                  <span className="text-xs sm:text-sm">{formatCurrency(currentPrice)}</span>
                                  <span className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                    {isPositive ? '+' : ''}{percentChange.toFixed(1)}%
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-xs sm:text-sm">
                                  <div>{holding.amount.toFixed(4)}</div>
                                  <div className="text-xs text-muted-foreground sm:hidden">
                                    {formatCurrency(currentPrice)}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs sm:text-sm font-medium">{formatCurrency(currentValue)}</span>
                                  <span className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                    {isPositive ? '+' : ''}{percentChange.toFixed(1)}%
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>;
                    })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* Balance History Chart */}
              <div className="xl:col-span-1">
                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <h3 className="font-semibold mb-4 text-sm lg:text-base">BALANCES HISTORY</h3>
                    <div className="h-48 sm:h-64">
                      <CryptoChart holdings={holdings} prices={prices} />
                    </div>
                  </CardContent>
                </Card>
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
                <h3 className="font-semibold mb-4">Balance History</h3>
                <div className="h-96">
                  <CryptoChart holdings={holdings} prices={prices} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tokens">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Token Balance History</h3>
                <p className="text-muted-foreground">Individual token balance tracking coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profit">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Profit & Loss</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Gain/Loss:</span>
                    <span className={`font-bold ${isGain ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(Math.abs(totalGainLoss))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Percentage Change:</span>
                    <span className={`font-bold ${isGain ? 'text-green-500' : 'text-red-500'}`}>
                      {isGain ? '+' : ''}{portfolioPercentChange.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <AddHoldingDialog onAddHolding={addHolding} />
        <PriceAlertsDialog holdings={holdings} alerts={alerts} onAddAlert={addAlert} onRefreshAlerts={fetchAlerts} />
        <ExchangeIntegration onImportHoldings={handleImportHoldings} />
        <CurrencySettings onCurrencyChange={handleCurrencyChange} />
      </div>
    </div>;
}