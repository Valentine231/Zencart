import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateWhatsAppResponse } from "@/lib/whatsappAgent";

export const runtime = "nodejs";

const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";
const WHATSAPP_TOKEN = process.env.WHATSAPP_BUSINESS_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return NextResponse.json({ challenge }, { status: 200 });
  }

  return NextResponse.json(
    { error: "Webhook verification failed" },
    { status: 403 }
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { entry } = body;

    if (!entry || entry.length === 0) {
      return NextResponse.json({ success: true });
    }

    for (const e of entry) {
      const changes = e.changes?.[0];
      if (!changes) continue;

      const { value } = changes;
      const { messages, statuses } = value;

      if (messages && messages.length > 0) {
        await handleIncomingMessage(messages[0]);
      }

      if (statuses && statuses.length > 0) {
        await handleMessageStatus(statuses[0]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleIncomingMessage(message: any) {
  const { from, id, timestamp, type, text, image, voice, document } = message;

  console.log(`Received ${type} from ${from} at ${timestamp}`);

  let messageContent = "";

  if (type === "text" && text?.body) {
    messageContent = text.body;
  } else if (type === "image" && image?.link) {
    messageContent = `[Image: ${image.link}]`;
  } else if (type === "voice" && voice?.link) {
    messageContent = `[Voice Note: ${voice.link}]`;
  } else if (type === "document" && document?.link) {
    messageContent = `[Document: ${document.link}]`;
  }

  try {
    await prisma.whatsappMessage.create({
      data: {
        phoneNumber: from,
        messageType: type,
        content: messageContent,
        mediaUrl:
          image?.link || voice?.link || document?.link || document?.id,
        waMessageId: id,
      },
    });
  } catch (error) {
    console.error("Error saving WhatsApp message:", error);
  }

  await sendWhatsAppResponse(from, messageContent);
}

async function handleMessageStatus(status: any) {
  const { recipient_id, status: deliveryStatus, id } = status;

  console.log(`Message ${id} status: ${deliveryStatus} for ${recipient_id}`);

  try {
    await prisma.whatsappMessage.updateMany({
      where: { waMessageId: id },
      data: { deliveryStatus },
    });
  } catch (error) {
    console.error("Error updating message status:", error);
  }
}

async function sendWhatsAppResponse(phoneNumber: string, userMessage: string) {
  try {
    const responseText = await generateWhatsAppResponse(phoneNumber, userMessage);
    await sendWhatsAppMessage(phoneNumber, responseText);
  } catch (error) {
    console.error("Error sending WhatsApp response:", error);
  }
}

async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phoneNumber,
          type: "text",
          text: { body: message },
        }),
      }
    );

    const data = await response.json();

    if (response.ok && data.messages?.[0]?.id) {
      console.log(`Message sent to ${phoneNumber}, ID: ${data.messages[0].id}`);
      return true;
    } else {
      console.error("WhatsApp send error:", data);
      return false;
    }
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
}
