import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Trash2 } from "lucide-react";
import { CryptoAlert, CryptoHolding } from "@/hooks/useCryptoData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PriceAlertsDialogProps {
  holdings: CryptoHolding[];
  alerts: CryptoAlert[];
  onAddAlert: (alert: Omit<CryptoAlert, 'id' | 'is_triggered'>) => void;
  onRefreshAlerts: () => void;
}

export default function PriceAlertsDialog({ holdings, alerts, onAddAlert, onRefreshAlerts }: PriceAlertsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: "",
    name: "",
    alert_type: "price_above" as 'price_above' | 'price_below' | 'percent_change',
    target_value: "",
    is_active: true
  });
  
  const { toast } = useToast();

  const handleAddAlert = () => {
    if (!newAlert.symbol || !newAlert.name || !newAlert.target_value) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    onAddAlert({
      symbol: newAlert.symbol.toLowerCase(),
      name: newAlert.name,
      alert_type: newAlert.alert_type,
      target_value: parseFloat(newAlert.target_value),
      is_active: newAlert.is_active
    });

    setNewAlert({
      symbol: "",
      name: "",
      alert_type: "price_above",
      target_value: "",
      is_active: true
    });
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('crypto_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Alert deleted successfully"
      });

      onRefreshAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast({
        title: "Error",
        description: "Failed to delete alert",
        variant: "destructive"
      });
    }
  };

  const handleToggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('crypto_alerts')
        .update({ is_active: !isActive })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Alert ${!isActive ? 'activated' : 'deactivated'}`
      });

      onRefreshAlerts();
    } catch (error) {
      console.error('Error toggling alert:', error);
      toast({
        title: "Error",
        description: "Failed to update alert",
        variant: "destructive"
      });
    }
  };

  const uniqueHoldings = holdings.reduce((acc, holding) => {
    if (!acc.find(h => h.symbol === holding.symbol)) {
      acc.push(holding);
    }
    return acc;
  }, [] as CryptoHolding[]);

  const getTargetLabel = () => {
    return newAlert.alert_type === 'percent_change' ? '(%)' : '($)';
  };

  const getPlaceholder = () => {
    return newAlert.alert_type === 'percent_change' ? "5" : "50000";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Bell className="h-4 w-4 mr-1" />
          Price Alerts ({alerts.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Price Alerts</DialogTitle>
        </DialogHeader>
        
        {/* Existing Alerts */}
        <div className="space-y-3 max-h-60 overflow-y-auto">
          <h4 className="text-sm font-medium">Active Alerts</h4>
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No alerts set</p>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{alert.name}</span>
                    <Badge variant={alert.is_triggered ? "destructive" : alert.is_active ? "default" : "secondary"}>
                      {alert.is_triggered ? "Triggered" : alert.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {alert.alert_type === 'price_above' && `Above $${alert.target_value}`}
                    {alert.alert_type === 'price_below' && `Below $${alert.target_value}`}
                    {alert.alert_type === 'percent_change' && `±${alert.target_value}% change`}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleAlert(alert.id, alert.is_active)}
                  >
                    {alert.is_active ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteAlert(alert.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add New Alert */}
        <div className="space-y-4 border-t pt-4">
          <h4 className="text-sm font-medium">Create New Alert</h4>
          
          <div>
            <Label htmlFor="crypto-select">Select Cryptocurrency</Label>
            <Select 
              value={newAlert.symbol} 
              onValueChange={(value) => {
                const holding = uniqueHoldings.find(h => h.symbol === value);
                setNewAlert({ ...newAlert, symbol: value, name: holding?.name || "" });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose cryptocurrency" />
              </SelectTrigger>
              <SelectContent>
                {uniqueHoldings.map((holding) => (
                  <SelectItem key={holding.symbol} value={holding.symbol}>
                    {holding.name} ({holding.symbol.toUpperCase()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="alert-type">Alert Type</Label>
            <Select 
              value={newAlert.alert_type} 
              onValueChange={(value: 'price_above' | 'price_below' | 'percent_change') => setNewAlert({ ...newAlert, alert_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price_above">Price Above</SelectItem>
                <SelectItem value="price_below">Price Below</SelectItem>
                <SelectItem value="percent_change">24h Change %</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="target-value">
              Target Value {getTargetLabel()}
            </Label>
            <Input
              id="target-value"
              type="number"
              step="0.01"
              placeholder={getPlaceholder()}
              value={newAlert.target_value}
              onChange={(e) => setNewAlert({ ...newAlert, target_value: e.target.value })}
            />
          </div>

          <Button onClick={handleAddAlert} className="w-full">
            Create Alert
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
