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
    const url = new URL(req.url);
    const sessionToken = url.searchParams.get('sessionToken');

    if (!sessionToken) {
      return new Response(
        JSON.stringify({ error: 'Session token is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log('Checking QR signin status for token:', sessionToken);

    // Check the QR signin session status
    const { data: session, error } = await supabase
      .from('qr_signin_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .single();

    if (error) {
      console.error('Error finding QR session:', error);
      return new Response(
        JSON.stringify({ 
          status: 'not_found',
          error: 'Session not found'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    // Check if session is expired
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    
    if (now > expiresAt) {
      // Mark as expired
      await supabase
        .from('qr_signin_sessions')
        .update({ status: 'expired' })
        .eq('id', session.id);

      return new Response(
        JSON.stringify({ 
          status: 'expired',
          message: 'QR code has expired'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // If confirmed, create a session for the user
    if (session.status === 'confirmed' && session.user_id) {
      console.log('QR signin confirmed, creating session for user:', session.user_id);
      
      // Create an admin client to generate a session
      const { data, error: sessionError } = await supabase.auth.admin.createSession({
        user_id: session.user_id
      });

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        throw sessionError;
      }

      // Clean up the QR session
      await supabase
        .from('qr_signin_sessions')
        .delete()
        .eq('id', session.id);

      return new Response(
        JSON.stringify({
          status: 'confirmed',
          session: data.session,
          user: data.user
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({
        status: session.status,
        expiresAt: session.expires_at
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in check-qr-signin-status:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});