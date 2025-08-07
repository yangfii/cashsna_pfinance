import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Generate a unique session token
    const sessionToken = crypto.randomUUID();
    
    // Get device info from request headers
    const userAgent = req.headers.get('user-agent') || '';
    const deviceInfo = {
      userAgent,
      timestamp: new Date().toISOString()
    };

    console.log('Generating QR signin session with token:', sessionToken);

    // Create QR signin session
    const { data, error } = await supabase
      .from('qr_signin_sessions')
      .insert({
        session_token: sessionToken,
        device_info: deviceInfo,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating QR signin session:', error);
      throw error;
    }

    console.log('QR signin session created successfully:', data.id);

    // Generate QR code URL - this will point to the confirmation page
    const qrUrl = `${Deno.env.get('SUPABASE_URL')?.replace('https://', 'https://').replace('.supabase.co', '.lovableproject.com')}/qr-confirm?token=${sessionToken}`;

    return new Response(
      JSON.stringify({
        sessionToken,
        qrUrl,
        expiresAt: data.expires_at
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in generate-qr-signin:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});