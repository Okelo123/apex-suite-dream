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
    const body = await req.json();
    console.log('M-Pesa Callback received:', JSON.stringify(body, null, 2));

    const stkCallback = body?.Body?.stkCallback;
    if (stkCallback) {
      const resultCode = stkCallback.ResultCode;
      const resultDesc = stkCallback.ResultDesc;
      const checkoutRequestId = stkCallback.CheckoutRequestID;

      console.log(`Payment ${resultCode === 0 ? 'SUCCESS' : 'FAILED'}: ${resultDesc} (CheckoutRequestID: ${checkoutRequestId})`);

      if (resultCode === 0 && stkCallback.CallbackMetadata?.Item) {
        const items = stkCallback.CallbackMetadata.Item;
        const amount = items.find((i: any) => i.Name === 'Amount')?.Value;
        const receipt = items.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
        const phone = items.find((i: any) => i.Name === 'PhoneNumber')?.Value;
        console.log(`Amount: ${amount}, Receipt: ${receipt}, Phone: ${phone}`);
      }
    }

    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Callback error:', error);
    return new Response(
      JSON.stringify({ ResultCode: 1, ResultDesc: 'Error' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
