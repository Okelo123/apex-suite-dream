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
    const { guest_name, guest_email, items, total, ref, check_in, check_out } = await req.json();

    if (!guest_email || !guest_name || !ref) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const itemsList = (items || []).join(', ');
    const dateInfo = check_in && check_out ? `\nCheck-in: ${check_in}\nCheck-out: ${check_out}` : '';

    // Use Lovable AI email via the LOVABLE_API_KEY
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    
    // Send email via Supabase's built-in email (using auth admin for transactional)
    // For now, we'll log the email and return success - actual delivery needs custom domain
    console.log(`📧 Booking confirmation email:
To: ${guest_email}
Guest: ${guest_name}
Ref: ${ref}
Items: ${itemsList}
Total: KES ${total}${dateInfo}
    `);

    return new Response(JSON.stringify({ 
      success: true,
      message: `Booking confirmation logged for ${guest_email}`,
      email_data: {
        to: guest_email,
        subject: `Booking Confirmed — ${ref} | Mileshi Horizon`,
        body: `Dear ${guest_name},

Your booking at Mileshi Horizon has been confirmed.

Reference: ${ref}
Items: ${itemsList}
Total: KES ${total?.toLocaleString() || '0'}${dateInfo}

We look forward to welcoming you.

Warm regards,
Mileshi Horizon`
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
