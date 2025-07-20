import { useState, useEffect } from "react";
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
  symbol: string;
  price: number;
  price_change_24h: number;
  volume_24h: number;
  market_cap: number;
  last_updated: string;
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

export const useCryptoData = () => {
  const [holdings, setHoldings] = useState<CryptoHolding[]>([]);
  const [prices, setPrices] = useState<Record<string, CryptoPrice>>({});
  const [alerts, setAlerts] = useState<CryptoAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceUpdateCount, setPriceUpdateCount] = useState(0);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Set up real-time subscription for crypto prices
  useEffect(() => {
    if (!user) return;

    const channel = supabase
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
          
          const newPrice = payload.new as any;
          const cryptoPrice: CryptoPrice = {
            symbol: newPrice.symbol,
            price: parseFloat(newPrice.price?.toString() || '0'),
            price_change_24h: newPrice.price_change_24h ? parseFloat(newPrice.price_change_24h.toString()) : 0,
            volume_24h: newPrice.volume_24h ? parseFloat(newPrice.volume_24h.toString()) : 0,
            market_cap: newPrice.market_cap ? parseFloat(newPrice.market_cap.toString()) : 0,
            last_updated: newPrice.last_updated || new Date().toISOString()
          };
          
          setPrices(prev => ({
            ...prev,
            [newPrice.symbol]: cryptoPrice
          }));
          
          setLastPriceUpdate(new Date());
          setPriceUpdateCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchHoldings();
      fetchAlerts();
      fetchCryptoPrices();
    }
  }, [user]);

  const fetchHoldings = async () => {
    try {
      const { data, error } = await supabase
        .from('crypto_holdings')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHoldings(data || []);
    } catch (error) {
      console.error('Error fetching crypto holdings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch crypto holdings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('crypto_alerts')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts((data || []) as CryptoAlert[]);
    } catch (error) {
      console.error('Error fetching crypto alerts:', error);
    }
  };

  const fetchCryptoPrices = async () => {
    try {
      console.log('Fetching crypto prices from database...');
      
      // Get unique symbols from holdings
      const symbols = holdings.map(h => h.symbol);
      
      // If no holdings, fetch some default popular cryptocurrencies
      const defaultSymbols = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'ADA', 'XRP', 'DOT', 'LINK', 'LTC'];
      const symbolsToFetch = symbols.length > 0 ? symbols : defaultSymbols;
      
      const { data: pricesData, error } = await supabase
        .from('crypto_prices')
        .select('*')
        .in('symbol', symbolsToFetch)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching crypto prices:', error);
        toast({
          title: "Error",
          description: "Failed to fetch crypto prices",
          variant: "destructive"
        });
        return;
      }

      // Group by symbol and take the latest price for each
      const latestPrices: Record<string, CryptoPrice> = {};
      
      pricesData?.forEach(price => {
        if (!latestPrices[price.symbol]) {
          latestPrices[price.symbol] = {
            symbol: price.symbol,
            price: parseFloat(price.price?.toString() || '0'),
            price_change_24h: price.price_change_24h ? parseFloat(price.price_change_24h.toString()) : 0,
            volume_24h: price.volume_24h ? parseFloat(price.volume_24h.toString()) : 0,
            market_cap: price.market_cap ? parseFloat(price.market_cap.toString()) : 0,
            last_updated: price.last_updated || new Date().toISOString()
          };
        }
      });

      setPrices(latestPrices);
      setLastPriceUpdate(new Date());
      setPriceUpdateCount(prev => prev + 1);
      
      console.log(`Updated prices for ${Object.keys(latestPrices).length} cryptocurrencies`);
      
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      toast({
        title: "Error",
        description: "Failed to fetch crypto prices",
        variant: "destructive"
      });
    }
  };

  const checkAlerts = async (currentPrices: Record<string, CryptoPrice>) => {
    for (const alert of alerts) {
      const currentPrice = currentPrices[alert.symbol]?.price;
      if (!currentPrice || alert.is_triggered) continue;

      let shouldTrigger = false;
      
      switch (alert.alert_type) {
        case 'price_above':
          shouldTrigger = currentPrice >= alert.target_value;
          break;
        case 'price_below':
          shouldTrigger = currentPrice <= alert.target_value;
          break;
        case 'percent_change':
          const change24h = currentPrices[alert.symbol]?.price_change_24h || 0;
          shouldTrigger = Math.abs(change24h) >= alert.target_value;
          break;
      }

      if (shouldTrigger) {
        await triggerAlert(alert, currentPrice);
      }
    }
  };

  const triggerAlert = async (alert: CryptoAlert, currentPrice: number) => {
    try {
      await supabase
        .from('crypto_alerts')
        .update({ is_triggered: true })
        .eq('id', alert.id);

      toast({
        title: "Price Alert Triggered!",
        description: `${alert.name} has reached your target: $${currentPrice.toFixed(2)}`,
      });

      setAlerts(prev => prev.map(a => 
        a.id === alert.id ? { ...a, is_triggered: true } : a
      ));
    } catch (error) {
      console.error('Error triggering alert:', error);
    }
  };

  const addHolding = async (holding: Omit<CryptoHolding, 'id'>) => {
    try {
      const { error } = await supabase
        .from('crypto_holdings')
        .insert({
          user_id: user?.id,
          ...holding
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Crypto holding added successfully"
      });

      fetchHoldings();
    } catch (error) {
      console.error('Error adding crypto holding:', error);
      toast({
        title: "Error",
        description: "Failed to add crypto holding",
        variant: "destructive"
      });
    }
  };

  const bulkAddHoldings = async (holdings: Omit<CryptoHolding, 'id'>[]) => {
    try {
      const holdingsWithUserId = holdings.map(holding => ({
        user_id: user?.id,
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

      fetchHoldings();
    } catch (error) {
      console.error('Error bulk adding crypto holdings:', error);
      toast({
        title: "Error",
        description: "Failed to import crypto holdings",
        variant: "destructive"
      });
    }
  };

  const deleteHolding = async (id: string) => {
    try {
      const { error } = await supabase
        .from('crypto_holdings')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Crypto holding deleted successfully"
      });

      fetchHoldings();
    } catch (error) {
      console.error('Error deleting crypto holding:', error);
      toast({
        title: "Error",
        description: "Failed to delete crypto holding",
        variant: "destructive"
      });
    }
  };

  const addAlert = async (alert: Omit<CryptoAlert, 'id' | 'is_triggered'>) => {
    try {
      const { error } = await supabase
        .from('crypto_alerts')
        .insert({
          user_id: user?.id,
          ...alert
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Price alert created successfully"
      });

      fetchAlerts();
    } catch (error) {
      console.error('Error adding crypto alert:', error);
      toast({
        title: "Error",
        description: "Failed to create price alert",
        variant: "destructive"
      });
    }
  };

  const deleteAllData = async () => {
    try {
      // Delete all crypto holdings for the user
      const { error: holdingsError } = await supabase
        .from('crypto_holdings')
        .delete()
        .eq('user_id', user?.id);

      if (holdingsError) throw holdingsError;

      // Delete all crypto alerts for the user
      const { error: alertsError } = await supabase
        .from('crypto_alerts')
        .delete()
        .eq('user_id', user?.id);

      if (alertsError) throw alertsError;

      toast({
        title: "Success",
        description: "All portfolio data deleted successfully"
      });

      // Refresh data
      fetchHoldings();
      fetchAlerts();
    } catch (error) {
      console.error('Error deleting all data:', error);
      toast({
        title: "Error",
        description: "Failed to delete all data",
        variant: "destructive"
      });
    }
  };

  const calculatePortfolioValue = () => {
    return holdings.reduce((total, holding) => {
      const currentPrice = prices[holding.symbol]?.price || 0;
      return total + (holding.amount * currentPrice);
    }, 0);
  };

  const calculateTotalGainLoss = () => {
    return holdings.reduce((total, holding) => {
      const currentPrice = prices[holding.symbol]?.price || 0;
      const currentValue = holding.amount * currentPrice;
      const purchaseValue = holding.amount * holding.purchase_price;
      return total + (currentValue - purchaseValue);
    }, 0);
  };

  const calculateROI = () => {
    const totalInvested = holdings.reduce((total, holding) => 
      total + (holding.amount * holding.purchase_price), 0
    );
    const totalGainLoss = calculateTotalGainLoss();
    return totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;
  };

  const calculatePortfolioMetrics = () => {
    const totalValue = calculatePortfolioValue();
    const totalGainLoss = calculateTotalGainLoss();
    const roi = calculateROI();
    
    const holdingMetrics = holdings.map(holding => {
      const currentPrice = prices[holding.symbol]?.price || 0;
      const priceChange24h = prices[holding.symbol]?.price_change_24h || 0;
      const currentValue = holding.amount * currentPrice;
      const purchaseValue = holding.amount * holding.purchase_price;
      const gainLoss = currentValue - purchaseValue;
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
  };

  const getTopPerformers = () => {
    const metrics = calculatePortfolioMetrics();
    return metrics.holdingMetrics
      .sort((a, b) => b.gainLossPercent - a.gainLossPercent)
      .slice(0, 3);
  };

  const getWorstPerformers = () => {
    const metrics = calculatePortfolioMetrics();
    return metrics.holdingMetrics
      .sort((a, b) => a.gainLossPercent - b.gainLossPercent)
      .slice(0, 3);
  };

  return {
    holdings,
    prices,
    alerts,
    loading,
    addHolding,
    bulkAddHoldings,
    deleteHolding,
    deleteAllData,
    addAlert,
    fetchHoldings,
    fetchAlerts,
    fetchCryptoPrices,
    calculatePortfolioValue,
    calculateTotalGainLoss,
    calculateROI,
    calculatePortfolioMetrics,
    getTopPerformers,
    getWorstPerformers,
    lastPriceUpdate,
    priceUpdateCount
  };
};