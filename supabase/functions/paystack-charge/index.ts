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
    const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error('PAYSTACK_SECRET_KEY not configured');
    }

    const { email, amount, phone, ref, callback_url } = await req.json();

    if (!email || !amount || !phone || !ref) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, amount, phone, ref' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Paystack expects amount in smallest currency unit (cents for KES)
    const amountInCents = Math.round(amount * 100);

    const response = await fetch('https://api.paystack.co/charge', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amountInCents,
        currency: 'KES',
        reference: ref,
        mobile_money: {
          phone,
          provider: 'mpesa',
        },
        callback_url: callback_url || undefined,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Paystack error:', data);
      return new Response(
        JSON.stringify({ error: data.message || 'Payment initiation failed', details: data }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: data.data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
