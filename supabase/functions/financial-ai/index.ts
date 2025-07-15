import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userId, data } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get user's transactions and categories
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId);

    let systemPrompt = '';
    let userPrompt = '';

    if (action === 'categorize') {
      systemPrompt = `You are a financial categorization AI. Given a transaction description, amount, and existing categories, suggest the most appropriate category.
      
      Existing categories: ${JSON.stringify(categories)}
      
      If no existing category fits well, suggest a new category name.
      Respond with JSON: {"category": "category_name", "confidence": 0.9, "isNew": false}`;
      
      userPrompt = `Categorize this transaction: ${JSON.stringify(data)}`;
    } else if (action === 'analyze') {
      systemPrompt = `You are a financial analysis AI. Analyze the user's spending patterns and provide insights.
      
      Transactions: ${JSON.stringify(transactions)}
      Categories: ${JSON.stringify(categories)}
      
      Provide insights about spending patterns, trends, and recommendations.
      Be specific with numbers and actionable advice.`;
      
      userPrompt = 'Analyze my spending patterns and provide insights and recommendations.';
    } else if (action === 'budget') {
      systemPrompt = `You are a budget planning AI. Based on the user's transaction history, create budget recommendations.
      
      Recent transactions: ${JSON.stringify(transactions?.slice(0, 50))}
      Categories: ${JSON.stringify(categories)}
      
      Provide practical budget recommendations with specific amounts for each category.
      Consider income, expenses, and spending patterns.`;
      
      userPrompt = data?.prompt || 'Create a budget plan based on my spending history.';
    } else if (action === 'report') {
      systemPrompt = `You are a financial report generator. Create a comprehensive financial report based on the user's data.
      
      Transactions: ${JSON.stringify(transactions)}
      Categories: ${JSON.stringify(categories)}
      
      Create a detailed report with insights, trends, and recommendations.
      Format it nicely with sections and bullet points.`;
      
      userPrompt = data?.prompt || 'Generate a comprehensive financial report for me.';
    } else if (action === 'market-trends') {
      systemPrompt = `You are a cryptocurrency market analyst AI. Analyze current market trends and provide insights based on the user's portfolio and holdings.
      
      User's recent transactions: ${JSON.stringify(transactions)}
      User's categories: ${JSON.stringify(categories)}
      
      Analyze market trends for cryptocurrencies and provide actionable insights for portfolio management.
      Include analysis of current market conditions, price movements, and strategic recommendations.
      Format with clear sections and actionable insights.`;
      
      userPrompt = 'Please analyze current cryptocurrency market trends and provide insights relevant to my portfolio with specific recommendations.';
    } else if (action === 'monthly-report') {
      systemPrompt = `You are a monthly financial report generator. Create a comprehensive monthly report based on the user's financial data.
      
      User's recent transactions: ${JSON.stringify(transactions)}
      User's categories: ${JSON.stringify(categories)}
      
      Generate a detailed monthly financial report with performance analysis, portfolio insights, and recommendations for the next month.
      Include sections on: Performance Summary, Portfolio Analysis, Risk Assessment, and Next Month's Recommendations.
      Format with clear sections and specific metrics.`;
      
      userPrompt = 'Please generate a comprehensive monthly financial report with performance analysis and forward-looking recommendations.';
    } else if (action === 'risk-assessment') {
      systemPrompt = `You are a financial risk assessment AI. Evaluate the user's portfolio risk level and provide personalized risk management recommendations.
      
      User's recent transactions: ${JSON.stringify(transactions)}
      User's categories: ${JSON.stringify(categories)}
      
      Assess the risk level of their financial portfolio and provide specific recommendations for risk management and diversification.
      Include sections on: Current Risk Level, Risk Factors, Diversification Analysis, and Specific Action Items.
      Provide a clear risk score and actionable recommendations.`;
      
      userPrompt = 'Please assess my portfolio risk level and provide personalized risk management recommendations with specific actionable steps.';
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to get AI response');
    }

    const aiResponse = result.choices[0].message.content;

    // For categorization, try to parse JSON response
    if (action === 'categorize') {
      try {
        const parsed = JSON.parse(aiResponse);
        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch {
        // If parsing fails, return as text
        return new Response(JSON.stringify({ 
          category: aiResponse, 
          confidence: 0.5, 
          isNew: false 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in financial-ai:', error);
    const errorMessage = error.message || 'An unexpected error occurred';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: error.toString() 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});