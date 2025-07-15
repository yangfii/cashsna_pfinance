import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, TrendingUp, TrendingDown, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface CryptoHolding {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  purchase_price: number;
  purchase_date: string;
  notes?: string;
}

interface CryptoPrice {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

export default function CryptoPortfolio() {
  const [holdings, setHoldings] = useState<CryptoHolding[]>([]);
  const [prices, setPrices] = useState<CryptoPrice>({});
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newHolding, setNewHolding] = useState({
    symbol: "",
    name: "",
    amount: "",
    purchase_price: "",
    purchase_date: "",
    notes: ""
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchHoldings();
    }
  }, [user]);

  useEffect(() => {
    if (holdings.length > 0) {
      fetchCryptoPrices();
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

  const fetchCryptoPrices = async () => {
    try {
      const symbols = holdings.map(h => h.symbol.toLowerCase()).join(',');
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${symbols}&vs_currencies=usd&include_24hr_change=true`
      );
      
      if (response.ok) {
        const data = await response.json();
        setPrices(data);
      }
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
    }
  };

  const handleAddHolding = async () => {
    if (!newHolding.symbol || !newHolding.name || !newHolding.amount || !newHolding.purchase_price || !newHolding.purchase_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('crypto_holdings')
        .insert({
          user_id: user?.id,
          symbol: newHolding.symbol.toLowerCase(),
          name: newHolding.name,
          amount: parseFloat(newHolding.amount),
          purchase_price: parseFloat(newHolding.purchase_price),
          purchase_date: newHolding.purchase_date,
          notes: newHolding.notes || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Crypto holding added successfully"
      });

      setNewHolding({
        symbol: "",
        name: "",
        amount: "",
        purchase_price: "",
        purchase_date: "",
        notes: ""
      });
      setIsAddDialogOpen(false);
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

  const calculatePortfolioValue = () => {
    return holdings.reduce((total, holding) => {
      const currentPrice = prices[holding.symbol]?.usd || 0;
      return total + (holding.amount * currentPrice);
    }, 0);
  };

  const calculateTotalGainLoss = () => {
    return holdings.reduce((total, holding) => {
      const currentPrice = prices[holding.symbol]?.usd || 0;
      const currentValue = holding.amount * currentPrice;
      const purchaseValue = holding.amount * holding.purchase_price;
      return total + (currentValue - purchaseValue);
    }, 0);
  };

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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Holding
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Crypto Holding</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="symbol">Symbol</Label>
                    <Input
                      id="symbol"
                      placeholder="bitcoin"
                      value={newHolding.symbol}
                      onChange={(e) => setNewHolding({ ...newHolding, symbol: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Bitcoin"
                      value={newHolding.name}
                      onChange={(e) => setNewHolding({ ...newHolding, name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.00000001"
                      placeholder="0.5"
                      value={newHolding.amount}
                      onChange={(e) => setNewHolding({ ...newHolding, amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="purchase_price">Purchase Price ($)</Label>
                    <Input
                      id="purchase_price"
                      type="number"
                      step="0.01"
                      placeholder="50000"
                      value={newHolding.purchase_price}
                      onChange={(e) => setNewHolding({ ...newHolding, purchase_price: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="purchase_date">Purchase Date</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={newHolding.purchase_date}
                    onChange={(e) => setNewHolding({ ...newHolding, purchase_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes..."
                    value={newHolding.notes}
                    onChange={(e) => setNewHolding({ ...newHolding, notes: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddHolding} className="w-full">
                  Add Holding
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
          <div className="space-y-4">
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

            {/* Holdings List */}
            <div className="space-y-3">
              {holdings.map((holding) => {
                const currentPrice = prices[holding.symbol]?.usd || 0;
                const currentValue = holding.amount * currentPrice;
                const purchaseValue = holding.amount * holding.purchase_price;
                const gainLoss = currentValue - purchaseValue;
                const gainLossPercent = purchaseValue > 0 ? (gainLoss / purchaseValue) * 100 : 0;
                const priceChange24h = prices[holding.symbol]?.usd_24h_change || 0;

                return (
                  <div key={holding.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{holding.name}</h4>
                        <p className="text-sm text-muted-foreground uppercase">{holding.symbol}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(currentValue)}</p>
                        <Badge variant={priceChange24h >= 0 ? "default" : "destructive"} className="text-xs">
                          {priceChange24h >= 0 ? "+" : ""}{priceChange24h.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p>{holding.amount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Current Price</p>
                        <p>{formatCurrency(currentPrice)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Gain/Loss</p>
                        <p className={gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {formatCurrency(gainLoss)} ({gainLossPercent >= 0 ? "+" : ""}{gainLossPercent.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}