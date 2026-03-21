import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncUserWithClerk } from "@/lib/syncUserWithClerk";

export const runtime = "nodejs";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await syncUserWithClerk();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if order belongs to user
    const order = await prisma.order.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the order (cascade delete handles items and disputes due to schema update)
    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Order removed successfully" });
  } catch (error: any) {
    console.error("DELETE /api/orders/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove order" },
      { status: 500 }
    );
  }
}
