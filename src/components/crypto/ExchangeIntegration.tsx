import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, ExternalLink, Key, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import binanceIcon from "@/assets/binance-icon.png";

interface ExchangeAccount {
  id: string;
  exchange: 'binance' | 'bybit';
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  totalBalance: number;
  isAutoSync: boolean;
}

interface ExchangeIntegrationProps {
  onImportHoldings: (holdings: any[]) => void;
}

export default function ExchangeIntegration({ onImportHoldings }: ExchangeIntegrationProps) {
  const [connectedAccounts, setConnectedAccounts] = useState<ExchangeAccount[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Binance connection state
  const [binanceApiKey, setBinanceApiKey] = useState('');
  const [binanceSecret, setBinanceSecret] = useState('');
  
  // Bybit connection state
  const [bybitApiKey, setBybitApiKey] = useState('');
  const [bybitSecret, setBybitSecret] = useState('');

  const connectBinance = async () => {
    if (!binanceApiKey || !binanceSecret) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both API key and secret",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    try {
      // Call Supabase edge function to handle Binance API connection
      const { data, error } = await supabase.functions.invoke('binance-integration', {
        body: {
          action: 'connect',
          apiKey: binanceApiKey,
          secret: binanceSecret
        }
      });

      if (error) throw error;

      if (data.success) {
        const newAccount: ExchangeAccount = {
          id: `binance-${Date.now()}`,
          exchange: 'binance',
          name: 'Binance Account',
          status: 'connected',
          lastSync: new Date().toISOString(),
          totalBalance: data.totalBalance || 0,
          isAutoSync: false
        };

        setConnectedAccounts(prev => [...prev, newAccount]);
        
        // Import holdings if available
        if (data.holdings && data.holdings.length > 0) {
          onImportHoldings(data.holdings);
        }

        toast({
          title: "Binance Connected",
          description: `Successfully connected to Binance. Found ${data.holdings?.length || 0} holdings.`
        });

        // Clear credentials
        setBinanceApiKey('');
        setBinanceSecret('');
      }
    } catch (error) {
      console.error('Binance connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Binance. Please check your credentials.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const connectBybit = async () => {
    if (!bybitApiKey || !bybitSecret) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both API key and secret",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    try {
      // Call Supabase edge function to handle Bybit API connection
      const { data, error } = await supabase.functions.invoke('bybit-integration', {
        body: {
          action: 'connect',
          apiKey: bybitApiKey,
          secret: bybitSecret
        }
      });

      if (error) throw error;

      if (data.success) {
        const newAccount: ExchangeAccount = {
          id: `bybit-${Date.now()}`,
          exchange: 'bybit',
          name: 'Bybit Account',
          status: 'connected',
          lastSync: new Date().toISOString(),
          totalBalance: data.totalBalance || 0,
          isAutoSync: false
        };

        setConnectedAccounts(prev => [...prev, newAccount]);
        
        // Import holdings if available
        if (data.holdings && data.holdings.length > 0) {
          onImportHoldings(data.holdings);
        }

        toast({
          title: "Bybit Connected",
          description: `Successfully connected to Bybit. Found ${data.holdings?.length || 0} holdings.`
        });

        // Clear credentials
        setBybitApiKey('');
        setBybitSecret('');
      }
    } catch (error) {
      console.error('Bybit connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Bybit. Please check your credentials.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const syncAccount = async (accountId: string) => {
    setIsSyncing(true);
    const account = connectedAccounts.find(acc => acc.id === accountId);
    
    if (!account) return;

    try {
      const functionName = account.exchange === 'binance' ? 'binance-integration' : 'bybit-integration';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          action: 'sync',
          accountId: account.id
        }
      });

      if (error) throw error;

      if (data.success) {
        // Update account status and last sync
        setConnectedAccounts(prev => 
          prev.map(acc => 
            acc.id === accountId 
              ? { ...acc, lastSync: new Date().toISOString(), totalBalance: data.totalBalance || acc.totalBalance }
              : acc
          )
        );

        // Import new/updated holdings
        if (data.holdings && data.holdings.length > 0) {
          onImportHoldings(data.holdings);
        }

        toast({
          title: "Sync Complete",
          description: `Successfully synced ${account.exchange} account`
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: `Failed to sync ${account.exchange} account`,
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleAutoSync = (accountId: string, enabled: boolean) => {
    setConnectedAccounts(prev =>
      prev.map(acc =>
        acc.id === accountId ? { ...acc, isAutoSync: enabled } : acc
      )
    );

    toast({
      title: enabled ? "Auto-sync Enabled" : "Auto-sync Disabled",
      description: `Auto-sync ${enabled ? 'enabled' : 'disabled'} for account`
    });
  };

  const disconnectAccount = (accountId: string) => {
    setConnectedAccounts(prev => prev.filter(acc => acc.id !== accountId));
    toast({
      title: "Account Disconnected",
      description: "Exchange account has been disconnected"
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ExternalLink className="h-4 w-4" />
          Exchange Integration
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Exchange Integration</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="accounts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="accounts">Connected Accounts</TabsTrigger>
            <TabsTrigger value="connect">Connect New</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Connected Accounts</h3>
              
              {connectedAccounts.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No exchange accounts connected</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Connect to Binance or Bybit to automatically sync your portfolio
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {connectedAccounts.map((account) => (
                    <Card key={account.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <span className="font-bold text-primary">
                                {account.exchange === 'binance' ? 'B' : 'BY'}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold capitalize">{account.exchange}</h4>
                              <p className="text-sm text-muted-foreground">
                                Last sync: {new Date(account.lastSync).toLocaleString()}
                              </p>
                              <p className="text-sm font-medium">
                                Balance: ${account.totalBalance.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {account.status === 'connected' ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                              <Badge variant={account.status === 'connected' ? 'default' : 'destructive'}>
                                {account.status}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`auto-sync-${account.id}`} className="text-sm">
                                Auto-sync
                              </Label>
                              <Switch
                                id={`auto-sync-${account.id}`}
                                checked={account.isAutoSync}
                                onCheckedChange={(checked) => toggleAutoSync(account.id, checked)}
                              />
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => syncAccount(account.id)}
                                disabled={isSyncing}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => disconnectAccount(account.id)}
                              >
                                Disconnect
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="connect" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Binance Connection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded flex items-center justify-center">
                      <img src={binanceIcon} alt="Binance" className="w-8 h-8 rounded" />
                    </div>
                    Connect Binance
                  </CardTitle>
                  <CardDescription>
                    Import your Binance spot trading portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="binance-api-key">API Key</Label>
                    <Input
                      id="binance-api-key"
                      type="password"
                      placeholder="Enter Binance API Key"
                      value={binanceApiKey}
                      onChange={(e) => setBinanceApiKey(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="binance-secret">Secret Key</Label>
                    <Input
                      id="binance-secret"
                      type="password"
                      placeholder="Enter Binance Secret Key"
                      value={binanceSecret}
                      onChange={(e) => setBinanceSecret(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium">Required Permissions:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Enable Reading</li>
                        <li>Spot & Margin Trading (read-only)</li>
                      </ul>
                    </div>
                  </div>

                  <Button
                    onClick={connectBinance}
                    disabled={!binanceApiKey || !binanceSecret || isConnecting}
                    className="w-full"
                  >
                    {isConnecting ? "Connecting..." : "Connect Binance"}
                  </Button>
                  
                  <div className="text-center">
                    <Button variant="link" size="sm" asChild>
                      <a href="https://www.binance.com/en/my/settings/api-management" target="_blank" rel="noopener noreferrer">
                        <Key className="h-4 w-4 mr-1" />
                        Get Binance API Keys
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Bybit Connection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-orange-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">BY</span>
                    </div>
                    Connect Bybit
                  </CardTitle>
                  <CardDescription>
                    Import your Bybit spot trading portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bybit-api-key">API Key</Label>
                    <Input
                      id="bybit-api-key"
                      type="password"
                      placeholder="Enter Bybit API Key"
                      value={bybitApiKey}
                      onChange={(e) => setBybitApiKey(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bybit-secret">Secret Key</Label>
                    <Input
                      id="bybit-secret"
                      type="password"
                      placeholder="Enter Bybit Secret Key"
                      value={bybitSecret}
                      onChange={(e) => setBybitSecret(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium">Required Permissions:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Read-Only</li>
                        <li>Spot Trading (read access)</li>
                      </ul>
                    </div>
                  </div>

                  <Button
                    onClick={connectBybit}
                    disabled={!bybitApiKey || !bybitSecret || isConnecting}
                    className="w-full"
                  >
                    {isConnecting ? "Connecting..." : "Connect Bybit"}
                  </Button>
                  
                  <div className="text-center">
                    <Button variant="link" size="sm" asChild>
                      <a href="https://www.bybit.com/app/user/api-management" target="_blank" rel="noopener noreferrer">
                        <Key className="h-4 w-4 mr-1" />
                        Get Bybit API Keys
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Security Notice:</p>
                    <ul className="space-y-1">
                      <li>• API keys are only used temporarily to fetch your portfolio data</li>
                      <li>• We never store your API keys or secret keys</li>
                      <li>• Only read-only permissions are required</li>
                      <li>• You can revoke API access anytime from your exchange settings</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}