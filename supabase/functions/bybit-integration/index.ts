import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BybitCredentials {
  apiKey: string;
  secret: string;
}

interface BybitBalance {
  coin: string;
  walletBalance: string;
  transferBalance: string;
  bonus: string;
}

const createBybitSignature = (params: string, secret: string): string => {
  return createHmac('sha256', secret).update(params).digest('hex');
}

const bybitRequest = async (endpoint: string, credentials: BybitCredentials, params: Record<string, any> = {}) => {
  const baseUrl = 'https://api.bybit.com';
  const timestamp = Date.now();
  const recvWindow = 5000;
  
  // Create parameter string for signature
  const paramString = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  const signaturePayload = `${timestamp}${credentials.apiKey}${recvWindow}${paramString}`;
  const signature = createBybitSignature(signaturePayload, credentials.secret);
  
  const url = `${baseUrl}${endpoint}?${paramString}`;
  
  const response = await fetch(url, {
    headers: {
      'X-BAPI-API-KEY': credentials.apiKey,
      'X-BAPI-SIGN': signature,
      'X-BAPI-SIGN-TYPE': '2',
      'X-BAPI-TIMESTAMP': timestamp.toString(),
      'X-BAPI-RECV-WINDOW': recvWindow.toString(),
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Bybit API error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

const fetchBybitPortfolio = async (credentials: BybitCredentials) => {
  try {
    // Get account balance for unified account
    const balanceResponse = await bybitRequest('/v5/account/wallet-balance', credentials, {
      accountType: 'UNIFIED'
    });
    
    if (balanceResponse.retCode !== 0) {
      throw new Error(`Bybit API error: ${balanceResponse.retMsg}`);
    }
    
    // Get current prices from Bybit
    const tickerResponse = await fetch('https://api.bybit.com/v5/market/tickers?category=spot');
    const tickerData = await tickerResponse.json();
    
    const priceMap = new Map();
    if (tickerData.result && tickerData.result.list) {
      tickerData.result.list.forEach((ticker: any) => {
        priceMap.set(ticker.symbol, parseFloat(ticker.lastPrice));
      });
    }
    
    // Process balances
    const balances: BybitBalance[] = balanceResponse.result.list[0]?.coin || [];
    
    // Convert to portfolio format
    const holdings = balances
      .filter((balance: BybitBalance) => parseFloat(balance.walletBalance) > 0)
      .map((balance: BybitBalance) => {
        const totalAmount = parseFloat(balance.walletBalance);
        
        // Get current price (try USDT pair first)
        let currentPrice = 0;
        if (balance.coin === 'USDT' || balance.coin === 'USD') {
          currentPrice = 1;
        } else {
          // Try different pairs
          currentPrice = priceMap.get(`${balance.coin}USDT`) || 
                        priceMap.get(`${balance.coin}USD`) || 
                        priceMap.get(`${balance.coin}BTC`) || 0;
          
          // If we got BTC price, convert to USD
          if (currentPrice > 0 && priceMap.has(`${balance.coin}BTC`)) {
            const btcPrice = priceMap.get('BTCUSDT') || 0;
            currentPrice = currentPrice * btcPrice;
          }
        }
        
        return {
          symbol: balance.coin,
          name: balance.coin,
          amount: totalAmount,
          purchase_price: currentPrice, // Use current price as purchase price for now
          purchase_date: new Date().toISOString().split('T')[0],
          notes: 'Imported from Bybit',
          wallet_address: '',
          wallet_type: 'bybit'
        };
      })
      .filter(holding => holding.amount > 0.0001); // Filter out dust amounts
    
    // Calculate total balance in USD
    const totalBalance = holdings.reduce((sum, holding) => {
      return sum + (holding.amount * holding.purchase_price);
    }, 0);
    
    return {
      success: true,
      holdings,
      totalBalance,
      accountInfo: {
        accountType: 'SPOT',
        totalEquity: balanceResponse.result.list[0]?.totalEquity || '0',
        totalWalletBalance: balanceResponse.result.list[0]?.totalWalletBalance || '0'
      }
    };
    
  } catch (error) {
    console.error('Error fetching Bybit portfolio:', error);
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

      const credentials: BybitCredentials = { apiKey, secret };
      const result = await fetchBybitPortfolio(credentials);

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
    console.error('Bybit integration error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})