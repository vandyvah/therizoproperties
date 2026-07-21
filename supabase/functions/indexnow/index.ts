import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://therizoproperties.com";
const HOST = "therizoproperties.com";

const staticUrls = [
  "/",
  "/properties",
  "/blog",
  "/calculator",
  "/calculator/advanced",
  "/our-standard",
  "/team",
  "/contact",
  "/materials-supply",
  "/guides/title-verification",
  "/guides/buyer-guide",
  "/guides/roi-methodology",
  "/press",
  "/locations/lagos",
  "/locations/abuja",
  "/locations/port-harcourt",
  "/submit-property",
  "/abuja-starter-kit",
  "/report-fraud",
];

// IndexNow endpoints for different search engines
const indexNowEndpoints = [
  "https://api.indexnow.org/indexnow",
  "https://www.bing.com/indexnow",
  "https://yandex.com/indexnow",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const indexNowKey = Deno.env.get("INDEXNOW_API_KEY");
    
    if (!indexNowKey) {
      throw new Error("INDEXNOW_API_KEY not configured");
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

    console.log(`Submitting ${allUrls.length} URLs via IndexNow`);

    // IndexNow payload
    const payload = {
      host: HOST,
      key: indexNowKey,
      keyLocation: `${SITE_URL}/${indexNowKey}.txt`,
      urlList: allUrls,
    };

    // Submit to all IndexNow endpoints
    const results = await Promise.allSettled(
      indexNowEndpoints.map(async (endpoint) => {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: JSON.stringify(payload),
        });

        return {
          endpoint,
          status: response.status,
          ok: response.ok,
        };
      })
    );

    const successfulSubmissions = results.filter(
      (r) => r.status === "fulfilled" && r.value.ok
    ).length;

    console.log(`Successfully submitted to ${successfulSubmissions}/${indexNowEndpoints.length} endpoints`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Submitted ${allUrls.length} URLs to ${successfulSubmissions} IndexNow endpoints`,
        urls: allUrls,
        results: results.map((r) => 
          r.status === "fulfilled" ? r.value : { error: r.reason }
        ),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("IndexNow submission error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
