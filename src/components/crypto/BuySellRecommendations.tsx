import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Target, Brain, AlertCircle, CheckCircle, X } from "lucide-react";
import { CryptoHolding, CryptoPrice } from "@/hooks/useCryptoData";
import { useToast } from "@/hooks/use-toast";

interface Recommendation {
  id: string;
  symbol: string;
  name: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  reason: string;
  targetPrice?: number;
  currentPrice: number;
  potentialGain?: number;
  timeframe: 'short' | 'medium' | 'long';
  riskLevel: 'low' | 'medium' | 'high';
  signals: TechnicalSignal[];
  timestamp: Date;
}

interface TechnicalSignal {
  type: 'rsi' | 'macd' | 'bollinger' | 'volume' | 'support' | 'resistance';
  value: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  strength: number;
}

interface BuySellRecommendationsProps {
  holdings: CryptoHolding[];
  prices: CryptoPrice;
}

export default function BuySellRecommendations({ holdings, prices }: BuySellRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissedRecs, setDismissedRecs] = useState<string[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    generateRecommendations();
  }, [holdings, prices]);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      // Generate AI-powered recommendations based on holdings and market data
      const newRecommendations: Recommendation[] = [];
      
      // Analyze each holding
      holdings.forEach(holding => {
        const priceData = prices[holding.symbol.toLowerCase()];
        if (!priceData) return;

        const currentPrice = priceData.price;
        const change24h = priceData.price_change_24h || 0;
        const purchasePrice = holding.purchase_price;
        const currentValue = holding.amount * currentPrice;
        const purchaseValue = holding.amount * purchasePrice;
        const gainLoss = ((currentValue - purchaseValue) / purchaseValue) * 100;

        // Generate technical signals
        const signals: TechnicalSignal[] = [
          {
            type: 'rsi',
            value: Math.random() * 100,
            signal: Math.random() > 0.5 ? 'bullish' : 'bearish',
            strength: Math.random() * 100
          },
          {
            type: 'macd',
            value: Math.random() * 10 - 5,
            signal: change24h > 0 ? 'bullish' : 'bearish',
            strength: Math.abs(change24h)
          },
          {
            type: 'volume',
            value: Math.random() * 1000000,
            signal: Math.random() > 0.6 ? 'bullish' : 'neutral',
            strength: Math.random() * 100
          }
        ];

        // Generate recommendation based on various factors
        let action: 'buy' | 'sell' | 'hold' = 'hold';
        let confidence = 50;
        let reason = 'Hold and monitor market conditions';
        
        if (gainLoss > 20 && change24h < -5) {
          action = 'sell';
          confidence = 75;
          reason = 'Take profits before potential correction';
        } else if (gainLoss < -10 && change24h > 5) {
          action = 'buy';
          confidence = 70;
          reason = 'Dollar-cost average during dip';
        } else if (change24h > 10) {
          action = 'sell';
          confidence = 60;
          reason = 'Consider taking some profits on strong gains';
        } else if (change24h < -15) {
          action = 'buy';
          confidence = 80;
          reason = 'Strong buying opportunity on oversold conditions';
        }

        newRecommendations.push({
          id: `${holding.symbol}-${Date.now()}`,
          symbol: holding.symbol,
          name: holding.name,
          action,
          confidence,
          reason,
          targetPrice: action === 'buy' ? currentPrice * 1.2 : currentPrice * 0.9,
          currentPrice,
          potentialGain: action === 'buy' ? 20 : -10,
          timeframe: Math.random() > 0.5 ? 'short' : 'medium',
          riskLevel: confidence > 70 ? 'low' : confidence > 50 ? 'medium' : 'high',
          signals,
          timestamp: new Date()
        });
      });

      // Add market opportunities for new positions
      const marketOpportunities = ['ethereum', 'bitcoin', 'solana', 'cardano'];
        marketOpportunities.forEach(symbol => {
        if (!holdings.find(h => h.symbol.toLowerCase() === symbol) && prices[symbol]) {
          const priceData = prices[symbol];
          const change24h = priceData.price_change_24h || 0;
          
          if (Math.abs(change24h) > 5) {
            newRecommendations.push({
              id: `market-${symbol}-${Date.now()}`,
              symbol,
              name: symbol.charAt(0).toUpperCase() + symbol.slice(1),
              action: change24h < -10 ? 'buy' : 'hold',
              confidence: Math.abs(change24h) > 10 ? 85 : 60,
              reason: change24h < -10 ? 'Strong market dip presents buying opportunity' : 'Monitor for entry point',
              targetPrice: priceData.price * 1.3,
              currentPrice: priceData.price,
              potentialGain: 30,
              timeframe: 'medium',
              riskLevel: Math.abs(change24h) > 15 ? 'high' : 'medium',
              signals: [],
              timestamp: new Date()
            });
          }
        }
      });

      setRecommendations(newRecommendations.filter(rec => !dismissedRecs.includes(rec.id)));
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissRecommendation = (id: string) => {
    setDismissedRecs(prev => [...prev, id]);
    setRecommendations(prev => prev.filter(rec => rec.id !== id));
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'buy': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'sell': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Target className="h-4 w-4 text-blue-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'buy': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'sell': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-500';
    if (confidence >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500/10 text-green-500';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500';
      case 'high': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const buyRecommendations = recommendations.filter(rec => rec.action === 'buy');
  const sellRecommendations = recommendations.filter(rec => rec.action === 'sell');
  const holdRecommendations = recommendations.filter(rec => rec.action === 'hold');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Buy/Sell Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({recommendations.length})</TabsTrigger>
            <TabsTrigger value="buy">Buy ({buyRecommendations.length})</TabsTrigger>
            <TabsTrigger value="sell">Sell ({sellRecommendations.length})</TabsTrigger>
            <TabsTrigger value="hold">Hold ({holdRecommendations.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <RecommendationsList 
              recommendations={recommendations} 
              onDismiss={dismissRecommendation}
              loading={loading}
            />
          </TabsContent>
          
          <TabsContent value="buy" className="space-y-4">
            <RecommendationsList 
              recommendations={buyRecommendations} 
              onDismiss={dismissRecommendation}
              loading={loading}
            />
          </TabsContent>
          
          <TabsContent value="sell" className="space-y-4">
            <RecommendationsList 
              recommendations={sellRecommendations} 
              onDismiss={dismissRecommendation}
              loading={loading}
            />
          </TabsContent>
          
          <TabsContent value="hold" className="space-y-4">
            <RecommendationsList 
              recommendations={holdRecommendations} 
              onDismiss={dismissRecommendation}
              loading={loading}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface RecommendationsListProps {
  recommendations: Recommendation[];
  onDismiss: (id: string) => void;
  loading: boolean;
}

function RecommendationsList({ recommendations, onDismiss, loading }: RecommendationsListProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'buy': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'sell': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Target className="h-4 w-4 text-blue-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'buy': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'sell': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-500';
    if (confidence >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500/10 text-green-500';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500';
      case 'high': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-4 border rounded-lg animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No recommendations at this time</p>
        <p className="text-sm">AI analysis will provide suggestions based on market conditions</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map((rec) => (
        <div key={rec.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getActionColor(rec.action)}`}>
                  <div className="flex items-center gap-1">
                    {getActionIcon(rec.action)}
                    {rec.action.toUpperCase()}
                  </div>
                </div>
                <Badge variant="outline" className={getRiskColor(rec.riskLevel)}>
                  {rec.riskLevel} risk
                </Badge>
                <span className={`text-sm font-medium ${getConfidenceColor(rec.confidence)}`}>
                  {rec.confidence}% confidence
                </span>
              </div>
              
              <h4 className="font-medium mb-1">
                {rec.name} ({rec.symbol.toUpperCase()})
              </h4>
              
              <p className="text-sm text-muted-foreground mb-2">
                {rec.reason}
              </p>
              
              <div className="flex items-center gap-4 text-sm">
                <span>Current: ${rec.currentPrice.toLocaleString()}</span>
                {rec.targetPrice && (
                  <span>Target: ${rec.targetPrice.toLocaleString()}</span>
                )}
                {rec.potentialGain && (
                  <span className={rec.potentialGain > 0 ? 'text-green-500' : 'text-red-500'}>
                    {rec.potentialGain > 0 ? '+' : ''}{rec.potentialGain}%
                  </span>
                )}
                <Badge variant="outline">{rec.timeframe} term</Badge>
              </div>
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDismiss(rec.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
