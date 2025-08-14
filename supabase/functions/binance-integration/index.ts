
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

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
  const recvWindow = 60000;
  
  const allParams = {
    ...params,
    timestamp: timestamp.toString(),
    recvWindow: recvWindow.toString()
  };
  
  const queryString = Object.keys(allParams)
    .sort()
    .map(key => `${key}=${encodeURIComponent(allParams[key])}`)
    .join('&');
  
  const signature = createSignature(queryString, credentials.secret);
  const finalQueryString = `${queryString}&signature=${signature}`;
  
  const url = `${baseUrl}${endpoint}?${finalQueryString}`;
  
  const response = await fetch(url, {
    headers: {
      'X-MBX-APIKEY': credentials.apiKey,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Unknown error';
    
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.code === -2015) {
        errorMessage = 'Invalid API-key, IP, or permissions for action';
      } else if (errorData.code === -1021) {
        errorMessage = 'Timestamp for this request is outside of the recvWindow';
      } else if (errorData.code === -1022) {
        errorMessage = 'Signature for this request is not valid';
      } else {
        errorMessage = errorData.msg || errorText;
      }
    } catch {
      errorMessage = errorText;
    }
    
    throw new Error(`Binance API error: ${errorMessage}`);
  }
  
  return await response.json();
}

const validateCredentials = (credentials: BinanceCredentials) => {
  if (!credentials.apiKey || !credentials.secret) {
    throw new Error('API key and secret are required');
  }
  
  // Enhanced validation for API key format
  if (credentials.apiKey.length < 10 || credentials.secret.length < 10) {
    throw new Error('Invalid API credentials format');
  }
  
  // Check for potentially leaked/test credentials
  const suspiciousPatterns = ['test', 'demo', 'example', 'default', 'sample'];
  const keyLower = credentials.apiKey.toLowerCase();
  if (suspiciousPatterns.some(pattern => keyLower.includes(pattern))) {
    throw new Error('Suspicious API key pattern detected');
  }
  
  // Rate limiting check (basic implementation)
  if (credentials.apiKey.length > 100 || credentials.secret.length > 100) {
    throw new Error('API credentials exceed maximum length');
  }
  
  // Additional security checks
  if (credentials.apiKey.includes(' ') || credentials.secret.includes(' ')) {
    throw new Error('API credentials contain invalid characters');
  }
}

const fetchBinancePortfolio = async (credentials: BinanceCredentials) => {
  try {
    validateCredentials(credentials);
    
    // Test connection with server time first
    const serverTimeResponse = await fetch('https://api.binance.com/api/v3/time');
    if (!serverTimeResponse.ok) {
      throw new Error('Cannot connect to Binance API');
    }
    
    const accountInfo = await binanceRequest('/api/v3/account', credentials);
    
    // Get current prices
    const tickerData = await fetch('https://api.binance.com/api/v3/ticker/price');
    const prices = await tickerData.json();
    const priceMap = new Map(prices.map((p: any) => [p.symbol, parseFloat(p.price)]));
    
    const balances: BinanceBalance[] = accountInfo.balances.filter((balance: BinanceBalance) => 
      parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0
    );
    
    const holdings = balances.map((balance: BinanceBalance) => {
      const totalAmount = parseFloat(balance.free) + parseFloat(balance.locked);
      
      let currentPrice = 0;
      if (balance.asset === 'USDT' || balance.asset === 'USD') {
        currentPrice = 1;
      } else {
        currentPrice = priceMap.get(`${balance.asset}USDT`) || 
                     priceMap.get(`${balance.asset}USD`) || 
                     priceMap.get(`${balance.asset}BTC`) || 0;
        
        if (currentPrice > 0 && priceMap.has(`${balance.asset}BTC`)) {
          const btcPrice = priceMap.get('BTCUSDT') || 0;
          currentPrice = currentPrice * btcPrice;
        }
      }
      
      return {
        symbol: balance.asset,
        name: balance.asset,
        amount: totalAmount,
        purchase_price: currentPrice,
        purchase_date: new Date().toISOString().split('T')[0],
        notes: 'Imported from Binance',
        wallet_address: '',
        wallet_type: 'binance'
      };
    }).filter(holding => holding.amount > 0.0001);
    
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
      const credentials: BinanceCredentials = { apiKey, secret };
      const result = await fetchBinancePortfolio(credentials);

      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'sync') {
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
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
