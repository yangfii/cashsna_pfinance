import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Share, Bell, Plus, MoreHorizontal, Twitter, Link2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();
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
  const [activeTab, setActiveTab] = useState('portfolio');
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
  return <div className="space-y-8 lg:space-y-10">
      {/* Profile Header - Enhanced spacing and responsive design */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8 p-1 sm:p-2">
        <div className="flex items-center gap-4 lg:gap-6">
          <Avatar className="h-14 w-14 lg:h-18 lg:w-18 xl:h-20 xl:w-20">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="text-lg lg:text-xl xl:text-2xl">
              {profile?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold">
                {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : user?.email?.split('@')[0] || 'Portfolio'}
              </h1>
              <Badge variant="secondary" className="text-xs px-2 py-1 inline-flex items-center gap-1.5 max-w-fit shrink-0">
                <img src="https://intel.arkm.com/arkham_check.svg" alt="Verified" className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">Verified</span>
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold">{formatCurrency(portfolioValue)}</span>
              <div className={`flex items-center gap-2 ${isGain ? 'text-green-500' : 'text-red-500'}`}>
                {isGain ? <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6" /> : <TrendingDown className="h-5 w-5 lg:h-6 lg:w-6" />}
                <span className="text-lg lg:text-xl font-semibold">
                  {isGain ? '+' : ''}{portfolioPercentChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced button layout with better spacing and wrapping */}
        <div className="flex flex-wrap items-center gap-3 lg:gap-4 w-full lg:w-auto">
          <div className="flex flex-wrap gap-2 sm:gap-3 flex-1 lg:flex-initial">
            <AddHoldingDialog onAddHolding={addHolding} />
            <ExchangeIntegration onImportHoldings={handleImportHoldings} />
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 flex-1 lg:flex-initial">
            <PriceAlertsDialog holdings={holdings} alerts={alerts} onAddAlert={addAlert} onRefreshAlerts={fetchAlerts} />
            <CurrencySettings onCurrencyChange={handleCurrencyChange} />
          </div>
        </div>
      </div>

      {holdings.length === 0 ? <Card className="mx-1 sm:mx-2">
          <CardContent className="text-center py-12 lg:py-16 text-muted-foreground">
            <div className="space-y-6">
              <p className="text-lg lg:text-xl">No crypto holdings yet</p>
              <p className="text-base lg:text-lg">Add your first cryptocurrency to start tracking your portfolio</p>
              <AddHoldingDialog onAddHolding={addHolding} />
            </div>
          </CardContent>
        </Card> : <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8 lg:space-y-10">
          {/* Enhanced tabs layout with better responsive behavior */}
          <div className="flex items-center gap-3 lg:gap-4 px-1 sm:px-2">
            {isMobile ? <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="flex-1 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portfolio">PORTFOLIO</SelectItem>
                  <SelectItem value="holdings">HOLDINGS BY CHAIN</SelectItem>
                  <SelectItem value="archive">PORTFOLIO ARCHIVE</SelectItem>
                  <SelectItem value="balances">BALANCES HISTORY</SelectItem>
                  <SelectItem value="tokens">TOKEN BALANCES HISTORY</SelectItem>
                  <SelectItem value="profit">PROFIT & LOSS</SelectItem>
                </SelectContent>
              </Select> : <>
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-3 flex-1 h-12 lg:h-14">
                  <TabsTrigger value="portfolio" className="text-xs sm:text-sm lg:text-base px-3 py-3 overflow-hidden">
                    <span className="hidden sm:inline truncate">PORTFOLIO</span>
                    <span className="sm:hidden truncate">PORT</span>
                  </TabsTrigger>
                  <TabsTrigger value="holdings" className="text-xs sm:text-sm lg:text-base px-3 py-3 overflow-hidden">
                    <span className="hidden lg:inline truncate">HOLDINGS BY CHAIN</span>
                    <span className="lg:hidden truncate">HOLDINGS</span>
                  </TabsTrigger>
                  <TabsTrigger value="archive" className="text-xs sm:text-sm lg:text-base px-3 py-3 overflow-hidden">
                    <span className="hidden lg:inline truncate">PORTFOLIO ARCHIVE</span>
                    <span className="lg:hidden truncate">ARCHIVE</span>
                  </TabsTrigger>
                  <TabsTrigger value="balances" className="text-xs sm:text-sm lg:text-base px-3 py-3 overflow-hidden">
                    <span className="hidden lg:inline truncate">BALANCES HISTORY</span>
                    <span className="lg:hidden truncate">BALANCES</span>
                  </TabsTrigger>
                  <TabsTrigger value="tokens" className="text-xs sm:text-sm lg:text-base px-3 py-3 overflow-hidden">
                    <span className="hidden lg:inline truncate">TOKEN BALANCES HISTORY</span>
                    <span className="lg:hidden truncate">TOKENS</span>
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-3">
                  <Button variant={activeTab === 'profit' ? 'default' : 'outline'} size="sm" className="text-xs lg:text-sm border rounded-md px-4 py-3 h-12 lg:h-14 whitespace-nowrap" onClick={() => setActiveTab('profit')}>
                    <span className="hidden lg:inline">PROFIT & LOSS</span>
                    <span className="lg:hidden">P&L</span>
                  </Button>
                </div>
              </>}
          </div>

          <TabsContent value="portfolio">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-10">
              {/* Portfolio Table - Enhanced spacing and responsive design */}
              <div className="xl:col-span-2">
                <Card className="mx-1 sm:mx-2">
                  <CardContent className="p-6 lg:p-8">
                    {/* Enhanced Search and Filter Controls */}
                    <div className="space-y-6 lg:space-y-8 mb-8 lg:mb-10">
                      {/* Search */}
                      <AdvancedSearch holdings={holdings} onSearch={setSearchTerm} searchTerm={searchTerm} />
                      
                      {/* Filters and Sorting */}
                      <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 xl:items-start">
                        <div className="flex-1">
                          <AdvancedFilters filters={filters} onFiltersChange={setFilters} walletTypes={walletTypes} activeFiltersCount={activeFiltersCount} />
                        </div>
                        
                        <div className="xl:w-auto">
                          <AdvancedSorting sortBy={sortBy} sortDirection={sortDirection} onSortChange={(field, direction) => {
                        setSortBy(field);
                        setSortDirection(direction);
                      }} secondarySort={secondarySort} onSecondarySortChange={setSecondarySort} />
                        </div>
                      </div>

                      {/* Results Count */}
                      {filteredAndSortedHoldings.length !== holdings.length && <div className="text-sm lg:text-base text-muted-foreground">
                          Showing {filteredAndSortedHoldings.length} of {holdings.length} assets
                        </div>}
                    </div>
                    
                    <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-8 sm:w-12 text-xs sm:text-sm lg:text-base">#</TableHead>
                          <TableHead className="text-xs sm:text-sm lg:text-base">ASSET</TableHead>
                          <TableHead className="text-xs sm:text-sm lg:text-base hidden sm:table-cell">PRICE</TableHead>
                          <TableHead className="text-xs sm:text-sm lg:text-base">HOLDINGS</TableHead>
                          <TableHead className="text-xs sm:text-sm lg:text-base">VALUE</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAndSortedHoldings.length === 0 ? <TableRow>
                            <TableCell colSpan={5} className="text-center py-12 lg:py-16 text-muted-foreground text-base lg:text-lg">
                              No assets match your current filters
                            </TableCell>
                          </TableRow> : filteredAndSortedHoldings.map((holding, index) => {
                        const currentPrice = prices[holding.symbol]?.price || 0;
                        const currentValue = getHoldingCurrentValue(holding);
                        const percentChange = getHoldingPercentChange(holding);
                        const isPositive = percentChange >= 0;
                        return <TableRow key={holding.id} className="hover:bg-muted/30">
                                <TableCell className="font-medium text-xs sm:text-sm lg:text-base py-4 lg:py-6">{index + 1}</TableCell>
                                <TableCell className="py-4 lg:py-6">
                                  <div className="flex items-center gap-2 lg:gap-3">
                                    <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                      <span className="text-xs lg:text-sm font-bold">
                                        {holding.symbol.charAt(0)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-sm lg:text-base">{holding.symbol}</span>
                                      {holding.wallet_type && <div className="text-xs lg:text-sm text-muted-foreground/80 capitalize">
                                          {holding.wallet_type}
                                        </div>}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell py-4 lg:py-6">
                                  <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-2">
                                    <span className="text-sm lg:text-base">{formatCurrency(currentPrice)}</span>
                                    <span className={`text-xs lg:text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                      {isPositive ? '+' : ''}{percentChange.toFixed(1)}%
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 lg:py-6">
                                  <div className="text-sm lg:text-base">
                                    <div>{holding.amount.toFixed(4)}</div>
                                    <div className="text-xs lg:text-sm text-muted-foreground/80 sm:hidden">
                                      {formatCurrency(currentPrice)}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 lg:py-6">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-sm lg:text-base font-medium">{formatCurrency(currentValue)}</span>
                                    <span className={`text-xs lg:text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
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
                <Card className="mx-1 sm:mx-2">
                  <CardContent className="p-2 lg:p-3 py-0">
                    <h3 className="font-semibold mb-6 text-lg lg:text-xl">Balance History</h3>
                    <div className="h-64 lg:h-80">
                      <CryptoChart holdings={holdings} prices={prices} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="holdings">
            <Card className="mx-1 sm:mx-2">
              <CardContent className="p-8 lg:p-10">
                <h3 className="font-semibold mb-6 text-lg lg:text-xl">Holdings by Chain</h3>
                <p className="text-muted-foreground/80 text-base lg:text-lg">Chain-specific holdings view coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="archive">
            <Card className="mx-1 sm:mx-2">
              <CardContent className="p-8 lg:p-10">
                <h3 className="font-semibold mb-6 text-lg lg:text-xl">Portfolio Archive</h3>
                <p className="text-muted-foreground/80 text-base lg:text-lg">Historical portfolio snapshots coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="balances">
            <Card className="mx-1 sm:mx-2">
              <CardContent className="p-8 lg:p-10">
                <h3 className="font-semibold mb-6 text-lg lg:text-xl">Balance History</h3>
                <div className="h-96 lg:h-[500px]">
                  <CryptoChart holdings={holdings} prices={prices} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tokens">
            <Card className="mx-1 sm:mx-2">
              <CardContent className="p-8 lg:p-10">
                <h3 className="font-semibold mb-6 text-lg lg:text-xl">Token Balance History</h3>
                <p className="text-muted-foreground/80 text-base lg:text-lg">Individual token balance tracking coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profit">
            <Card className="mx-1 sm:mx-2">
              <CardContent className="p-8 lg:p-10 py-0">
                <h3 className="font-semibold mb-6 text-lg lg:text-xl">Profit & Loss</h3>
                <div className="space-y-6 lg:space-y-8">
                  <div className="flex justify-between items-center py-4 lg:py-6 border-b">
                    <span className="text-base lg:text-lg">Total Gain/Loss:</span>
                    <span className={`font-bold text-lg lg:text-xl ${isGain ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(Math.abs(totalGainLoss))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-4 lg:py-6">
                    <span className="text-base lg:text-lg">Percentage Change:</span>
                    <span className={`font-bold text-lg lg:text-xl ${isGain ? 'text-green-500' : 'text-red-500'}`}>
                      {isGain ? '+' : ''}{portfolioPercentChange.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>}
    </div>;
}