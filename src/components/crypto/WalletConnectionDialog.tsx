import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Key, Globe, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import bybitLogo from "@/assets/bybit-logo.png";
import coinbaseLogo from "@/assets/coinbase-logo.png";
import binanceLogo from "@/assets/binance-logo.png";
import coinbaseWalletLogo from "@/assets/coinbase-wallet-logo.png";

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface WalletConnection {
  id: string;
  name: string;
  type: 'api' | 'wallet';
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: Date;
}

interface WalletConnectionDialogProps {
  onConnect: (connection: { type: string; apiKey?: string; address?: string }) => void;
}

export default function WalletConnectionDialog({ onConnect }: WalletConnectionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("exchanges");
  const [connectionData, setConnectionData] = useState({
    exchange: "",
    apiKey: "",
    apiSecret: "",
    walletAddress: "",
    walletType: ""
  });
  
  const { toast } = useToast();

  const exchanges = [
    { id: "binance", name: "Binance", icon: "🟡", status: "supported" },
    { id: "coinbase", name: "Coinbase Pro", icon: "🔵", status: "supported" },
    { id: "kraken", name: "Kraken", icon: "🟣", status: "supported" },
    { id: "bybit", name: "Bybit", icon: "🟠", status: "supported" },
    { id: "kucoin", name: "KuCoin", icon: "🟢", status: "coming_soon" }
  ];

  const wallets = [
    { id: "metamask", name: "MetaMask", icon: "🦊", status: "supported" },
    { id: "trust", name: "Trust Wallet", icon: "💙", status: "supported" },
    { id: "coinbase_wallet", name: "Coinbase Wallet", icon: "🔵", status: "supported" },
    { id: "ledger", name: "Ledger", icon: "⚫", status: "coming_soon" }
  ];

  const handleExchangeConnect = () => {
    if (!connectionData.exchange || !connectionData.apiKey) {
      toast({
        title: "Missing Information",
        description: "Please select an exchange and provide API credentials",
        variant: "destructive"
      });
      return;
    }

    // In a real implementation, this would validate the API credentials
    onConnect({
      type: connectionData.exchange,
      apiKey: connectionData.apiKey
    });

    toast({
      title: "Exchange Connected",
      description: `Successfully connected to ${connectionData.exchange}`,
    });

    setIsOpen(false);
    resetForm();
  };

  const handleWalletConnect = async () => {
    if (!connectionData.walletType) {
      toast({
        title: "Select Wallet Type",
        description: "Please select a wallet type to connect",
        variant: "destructive"
      });
      return;
    }

    if (connectionData.walletType === "metamask") {
      try {
        // Check if MetaMask is installed
        if (typeof window.ethereum !== 'undefined') {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts.length > 0) {
            onConnect({
              type: "metamask",
              address: accounts[0]
            });
            
            toast({
              title: "Wallet Connected",
              description: `MetaMask connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
            });
            
            setIsOpen(false);
            resetForm();
          }
        } else {
          toast({
            title: "MetaMask Not Found",
            description: "Please install MetaMask extension",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Connection Failed",
          description: "Failed to connect to MetaMask",
          variant: "destructive"
        });
      }
    } else if (connectionData.walletAddress) {
      onConnect({
        type: connectionData.walletType,
        address: connectionData.walletAddress
      });
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${connectionData.walletType}`,
      });
      
      setIsOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setConnectionData({
      exchange: "",
      apiKey: "",
      apiSecret: "",
      walletAddress: "",
      walletType: ""
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Wallet className="h-4 w-4 mr-2" />
          Connect Wallet/Exchange
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect Wallets & Exchanges</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="exchanges">Exchanges</TabsTrigger>
            <TabsTrigger value="wallets">Wallets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="exchanges" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Connect Exchange
                </CardTitle>
                <CardDescription>
                  Connect your exchange account to automatically sync your holdings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {exchanges.map((exchange) => (
                    <Card 
                      key={exchange.id}
                      className={`cursor-pointer transition-colors ${
                        connectionData.exchange === exchange.id ? 'ring-2 ring-primary' : ''
                      } ${exchange.status === 'coming_soon' ? 'opacity-50' : ''}`}
                      onClick={() => exchange.status === 'supported' && setConnectionData({ 
                        ...connectionData, 
                        exchange: exchange.id 
                      })}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">
                          {exchange.id === "bybit" ? (
                            <img src={bybitLogo} alt="Bybit" className="h-8 w-8 mx-auto" />
                          ) : exchange.id === "coinbase" ? (
                            <img src={coinbaseLogo} alt="Coinbase Pro" className="h-8 w-8 mx-auto" />
                          ) : exchange.id === "binance" ? (
                            <img src={binanceLogo} alt="Binance" className="h-8 w-8 mx-auto" />
                          ) : (
                            exchange.icon
                          )}
                        </div>
                        <div className="font-medium">{exchange.name}</div>
                        <Badge variant={exchange.status === 'supported' ? 'default' : 'secondary'} className="mt-2">
                          {exchange.status === 'supported' ? 'Supported' : 'Coming Soon'}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {connectionData.exchange && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Key className="h-4 w-4" />
                      API Configuration
                    </div>
                    
                    <div>
                      <Label htmlFor="api-key">API Key</Label>
                      <Input
                        id="api-key"
                        type="password"
                        placeholder="Enter your API key"
                        value={connectionData.apiKey}
                        onChange={(e) => setConnectionData({ ...connectionData, apiKey: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="api-secret">API Secret (Optional)</Label>
                      <Input
                        id="api-secret"
                        type="password"
                        placeholder="Enter your API secret"
                        value={connectionData.apiSecret}
                        onChange={(e) => setConnectionData({ ...connectionData, apiSecret: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      Your API keys are stored securely and never shared
                    </div>
                    
                    <Button onClick={handleExchangeConnect} className="w-full">
                      Connect {exchanges.find(e => e.id === connectionData.exchange)?.name}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="wallets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Connect Wallet
                </CardTitle>
                <CardDescription>
                  Connect your crypto wallet to track your holdings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {wallets.map((wallet) => (
                    <Card 
                      key={wallet.id}
                      className={`cursor-pointer transition-colors ${
                        connectionData.walletType === wallet.id ? 'ring-2 ring-primary' : ''
                      } ${wallet.status === 'coming_soon' ? 'opacity-50' : ''}`}
                      onClick={() => wallet.status === 'supported' && setConnectionData({ 
                        ...connectionData, 
                        walletType: wallet.id 
                      })}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">
                          {wallet.id === "coinbase_wallet" ? (
                            <img src={coinbaseWalletLogo} alt="Coinbase Wallet" className="h-8 w-8 mx-auto" />
                          ) : (
                            wallet.icon
                          )}
                        </div>
                        <div className="font-medium">{wallet.name}</div>
                        <Badge variant={wallet.status === 'supported' ? 'default' : 'secondary'} className="mt-2">
                          {wallet.status === 'supported' ? 'Supported' : 'Coming Soon'}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {connectionData.walletType && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    {connectionData.walletType === "metamask" ? (
                      <div className="text-center">
                        <div className="text-2xl mb-2">🦊</div>
                        <div className="font-medium mb-2">Connect MetaMask</div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Click the button below to connect your MetaMask wallet
                        </p>
                        <Button onClick={handleWalletConnect} className="w-full">
                          Connect MetaMask
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <Label htmlFor="wallet-address">Wallet Address</Label>
                          <Input
                            id="wallet-address"
                            placeholder="Enter your wallet address"
                            value={connectionData.walletAddress}
                            onChange={(e) => setConnectionData({ ...connectionData, walletAddress: e.target.value })}
                          />
                        </div>
                        <Button onClick={handleWalletConnect} className="w-full">
                          Connect {wallets.find(w => w.id === connectionData.walletType)?.name}
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}