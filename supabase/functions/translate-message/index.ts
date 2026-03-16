import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TranslationResult {
  originalText: string;
  translatedText: string;
  detectedLanguage: string;
  targetLanguage: string;
  confidence: number;
}

const languageMap: Record<string, string> = {
  en: "English",
  pidgin: "Nigerian Pidgin",
  yo: "Yoruba",
  ig: "Igbo",
  ha: "Hausa",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { text, targetLanguage = "en", detectLanguage = true } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: "Missing text parameter" }),
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

    let detectedLang = targetLanguage;
    let translatedText = text;

    if (detectLanguage) {
      const detectResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: `Detect the language of this text. Only respond with the language code: en, pidgin, yo, ig, or ha.\n\nText: "${text}"`,
            },
          ],
          max_tokens: 10,
        }),
      });

      const detectData = await detectResponse.json();
      detectedLang = detectData.choices?.[0]?.message?.content?.trim() || "en";
    }

    if (detectedLang !== targetLanguage) {
      const targetLangName = languageMap[targetLanguage] || "English";
      const sourceLangName = languageMap[detectedLang] || "English";

      const translationResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a translator specializing in Nigerian languages and dialects. Translate the text accurately while preserving the cultural context and informal tone. Only respond with the translated text, nothing else.`,
            },
            {
              role: "user",
              content: `Translate from ${sourceLangName} to ${targetLangName}:\n\n"${text}"`,
            },
          ],
          max_tokens: 200,
        }),
      });

      const translationData = await translationResponse.json();
      translatedText = translationData.choices?.[0]?.message?.content?.trim() || text;
    }

    const result: TranslationResult = {
      originalText: text,
      translatedText,
      detectedLanguage: detectedLang,
      targetLanguage,
      confidence: 0.95,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Translation error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Translation failed",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
