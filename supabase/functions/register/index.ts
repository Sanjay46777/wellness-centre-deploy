import { createClient } from 'npm:@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, password, role, full_name, student_id, phone } = await req.json();

    if (!email || !password || !role) {
      throw new Error('Email, password, and role are required.');
    }

    const allowedRoles = ['student', 'head_counsellor'];
    if (!allowedRoles.includes(role)) {
      throw new Error('Invalid role. Public registration is only open to Student and Head Admin.');
    }

    if (role === 'student' && !student_id) {
      throw new Error('Student / Institution ID is required for student registration.');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) {
      throw new Error('Server configuration missing.');
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, full_name, student_id, phone },
    });

    if (createError || !createData.user) {
      throw createError || new Error('Account creation failed.');
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: createData.user.id,
        email,
        message: 'Your account has been created. You can now sign in.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
