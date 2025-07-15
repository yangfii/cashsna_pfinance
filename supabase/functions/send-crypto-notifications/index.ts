import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: 'email' | 'telegram' | 'push';
  recipient: string; // email address or telegram chat_id
  alert: {
    name: string;
    symbol: string;
    condition: string;
    currentPrice: number;
    targetValue: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, recipient, alert }: NotificationRequest = await req.json();

    console.log(`Sending ${type} notification for alert: ${alert.name}`);

    switch (type) {
      case 'email':
        await sendEmailNotification(recipient, alert);
        break;
      case 'telegram':
        await sendTelegramNotification(recipient, alert);
        break;
      case 'push':
        // Browser push notifications would be handled client-side
        console.log('Push notification request received');
        break;
      default:
        throw new Error(`Unsupported notification type: ${type}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: `${type} notification sent successfully` }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error sending notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function sendEmailNotification(email: string, alert: any) {
  if (!resend) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const { error } = await resend.emails.send({
    from: 'Crypto Alerts <noreply@yourdomain.com>',
    to: [email],
    subject: `🚨 Crypto Alert: ${alert.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">🚨 Crypto Alert Triggered</h2>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1e293b;">${alert.name}</h3>
          <p style="margin: 5px 0;"><strong>Symbol:</strong> ${alert.symbol.toUpperCase()}</p>
          <p style="margin: 5px 0;"><strong>Condition:</strong> ${alert.condition}</p>
          <p style="margin: 5px 0;"><strong>Current Price:</strong> $${alert.currentPrice.toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>Target Value:</strong> $${alert.targetValue.toLocaleString()}</p>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          This alert was triggered at ${new Date().toLocaleString()}
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

async function sendTelegramNotification(chatId: string, alert: any) {
  if (!telegramBotToken) {
    throw new Error('TELEGRAM_BOT_TOKEN not configured');
  }

  const message = `
🚨 *Crypto Alert Triggered*

📊 *${alert.name}*
💰 Symbol: ${alert.symbol.toUpperCase()}
📈 Condition: ${alert.condition}
💵 Current Price: $${alert.currentPrice.toLocaleString()}
🎯 Target Value: $${alert.targetValue.toLocaleString()}

⏰ Triggered at: ${new Date().toLocaleString()}
  `.trim();

  const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send Telegram message: ${error}`);
  }
}