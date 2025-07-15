import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, FileText, Table, Code } from "lucide-react";
import * as XLSX from 'xlsx';
import { CryptoHolding } from "@/hooks/useCryptoData";

interface DataImportExportProps {
  holdings: CryptoHolding[];
  onImportHoldings: (holdings: Omit<CryptoHolding, 'id'>[]) => void;
}

export default function DataImportExport({ holdings, onImportHoldings }: DataImportExportProps) {
  const [binanceApiKey, setBinanceApiKey] = useState("");
  const [binanceSecret, setBinanceSecret] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const exportToCSV = () => {
    const csvData = holdings.map(h => ({
      Symbol: h.symbol,
      Name: h.name,
      Amount: h.amount,
      'Purchase Price': h.purchase_price,
      'Purchase Date': h.purchase_date,
      'Wallet Type': h.wallet_type || '',
      'Wallet Address': h.wallet_address || '',
      Notes: h.notes || ''
    }));

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crypto-portfolio-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Portfolio exported to CSV file"
    });
  };

  const exportToXLSX = () => {
    const wsData = holdings.map(h => ({
      Symbol: h.symbol,
      Name: h.name,
      Amount: h.amount,
      'Purchase Price': h.purchase_price,
      'Purchase Date': h.purchase_date,
      'Wallet Type': h.wallet_type || '',
      'Wallet Address': h.wallet_address || '',
      Notes: h.notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Portfolio");

    XLSX.writeFile(wb, `crypto-portfolio-${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: "Export Successful",
      description: "Portfolio exported to Excel file"
    });
  };

  const exportToJSON = () => {
    const jsonData = {
      exportDate: new Date().toISOString(),
      holdings: holdings.map(h => ({
        symbol: h.symbol,
        name: h.name,
        amount: h.amount,
        purchase_price: h.purchase_price,
        purchase_date: h.purchase_date,
        wallet_type: h.wallet_type,
        wallet_address: h.wallet_address,
        notes: h.notes
      }))
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crypto-portfolio-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Portfolio exported to JSON file"
    });
  };

  const importFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let importedData: any[] = [];

        if (file.name.endsWith('.json')) {
          const jsonData = JSON.parse(content);
          importedData = jsonData.holdings || jsonData;
        } else if (file.name.endsWith('.csv')) {
          const lines = content.split('\n');
          const headers = lines[0].split(',');
          importedData = lines.slice(1).map(line => {
            const values = line.split(',');
            return headers.reduce((obj, header, index) => {
              obj[header.trim()] = values[index]?.trim() || '';
              return obj;
            }, {} as any);
          });
        }

        const processedHoldings = importedData.map(item => ({
          symbol: item.Symbol || item.symbol,
          name: item.Name || item.name,
          amount: parseFloat(item.Amount || item.amount),
          purchase_price: parseFloat(item['Purchase Price'] || item.purchase_price),
          purchase_date: item['Purchase Date'] || item.purchase_date,
          wallet_type: item['Wallet Type'] || item.wallet_type,
          wallet_address: item['Wallet Address'] || item.wallet_address,
          notes: item.Notes || item.notes
        })).filter(h => h.symbol && h.amount && h.purchase_price);

        onImportHoldings(processedHoldings);
        toast({
          title: "Import Successful",
          description: `Imported ${processedHoldings.length} holdings`
        });
      } catch (error) {
        console.error('Import error:', error);
        toast({
          title: "Import Failed",
          description: "Unable to parse the selected file",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const importFromBinance = async () => {
    setIsImporting(true);
    try {
      // This would typically call your backend API to fetch Binance data
      // For now, we'll show a placeholder message
      toast({
        title: "Binance Integration",
        description: "Binance API integration requires backend implementation for security",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Binance import error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import from Binance",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Import/Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Data Import/Export</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export Data</TabsTrigger>
            <TabsTrigger value="import">Import Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Portfolio
                </CardTitle>
                <CardDescription>
                  Export your crypto portfolio to various formats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Button onClick={exportToCSV} className="flex flex-col gap-2 h-auto py-4">
                    <FileText className="h-6 w-6" />
                    Export CSV
                  </Button>
                  <Button onClick={exportToXLSX} className="flex flex-col gap-2 h-auto py-4">
                    <Table className="h-6 w-6" />
                    Export XLSX
                  </Button>
                  <Button onClick={exportToJSON} className="flex flex-col gap-2 h-auto py-4">
                    <Code className="h-6 w-6" />
                    Export JSON
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Import from File
                </CardTitle>
                <CardDescription>
                  Import portfolio data from CSV, XLSX, or JSON files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file-import">Select File</Label>
                    <Input
                      id="file-import"
                      type="file"
                      accept=".csv,.xlsx,.json"
                      onChange={importFromFile}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Import from Binance</CardTitle>
                <CardDescription>
                  Connect your Binance account to import holdings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="binance-api-key">API Key</Label>
                    <Input
                      id="binance-api-key"
                      type="password"
                      placeholder="Enter your Binance API key"
                      value={binanceApiKey}
                      onChange={(e) => setBinanceApiKey(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="binance-secret">Secret Key</Label>
                    <Input
                      id="binance-secret"
                      type="password"
                      placeholder="Enter your Binance secret key"
                      value={binanceSecret}
                      onChange={(e) => setBinanceSecret(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={importFromBinance}
                    disabled={!binanceApiKey || !binanceSecret || isImporting}
                    className="w-full"
                  >
                    {isImporting ? "Importing..." : "Import from Binance"}
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Note: API keys are not stored and only used for one-time import
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}