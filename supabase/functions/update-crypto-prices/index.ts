
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting crypto price update...')

    // Get dynamic list from user holdings or use defaults
    let cryptoIds = [
      'bitcoin',
      'ethereum', 
      'tether',
      'binancecoin',
      'solana',
      'cardano',
      'ripple',
      'polkadot',
      'chainlink',
      'litecoin',
      'bitcoin-cash',
      'stellar',
      'dogecoin',
      'uniswap',
      'wrapped-bitcoin',
      'polygon',
      'avalanche-2',
      'cosmos',
      'algorand',
      'near',
      'internet-computer',
      'tron',
      'vechain',
      'ethereum-classic',
      'filecoin',
      'monero',
      'hedera-hashgraph',
      'decentraland',
      'the-sandbox',
      'aave',
      'lido-dao',
      'sui',
    ]

    // Get user holdings to include their specific tokens
    try {
      const { data: holdings } = await supabase
        .from('crypto_holdings')
        .select('symbol')
        .neq('symbol', null)
      
      if (holdings && holdings.length > 0) {
        const userSymbols = holdings.map(h => h.symbol.toLowerCase())
        const symbolMappings: Record<string, string> = {
          'ldo': 'lido-dao',
          'sui': 'sui',
          'usdt': 'tether',
          'btc': 'bitcoin',
          'eth': 'ethereum',
          'bnb': 'binancecoin',
          'ada': 'cardano',
          'sol': 'solana',
          'xrp': 'ripple',
          'dot': 'polkadot',
          'avax': 'avalanche-2',
          'matic': 'polygon',
          'link': 'chainlink',
          'uni': 'uniswap',
          'atom': 'cosmos',
          'ltc': 'litecoin',
          'bch': 'bitcoin-cash',
          'xlm': 'stellar',
          'vet': 'vechain',
          'icp': 'internet-computer',
          'fil': 'filecoin',
          'trx': 'tron',
          'etc': 'ethereum-classic',
          'xmr': 'monero',
          'algo': 'algorand',
          'near': 'near',
          'flow': 'flow',
          'mana': 'decentraland',
          'sand': 'the-sandbox',
          'crv': 'curve-dao-token',
          'aave': 'aave',
          'mkr': 'maker',
          'comp': 'compound-governance-token',
          'yfi': 'yearn-finance',
          'snx': 'havven',
          'sushi': 'sushi',
          '1inch': '1inch',
          'grt': 'the-graph',
          'enj': 'enjin-coin',
          'bat': 'basic-attention-token',
          'zrx': '0x',
          'usdc': 'usd-coin',
          'busd': 'binance-usd',
          'dai': 'dai',
          'wbtc': 'wrapped-bitcoin',
          'weth': 'weth',
          'shib': 'shiba-inu',
          'doge': 'dogecoin'
        }
        
        userSymbols.forEach(symbol => {
          const coinGeckoId = symbolMappings[symbol] || symbol
          if (!cryptoIds.includes(coinGeckoId)) {
            cryptoIds.push(coinGeckoId)
          }
        })
      }
    } catch (error) {
      console.log('Could not fetch user holdings, using default list:', error)
    }

    // Fetch prices from CoinGecko API with retry logic
    const maxRetries = 3;
    let pricesData = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds.join(',')}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
        
        console.log(`Fetching from CoinGecko API (attempt ${attempt})...`)
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`CoinGecko API error: ${response.status}`)
        }

        pricesData = await response.json()
        console.log('CoinGecko API response received successfully')
        break;
      } catch (error) {
        console.log(`Attempt ${attempt} failed:`, error.message)
        if (attempt === maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    // Map coin IDs to symbols
    const coinSymbols: Record<string, string> = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'tether': 'USDT',
      'binancecoin': 'BNB',
      'solana': 'SOL',
      'cardano': 'ADA',
      'ripple': 'XRP',
      'polkadot': 'DOT',
      'chainlink': 'LINK',
      'litecoin': 'LTC',
      'bitcoin-cash': 'BCH',
      'stellar': 'XLM',
      'dogecoin': 'DOGE',
      'uniswap': 'UNI',
      'wrapped-bitcoin': 'WBTC',
      'polygon': 'MATIC',
      'avalanche-2': 'AVAX',
      'cosmos': 'ATOM',
      'algorand': 'ALGO',
      'near': 'NEAR',
      'internet-computer': 'ICP',
      'tron': 'TRX',
      'vechain': 'VET',
      'ethereum-classic': 'ETC',
      'filecoin': 'FIL',
      'monero': 'XMR',
      'hedera-hashgraph': 'HBAR',
      'decentraland': 'MANA',
      'the-sandbox': 'SAND',
      'aave': 'AAVE',
      'lido-dao': 'LDO',
      'sui': 'SUI'
    }

    // Add fallback entries for tokens not on CoinGecko with realistic prices
    const fallbackTokens: Record<string, number> = {
      'LDBERA': 0.001,
      'RED': 0.0001, 
      'INIT': 0.01,
      'GOAT': 0.0005,
      'ZEREBRO': 0.05,
      'PELL': 0.005
    }

    // Prepare data for upsert operations
    const priceData = Object.entries(pricesData).map(([coinId, priceInfo]: [string, any]) => ({
      symbol: coinSymbols[coinId] || coinId.toUpperCase(),
      price: priceInfo.usd || 0,
      price_change_24h: priceInfo.usd_24h_change || 0,
      volume_24h: priceInfo.usd_24h_vol || 0,
      market_cap: priceInfo.usd_market_cap || 0,
      last_updated: new Date().toISOString()
    }))

    // Add fallback entries for tokens not available on CoinGecko
    Object.entries(fallbackTokens).forEach(([symbol, price]) => {
      if (!priceData.some(p => p.symbol === symbol)) {
        priceData.push({
          symbol,
          price,
          price_change_24h: 0,
          volume_24h: 0,
          market_cap: 0,
          last_updated: new Date().toISOString()
        });
        console.log(`Added fallback price for ${symbol}: $${price}`);
      }
    });

    console.log(`Processing ${priceData.length} price records...`)

    // Batch upsert operations for better performance
    const batchSize = 50;
    const batches = [];
    
    for (let i = 0; i < priceData.length; i += batchSize) {
      batches.push(priceData.slice(i, i + batchSize));
    }

    let totalInserted = 0;
    let totalErrors = 0;

    for (const batch of batches) {
      try {
        const { error, count } = await supabase
          .from('crypto_prices')
          .upsert(batch, { 
            onConflict: 'symbol',
            ignoreDuplicates: false 
          })
          .select('*', { count: 'exact' });

        if (error) {
          console.error('Batch upsert error:', error);
          totalErrors++;
        } else {
          totalInserted += count || batch.length;
          console.log(`Batch processed successfully: ${batch.length} records`);
        }
      } catch (error) {
        console.error('Batch processing error:', error);
        totalErrors++;
      }
    }

    console.log(`Crypto prices update completed! Inserted: ${totalInserted}, Errors: ${totalErrors}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Updated ${totalInserted} crypto prices`,
        errors: totalErrors,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error updating crypto prices:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
