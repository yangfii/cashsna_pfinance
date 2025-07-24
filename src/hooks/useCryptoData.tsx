import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface CryptoHolding {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  purchase_price: number;
  purchase_date: string;
  notes?: string;
  wallet_address?: string;
  wallet_type?: string;
}

export interface CryptoPrice {
  [key: string]: {
    price: number;
    price_change_24h: number;
    volume_24h?: number;
    market_cap?: number;
    last_updated?: string;
    // Backward compatibility
    usd: number;
    usd_24h_change: number;
    usd_24h_vol?: number;
    usd_market_cap?: number;
  };
}

export interface CryptoAlert {
  id: string;
  symbol: string;
  name: string;
  alert_type: 'price_above' | 'price_below' | 'percent_change';
  target_value: number;
  is_active: boolean;
  is_triggered: boolean;
}

export interface PortfolioSnapshot {
  id: string;
  user_id: string;
  date: string;
  total_value: number;
  total_invested: number;
  total_gain_loss: number;
  roi_percentage: number;
  holdings_count: number;
  created_at: string;
  updated_at: string;
}

export const useCryptoData = () => {
  const [holdings, setHoldings] = useState<CryptoHolding[]>([]);
  const [prices, setPrices] = useState<Record<string, any>>({});
  const [alerts, setAlerts] = useState<CryptoAlert[]>([]);
  const [portfolioSnapshots, setPortfolioSnapshots] = useState<PortfolioSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceUpdateCount, setPriceUpdateCount] = useState(0);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Debounced price update function
  const debouncedPriceUpdate = useCallback(
    debounce((newPrice: any) => {
      console.log('Updating price for:', newPrice.symbol, newPrice.price);
      
      setPrices(prev => ({
        ...prev,
        [newPrice.symbol]: {
          price: parseFloat(newPrice.price?.toString() || '0'),
          price_change_24h: newPrice.price_change_24h ? parseFloat(newPrice.price_change_24h.toString()) : 0,
          volume_24h: newPrice.volume_24h ? parseFloat(newPrice.volume_24h.toString()) : 0,
          market_cap: newPrice.market_cap ? parseFloat(newPrice.market_cap.toString()) : 0,
          last_updated: newPrice.last_updated || new Date().toISOString(),
          // Backward compatibility
          usd: parseFloat(newPrice.price?.toString() || '0'),
          usd_24h_change: newPrice.price_change_24h ? parseFloat(newPrice.price_change_24h.toString()) : 0,
          usd_24h_vol: newPrice.volume_24h ? parseFloat(newPrice.volume_24h.toString()) : 0,
          usd_market_cap: newPrice.market_cap ? parseFloat(newPrice.market_cap.toString()) : 0
        }
      }));
      
      setLastPriceUpdate(new Date());
      setPriceUpdateCount(prev => prev + 1);
    }, 100),
    []
  );

  // Enhanced real-time subscription with reconnection logic
  useEffect(() => {
    if (!user) return;

    let channel: any;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const setupRealtimeSubscription = () => {
      try {
        setConnectionStatus('reconnecting');
        channel = supabase
          .channel('crypto-prices-changes')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'crypto_prices'
            },
            (payload) => {
              console.log('New crypto price received:', payload);
              setConnectionStatus('connected');
              debouncedPriceUpdate(payload.new);
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'crypto_prices'
            },
            (payload) => {
              console.log('Updated crypto price received:', payload);
              setConnectionStatus('connected');
              debouncedPriceUpdate(payload.new);
            }
          )
          .subscribe((status) => {
            console.log('Realtime subscription status:', status);
            if (status === 'SUBSCRIBED') {
              setConnectionStatus('connected');
              reconnectAttempts = 0;
            } else if (status === 'CLOSED') {
              setConnectionStatus('disconnected');
              if (reconnectAttempts < maxReconnectAttempts) {
                reconnectAttempts++;
                const delay = Math.min(2000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff
                setTimeout(() => setupRealtimeSubscription(), delay);
              }
            }
          });
      } catch (error) {
        console.error('Error setting up realtime subscription:', error);
        setConnectionStatus('disconnected');
      }
    };

    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, debouncedPriceUpdate]);

  // Fetch crypto holdings
  const fetchHoldings = useCallback(async () => {
    if (!user) return;

    try {
      console.log('Fetching holdings...');
      const { data, error } = await supabase
        .from('crypto_holdings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching holdings:', error);
        toast({
          title: "Error",
          description: "Failed to fetch your holdings",
          variant: "destructive"
        });
        return;
      }

      console.log('Holdings fetched:', data?.length || 0);
      setHoldings(data || []);
    } catch (error) {
      console.error('Exception fetching holdings:', error);
    }
  }, [user, toast]);

  // Fetch crypto prices with better error handling and retry logic
  const fetchPrices = useCallback(async () => {
    try {
      console.log('Fetching crypto prices...');
      const { data, error } = await supabase
        .from('crypto_prices')
        .select('*')
        .order('last_updated', { ascending: false });

      if (error) {
        console.error('Error fetching prices:', error);
        return;
      }

      console.log('Prices fetched:', data?.length || 0);
      
      // Convert to the format expected by components
      const pricesMap: Record<string, any> = {};
      data?.forEach(price => {
        pricesMap[price.symbol] = {
          price: parseFloat(price.price?.toString() || '0'),
          price_change_24h: price.price_change_24h ? parseFloat(price.price_change_24h.toString()) : 0,
          volume_24h: price.volume_24h ? parseFloat(price.volume_24h.toString()) : 0,
          market_cap: price.market_cap ? parseFloat(price.market_cap.toString()) : 0,
          last_updated: price.last_updated,
          // Backward compatibility
          usd: parseFloat(price.price?.toString() || '0'),
          usd_24h_change: price.price_change_24h ? parseFloat(price.price_change_24h.toString()) : 0,
          usd_24h_vol: price.volume_24h ? parseFloat(price.volume_24h.toString()) : 0,
          usd_market_cap: price.market_cap ? parseFloat(price.market_cap.toString()) : 0
        };
      });

      setPrices(pricesMap);
      setLastPriceUpdate(new Date());
      
      // If no prices found, trigger a refresh
      if (!data || data.length === 0) {
        console.log('No prices found, triggering refresh...');
        await refreshPrices();
      }
    } catch (error) {
      console.error('Exception fetching prices:', error);
    }
  }, []);

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('crypto_alerts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching alerts:', error);
        return;
      }

      console.log('Alerts fetched:', data?.length || 0);
      setAlerts((data || []) as CryptoAlert[]);
    } catch (error) {
      console.error('Exception fetching alerts:', error);
    }
  }, [user]);

  // Fetch portfolio snapshots for historical data
  const fetchPortfolioSnapshots = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('portfolio_snapshots')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .limit(30); // Last 30 days

      if (error) {
        console.error('Error fetching portfolio snapshots:', error);
        return;
      }

      console.log('Portfolio snapshots fetched:', data?.length || 0);
      setPortfolioSnapshots(data || []);
    } catch (error) {
      console.error('Exception fetching portfolio snapshots:', error);
    }
  }, [user]);

  // Refresh crypto prices by calling the edge function
  const refreshPrices = useCallback(async () => {
    try {
      console.log('Refreshing crypto prices...');
      const { data, error } = await supabase.functions.invoke('update-crypto-prices');
      
      if (error) {
        console.error('Error refreshing prices:', error);
        throw error;
      }
      
      console.log('Price refresh response:', data);
      
      // Refetch prices after update
      setTimeout(() => fetchPrices(), 2000);
      
      toast({
        title: "Success",
        description: "Crypto prices updated successfully"
      });
      
      return data;
    } catch (error) {
      console.error('Error refreshing crypto prices:', error);
      toast({
        title: "Error",
        description: "Failed to refresh crypto prices",
        variant: "destructive"
      });
      throw error;
    }
  }, [fetchPrices, toast]);

  // Initial data loading with better coordination
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log('Loading initial crypto data...');
      
      try {
        // Load all data in parallel
        await Promise.all([
          fetchHoldings(),
          fetchPrices(),
          fetchAlerts(),
          fetchPortfolioSnapshots()
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
        console.log('Initial crypto data loading completed');
      }
    };

    loadInitialData();
  }, [user, fetchHoldings, fetchPrices, fetchAlerts, fetchPortfolioSnapshots]);

  // Add holding
  const addHolding = useCallback(async (holding: Omit<CryptoHolding, 'id'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('crypto_holdings')
        .insert({
          user_id: user.id,
          ...holding
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Crypto holding added successfully"
      });

      await fetchHoldings();
    } catch (error) {
      console.error('Error adding crypto holding:', error);
      toast({
        title: "Error",
        description: "Failed to add crypto holding",
        variant: "destructive"
      });
    }
  }, [user, toast, fetchHoldings]);

  // Bulk add holdings
  const bulkAddHoldings = useCallback(async (holdings: Omit<CryptoHolding, 'id'>[]) => {
    if (!user) return;

    try {
      const holdingsWithUserId = holdings.map(holding => ({
        user_id: user.id,
        ...holding
      }));

      const { error } = await supabase
        .from('crypto_holdings')
        .insert(holdingsWithUserId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${holdings.length} crypto holdings imported successfully`
      });

      await fetchHoldings();
    } catch (error) {
      console.error('Error bulk adding crypto holdings:', error);
      toast({
        title: "Error",
        description: "Failed to import crypto holdings",
        variant: "destructive"
      });
    }
  }, [user, toast, fetchHoldings]);

  // Delete holding
  const deleteHolding = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('crypto_holdings')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Crypto holding deleted successfully"
      });

      await fetchHoldings();
    } catch (error) {
      console.error('Error deleting crypto holding:', error);
      toast({
        title: "Error",
        description: "Failed to delete crypto holding",
        variant: "destructive"
      });
    }
  }, [user, toast, fetchHoldings]);

  // Add alert
  const addAlert = useCallback(async (alert: Omit<CryptoAlert, 'id' | 'is_triggered'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('crypto_alerts')
        .insert({
          user_id: user.id,
          ...alert
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Price alert created successfully"
      });

      await fetchAlerts();
    } catch (error) {
      console.error('Error adding crypto alert:', error);
      toast({
        title: "Error",
        description: "Failed to create price alert",
        variant: "destructive"
      });
    }
  }, [user, toast, fetchAlerts]);

  // Calculate current value of a holding with proper price lookup
  const getHoldingCurrentValue = useCallback((holding: CryptoHolding) => {
    const priceData = prices[holding.symbol];
    const currentPrice = priceData?.price || 0;
    return holding.amount * currentPrice;
  }, [prices]);

  // Calculate gain/loss for a holding with proper price lookup
  const getHoldingGainLoss = useCallback((holding: CryptoHolding) => {
    const currentValue = getHoldingCurrentValue(holding);
    const purchaseValue = holding.amount * holding.purchase_price;
    return currentValue - purchaseValue;
  }, [getHoldingCurrentValue]);

  // Calculate total portfolio value with better error handling
  const calculateTotalValue = useCallback(() => {
    return holdings.reduce((total, holding) => {
      const value = getHoldingCurrentValue(holding);
      return total + (isNaN(value) ? 0 : value);
    }, 0);
  }, [holdings, getHoldingCurrentValue]);

  // Calculate total gain/loss with better error handling
  const calculateTotalGainLoss = useCallback(() => {
    return holdings.reduce((total, holding) => {
      const gainLoss = getHoldingGainLoss(holding);
      return total + (isNaN(gainLoss) ? 0 : gainLoss);
    }, 0);
  }, [holdings, getHoldingGainLoss]);

  // Calculate ROI with better error handling
  const calculateROI = useCallback(() => {
    const totalInvested = holdings.reduce((total, holding) => {
      const invested = holding.amount * holding.purchase_price;
      return total + (isNaN(invested) ? 0 : invested);
    }, 0);
    
    if (totalInvested === 0) return 0;
    
    const totalGainLoss = calculateTotalGainLoss();
    return (totalGainLoss / totalInvested) * 100;
  }, [holdings, calculateTotalGainLoss]);

  // Calculate detailed portfolio metrics
  const calculatePortfolioMetrics = useCallback(() => {
    const totalValue = calculateTotalValue();
    const totalGainLoss = calculateTotalGainLoss();
    const roi = calculateROI();
    
    const holdingMetrics = holdings.map(holding => {
      const priceData = prices[holding.symbol];
      const currentPrice = priceData?.price || 0;
      const priceChange24h = priceData?.price_change_24h || 0;
      const currentValue = getHoldingCurrentValue(holding);
      const purchaseValue = holding.amount * holding.purchase_price;
      const gainLoss = getHoldingGainLoss(holding);
      const gainLossPercent = purchaseValue > 0 ? (gainLoss / purchaseValue) * 100 : 0;
      
      return {
        ...holding,
        currentPrice,
        priceChange24h,
        currentValue,
        purchaseValue,
        gainLoss,
        gainLossPercent,
        allocation: totalValue > 0 ? (currentValue / totalValue) * 100 : 0
      };
    });

    return {
      totalValue,
      totalGainLoss,
      roi,
      holdingMetrics,
      lastUpdate: lastPriceUpdate,
      updateCount: priceUpdateCount
    };
  }, [holdings, prices, calculateTotalValue, calculateTotalGainLoss, calculateROI, getHoldingCurrentValue, getHoldingGainLoss, lastPriceUpdate, priceUpdateCount]);

  // Get top performers
  const getTopPerformers = useCallback(() => {
    const metrics = calculatePortfolioMetrics();
    return metrics.holdingMetrics
      .sort((a, b) => b.gainLossPercent - a.gainLossPercent)
      .slice(0, 3);
  }, [calculatePortfolioMetrics]);

  // Get worst performers
  const getWorstPerformers = useCallback(() => {
    const metrics = calculatePortfolioMetrics();
    return metrics.holdingMetrics
      .sort((a, b) => a.gainLossPercent - b.gainLossPercent)
      .slice(0, 3);
  }, [calculatePortfolioMetrics]);

  // Missing functions for backward compatibility
  const deleteAllData = useCallback(async () => {
    if (!user) return;
    try {
      await supabase.from('crypto_holdings').delete().eq('user_id', user.id);
      await fetchHoldings();
      toast({ title: "Success", description: "All data deleted successfully" });
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  }, [user, fetchHoldings, toast]);

  const fetchCryptoPrices = fetchPrices;
  const updateCryptoPrices = refreshPrices;
  const calculatePortfolioValue = calculateTotalValue;

  return {
    holdings,
    prices,
    alerts,
    portfolioSnapshots,
    loading,
    connectionStatus,
    lastPriceUpdate,
    priceUpdateCount,
    
    // Data management functions
    addHolding,
    bulkAddHoldings,
    deleteHolding,
    addAlert,
    refreshPrices,
    
    // Portfolio calculations
    calculateTotalValue,
    calculateTotalGainLoss,
    calculateROI,
    getHoldingCurrentValue,
    getHoldingGainLoss,
    calculatePortfolioMetrics,
    getTopPerformers,
    getWorstPerformers,
    
    // Historical data
    fetchPortfolioSnapshots,
    
    // Backward compatibility
    deleteAllData,
    fetchAlerts,
    fetchCryptoPrices,
    updateCryptoPrices,
    calculatePortfolioValue
  };
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
