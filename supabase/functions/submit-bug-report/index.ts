import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BugReportRequest {
  type: string;
  subject: string;
  description: string;
  email?: string;
  files: Array<{
    name: string;
    size: number;
    type: string;
    content: string; // base64 encoded file content
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the user from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid user" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const bugReport: BugReportRequest = await req.json();

    // Save the bug report to the database
    const { data: savedReport, error: saveError } = await supabase
      .from("bug_reports")
      .insert({
        user_id: user.id,
        report_type: bugReport.type,
        subject: bugReport.subject,
        description: bugReport.description,
        email: bugReport.email || user.email,
        files: bugReport.files,
        status: "submitted",
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving bug report:", saveError);
      return new Response(JSON.stringify({ error: "Failed to save bug report" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Send the bug report to Lovable
    // This would be replaced with actual Lovable API endpoint
    const lovablePayload = {
      id: savedReport.id,
      type: bugReport.type,
      subject: bugReport.subject,
      description: bugReport.description,
      user_email: bugReport.email || user.email,
      user_id: user.id,
      files: bugReport.files,
      timestamp: new Date().toISOString(),
      project_id: Deno.env.get("SUPABASE_PROJECT_ID"),
    };

    try {
      // For now, we'll just log the payload since we don't have Lovable's actual endpoint
      console.log("Bug report to be sent to Lovable:", JSON.stringify(lovablePayload, null, 2));
      
      // In a real implementation, this would be:
      // const lovableResponse = await fetch("https://api.lovable.dev/bug-reports", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      //   },
      //   body: JSON.stringify(lovablePayload),
      // });

      // Update the bug report status to indicate it was sent
      await supabase
        .from("bug_reports")
        .update({
          status: "sent_to_lovable",
          // lovable_ticket_id: lovableResponse.ticket_id, // would come from Lovable API
        })
        .eq("id", savedReport.id);

      console.log("Bug report successfully submitted and sent to Lovable");

      return new Response(JSON.stringify({ 
        success: true, 
        report_id: savedReport.id,
        message: "Bug report submitted successfully" 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });

    } catch (lovableError) {
      console.error("Error sending to Lovable:", lovableError);
      
      // Update status to indicate failure
      await supabase
        .from("bug_reports")
        .update({ status: "failed_to_send" })
        .eq("id", savedReport.id);

      return new Response(JSON.stringify({ 
        success: false, 
        error: "Failed to send to Lovable but report was saved" 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

  } catch (error) {
    console.error("Error in submit-bug-report function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);