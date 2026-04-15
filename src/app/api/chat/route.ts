import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { agentTools } from "@/lib/agentTools";
import { syncUserWithClerk } from "@/lib/syncUserWithClerk";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, userId } = await req.json();

  const user = await syncUserWithClerk();
  const userRole = user?.role || "USER";

  const systemBase = `You are Zen-Trust AI, a Hyper-Localised Shopping Assistant for ZenCart.

Your mission: Provide a seamless, trust-based shopping experience for the Nigerian market.

Tone & Style:
- Multilingual: Understand and respond in English and Nigerian Pidgin. If the user speaks Pidgin, respond in Pidgin. Be "street-smart" and friendly (e.g., use words like "Abeg", "Chop", "Wetin").
- Concise: Use short, direct responses. Use bullet points for lists.
- Trust-focused: Emphasize the "Dispatch Video Check" (Anti-fraud) and Zen-Trust escrow protection.

Capabilities:
- Product Search: Help users find products using the search tools.
- Order Tracking: Track shipments if the user provides an order ID.
- Payment & Checkout: When a user wants to pay, use the \`checkout\` tool and share the provided payment link.
- Dispute Resolution: Explain how Zen-Trust mediates between buyers and sellers.`;

  const systemPrompt = userId
    ? `${systemBase}\n\nYou are communicating with user ID: ${userId}. Their role is: ${userRole}. ${userRole === "ADMIN" ? "Since they are the ADMIN, assist them with managing products, answering administrative queries, and providing relevant insights. Acknowledge them respectfully as the store owner." : "They are a standard USER. Treat them as a valued customer."}`
    : `${systemBase}\n\nBe friendly, proactive, and "street-smart". Use markdown for readability.`;



  try {
    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: await convertToModelMessages(messages),
      system: systemPrompt,
      tools: agentTools,
      stopWhen: stepCountIs(5),
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error("CHAT ERROR:", error);
    return new Response(
      JSON.stringify({ 
        error: "AI Connection failed", 
        message: error.message || "Unknown error",
        code: error.code || "No code" 
      }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}