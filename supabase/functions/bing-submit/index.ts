import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://therizoproperties.com";

const staticUrls = [
  "/",
  "/properties",
  "/calculator",
  "/our-standard",
  "/team",
  "/contact",
  "/vault",
  "/guides/title-verification",
  "/guides/buyer-guide",
  "/guides/roi-methodology",
  "/press",
  "/locations/lagos",
  "/locations/abuja",
  "/locations/port-harcourt",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const bingApiKey = Deno.env.get("BING_WEBMASTER_API_KEY");
    
    if (!bingApiKey) {
      throw new Error("BING_WEBMASTER_API_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build URL list starting with static pages
    const allUrls = staticUrls.map(path => `${SITE_URL}${path}`);

    // Fetch listed properties from database
    const { data: properties, error } = await supabase
      .from("properties")
      .select("id")
      .eq("status", "listed");

    if (!error && properties && properties.length > 0) {
      properties.forEach((property) => {
        allUrls.push(`${SITE_URL}/properties/${property.id}`);
      });
    }

    console.log(`Submitting ${allUrls.length} URLs to Bing`);

    // Build XML payload for Bing SubmitUrlBatch API
    const urlListXml = allUrls
      .map(url => `<string xmlns="http://schemas.microsoft.com/2003/10/Serialization/Arrays">${url}</string>`)
      .join("\n    ");

    const xmlPayload = `<?xml version="1.0" encoding="UTF-8"?>
<SubmitUrlBatch xmlns="http://schemas.datacontract.org/2004/07/Microsoft.Bing.Webmaster.Api">
  <siteUrl>${SITE_URL}</siteUrl>
  <urlList>
    ${urlListXml}
  </urlList>
</SubmitUrlBatch>`;

    // Submit to Bing Webmaster API
    const bingResponse = await fetch(
      `https://ssl.bing.com/webmaster/api.svc/pox/SubmitUrlBatch?apikey=${bingApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
        },
        body: xmlPayload,
      }
    );

    if (!bingResponse.ok) {
      const errorText = await bingResponse.text();
      console.error("Bing API error:", errorText);
      throw new Error(`Bing API error: ${bingResponse.status} - ${errorText}`);
    }

    console.log("Successfully submitted URLs to Bing");

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully submitted ${allUrls.length} URLs to Bing`,
        urls: allUrls,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Bing submission error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
