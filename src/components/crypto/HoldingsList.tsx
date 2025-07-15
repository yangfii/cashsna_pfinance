import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { TrendingUp, TrendingDown, Wallet, Trash2 } from "lucide-react";
import { CryptoHolding, CryptoPrice } from "@/hooks/useCryptoData";

interface HoldingsListProps {
  holdings: CryptoHolding[];
  prices: CryptoPrice;
  onDeleteHolding: (id: string) => void;
}

export default function HoldingsList({ holdings, prices, onDeleteHolding }: HoldingsListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getWalletIcon = (walletType?: string) => {
    switch (walletType) {
      case 'binance':
        return '🟡';
      case 'coinbase':
        return '🔵';
      case 'metamask':
        return '🦊';
      case 'trust_wallet':
        return '💙';
      default:
        return '📱';
    }
  };

  return (
    <div className="space-y-3">
      {holdings.map((holding) => {
        const currentPrice = prices[holding.symbol]?.usd || 0;
        const currentValue = holding.amount * currentPrice;
        const purchaseValue = holding.amount * holding.purchase_price;
        const gainLoss = currentValue - purchaseValue;
        const gainLossPercent = purchaseValue > 0 ? (gainLoss / purchaseValue) * 100 : 0;
        const priceChange24h = prices[holding.symbol]?.usd_24h_change || 0;

        return (
          <div key={holding.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{holding.name}</h4>
                    {holding.wallet_type && holding.wallet_type !== 'manual' && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>{getWalletIcon(holding.wallet_type)}</span>
                        <span className="capitalize">{holding.wallet_type}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground uppercase">{holding.symbol}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-semibold text-lg">{formatCurrency(currentValue)}</p>
                  <Badge variant={priceChange24h >= 0 ? "default" : "destructive"} className="text-xs">
                    {priceChange24h >= 0 ? "+" : ""}{priceChange24h.toFixed(2)}%
                  </Badge>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Holding</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this {holding.name} holding? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDeleteHolding(holding.id)} className="bg-destructive hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-medium">{holding.amount.toFixed(8)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Current Price</p>
                <p className="font-medium">{formatCurrency(currentPrice)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Purchase Price</p>
                <p className="font-medium">{formatCurrency(holding.purchase_price)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Gain/Loss</p>
                <div className="flex items-center gap-1">
                  {gainLoss >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <p className={`font-medium ${gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(Math.abs(gainLoss))} ({gainLossPercent >= 0 ? "+" : ""}{gainLossPercent.toFixed(2)}%)
                  </p>
                </div>
              </div>
            </div>

            {holding.wallet_address && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Wallet className="h-3 w-3" />
                  <span>Wallet: {holding.wallet_address.substring(0, 8)}...{holding.wallet_address.slice(-6)}</span>
                </div>
              </div>
            )}

            {holding.notes && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-muted-foreground">{holding.notes}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}