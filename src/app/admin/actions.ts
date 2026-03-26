"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// Utility to check admin access for server actions
async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("adminAuth")?.value;
  
  if (!token || token !== "authenticated") {
    throw new Error("Unauthorized");
  }
}

export async function loginAdmin(passcode: string) {
  if (passcode === process.env.ADMIN_PASSCODE) {
    const cookieStore = await cookies();
    cookieStore.set("adminAuth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
    return { success: true };
  }
  return { success: false, error: "Invalid passcode" };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("adminAuth");
}

export async function getDashboardStats() {
  await requireAdmin();

  const [totalUsers, totalProducts, totalOrders, paidOrders] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.findMany({
      where: { status: "PAID" },
      select: { total: true },
    }),
  ]);

  const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);

  return {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
  };
}

export async function getProducts() {
  await requireAdmin();
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  await prisma.product.delete({
    where: { id: productId },
  });
}

import { Category } from "@prisma/client";

export async function createProduct(data: {
  title: string;
  description: string;
  price: number;
  image: string;
  category: Category;
}) {
  await requireAdmin();
  
  const product = await prisma.product.create({
    data: {
      title: data.title,
      description: data.description,
      price: data.price,
      image: data.image,
      category: data.category,
    },
  });

  return product;
}

export async function getUsers() {
  await requireAdmin();
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { orders: true },
      },
    },
  });
}

export async function getOrders() {
  await requireAdmin();
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          email: true,
        },
      },
      _count: {
        select: { items: true },
      },
    },
  });
}
