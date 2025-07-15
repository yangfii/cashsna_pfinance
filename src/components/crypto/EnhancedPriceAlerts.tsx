import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, TrendingUp, TrendingDown, Target, AlertTriangle, Plus, Trash2 } from "lucide-react";
import { CryptoHolding } from "@/hooks/useCryptoData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface EnhancedAlert {
  id: string;
  name: string;
  symbol: string;
  alert_type: 'price_above' | 'price_below' | 'percent_change' | 'volume_spike' | 'support_resistance' | 'moving_average';
  target_value: number;
  secondary_value?: number;
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  is_active: boolean;
  is_triggered: boolean;
  notification_types: string[];
  created_at: string;
  updated_at: string;
}

interface EnhancedPriceAlertsProps {
  holdings: CryptoHolding[];
  onRefresh: () => void;
}

export default function EnhancedPriceAlerts({ holdings, onRefresh }: EnhancedPriceAlertsProps) {
  const [alerts, setAlerts] = useState<EnhancedAlert[]>([]);
  const [newAlert, setNewAlert] = useState({
    name: "",
    symbol: "",
    alert_type: "price_above" as EnhancedAlert['alert_type'],
    target_value: "",
    secondary_value: "",
    timeframe: "1h" as EnhancedAlert['timeframe'],
    notification_types: ['push', 'email']
  });
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchAlerts();
  }, [user]);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('crypto_alerts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const mappedAlerts = (data || []).map(alert => ({
        ...alert,
        alert_type: alert.alert_type as EnhancedAlert['alert_type'],
        timeframe: '1h' as const,
        notification_types: ['push', 'email']
      }));
      setAlerts(mappedAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleCreateAlert = async () => {
    if (!newAlert.name || !newAlert.symbol || !newAlert.target_value) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('crypto_alerts')
        .insert({
          user_id: user?.id,
          name: newAlert.name,
          symbol: newAlert.symbol.toLowerCase(),
          alert_type: newAlert.alert_type,
          target_value: parseFloat(newAlert.target_value),
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Price alert created successfully"
      });

      setNewAlert({
        name: "",
        symbol: "",
        alert_type: "price_above",
        target_value: "",
        secondary_value: "",
        timeframe: "1h",
        notification_types: ['push', 'email']
      });

      fetchAlerts();
    } catch (error) {
      console.error('Error creating alert:', error);
      toast({
        title: "Error",
        description: "Failed to create alert",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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

      fetchAlerts();
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

      fetchAlerts();
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  const alertTypes = [
    { value: 'price_above', label: 'Price Above', icon: TrendingUp },
    { value: 'price_below', label: 'Price Below', icon: TrendingDown },
    { value: 'percent_change', label: '24h Change %', icon: AlertTriangle },
    { value: 'volume_spike', label: 'Volume Spike', icon: Target },
    { value: 'support_resistance', label: 'Support/Resistance', icon: Target },
    { value: 'moving_average', label: 'Moving Average Cross', icon: TrendingUp }
  ];

  const timeframes = [
    { value: '1m', label: '1 Minute' },
    { value: '5m', label: '5 Minutes' },
    { value: '15m', label: '15 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '4h', label: '4 Hours' },
    { value: '1d', label: '1 Day' }
  ];

  const uniqueHoldings = holdings.reduce((acc, holding) => {
    if (!acc.find(h => h.symbol === holding.symbol)) {
      acc.push(holding);
    }
    return acc;
  }, [] as CryptoHolding[]);

  const getAlertIcon = (type: string) => {
    const alertType = alertTypes.find(t => t.value === type);
    const Icon = alertType?.icon || Bell;
    return <Icon className="h-4 w-4" />;
  };

  const getAlertDescription = (alert: EnhancedAlert) => {
    switch (alert.alert_type) {
      case 'price_above':
        return `When price goes above $${alert.target_value}`;
      case 'price_below':
        return `When price drops below $${alert.target_value}`;
      case 'percent_change':
        return `When 24h change exceeds ±${alert.target_value}%`;
      case 'volume_spike':
        return `When volume spikes above ${alert.target_value}x average`;
      case 'support_resistance':
        return `When price hits support/resistance at $${alert.target_value}`;
      case 'moving_average':
        return `When price crosses MA(${alert.target_value})`;
      default:
        return 'Custom alert condition';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Enhanced Price Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="alerts" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="alerts">Active Alerts ({alerts.length})</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>
          
          <TabsContent value="alerts" className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No price alerts set</p>
                <p className="text-sm">Create your first alert to get notified about price changes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg animate-fade-in">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2">
                        {getAlertIcon(alert.alert_type)}
                        <div>
                          <h4 className="font-medium">{alert.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {alert.symbol.toUpperCase()} • {getAlertDescription(alert)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={alert.is_triggered ? "destructive" : alert.is_active ? "default" : "secondary"}>
                        {alert.is_triggered ? "Triggered" : alert.is_active ? "Active" : "Paused"}
                      </Badge>
                      <Switch
                        checked={alert.is_active}
                        onCheckedChange={() => handleToggleAlert(alert.id, alert.is_active)}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteAlert(alert.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="create" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="alert-name">Alert Name</Label>
                <Input
                  id="alert-name"
                  placeholder="e.g., Bitcoin Bull Run Alert"
                  value={newAlert.name}
                  onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="crypto-select">Cryptocurrency</Label>
                <Select 
                  value={newAlert.symbol} 
                  onValueChange={(value) => setNewAlert({ ...newAlert, symbol: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cryptocurrency" />
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
                  onValueChange={(value: EnhancedAlert['alert_type']) => setNewAlert({ ...newAlert, alert_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {alertTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="target-value">
                  Target Value
                  {newAlert.alert_type === 'percent_change' ? ' (%)' : 
                   newAlert.alert_type === 'volume_spike' ? ' (x)' : ' ($)'}
                </Label>
                <Input
                  id="target-value"
                  type="number"
                  step="0.01"
                  placeholder={
                    newAlert.alert_type === 'percent_change' ? '5' :
                    newAlert.alert_type === 'volume_spike' ? '2' : '50000'
                  }
                  value={newAlert.target_value}
                  onChange={(e) => setNewAlert({ ...newAlert, target_value: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="timeframe">Timeframe</Label>
                <Select 
                  value={newAlert.timeframe} 
                  onValueChange={(value: EnhancedAlert['timeframe']) => setNewAlert({ ...newAlert, timeframe: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeframes.map((tf) => (
                      <SelectItem key={tf.value} value={tf.value}>
                        {tf.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={handleCreateAlert} 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Alert"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}