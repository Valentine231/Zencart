import { generateWhatsAppResponse } from "./src/lib/whatsappAgent";
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testWhatsAppAI() {
  console.log("Testing WhatsApp AI Agent...");
  
  const testPhone = "2348012345678";
  const testMessage = "Abeg, I wan pay for order zencart_test_123.";

  console.log(`User (${testPhone}): ${testMessage}`);
  
  try {
    const response = await generateWhatsAppResponse(testPhone, testMessage);
    console.log("\nAI Response:");
    console.log(response);
    
    if (response) {
      console.log("\nVERIFICATION: SUCCESS");
    } else {
      console.log("\nVERIFICATION: FAILED (Empty response)");
    }
  } catch (error) {
    console.error("\nVERIFICATION: ERROR", error);
  }
}

testWhatsAppAI();
