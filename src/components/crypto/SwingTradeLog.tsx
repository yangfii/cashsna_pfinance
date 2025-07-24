import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, CalendarIcon, Plus, TrendingUp, TrendingDown, Target, DollarSign } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface SwingTrade {
  id: string;
  symbol: string;
  tradeType: 'long' | 'short';
  entryPrice: number;
  entryDate: Date;
  exitPrice?: number;
  exitDate?: Date;
  quantity: number;
  stopLoss?: number;
  takeProfit?: number;
  status: 'open' | 'closed' | 'stopped';
  pnl?: number;
  pnlPercent?: number;
  notes?: string;
  strategy?: string;
}

interface SwingTradeLogProps {
  formatCurrency: (amount: number) => string;
}

export default function SwingTradeLog({ formatCurrency }: SwingTradeLogProps) {
  const [trades, setTrades] = useState<SwingTrade[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTrade, setNewTrade] = useState<Partial<SwingTrade>>({
    tradeType: 'long',
    status: 'open'
  });
  const [entryDate, setEntryDate] = useState<Date>();
  const [exitDate, setExitDate] = useState<Date>();
  const { toast } = useToast();

  const calculatePnL = useCallback((trade: SwingTrade) => {
    if (!trade.exitPrice || trade.status === 'open') return null;
    
    const entryValue = trade.entryPrice * trade.quantity;
    const exitValue = trade.exitPrice * trade.quantity;
    
    let pnl: number;
    if (trade.tradeType === 'long') {
      pnl = exitValue - entryValue;
    } else {
      pnl = entryValue - exitValue;
    }
    
    const pnlPercent = (pnl / entryValue) * 100;
    return { pnl, pnlPercent };
  }, []);

  const addTrade = useCallback(() => {
    if (!newTrade.symbol || !newTrade.entryPrice || !newTrade.quantity || !entryDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const trade: SwingTrade = {
      id: Date.now().toString(),
      symbol: newTrade.symbol.toUpperCase(),
      tradeType: newTrade.tradeType as 'long' | 'short',
      entryPrice: newTrade.entryPrice,
      entryDate,
      exitPrice: newTrade.exitPrice,
      exitDate: exitDate,
      quantity: newTrade.quantity,
      stopLoss: newTrade.stopLoss,
      takeProfit: newTrade.takeProfit,
      status: newTrade.status as 'open' | 'closed' | 'stopped',
      notes: newTrade.notes,
      strategy: newTrade.strategy
    };

    if (trade.exitPrice && trade.status === 'closed') {
      const pnlData = calculatePnL(trade);
      if (pnlData) {
        trade.pnl = pnlData.pnl;
        trade.pnlPercent = pnlData.pnlPercent;
      }
    }

    setTrades(prev => [trade, ...prev]);
    setNewTrade({ tradeType: 'long', status: 'open' });
    setEntryDate(undefined);
    setExitDate(undefined);
    setIsAddDialogOpen(false);

    toast({
      title: "Success",
      description: "Swing trade added successfully"
    });
  }, [newTrade, entryDate, exitDate, calculatePnL, toast]);

  const getTotalPnL = useCallback(() => {
    return trades.reduce((total, trade) => {
      return total + (trade.pnl || 0);
    }, 0);
  }, [trades]);

  const getWinRate = useCallback(() => {
    const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl !== undefined);
    if (closedTrades.length === 0) return 0;
    
    const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
    return (winningTrades.length / closedTrades.length) * 100;
  }, [trades]);

  const getStatusBadge = (status: SwingTrade['status']) => {
    switch (status) {
      case 'open':
        return <Badge variant="secondary">Open</Badge>;
      case 'closed':
        return <Badge variant="default">Closed</Badge>;
      case 'stopped':
        return <Badge variant="destructive">Stopped</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPnLDisplay = (trade: SwingTrade) => {
    if (trade.status === 'open' || !trade.pnl) {
      return <span className="text-muted-foreground">-</span>;
    }

    const isPositive = trade.pnl > 0;
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        <div className="flex flex-col">
          <span className="font-medium">{formatCurrency(Math.abs(trade.pnl))}</span>
          <span className="text-xs">
            {isPositive ? '+' : ''}{trade.pnlPercent?.toFixed(2)}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total P&L</p>
                <p className={`text-lg font-bold ${getTotalPnL() >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(getTotalPnL())}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-lg font-bold">{getWinRate().toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Trades</p>
                <p className="text-lg font-bold">{trades.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Trade Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add New Trade
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Swing Trade</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="symbol">Symbol *</Label>
              <Input
                id="symbol"
                placeholder="BTC, ETH, etc."
                value={newTrade.symbol || ''}
                onChange={(e) => setNewTrade(prev => ({ ...prev, symbol: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="tradeType">Trade Type *</Label>
              <Select value={newTrade.tradeType} onValueChange={(value) => setNewTrade(prev => ({ ...prev, tradeType: value as 'long' | 'short' }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="long">Long</SelectItem>
                  <SelectItem value="short">Short</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="entryPrice">Entry Price *</Label>
              <Input
                id="entryPrice"
                type="number"
                step="0.00001"
                value={newTrade.entryPrice || ''}
                onChange={(e) => setNewTrade(prev => ({ ...prev, entryPrice: parseFloat(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.00001"
                value={newTrade.quantity || ''}
                onChange={(e) => setNewTrade(prev => ({ ...prev, quantity: parseFloat(e.target.value) }))}
              />
            </div>
            <div>
              <Label>Entry Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !entryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {entryDate ? format(entryDate, "PPP") : "Pick entry date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={entryDate}
                    onSelect={(date) => setEntryDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={newTrade.status} onValueChange={(value) => setNewTrade(prev => ({ ...prev, status: value as 'open' | 'closed' | 'stopped' }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="stopped">Stopped</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="exitPrice">Exit Price</Label>
              <Input
                id="exitPrice"
                type="number"
                step="0.00001"
                value={newTrade.exitPrice || ''}
                onChange={(e) => setNewTrade(prev => ({ ...prev, exitPrice: parseFloat(e.target.value) || undefined }))}
              />
            </div>
            <div>
              <Label>Exit Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !exitDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {exitDate ? format(exitDate, "PPP") : "Pick exit date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={exitDate}
                    onSelect={(date) => setExitDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="stopLoss">Stop Loss</Label>
              <Input
                id="stopLoss"
                type="number"
                step="0.00001"
                value={newTrade.stopLoss || ''}
                onChange={(e) => setNewTrade(prev => ({ ...prev, stopLoss: parseFloat(e.target.value) || undefined }))}
              />
            </div>
            <div>
              <Label htmlFor="takeProfit">Take Profit</Label>
              <Input
                id="takeProfit"
                type="number"
                step="0.00001"
                value={newTrade.takeProfit || ''}
                onChange={(e) => setNewTrade(prev => ({ ...prev, takeProfit: parseFloat(e.target.value) || undefined }))}
              />
            </div>
            <div>
              <Label htmlFor="strategy">Strategy</Label>
              <Input
                id="strategy"
                placeholder="e.g., Breakout, Support/Resistance"
                value={newTrade.strategy || ''}
                onChange={(e) => setNewTrade(prev => ({ ...prev, strategy: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Trade rationale, market conditions, etc."
                value={newTrade.notes || ''}
                onChange={(e) => setNewTrade(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addTrade}>Add Trade</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Trades Table */}
      <Card>
        <CardHeader>
          <CardTitle>Trade Log</CardTitle>
        </CardHeader>
        <CardContent>
          {trades.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No swing trades recorded yet</p>
              <p className="text-sm mt-2">Add your first trade to start tracking your swing trading performance</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Entry</TableHead>
                    <TableHead>Exit</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>P&L</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Strategy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell className="font-medium">{trade.symbol}</TableCell>
                      <TableCell>
                        <Badge variant={trade.tradeType === 'long' ? 'default' : 'secondary'}>
                          {trade.tradeType.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{formatCurrency(trade.entryPrice)}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(trade.entryDate, "MMM dd, yyyy")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {trade.exitPrice ? (
                          <div className="flex flex-col">
                            <span>{formatCurrency(trade.exitPrice)}</span>
                            {trade.exitDate && (
                              <span className="text-xs text-muted-foreground">
                                {format(trade.exitDate, "MMM dd, yyyy")}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{trade.quantity}</TableCell>
                      <TableCell>{getPnLDisplay(trade)}</TableCell>
                      <TableCell>{getStatusBadge(trade.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {trade.strategy || '-'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
