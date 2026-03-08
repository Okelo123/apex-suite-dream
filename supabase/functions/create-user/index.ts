import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { email, password, role } = await req.json();

    if (!email || !password || !role) {
      return new Response(JSON.stringify({ error: 'email, password, and role are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the caller is an admin
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: caller } } = await supabaseAdmin.auth.getUser(token);
      if (caller) {
        const { data: callerRole } = await supabaseAdmin
          .from('user_roles')
          .select('role')
          .eq('user_id', caller.id)
          .eq('role', 'admin')
          .single();
        
        if (!callerRole) {
          return new Response(JSON.stringify({ error: 'Only admins can create accounts' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // Create the user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // The trigger already creates a 'guest' role, update to the requested role
    if (role !== 'guest') {
      await supabaseAdmin
        .from('user_roles')
        .update({ role })
        .eq('user_id', newUser.user.id);
    }

    return new Response(JSON.stringify({ 
      message: `${role} account created successfully`,
      email 
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
