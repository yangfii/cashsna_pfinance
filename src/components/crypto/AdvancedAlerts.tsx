import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bell, TrendingUp, TrendingDown, Target, AlertTriangle } from "lucide-react";
import { CryptoHolding } from "@/hooks/useCryptoData";
import { useToast } from "@/hooks/use-toast";

interface AdvancedAlert {
  id: string;
  name: string;
  symbol: string;
  conditions: AlertCondition[];
  actions: AlertAction[];
  isActive: boolean;
  isTriggered: boolean;
}

interface AlertCondition {
  type: 'price' | 'volume' | 'market_cap' | 'change_24h' | 'rsi' | 'moving_average';
  operator: 'above' | 'below' | 'crosses_above' | 'crosses_below' | 'between';
  value: number;
  value2?: number; // For 'between' operator
}

interface AlertAction {
  type: 'notification' | 'email' | 'sms' | 'webhook' | 'telegram' | 'push';
  enabled: boolean;
  config?: any;
}

interface AdvancedAlertsProps {
  holdings: CryptoHolding[];
  onCreateAlert: (alert: Omit<AdvancedAlert, 'id' | 'isTriggered'>) => void;
}

export default function AdvancedAlerts({ holdings, onCreateAlert }: AdvancedAlertsProps) {
  const [newAlert, setNewAlert] = useState({
    name: "",
    symbol: "",
    conditions: [] as AlertCondition[],
    actions: [
      { type: 'notification' as const, enabled: true },
      { type: 'email' as const, enabled: false },
      { type: 'telegram' as const, enabled: false },
      { type: 'push' as const, enabled: false }
    ] as AlertAction[],
    isActive: true
  });

  const [currentCondition, setCurrentCondition] = useState({
    type: 'price' as AlertCondition['type'],
    operator: 'above' as AlertCondition['operator'],
    value: 0,
    value2: 0
  });

  const { toast } = useToast();

  const conditionTypes = [
    { value: 'price', label: 'Price', icon: Target },
    { value: 'change_24h', label: '24h Change %', icon: TrendingUp },
    { value: 'volume', label: 'Volume', icon: TrendingDown },
    { value: 'market_cap', label: 'Market Cap', icon: Target },
    { value: 'rsi', label: 'RSI', icon: AlertTriangle },
    { value: 'moving_average', label: 'Moving Average', icon: TrendingUp }
  ];

  const operators = [
    { value: 'above', label: 'Above' },
    { value: 'below', label: 'Below' },
    { value: 'crosses_above', label: 'Crosses Above' },
    { value: 'crosses_below', label: 'Crosses Below' },
    { value: 'between', label: 'Between' }
  ];

  const addCondition = () => {
    if (currentCondition.value === 0) {
      toast({
        title: "Invalid Condition",
        description: "Please enter a valid value for the condition",
        variant: "destructive"
      });
      return;
    }

    setNewAlert({
      ...newAlert,
      conditions: [...newAlert.conditions, { ...currentCondition }]
    });

    setCurrentCondition({
      type: 'price',
      operator: 'above',
      value: 0,
      value2: 0
    });
  };

  const removeCondition = (index: number) => {
    setNewAlert({
      ...newAlert,
      conditions: newAlert.conditions.filter((_, i) => i !== index)
    });
  };

  const toggleAction = (actionType: string) => {
    setNewAlert({
      ...newAlert,
      actions: newAlert.actions.map(action =>
        action.type === actionType
          ? { ...action, enabled: !action.enabled }
          : action
      )
    });
  };

  const createAlert = () => {
    if (!newAlert.name || !newAlert.symbol || newAlert.conditions.length === 0) {
      toast({
        title: "Incomplete Alert",
        description: "Please provide a name, select a cryptocurrency, and add at least one condition",
        variant: "destructive"
      });
      return;
    }

    onCreateAlert(newAlert);

    // Reset form
    setNewAlert({
      name: "",
      symbol: "",
      conditions: [],
      actions: [
        { type: 'notification', enabled: true },
        { type: 'email', enabled: false },
        { type: 'telegram', enabled: false },
        { type: 'push', enabled: false }
      ],
      isActive: true
    });

    toast({
      title: "Alert Created",
      description: "Your advanced alert has been created successfully",
    });
  };

  const getConditionDisplay = (condition: AlertCondition) => {
    const typeLabel = conditionTypes.find(t => t.value === condition.type)?.label;
    const operatorLabel = operators.find(o => o.value === condition.operator)?.label;
    
    if (condition.operator === 'between') {
      return `${typeLabel} ${operatorLabel} ${condition.value} and ${condition.value2}`;
    }
    
    return `${typeLabel} ${operatorLabel} ${condition.value}`;
  };

  const uniqueHoldings = holdings.reduce((acc, holding) => {
    if (!acc.find(h => h.symbol === holding.symbol)) {
      acc.push(holding);
    }
    return acc;
  }, [] as CryptoHolding[]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Advanced Alert Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Alert Info */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="alert-name">Alert Name</Label>
            <Input
              id="alert-name"
              placeholder="e.g., Bitcoin Bull Market Alert"
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
                ))
                }
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Conditions */}
        <div className="space-y-4">
          <h4 className="font-medium">Conditions</h4>
          
          {/* Existing Conditions */}
          {newAlert.conditions.map((condition, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">{getConditionDisplay(condition)}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => removeCondition(index)}
              >
                Remove
              </Button>
            </div>
          ))}

          {/* Add New Condition */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
            <div>
              <Label>Condition Type</Label>
              <Select 
                value={currentCondition.type} 
                onValueChange={(value: AlertCondition['type']) => 
                  setCurrentCondition({ ...currentCondition, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {conditionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Operator</Label>
              <Select 
                value={currentCondition.operator} 
                onValueChange={(value: AlertCondition['operator']) => 
                  setCurrentCondition({ ...currentCondition, operator: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Value</Label>
              <Input
                type="number"
                step="0.01"
                value={currentCondition.value}
                onChange={(e) => setCurrentCondition({ 
                  ...currentCondition, 
                  value: parseFloat(e.target.value) || 0 
                })}
              />
            </div>

            {currentCondition.operator === 'between' && (
              <div>
                <Label>Value 2</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={currentCondition.value2}
                  onChange={(e) => setCurrentCondition({ 
                    ...currentCondition, 
                    value2: parseFloat(e.target.value) || 0 
                  })}
                />
              </div>
            )}

            <div className="flex items-end">
              <Button onClick={addCondition} className="w-full">
                Add Condition
              </Button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <h4 className="font-medium">Notification Actions</h4>
          
          <div className="space-y-3">
            {newAlert.actions.map((action) => (
              <div key={action.type} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="capitalize">{action.type}</span>
                  {action.type === 'sms' && (
                    <Badge variant="secondary">Pro Feature</Badge>
                  )}
                  {action.type === 'telegram' && (
                    <Badge variant="outline">Setup Required</Badge>
                  )}
                  {action.type === 'push' && (
                    <Badge variant="outline">Browser</Badge>
                  )}
                </div>
                <Switch
                  checked={action.enabled}
                  onCheckedChange={() => toggleAction(action.type)}
                  disabled={action.type === 'email' || action.type === 'sms'}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Create Button */}
        <Button onClick={createAlert} className="w-full" size="lg">
          Create Advanced Alert
        </Button>
      </CardContent>
    </Card>
  );
}
