import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testOpenAI() {
  console.log("Testing OpenAI connectivity...");
  console.log("API Key present:", !!process.env.OPENAI_API_KEY);
  
  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: "Say hello!",
    });
    console.log("AI Response:", text);
  } catch (error) {
    console.error("OpenAI Error:", error);
  }
}

testOpenAI();
