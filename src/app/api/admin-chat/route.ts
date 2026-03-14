import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { adminAgentTools } from "@/lib/adminAgentTools";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { userId } = await auth();

  // Check if user is admin
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user || user.role !== "ADMIN") {
    return new Response("Admin access required", { status: 403 });
  }

  const { messages } = await req.json();

  const systemPrompt = `You are ZenCart Admin AI Agent, an advanced administrative assistant for managing the ZenCart store.

Your capabilities:
- View and manage all orders (update status, track shipments)
- Monitor user accounts and purchase history
- Track sales analytics and revenue metrics
- Manage product inventory and pricing
- Generate detailed sales reports
- Analyze customer behavior and trends

When admins ask:
1. Use getAllOrders to view orders with filtering
2. Use updateOrderStatus to manage order fulfillment
3. Use getUserProfile to check customer details
4. Use listUsers to monitor user accounts
5. Use getSalesAnalytics for business metrics
6. Use getProductInventory for stock information
7. Use generateSalesReport for detailed reports

Provide clear, actionable insights. Format data professionally for business decisions.`;

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages,
    system: systemPrompt,
    tools: adminAgentTools,
  });

  return result.toDataStreamResponse({
    headers: {
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
