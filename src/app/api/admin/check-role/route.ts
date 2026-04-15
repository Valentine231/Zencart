import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { role: true },
    });

    const isAdmin = dbUser?.role === "ADMIN";

    if (isAdmin) {
      // Also set the cookie so the admin layout works without re-checking
      const response = NextResponse.json({ isAdmin: true });
      response.cookies.set("adminAuth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return response;
    }

    return NextResponse.json({ isAdmin: false });
  } catch (error) {
    console.error("Admin role check error:", error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
