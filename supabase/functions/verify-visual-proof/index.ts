import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ComparisonResult {
  matchScore: number;
  itemsMatch: boolean;
  details: string;
  confidence: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { listingImageUrl, dispatchVideoFrameUrl } = await req.json();

    if (!listingImageUrl || !dispatchVideoFrameUrl) {
      return new Response(
        JSON.stringify({
          error: "Missing listingImageUrl or dispatchVideoFrameUrl",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const [listingBase64, dispatchBase64] = await Promise.all([
      imageUrlToBase64(listingImageUrl),
      imageUrlToBase64(dispatchVideoFrameUrl),
    ]);

    const comparisonResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4-vision",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Compare these two images for product verification in a Nigerian e-commerce context:

1. LISTING IMAGE (What customer ordered)
2. DISPATCH VIDEO FRAME (What seller is actually sending)

Analyze:
- Is it the SAME ITEM?
- Any VISIBLE DAMAGE?
- CORRECT COLOR/SIZE?
- OBVIOUS FRAUD?

Respond in JSON:
{
  "itemsMatch": true/false,
  "matchScore": 0-100,
  "details": "brief explanation",
  "fraudRisk": "low/medium/high",
  "recommendation": "VERIFY/DISPUTE/INVESTIGATE"
}`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${listingBase64}`,
                },
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${dispatchBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    if (!comparisonResponse.ok) {
      throw new Error("Vision API request failed");
    }

    const data = await comparisonResponse.json();
    const responseText = data.choices?.[0]?.message?.content;

    let result: ComparisonResult = {
      matchScore: 50,
      itemsMatch: false,
      details: "Unable to verify",
      confidence: 0,
    };

    try {
      const parsed = JSON.parse(responseText);
      result = {
        matchScore: parsed.matchScore || 50,
        itemsMatch: parsed.itemsMatch || false,
        details: parsed.details || "Analysis complete",
        confidence: parsed.fraudRisk === "low" ? 0.95 : parsed.fraudRisk === "medium" ? 0.7 : 0.3,
      };
    } catch {
      result.details = responseText || "Analysis complete but format parsing failed";
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Visual proof verification error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Verification failed",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function imageUrlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${url}`);
  }

  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}
