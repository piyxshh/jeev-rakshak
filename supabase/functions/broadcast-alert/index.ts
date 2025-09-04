// supabase/functions/broadcast-alert/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type Farmer = {
  profile_id: string;
  phone_number: string;
}

Deno.serve(async (req) => {
  console.log("--- New Request Received ---");

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("Step 1: Parsing request body...");
    const { report_id, radius_km, message } = await req.json()
    console.log(`Step 1 OK. report_id: ${report_id}, radius_km: ${radius_km}`);
    
    if (!report_id || !radius_km || !message) {
      throw new Error("Missing required parameters.");
    }
    const radius_meters = radius_km * 1000;

    console.log("Step 2: Creating Supabase admin client...");
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    console.log("Step 2 OK.");

    console.log("Step 3: Calling database function 'get_farmers_in_radius'...");
    const { data: farmers, error: rpcError } = await supabaseAdmin.rpc('get_farmers_in_radius', {
      report_id_input: report_id,
      radius_meters: radius_meters,
    })

    if (rpcError) {
      console.error("!!! DATABASE FUNCTION ERROR:", rpcError);
      throw rpcError;
    }
    console.log(`Step 3 OK. Found ${farmers.length} farmers.`);
    
    if (farmers && farmers.length > 0) {
      console.log("Step 4: Broadcasting alerts...");
      const broadcastPromises = farmers.map((farmer: Farmer) => {
        const channelName = `farmer-alerts:${farmer.profile_id}`;
        const channel = supabaseAdmin.channel(channelName);
        return channel.send({
          type: 'broadcast', event: 'new-alert',
          payload: { message: message, report_id: report_id },
        })
      })
      await Promise.all(broadcastPromises)
      console.log("Step 4 OK.");
    }

    const responseData = {
      message: `Alert successfully sent to ${farmers.length} farmers.`,
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("!!! CATCH BLOCK ERROR:", error);
    
    // THIS IS THE FIX: We safely check the error type before accessing .message
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})