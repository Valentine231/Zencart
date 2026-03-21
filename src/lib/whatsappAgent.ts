import { openai } from "@ai-sdk/openai";
import { generateText, stepCountIs } from "ai";
import { agentTools } from "./agentTools";
import { prisma } from "./prisma";

/**
 * Generates an AI response for an incoming WhatsApp message.
 * @param phoneNumber The user's WhatsApp phone number.
 * @param message The user's message text.
 * @returns The AI-generated response text.
 */
export async function generateWhatsAppResponse(phoneNumber: string, message: string): Promise<string> {
  // Try to find a user associated with this phone number (optional for now)
  // Note: We might want to add a phoneNumber field to the User model later.
    const systemPrompt = `You are Zen-Trust AI, a Hyper-Localised Shopping Assistant for ZenCart, responding via WhatsApp.

Your mission: Provide a seamless, trust-based shopping experience for the Nigerian market.

Tone & Style:
- Multilingual: Understand and respond in English and Nigerian Pidgin. If the user speaks Pidgin, respond in Pidgin. Be "street-smart" and friendly (e.g., use words like "Abeg", "Chop", "Wetin").
- Concise: WhatsApp users prefer short, direct responses. Use bullet points for lists. Avoid long paragraphs.
- Trust-focused: Emphasize the "Dispatch Video Check" (Anti-fraud) and Zen-Trust escrow protection.

Capabilities:
- Product Search: Help users find products using the search tools.
- Order Tracking: Track shipments if the user provides an order ID.
- Payment & Checkout: When a user wants to pay, use the \`checkout\` tool and ALWAYS share the provided payment link/URL directly in the chat so they can click it.
- Dispute Resolution: Explain how Zen-Trust mediates between buyers and sellers.


IMPORTANT: Always provide a text response summarizing the results of any tool you use. Even if no products are found, explain that to the user in a friendly way.

You are communicating with the user at phone number: ${phoneNumber}`;


  console.log("Generating AI response for WhatsApp...");
  
  try {
    const result = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: message,
      tools: agentTools,
      stopWhen: stepCountIs(5),
      onStepFinish: (step) => {
        console.log(`\n--- Step Finish ---`);
        if (step.toolCalls && step.toolCalls.length > 0) {
          console.log("Tool Calls:", JSON.stringify(step.toolCalls, null, 2));
        }
        if (step.toolResults && step.toolResults.length > 0) {
          console.log("Tool Results:", JSON.stringify(step.toolResults, null, 2));
        }
        if (step.text) {
          console.log("Step Text:", step.text);
        }
      }
    });

    console.log("\nFinal AI Generation Text:", result.text);
    console.log("Steps taken:", result.steps.length);
    
    // Fallback logic for WhatsApp: Use messages from tool results if model text is empty
    if (!result.text) {
      for (const step of result.steps) {
        if (step.toolResults && step.toolResults.length > 0) {
          for (const toolResult of step.toolResults) {
            // Check both 'result' and 'output' for the tool result
            const rawResult = (toolResult as any).result || (toolResult as any).output;
            const parsedOutput = typeof rawResult === 'string' 
              ? JSON.parse(rawResult) 
              : rawResult;
            
            if (parsedOutput && parsedOutput.message) {
               console.log("Using tool result message as fallback:", parsedOutput.message);
               return parsedOutput.message;
            }
          }
        }
      }
      
      if (result.steps.length > 0) {
        return "I find wetin you search for! See the details above. You fit ask me anything else.";
      }
    }

    return result.text || "Abeg, I no fit find wetin you want now. Try search for another thing.";


  } catch (error) {
    console.error("AI Generation Error (WhatsApp):", error);
    return "Abeg, I get small issue with my brain now. Try again later or contact support.";
  }

}
