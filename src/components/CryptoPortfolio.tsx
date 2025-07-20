import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Share, Bell, Plus, MoreHorizontal, Twitter, Link2 } from "lucide-react";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import CryptoChart from "@/components/crypto/CryptoChart";
import AddHoldingDialog from "@/components/crypto/AddHoldingDialog";
import PriceAlertsDialog from "@/components/crypto/PriceAlertsDialog";
import ExchangeIntegration from "@/components/crypto/ExchangeIntegration";
import CurrencySettings, { CurrencyRates } from "@/components/crypto/CurrencySettings";
import AdvancedSearch from "@/components/crypto/AdvancedSearch";
import AdvancedFilters, { FilterOptions } from "@/components/crypto/AdvancedFilters";
import AdvancedSorting, { SortOption } from "@/components/crypto/AdvancedSorting";
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
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('value');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [secondarySort, setSecondarySort] = useState<SortOption>();
  const [filters, setFilters] = useState<FilterOptions>({
    valueRange: {
      min: null,
      max: null
    },
    performance: 'all',
    walletType: [],
    dateRange: {
      from: null,
      to: null
    },
    amountRange: {
      min: null,
      max: null
    }
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

  // Get unique wallet types for filtering
  const walletTypes = useMemo(() => {
    const types = holdings.map(h => h.wallet_type).filter(Boolean).filter((type, index, arr) => arr.indexOf(type) === index);
    return types as string[];
  }, [holdings]);

  // Enhanced filtering and sorting logic
  const filteredAndSortedHoldings = useMemo(() => {
    let filtered = holdings.filter(holding => {
      // Search filter
      const matchesSearch = !searchTerm || holding.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || holding.name.toLowerCase().includes(searchTerm.toLowerCase()) || holding.wallet_type?.toLowerCase().includes(searchTerm.toLowerCase()) || holding.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      // Performance filter
      if (filters.performance !== 'all') {
        const percentChange = getHoldingPercentChange(holding);
        switch (filters.performance) {
          case 'gainers':
            if (percentChange <= 0) return false;
            break;
          case 'losers':
            if (percentChange >= 0) return false;
            break;
          case 'break_even':
            if (Math.abs(percentChange) > 5) return false; // Within 5% of break even
            break;
        }
      }

      // Value range filter
      if (filters.valueRange.min !== null || filters.valueRange.max !== null) {
        const currentValue = getHoldingCurrentValue(holding);
        if (filters.valueRange.min !== null && currentValue < filters.valueRange.min) return false;
        if (filters.valueRange.max !== null && currentValue > filters.valueRange.max) return false;
      }

      // Wallet type filter
      if (filters.walletType.length > 0) {
        if (!holding.wallet_type || !filters.walletType.includes(holding.wallet_type)) return false;
      }
      return true;
    });

    // Sort the filtered results
    return filtered.sort((a, b) => {
      const getSortValue = (holding: any, field: string) => {
        switch (field) {
          case 'value':
            return getHoldingCurrentValue(holding);
          case 'symbol':
            return holding.symbol;
          case 'name':
            return holding.name;
          case 'change':
            return getHoldingPercentChange(holding);
          case 'amount':
            return holding.amount;
          case 'purchase_price':
            return holding.purchase_price;
          case 'purchase_date':
            return new Date(holding.purchase_date).getTime();
          case 'gain_loss':
            return getHoldingGainLoss(holding);
          case 'gain_loss_percent':
            return getHoldingPercentChange(holding);
          default:
            return 0;
        }
      };

      // Primary sort
      const aValue = getSortValue(a, sortBy);
      const bValue = getSortValue(b, sortBy);
      let primaryComparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        primaryComparison = aValue.localeCompare(bValue);
      } else {
        primaryComparison = (aValue as number) - (bValue as number);
      }
      if (sortDirection === 'desc') {
        primaryComparison = -primaryComparison;
      }

      // Secondary sort if values are equal
      if (primaryComparison === 0 && secondarySort) {
        const aSecondary = getSortValue(a, secondarySort.field);
        const bSecondary = getSortValue(b, secondarySort.field);
        let secondaryComparison = 0;
        if (typeof aSecondary === 'string' && typeof bSecondary === 'string') {
          secondaryComparison = aSecondary.localeCompare(bSecondary);
        } else {
          secondaryComparison = (aSecondary as number) - (bSecondary as number);
        }
        if (secondarySort.direction === 'desc') {
          secondaryComparison = -secondaryComparison;
        }
        return secondaryComparison;
      }
      return primaryComparison;
    });
  }, [holdings, searchTerm, filters, sortBy, sortDirection, secondarySort, prices]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.performance !== 'all') count++;
    if (filters.valueRange.min !== null || filters.valueRange.max !== null) count++;
    if (filters.walletType.length > 0) count++;
    if (filters.dateRange.from !== null || filters.dateRange.to !== null) count++;
    if (filters.amountRange.min !== null || filters.amountRange.max !== null) count++;
    return count;
  }, [filters]);
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
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
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
            <div className="space-y-4">
              <p>No crypto holdings yet</p>
              <p className="text-sm">Add your first cryptocurrency to start tracking your portfolio</p>
              <AddHoldingDialog onAddHolding={addHolding} />
            </div>
          </CardContent>
        </Card> : <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1">
            <TabsTrigger value="portfolio" className="text-xs sm:text-sm px-0 my-0 mx-[33px]">
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
                  <CardContent className="p-4">
                    {/* Enhanced Search and Filter Controls */}
                    <div className="space-y-4 mb-6">
                      {/* Search */}
                      <AdvancedSearch holdings={holdings} onSearch={setSearchTerm} searchTerm={searchTerm} />
                      
                      {/* Filters and Sorting */}
                      <div className="flex flex-col lg:flex-row gap-4 lg:items-start">
                        <div className="flex-1">
                          <AdvancedFilters filters={filters} onFiltersChange={setFilters} walletTypes={walletTypes} activeFiltersCount={activeFiltersCount} />
                        </div>
                        
                        <div className="lg:w-auto">
                          <AdvancedSorting sortBy={sortBy} sortDirection={sortDirection} onSortChange={(field, direction) => {
                        setSortBy(field);
                        setSortDirection(direction);
                      }} secondarySort={secondarySort} onSecondarySortChange={setSecondarySort} />
                        </div>
                      </div>

                      {/* Results Count */}
                      {filteredAndSortedHoldings.length !== holdings.length && <div className="text-sm text-muted-foreground">
                          Showing {filteredAndSortedHoldings.length} of {holdings.length} assets
                        </div>}
                    </div>
                    
                    <div className="overflow-x-auto">
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
                        {filteredAndSortedHoldings.length === 0 ? <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No assets match your current filters
                            </TableCell>
                          </TableRow> : filteredAndSortedHoldings.map((holding, index) => {
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
                                        <div>
                                          <span className="font-medium text-xs sm:text-sm">{holding.symbol}</span>
                                          {holding.wallet_type && <div className="text-xs text-muted-foreground capitalize">
                                              {holding.wallet_type}
                                            </div>}
                                        </div>
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
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Balance History Chart */}
              <div className="xl:col-span-1">
                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <h3 className="font-semibold mb-4 text-sm lg:text-base">BALANCES HISTORY</h3>
                    <div className="h-48 sm:h-64 overflow-auto">
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
              <CardContent className="p-6 mx-0 py-0 my-0">
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
      <div className="flex flex-col sm:flex-row sm:justify-center gap-3 mt-8 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <AddHoldingDialog onAddHolding={addHolding} />
          <ExchangeIntegration onImportHoldings={handleImportHoldings} />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <PriceAlertsDialog holdings={holdings} alerts={alerts} onAddAlert={addAlert} onRefreshAlerts={fetchAlerts} />
          <CurrencySettings onCurrencyChange={handleCurrencyChange} />
        </div>
      </div>
    </div>;
}