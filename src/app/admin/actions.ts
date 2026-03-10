"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Utility to check admin access for server actions
async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user || user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
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
