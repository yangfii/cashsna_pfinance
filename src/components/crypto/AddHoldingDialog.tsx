import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CryptoHolding } from "@/hooks/useCryptoData";
import { AddIcon } from "@/components/ui/action-icons";

interface AddHoldingDialogProps {
  onAddHolding: (holding: Omit<CryptoHolding, 'id'>) => void;
}

export default function AddHoldingDialog({ onAddHolding }: AddHoldingDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newHolding, setNewHolding] = useState({
    symbol: "",
    name: "",
    amount: "",
    purchase_price: "",
    purchase_date: "",
    notes: "",
    wallet_address: "",
    wallet_type: "manual"
  });

  const handleAddHolding = () => {
    if (!newHolding.symbol || !newHolding.name || !newHolding.amount || !newHolding.purchase_price || !newHolding.purchase_date) {
      return;
    }

    onAddHolding({
      symbol: newHolding.symbol.toLowerCase(),
      name: newHolding.name,
      amount: parseFloat(newHolding.amount),
      purchase_price: parseFloat(newHolding.purchase_price),
      purchase_date: newHolding.purchase_date,
      notes: newHolding.notes || undefined,
      wallet_address: newHolding.wallet_address || undefined,
      wallet_type: newHolding.wallet_type as any
    });

    setNewHolding({
      symbol: "",
      name: "",
      amount: "",
      purchase_price: "",
      purchase_date: "",
      notes: "",
      wallet_address: "",
      wallet_type: "manual"
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <AddIcon size="sm" />
          Add Holding
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
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
            <Label htmlFor="wallet_type">Wallet Type</Label>
            <Select value={newHolding.wallet_type} onValueChange={(value) => setNewHolding({ ...newHolding, wallet_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual Entry</SelectItem>
                <SelectItem value="binance">Binance</SelectItem>
                <SelectItem value="coinbase">Coinbase</SelectItem>
                <SelectItem value="metamask">MetaMask</SelectItem>
                <SelectItem value="trust_wallet">Trust Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {newHolding.wallet_type !== "manual" && (
            <div>
              <Label htmlFor="wallet_address">Wallet Address</Label>
              <Input
                id="wallet_address"
                placeholder="Enter wallet address or API key"
                value={newHolding.wallet_address}
                onChange={(e) => setNewHolding({ ...newHolding, wallet_address: e.target.value })}
              />
            </div>
          )}

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
  );
}