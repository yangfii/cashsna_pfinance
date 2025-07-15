import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CryptoHolding, CryptoPrice } from "@/hooks/useCryptoData";

interface CryptoChartProps {
  holdings: CryptoHolding[];
  prices: CryptoPrice;
}

export default function CryptoChart({ holdings, prices }: CryptoChartProps) {
  const portfolioData = holdings.map(holding => {
    const currentPrice = prices[holding.symbol]?.usd || 0;
    const currentValue = holding.amount * currentPrice;
    const purchaseValue = holding.amount * holding.purchase_price;
    const gainLoss = currentValue - purchaseValue;
    const gainLossPercent = purchaseValue > 0 ? (gainLoss / purchaseValue) * 100 : 0;

    return {
      name: holding.name,
      symbol: holding.symbol,
      value: currentValue,
      gainLoss,
      gainLossPercent,
      amount: holding.amount,
      currentPrice
    };
  });

  const totalValue = portfolioData.reduce((sum, item) => sum + item.value, 0);

  const pieData = portfolioData.map((item, index) => ({
    name: item.symbol.toUpperCase(),
    value: item.value,
    percentage: ((item.value / totalValue) * 100).toFixed(1),
    fill: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
  }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Portfolio Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={portfolioData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="symbol" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
              />
              <Tooltip 
                formatter={(value, name) => [
                  `${Number(value).toFixed(2)}%`, 
                  name === 'gainLossPercent' ? 'Gain/Loss %' : name
                ]}
                labelFormatter={(label) => `${label.toUpperCase()}`}
              />
              <Line 
                type="monotone" 
                dataKey="gainLossPercent" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}