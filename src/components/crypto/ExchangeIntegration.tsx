import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, ExternalLink, Key, RefreshCw, CheckCircle, XCircle, Trash2, Edit } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import binanceIcon from "@/assets/binance-icon.png";
import bybitIcon from "@/assets/bybit-icon.png";
import { Database } from "@/integrations/supabase/types";
type ExchangeAccount = Database['public']['Tables']['exchange_accounts']['Row'];
interface ExchangeIntegrationProps {
  onImportHoldings: (holdings: any[]) => void;
}
export default function ExchangeIntegration({
  onImportHoldings
}: ExchangeIntegrationProps) {
  const [connectedAccounts, setConnectedAccounts] = useState<ExchangeAccount[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Binance connection state
  const [binanceApiKey, setBinanceApiKey] = useState('');
  const [binanceSecret, setBinanceSecret] = useState('');
  const [binanceAccountName, setBinanceAccountName] = useState('');

  // Bybit connection state
  const [bybitApiKey, setBybitApiKey] = useState('');
  const [bybitSecret, setBybitSecret] = useState('');
  const [bybitAccountName, setBybitAccountName] = useState('');

  // Load connected accounts on component mount
  useEffect(() => {
    loadConnectedAccounts();
  }, []);
  const loadConnectedAccounts = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('exchange_accounts').select('*').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setConnectedAccounts((data || []) as ExchangeAccount[]);
    } catch (error) {
      console.error('Error loading connected accounts:', error);
      toast({
        title: "Error",
        description: "Failed to load connected accounts",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const saveAccount = async (exchangeName: 'binance' | 'bybit', accountName: string, apiKey: string, apiSecret: string) => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const {
        data,
        error
      } = await supabase.from('exchange_accounts').insert({
        user_id: user.id,
        exchange_name: exchangeName,
        account_name: accountName,
        api_key: apiKey,
        api_secret: apiSecret,
        is_active: true
      }).select().single();
      if (error) throw error;

      // Add to local state
      setConnectedAccounts(prev => [data as ExchangeAccount, ...prev]);
      return data;
    } catch (error) {
      console.error('Error saving account:', error);
      throw error;
    }
  };
  const updateLastSync = async (accountId: string) => {
    try {
      const {
        error
      } = await supabase.from('exchange_accounts').update({
        last_synced_at: new Date().toISOString()
      }).eq('id', accountId);
      if (error) throw error;

      // Update local state
      setConnectedAccounts(prev => prev.map(acc => acc.id === accountId ? {
        ...acc,
        last_synced_at: new Date().toISOString()
      } : acc));
    } catch (error) {
      console.error('Error updating last sync:', error);
    }
  };
  const deleteAccount = async (accountId: string) => {
    try {
      const {
        error
      } = await supabase.from('exchange_accounts').delete().eq('id', accountId);
      if (error) throw error;
      setConnectedAccounts(prev => prev.filter(acc => acc.id !== accountId));
      toast({
        title: "Account Deleted",
        description: "Exchange account has been removed"
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive"
      });
    }
  };
  const connectBinance = async () => {
    if (!binanceApiKey || !binanceSecret || !binanceAccountName) {
      toast({
        title: "Missing Information",
        description: "Please enter account name, API key and secret",
        variant: "destructive"
      });
      return;
    }
    setIsConnecting(true);
    try {
      // Test the connection first
      const {
        data,
        error
      } = await supabase.functions.invoke('binance-integration', {
        body: {
          action: 'connect',
          apiKey: binanceApiKey,
          secret: binanceSecret
        }
      });
      if (error) throw error;
      if (data.success) {
        // Save to database
        const savedAccount = await saveAccount('binance', binanceAccountName, binanceApiKey, binanceSecret);

        // Import holdings if available
        if (data.holdings && data.holdings.length > 0) {
          onImportHoldings(data.holdings);
        }
        toast({
          title: "Binance Connected",
          description: `Successfully connected to Binance. Found ${data.holdings?.length || 0} holdings.`
        });

        // Clear form
        setBinanceApiKey('');
        setBinanceSecret('');
        setBinanceAccountName('');
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
    if (!bybitApiKey || !bybitSecret || !bybitAccountName) {
      toast({
        title: "Missing Information",
        description: "Please enter account name, API key and secret",
        variant: "destructive"
      });
      return;
    }
    setIsConnecting(true);
    try {
      // Test the connection first
      const {
        data,
        error
      } = await supabase.functions.invoke('bybit-integration', {
        body: {
          action: 'connect',
          apiKey: bybitApiKey,
          secret: bybitSecret
        }
      });
      console.log('Bybit connection response:', {
        data,
        error
      });
      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      if (data?.success) {
        // Save to database
        const savedAccount = await saveAccount('bybit', bybitAccountName, bybitApiKey, bybitSecret);

        // Import holdings if available
        if (data.holdings && data.holdings.length > 0) {
          onImportHoldings(data.holdings);
        }
        toast({
          title: "Bybit Connected",
          description: `Successfully connected to Bybit. Found ${data.holdings?.length || 0} holdings.`
        });

        // Clear form
        setBybitApiKey('');
        setBybitSecret('');
        setBybitAccountName('');
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
  const syncAccount = async (account: ExchangeAccount) => {
    setIsSyncing(true);
    try {
      const functionName = account.exchange_name === 'binance' ? 'binance-integration' : 'bybit-integration';
      const {
        data,
        error
      } = await supabase.functions.invoke(functionName, {
        body: {
          action: 'connect',
          // Use connect action with stored credentials
          apiKey: account.api_key,
          secret: account.api_secret
        }
      });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Function error: ${error.message || 'Unknown error'}`);
      }
      
      if (!data) {
        throw new Error('No data returned from exchange API');
      }
      
      if (data.success) {
        // Update last sync time
        await updateLastSync(account.id);

        // Import new/updated holdings
        if (data.holdings && data.holdings.length > 0) {
          onImportHoldings(data.holdings);
        }
        toast({
          title: "Sync Complete",
          description: `Successfully synced ${account.exchange_name} account`
        });
      } else {
        throw new Error(data.error || 'Sync failed without specific error');
      }
    } catch (error) {
      console.error('Sync error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Sync Failed",
        description: `Failed to sync ${account.exchange_name} account: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };
  const toggleAccountActive = async (accountId: string, isActive: boolean) => {
    try {
      const {
        error
      } = await supabase.from('exchange_accounts').update({
        is_active: isActive
      }).eq('id', accountId);
      if (error) throw error;
      setConnectedAccounts(prev => prev.map(acc => acc.id === accountId ? {
        ...acc,
        is_active: isActive
      } : acc));
      toast({
        title: isActive ? "Account Activated" : "Account Deactivated",
        description: `Account ${isActive ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error('Error toggling account status:', error);
      toast({
        title: "Error",
        description: "Failed to update account status",
        variant: "destructive"
      });
    }
  };
  return <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 text-base text-emerald-600">
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
              
              {isLoading ? <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">Loading connected accounts...</p>
                  </CardContent>
                </Card> : connectedAccounts.length === 0 ? <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No exchange accounts connected</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Connect to Binance or Bybit to automatically sync your portfolio
                    </p>
                  </CardContent>
                </Card> : <div className="space-y-4">
                  {connectedAccounts.map(account => <Card key={account.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              {account.exchange_name === 'binance' ? <img src={binanceIcon} alt="Binance" className="w-8 h-8 rounded" /> : <img src={bybitIcon} alt="Bybit" className="w-8 h-8 rounded" />}
                            </div>
                            <div>
                              <h4 className="font-semibold">{account.account_name}</h4>
                              <p className="text-sm text-muted-foreground capitalize">
                                {account.exchange_name} Account
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Last sync: {account.last_synced_at ? new Date(account.last_synced_at).toLocaleString() : 'Never'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {account.is_active ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                              <Badge variant={account.is_active ? 'default' : 'secondary'}>
                                {account.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`active-${account.id}`} className="text-sm">
                                Active
                              </Label>
                              <Switch id={`active-${account.id}`} checked={account.is_active} onCheckedChange={checked => toggleAccountActive(account.id, checked)} />
                            </div>
                            
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => syncAccount(account)} disabled={isSyncing || !account.is_active}>
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => deleteAccount(account.id)} className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>)}
                </div>}
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
                    <Label htmlFor="binance-account-name">Account Name</Label>
                    <Input id="binance-account-name" type="text" placeholder="e.g., Main Account, Trading Account" value={binanceAccountName} onChange={e => setBinanceAccountName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="binance-api-key">API Key</Label>
                    <Input id="binance-api-key" type="password" placeholder="Enter Binance API Key" value={binanceApiKey} onChange={e => setBinanceApiKey(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="binance-secret">Secret Key</Label>
                    <Input id="binance-secret" type="password" placeholder="Enter Binance Secret Key" value={binanceSecret} onChange={e => setBinanceSecret(e.target.value)} />
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

                  <Button onClick={connectBinance} disabled={!binanceApiKey || !binanceSecret || !binanceAccountName || isConnecting} className="w-full">
                    {isConnecting ? "Connecting..." : "Connect & Save"}
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
                    <div className="w-8 h-8 rounded flex items-center justify-center">
                      <img src={bybitIcon} alt="Bybit" className="w-8 h-8 rounded" />
                    </div>
                    Connect Bybit
                  </CardTitle>
                  <CardDescription>
                    Import your Bybit spot trading portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bybit-account-name">Account Name</Label>
                    <Input id="bybit-account-name" type="text" placeholder="e.g., Main Account, Trading Account" value={bybitAccountName} onChange={e => setBybitAccountName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bybit-api-key">API Key</Label>
                    <Input id="bybit-api-key" type="password" placeholder="Enter Bybit API Key" value={bybitApiKey} onChange={e => setBybitApiKey(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bybit-secret">Secret Key</Label>
                    <Input id="bybit-secret" type="password" placeholder="Enter Bybit Secret Key" value={bybitSecret} onChange={e => setBybitSecret(e.target.value)} />
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

                  <Button onClick={connectBybit} disabled={!bybitApiKey || !bybitSecret || !bybitAccountName || isConnecting} className="w-full">
                    {isConnecting ? "Connecting..." : "Connect & Save"}
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
                      <li>• API keys will be saved securely in your account for automatic syncing</li>
                      <li>• Only read-only permissions are required</li>
                      <li>• You can delete saved accounts anytime</li>
                      <li>• You can revoke API access anytime from your exchange settings</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>;
}