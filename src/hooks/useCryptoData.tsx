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
  [key: string]: {
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

export const useCryptoData = () => {
  const [holdings, setHoldings] = useState<CryptoHolding[]>([]);
  const [prices, setPrices] = useState<CryptoPrice>({});
  const [alerts, setAlerts] = useState<CryptoAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceUpdateCount, setPriceUpdateCount] = useState(0);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchHoldings();
      fetchAlerts();
    }
  }, [user]);

  useEffect(() => {
    if (holdings.length > 0) {
      fetchCryptoPrices();
      const interval = setInterval(fetchCryptoPrices, 10000); // Update every 10 seconds for real-time
      return () => clearInterval(interval);
    }
  }, [holdings]);

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

  const fetchCryptoPrices = async (retryCount = 0) => {
    try {
      // Map common symbols to CoinGecko IDs
      const symbolToId: Record<string, string> = {
        'btc': 'bitcoin',
        'bitcoin': 'bitcoin',
        'eth': 'ethereum',
        'ethereum': 'ethereum',
        'ada': 'cardano',
        'cardano': 'cardano',
        'sol': 'solana',
        'solana': 'solana',
        'dot': 'polkadot',
        'polkadot': 'polkadot',
        'bnb': 'binancecoin',
        'binancecoin': 'binancecoin',
        'usdt': 'tether',
        'tether': 'tether',
        'usdc': 'usd-coin',
        'xrp': 'ripple',
        'ripple': 'ripple',
        'matic': 'polygon',
        'polygon': 'polygon',
        'avax': 'avalanche-2',
        'avalanche': 'avalanche-2'
      };

      const coinIds = holdings
        .map(h => symbolToId[h.symbol.toLowerCase()] || h.symbol.toLowerCase())
        .join(',');
      
      if (!coinIds) return;
      
      console.log('Fetching prices for coin IDs:', coinIds);
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
      );
      
      if (response.ok) {
        const data = await response.json();
        setPrices(data);
        setPriceUpdateCount(prev => prev + 1);
        setLastPriceUpdate(new Date());
        checkAlerts(data);
      } else if (retryCount < 3) {
        // Retry after exponential backoff
        setTimeout(() => fetchCryptoPrices(retryCount + 1), Math.pow(2, retryCount) * 1000);
      }
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      if (retryCount < 3) {
        // Retry after exponential backoff
        setTimeout(() => fetchCryptoPrices(retryCount + 1), Math.pow(2, retryCount) * 1000);
      } else {
        toast({
          title: "Price Update Error",
          description: "Failed to fetch latest crypto prices after multiple attempts",
          variant: "destructive"
        });
      }
    }
  };

  const checkAlerts = async (currentPrices: CryptoPrice) => {
    for (const alert of alerts) {
      const currentPrice = currentPrices[alert.symbol]?.usd;
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
          const change24h = currentPrices[alert.symbol]?.usd_24h_change || 0;
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

  const calculatePortfolioValue = () => {
    const symbolToId: Record<string, string> = {
      'btc': 'bitcoin', 'bitcoin': 'bitcoin', 'eth': 'ethereum', 'ethereum': 'ethereum',
      'ada': 'cardano', 'cardano': 'cardano', 'sol': 'solana', 'solana': 'solana',
      'dot': 'polkadot', 'polkadot': 'polkadot', 'bnb': 'binancecoin', 'binancecoin': 'binancecoin',
      'usdt': 'tether', 'tether': 'tether', 'usdc': 'usd-coin', 'xrp': 'ripple', 'ripple': 'ripple',
      'matic': 'polygon', 'polygon': 'polygon', 'avax': 'avalanche-2', 'avalanche': 'avalanche-2'
    };
    
    return holdings.reduce((total, holding) => {
      const coinId = symbolToId[holding.symbol.toLowerCase()] || holding.symbol.toLowerCase();
      const currentPrice = prices[coinId]?.usd || 0;
      return total + (holding.amount * currentPrice);
    }, 0);
  };

  const calculateTotalGainLoss = () => {
    const symbolToId: Record<string, string> = {
      'btc': 'bitcoin', 'bitcoin': 'bitcoin', 'eth': 'ethereum', 'ethereum': 'ethereum',
      'ada': 'cardano', 'cardano': 'cardano', 'sol': 'solana', 'solana': 'solana',
      'dot': 'polkadot', 'polkadot': 'polkadot', 'bnb': 'binancecoin', 'binancecoin': 'binancecoin',
      'usdt': 'tether', 'tether': 'tether', 'usdc': 'usd-coin', 'xrp': 'ripple', 'ripple': 'ripple',
      'matic': 'polygon', 'polygon': 'polygon', 'avax': 'avalanche-2', 'avalanche': 'avalanche-2'
    };
    
    return holdings.reduce((total, holding) => {
      const coinId = symbolToId[holding.symbol.toLowerCase()] || holding.symbol.toLowerCase();
      const currentPrice = prices[coinId]?.usd || 0;
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
    
    const symbolToId: Record<string, string> = {
      'btc': 'bitcoin', 'bitcoin': 'bitcoin', 'eth': 'ethereum', 'ethereum': 'ethereum',
      'ada': 'cardano', 'cardano': 'cardano', 'sol': 'solana', 'solana': 'solana',
      'dot': 'polkadot', 'polkadot': 'polkadot', 'bnb': 'binancecoin', 'binancecoin': 'binancecoin',
      'usdt': 'tether', 'tether': 'tether', 'usdc': 'usd-coin', 'xrp': 'ripple', 'ripple': 'ripple',
      'matic': 'polygon', 'polygon': 'polygon', 'avax': 'avalanche-2', 'avalanche': 'avalanche-2'
    };
    
    const holdingMetrics = holdings.map(holding => {
      const coinId = symbolToId[holding.symbol.toLowerCase()] || holding.symbol.toLowerCase();
      const currentPrice = prices[coinId]?.usd || 0;
      const priceChange24h = prices[coinId]?.usd_24h_change || 0;
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
    deleteHolding,
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