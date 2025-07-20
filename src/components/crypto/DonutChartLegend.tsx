
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

interface TokenData {
  name: string;
  symbol: string;
  value: number;
  percent: number;
  color: string;
}

interface DonutChartLegendProps {
  topTokens: TokenData[];
  overflowTokens: TokenData[];
  totalValue: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`;
};

export default function DonutChartLegend({ topTokens, overflowTokens, totalValue }: DonutChartLegendProps) {
  return (
    <div className="space-y-4">
      {/* Center Value Display */}
      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
        <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
      </div>

      {/* Top 5 Tokens */}
      <div className="space-y-3">
        {topTokens.map((token, index) => (
          <div key={token.symbol} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: token.color }}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{token.symbol}</p>
                <p className="text-xs text-muted-foreground truncate">{token.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{formatPercent(token.percent)}</p>
              <p className="text-xs text-muted-foreground">{formatCurrency(token.value)}</p>
            </div>
          </div>
        ))}

        {/* +More Popup for Overflow Tokens */}
        {overflowTokens.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-between hover:bg-muted/50"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-muted flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    +{overflowTokens.length} more tokens
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">
                    {formatPercent(overflowTokens.reduce((sum, token) => sum + token.percent, 0))}
                  </span>
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-2">
                <h4 className="font-medium text-sm mb-3">Additional Holdings</h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {overflowTokens.map((token) => (
                    <div key={token.symbol} className="flex items-center justify-between py-1">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: token.color }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{token.symbol}</p>
                          <p className="text-xs text-muted-foreground truncate">{token.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium">{formatPercent(token.percent)}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(token.value)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
