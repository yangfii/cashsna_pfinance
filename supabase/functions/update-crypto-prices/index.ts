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
      'lido-dao', // LDO
      'sui', // SUI
      // Note: Some tokens like LDBERA, RED, INIT, GOAT, ZEREBRO, PELL may not be on CoinGecko
      // We'll add them with 0 values as fallback
    ]

    // Get user holdings to include their specific tokens
    try {
      const { data: holdings } = await supabase
        .from('crypto_holdings')
        .select('symbol')
        .neq('symbol', null)
      
      if (holdings && holdings.length > 0) {
        const userSymbols = holdings.map(h => h.symbol.toLowerCase())
        // Add common mappings
        const symbolMappings: Record<string, string> = {
          'ldo': 'lido-dao',
          'sui': 'sui',
          'usdt': 'tether',
          'btc': 'bitcoin',
          'eth': 'ethereum'
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

    // Fetch prices from CoinGecko API
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds.join(',')}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
    
    console.log('Fetching from CoinGecko API...')
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('CoinGecko API response received')

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

    // Add fallback entries for tokens not on CoinGecko
    const fallbackTokens = ['LDBERA', 'RED', 'INIT', 'GOAT', 'ZEREBRO', 'PELL']

    // Prepare data for insertion
    const priceData = Object.entries(data).map(([coinId, priceInfo]: [string, any]) => ({
      symbol: coinSymbols[coinId] || coinId.toUpperCase(),
      price: priceInfo.usd || 0,
      price_change_24h: priceInfo.usd_24h_change || 0,
      volume_24h: priceInfo.usd_24h_vol || 0,
      market_cap: priceInfo.usd_market_cap || 0,
      last_updated: new Date().toISOString()
    }))

    // Add fallback entries for tokens not available on CoinGecko
    fallbackTokens.forEach(symbol => {
      if (!priceData.some(p => p.symbol === symbol)) {
        priceData.push({
          symbol,
          price: 0,
          price_change_24h: 0,
          volume_24h: 0,
          market_cap: 0,
          last_updated: new Date().toISOString()
        })
      }
    })

    console.log(`Inserting ${priceData.length} price records...`)

    // Insert prices into database
    const { error } = await supabase
      .from('crypto_prices')
      .insert(priceData)

    if (error) {
      console.error('Database insert error:', error)
      throw error
    }

    console.log('Crypto prices updated successfully!')
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Updated ${priceData.length} crypto prices`,
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