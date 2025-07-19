import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createHash, createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BinanceCredentials {
  apiKey: string;
  secret: string;
}

interface BinanceBalance {
  asset: string;
  free: string;
  locked: string;
}

const createSignature = (params: string, secret: string): string => {
  return createHmac('sha256', secret).update(params).digest('hex');
}

const binanceRequest = async (endpoint: string, credentials: BinanceCredentials, params: Record<string, any> = {}) => {
  const baseUrl = 'https://api.binance.com';
  const timestamp = Date.now();
  
  const queryParams = new URLSearchParams({
    ...params,
    timestamp: timestamp.toString(),
    recvWindow: '5000'
  });
  
  const signature = createSignature(queryParams.toString(), credentials.secret);
  queryParams.append('signature', signature);
  
  const url = `${baseUrl}${endpoint}?${queryParams.toString()}`;
  
  const response = await fetch(url, {
    headers: {
      'X-MBX-APIKEY': credentials.apiKey,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

const fetchBinancePortfolio = async (credentials: BinanceCredentials) => {
  try {
    // Test API connection first
    const accountInfo = await binanceRequest('/api/v3/account', credentials);
    
    // Get current prices for all symbols
    const tickerData = await fetch('https://api.binance.com/api/v3/ticker/price');
    const prices = await tickerData.json();
    const priceMap = new Map(prices.map((p: any) => [p.symbol, parseFloat(p.price)]));
    
    // Filter non-zero balances
    const balances: BinanceBalance[] = accountInfo.balances.filter((balance: BinanceBalance) => 
      parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0
    );
    
    // Convert to portfolio format
    const holdings = balances.map((balance: BinanceBalance) => {
      const totalAmount = parseFloat(balance.free) + parseFloat(balance.locked);
      
      // Try to get current price (look for USDT pair first, then USD)
      let currentPrice = 0;
      if (balance.asset === 'USDT' || balance.asset === 'USD') {
        currentPrice = 1;
      } else {
        currentPrice = priceMap.get(`${balance.asset}USDT`) || 
                     priceMap.get(`${balance.asset}USD`) || 
                     priceMap.get(`${balance.asset}BTC`) || 0;
        
        // If we got BTC price, convert to USD
        if (currentPrice > 0 && priceMap.has(`${balance.asset}BTC`)) {
          const btcPrice = priceMap.get('BTCUSDT') || 0;
          currentPrice = currentPrice * btcPrice;
        }
      }
      
      return {
        symbol: balance.asset,
        name: balance.asset,
        amount: totalAmount,
        purchase_price: currentPrice, // Use current price as purchase price for now
        purchase_date: new Date().toISOString().split('T')[0],
        notes: 'Imported from Binance',
        wallet_address: '',
        wallet_type: 'binance'
      };
    }).filter(holding => holding.amount > 0.0001); // Filter out dust amounts
    
    // Calculate total balance in USD
    const totalBalance = holdings.reduce((sum, holding) => {
      return sum + (holding.amount * holding.purchase_price);
    }, 0);
    
    return {
      success: true,
      holdings,
      totalBalance,
      accountInfo: {
        canTrade: accountInfo.canTrade,
        canWithdraw: accountInfo.canWithdraw,
        canDeposit: accountInfo.canDeposit,
        updateTime: accountInfo.updateTime
      }
    };
    
  } catch (error) {
    console.error('Error fetching Binance portfolio:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, apiKey, secret, accountId } = await req.json()

    if (action === 'connect') {
      if (!apiKey || !secret) {
        return new Response(
          JSON.stringify({ error: 'API key and secret are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const credentials: BinanceCredentials = { apiKey, secret };
      const result = await fetchBinancePortfolio(credentials);

      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'sync') {
      // For sync operations, you would typically store encrypted credentials
      // and retrieve them here. For now, return a placeholder response.
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Sync functionality requires credential storage implementation' 
        }),
        { status: 501, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Binance integration error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})