import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, audio, text, voice } = await req.json();

    if (action === 'transcribe') {
      // Speech-to-text
      if (!audio) {
        throw new Error('No audio data provided');
      }

      const binaryAudio = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
      const formData = new FormData();
      const blob = new Blob([binaryAudio], { type: 'audio/webm' });
      formData.append('file', blob, 'audio.webm');
      formData.append('model', 'whisper-1');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${await response.text()}`);
      }

      const result = await response.json();
      return new Response(JSON.stringify({ text: result.text }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'synthesize') {
      // Text-to-speech
      if (!text) {
        throw new Error('No text provided');
      }

      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: voice || 'alloy',
          response_format: 'mp3',
        }),
      });

      if (!response.ok) {
        throw new Error(`Speech synthesis failed: ${await response.text()}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      return new Response(JSON.stringify({ audioContent: base64Audio }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in voice-assistant:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});