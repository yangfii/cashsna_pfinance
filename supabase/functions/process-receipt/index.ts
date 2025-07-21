import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const formData = await req.formData();
    const image = formData.get('image') as File;
    const userId = formData.get('userId') as string;

    if (!image || !userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing image or userId' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    // Convert image to base64 for OpenAI API
    const imageBuffer = await image.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    const imageDataUrl = `data:${image.type};base64,${base64Image}`;

    // Call OpenAI API to extract receipt data
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please analyze this receipt image and extract the following information in JSON format:
                {
                  "amount": number (total amount),
                  "type": "expense" or "income" (most likely expense for receipts),
                  "category": string (categorize based on: "អាហារ", "Research Costs", "ដឹកជញ្ជូន", "សុខភាព", "កម្សាន្ត", "សំលៀកបំពាក់", "គ្រួសារ", "ថ្លៃអុីនធ័រណេត" for expenses),
                  "description": string (brief description of the transaction),
                  "date": string (YYYY-MM-DD format, use receipt date or today if not visible)
                }

                If you cannot extract the information clearly, return null values but still follow the JSON structure.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageDataUrl
                }
              }
            ]
          }
        ],
        max_tokens: 500
      })
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
    }

    const openaiResult = await openaiResponse.json();
    const extractedText = openaiResult.choices?.[0]?.message?.content;

    if (!extractedText) {
      throw new Error('No content returned from OpenAI');
    }

    // Parse the JSON response from OpenAI
    let extractedData;
    try {
      // Clean the response in case it has markdown formatting
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : extractedText;
      extractedData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', extractedText);
      throw new Error('Failed to parse receipt data');
    }

    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error) {
    console.error('Error processing receipt:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to process receipt' 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});