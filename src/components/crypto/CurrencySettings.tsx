import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings, DollarSign, Euro, BadgeJapaneseYen, PoundSterling } from "lucide-react";

interface CurrencySettingsProps {
  onCurrencyChange: (currency: string, rates: CurrencyRates) => void;
}

export interface CurrencyRates {
  [key: string]: number;
}

const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', icon: DollarSign },
  { code: 'EUR', name: 'Euro', symbol: '€', icon: Euro },
  { code: 'GBP', name: 'British Pound', symbol: '£', icon: PoundSterling },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', icon: BadgeJapaneseYen },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', icon: DollarSign },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', icon: DollarSign },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', icon: DollarSign },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', icon: BadgeJapaneseYen },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', icon: BadgeJapaneseYen },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', icon: DollarSign }
];

export default function CurrencySettings({ onCurrencyChange }: CurrencySettingsProps) {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState<CurrencyRates>({});
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved currency preference
    const savedCurrency = localStorage.getItem('preferredCurrency') || 'USD';
    const savedAutoUpdate = localStorage.getItem('autoUpdateRates') === 'true';
    setSelectedCurrency(savedCurrency);
    setAutoUpdate(savedAutoUpdate);
    
    if (savedCurrency !== 'USD') {
      fetchExchangeRates(savedCurrency);
    }
  }, []);

  useEffect(() => {
    if (autoUpdate && selectedCurrency !== 'USD') {
      const interval = setInterval(() => {
        fetchExchangeRates(selectedCurrency);
      }, 300000); // Update every 5 minutes
      return () => clearInterval(interval);
    }
  }, [selectedCurrency, autoUpdate]);

  const fetchExchangeRates = async (targetCurrency: string) => {
    try {
      // Using a free exchange rate API
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
      const data = await response.json();
      
      const rates: CurrencyRates = { USD: 1 };
      SUPPORTED_CURRENCIES.forEach(currency => {
        rates[currency.code] = data.rates[currency.code] || 1;
      });
      
      setExchangeRates(rates);
      onCurrencyChange(targetCurrency, rates);
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      toast({
        title: "Exchange Rate Error",
        description: "Failed to fetch latest exchange rates. Using cached rates.",
        variant: "destructive"
      });
    }
  };

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    localStorage.setItem('preferredCurrency', currency);
    
    if (currency === 'USD') {
      const usdRates: CurrencyRates = { USD: 1 };
      setExchangeRates(usdRates);
      onCurrencyChange(currency, usdRates);
    } else {
      fetchExchangeRates(currency);
    }
    
    toast({
      title: "Currency Updated",
      description: `Portfolio currency changed to ${currency}`
    });
  };

  const handleAutoUpdateChange = (enabled: boolean) => {
    setAutoUpdate(enabled);
    localStorage.setItem('autoUpdateRates', enabled.toString());
    
    if (enabled && selectedCurrency !== 'USD') {
      fetchExchangeRates(selectedCurrency);
    }
  };

  const selectedCurrencyInfo = SUPPORTED_CURRENCIES.find(c => c.code === selectedCurrency);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Currency ({selectedCurrency})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Currency Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Display Currency</CardTitle>
              <CardDescription>
                Choose your preferred currency for portfolio display
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currency-select">Currency</Label>
                <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
                  <SelectTrigger id="currency-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_CURRENCIES.map(currency => {
                      const Icon = currency.icon;
                      return (
                        <SelectItem key={currency.code} value={currency.code}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span>{currency.name} ({currency.symbol})</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-update">Auto-update Rates</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically update exchange rates every 5 minutes
                  </p>
                </div>
                <Switch
                  id="auto-update"
                  checked={autoUpdate}
                  onCheckedChange={handleAutoUpdateChange}
                />
              </div>
            </CardContent>
          </Card>
          
          {selectedCurrencyInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <selectedCurrencyInfo.icon className="h-5 w-5" />
                  Current Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Currency:</span>
                    <span className="font-medium">{selectedCurrencyInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Symbol:</span>
                    <span className="font-medium">{selectedCurrencyInfo.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Code:</span>
                    <span className="font-medium">{selectedCurrencyInfo.code}</span>
                  </div>
                  {exchangeRates[selectedCurrency] && selectedCurrency !== 'USD' && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rate (USD):</span>
                      <span className="font-medium">{exchangeRates[selectedCurrency].toFixed(4)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="flex justify-end">
            <Button onClick={() => setIsOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}