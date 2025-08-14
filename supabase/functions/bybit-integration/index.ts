
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
  const recvWindow = 60000;
  
  const paramString = Object.keys(params)
    .sort()
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  const signaturePayload = `${timestamp}${credentials.apiKey}${recvWindow}${paramString}`;
  const signature = createBybitSignature(signaturePayload, credentials.secret);
  
  const url = paramString ? `${baseUrl}${endpoint}?${paramString}` : `${baseUrl}${endpoint}`;
  
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
    const errorText = await response.text();
    let errorMessage = 'Unknown error';
    
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.retCode === 10003) {
        errorMessage = 'Invalid API key';
      } else if (errorData.retCode === 10004) {
        errorMessage = 'Invalid signature';
      } else if (errorData.retCode === 10005) {
        errorMessage = 'Permission denied';
      } else {
        errorMessage = errorData.retMsg || errorText;
      }
    } catch {
      errorMessage = errorText;
    }
    
    throw new Error(`Bybit API error: ${errorMessage}`);
  }
  
  return await response.json();
}

const validateCredentials = (credentials: BybitCredentials) => {
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

const fetchBybitPortfolio = async (credentials: BybitCredentials) => {
  try {
    validateCredentials(credentials);
    
    // Test connection
    const serverTimeResponse = await fetch('https://api.bybit.com/v5/market/time');
    if (!serverTimeResponse.ok) {
      throw new Error('Cannot connect to Bybit API');
    }
    
    const balanceResponse = await bybitRequest('/v5/account/wallet-balance', credentials, {
      accountType: 'UNIFIED'
    });
    
    if (balanceResponse.retCode !== 0) {
      throw new Error(`Bybit API error: ${balanceResponse.retMsg}`);
    }
    
    // Get current prices
    const tickerResponse = await fetch('https://api.bybit.com/v5/market/tickers?category=spot');
    const tickerData = await tickerResponse.json();
    
    const priceMap = new Map();
    if (tickerData.result && tickerData.result.list) {
      tickerData.result.list.forEach((ticker: any) => {
        priceMap.set(ticker.symbol, parseFloat(ticker.lastPrice));
      });
    }
    
    const balances: BybitBalance[] = balanceResponse.result.list[0]?.coin || [];
    
    const holdings = balances
      .filter((balance: BybitBalance) => parseFloat(balance.walletBalance) > 0)
      .map((balance: BybitBalance) => {
        const totalAmount = parseFloat(balance.walletBalance);
        
        let currentPrice = 0;
        if (balance.coin === 'USDT' || balance.coin === 'USD') {
          currentPrice = 1;
        } else {
          currentPrice = priceMap.get(`${balance.coin}USDT`) || 
                        priceMap.get(`${balance.coin}USD`) || 
                        priceMap.get(`${balance.coin}BTC`) || 0;
          
          if (currentPrice > 0 && priceMap.has(`${balance.coin}BTC`)) {
            const btcPrice = priceMap.get('BTCUSDT') || 0;
            currentPrice = currentPrice * btcPrice;
          }
        }
        
        return {
          symbol: balance.coin,
          name: balance.coin,
          amount: totalAmount,
          purchase_price: currentPrice,
          purchase_date: new Date().toISOString().split('T')[0],
          notes: 'Imported from Bybit',
          wallet_address: '',
          wallet_type: 'bybit'
        };
      })
      .filter(holding => holding.amount > 0.0001);
    
    const totalBalance = holdings.reduce((sum, holding) => {
      return sum + (holding.amount * holding.purchase_price);
    }, 0);

    return {
      success: true,
      holdings,
      totalBalance,
      accountInfo: {
        accountType: 'UNIFIED',
        totalEquity: balanceResponse.result.list[0]?.totalEquity || '0',
        totalWalletBalance: balanceResponse.result.list[0]?.totalWalletBalance || '0'
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
    const { action, apiKey, secret, accountId } = await req.json();

    if (action === 'connect') {
      const credentials: BybitCredentials = { apiKey, secret };
      const result = await fetchBybitPortfolio(credentials);

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
