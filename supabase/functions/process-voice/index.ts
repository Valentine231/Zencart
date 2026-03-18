import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { audioUrl, language = "en" } = await req.json();

    if (!audioUrl) {
      return new Response(
        JSON.stringify({ error: "Missing audioUrl" }),
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

    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error("Failed to fetch audio file");
    }

    const audioBuffer = await audioResponse.arrayBuffer();

    const formData = new FormData();
    formData.append("file", new Blob([audioBuffer], { type: "audio/mpeg" }), "audio.mp3");
    formData.append("model", "whisper-1");
    formData.append("language", language);

    const transcriptionResponse = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: formData,
      }
    );

    const transcriptionData = await transcriptionResponse.json();

    if (!transcriptionResponse.ok) {
      throw new Error(
        `Transcription failed: ${transcriptionData.error?.message || "Unknown error"}`
      );
    }

    const isPidgin =
      transcriptionData.text?.toLowerCase().includes("wetin") ||
      transcriptionData.text?.toLowerCase().includes("na") ||
      transcriptionData.text?.toLowerCase().includes("go");

    return new Response(
      JSON.stringify({
        text: transcriptionData.text,
        language: isPidgin ? "pidgin" : language,
        confidence: transcriptionData.confidence || null,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Voice processing error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Voice processing failed",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
