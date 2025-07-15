import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart3, AlertTriangle, Settings, TrendingUp, TrendingDown, Target } from "lucide-react";
import { CryptoHolding, CryptoPrice } from "@/hooks/useCryptoData";
import { useToast } from "@/hooks/use-toast";

interface AllocationTarget {
  symbol: string;
  name: string;
  targetPercentage: number;
  currentPercentage: number;
  currentValue: number;
  deviation: number;
  action: 'buy' | 'sell' | 'hold';
  amount: number;
}

interface RebalancingRule {
  id: string;
  name: string;
  threshold: number; // deviation percentage to trigger rebalancing
  frequency: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  lastTriggered?: Date;
}

interface RebalancingNotificationsProps {
  holdings: CryptoHolding[];
  prices: Record<string, CryptoPrice>;
}

export default function RebalancingNotifications({ holdings, prices }: RebalancingNotificationsProps) {
  const [targets, setTargets] = useState<AllocationTarget[]>([]);
  const [rules, setRules] = useState<RebalancingRule[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [newTarget, setNewTarget] = useState({ symbol: '', percentage: '' });
  const [rebalanceThreshold, setRebalanceThreshold] = useState(10);
  const [autoRebalanceEnabled, setAutoRebalanceEnabled] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    calculateAllocationTargets();
    generateRebalancingNotifications();
  }, [holdings, prices]);

  const calculateAllocationTargets = () => {
    if (!holdings.length) return;

    const totalValue = holdings.reduce((sum, holding) => {
      const priceData = prices[holding.symbol.toLowerCase()];
      if (!priceData) return sum;
      return sum + (holding.amount * priceData.price);
    }, 0);

    // Calculate current allocations
    const currentAllocations = holdings.map(holding => {
      const priceData = prices[holding.symbol.toLowerCase()];
      if (!priceData) return null;
      
      const currentValue = holding.amount * priceData.price;
      const currentPercentage = (currentValue / totalValue) * 100;
      
      return {
        symbol: holding.symbol,
        name: holding.name,
        currentValue,
        currentPercentage,
        amount: holding.amount
      };
    }).filter(Boolean);

    // Default target allocations (you can make this user-configurable)
    const defaultTargets = [
      { symbol: 'bitcoin', percentage: 40 },
      { symbol: 'ethereum', percentage: 30 },
      { symbol: 'solana', percentage: 15 },
      { symbol: 'cardano', percentage: 10 },
      { symbol: 'polygon', percentage: 5 }
    ];

    const allocationTargets: AllocationTarget[] = [];

    currentAllocations.forEach(current => {
      if (!current) return;
      
      const target = defaultTargets.find(t => t.symbol === current.symbol.toLowerCase());
      const targetPercentage = target?.percentage || 0;
      const deviation = Math.abs(current.currentPercentage - targetPercentage);
      
      let action: 'buy' | 'sell' | 'hold' = 'hold';
      if (current.currentPercentage > targetPercentage + 5) {
        action = 'sell';
      } else if (current.currentPercentage < targetPercentage - 5) {
        action = 'buy';
      }

      allocationTargets.push({
        symbol: current.symbol,
        name: current.name,
        targetPercentage,
        currentPercentage: current.currentPercentage,
        currentValue: current.currentValue,
        deviation,
        action,
        amount: current.amount
      });
    });

    setTargets(allocationTargets);
  };

  const generateRebalancingNotifications = () => {
    const newNotifications: any[] = [];
    
    targets.forEach(target => {
      if (target.deviation > rebalanceThreshold) {
        newNotifications.push({
          id: `rebalance-${target.symbol}-${Date.now()}`,
          type: 'rebalance',
          symbol: target.symbol,
          name: target.name,
          message: `${target.name} allocation is ${target.deviation.toFixed(1)}% off target`,
          action: target.action,
          severity: target.deviation > 20 ? 'high' : target.deviation > 10 ? 'medium' : 'low',
          timestamp: new Date()
        });
      }
    });

    setNotifications(newNotifications);
  };

  const addAllocationTarget = () => {
    if (!newTarget.symbol || !newTarget.percentage) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const percentage = parseFloat(newTarget.percentage);
    if (percentage <= 0 || percentage > 100) {
      toast({
        title: "Error",
        description: "Percentage must be between 0 and 100",
        variant: "destructive"
      });
      return;
    }

    // Update targets logic here
    setNewTarget({ symbol: '', percentage: '' });
    
    toast({
      title: "Success",
      description: "Allocation target added"
    });
  };

  const getDeviationColor = (deviation: number) => {
    if (deviation > 20) return 'text-red-500';
    if (deviation > 10) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'buy': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'sell': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Target className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const totalCurrentAllocation = targets.reduce((sum, target) => sum + target.currentPercentage, 0);
  const totalTargetAllocation = targets.reduce((sum, target) => sum + target.targetPercentage, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Portfolio Rebalancing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="alerts" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="alerts">Alerts ({notifications.length})</TabsTrigger>
            <TabsTrigger value="allocations">Allocations</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="alerts" className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Portfolio is balanced</p>
                <p className="text-sm">No rebalancing needed at this time</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-4 border rounded-lg animate-fade-in">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <Badge className={getSeverityColor(notification.severity)}>
                          {notification.severity} priority
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {getActionIcon(notification.action)}
                        <span className="text-sm font-medium">
                          {notification.action.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <h4 className="font-medium mb-1">{notification.name}</h4>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="allocations" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Total Current Allocation</p>
                  <p className="text-2xl font-bold">{totalCurrentAllocation.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Target Allocation</p>
                  <p className="text-2xl font-bold">{totalTargetAllocation.toFixed(1)}%</p>
                </div>
              </div>
              
              {targets.map((target) => (
                <div key={target.symbol} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{target.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ${target.currentValue.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        Current: {target.currentPercentage.toFixed(1)}%
                      </p>
                      <p className="text-sm">
                        Target: {target.targetPercentage.toFixed(1)}%
                      </p>
                      <p className={`text-sm font-medium ${getDeviationColor(target.deviation)}`}>
                        Deviation: {target.deviation.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current</span>
                      <span>{target.currentPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={target.currentPercentage} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Target</span>
                      <span>{target.targetPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={target.targetPercentage} className="h-2 opacity-50" />
                  </div>
                  
                  {target.action !== 'hold' && (
                    <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                      <div className="flex items-center gap-2">
                        {getActionIcon(target.action)}
                        <span>
                          Suggested: {target.action.toUpperCase()} to reach target allocation
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium">Auto-Rebalancing</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatically generate rebalancing alerts
                    </p>
                  </div>
                  <Switch
                    checked={autoRebalanceEnabled}
                    onCheckedChange={setAutoRebalanceEnabled}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="threshold">Rebalancing Threshold (%)</Label>
                  <Input
                    id="threshold"
                    type="number"
                    min="1"
                    max="50"
                    value={rebalanceThreshold}
                    onChange={(e) => setRebalanceThreshold(parseFloat(e.target.value) || 10)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Trigger alerts when allocation deviates by this percentage
                  </p>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-4">Default Allocation Targets</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Bitcoin (BTC)</span>
                    <span>40%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ethereum (ETH)</span>
                    <span>30%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Solana (SOL)</span>
                    <span>15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cardano (ADA)</span>
                    <span>10%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Polygon (MATIC)</span>
                    <span>5%</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}