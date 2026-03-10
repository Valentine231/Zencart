import { tool } from "ai";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

/**
 * Admin AI Agent Tools - Tools for admins to manage orders, users, and products
 */

export const adminAgentTools = {
  // Get all orders
  getAllOrders: tool({
    description: "Retrieve all orders with optional filtering and sorting",
    parameters: z.object({
      status: z
        .enum(["PENDING", "PAID"])
        .optional()
        .describe("Filter by order status"),
      limit: z.number().optional().default(20).describe("Maximum results"),
      page: z.number().optional().default(1).describe("Page number"),
    }).strict(),
    execute: async (args) => {
      const skip = (args.page - 1) * args.limit;
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where: args.status ? { status: args.status } : {},
          take: args.limit,
          skip,
          include: {
            user: { select: { email: true, id: true } },
            items: {
              include: {
                product: { select: { title: true, price: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.order.count({
          where: args.status ? { status: args.status } : {},
        }),
      ]);

      return JSON.stringify({
        orders,
        pagination: {
          page: args.page,
          limit: args.limit,
          total,
          totalPages: Math.ceil(total / args.limit),
        },
      });
    },
  }),

  // Update order status
  updateOrderStatus: tool({
    description: "Update the status of an order",
    parameters: z.object({
      orderId: z.string().describe("The order ID"),
      status: z.enum(["PENDING", "PAID"]).describe("New status"),
    }),
    execute: async (args) => {
      try {
        const order = await prisma.order.update({
          where: { id: args.orderId },
          data: { status: args.status },
        });

        return JSON.stringify({
          success: true,
          message: `Order ${args.orderId} updated to ${args.status}`,
          order,
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : "Failed to update order",
        });
      }
    },
  }),

  // Get user details with history
  getUserProfile: tool({
    description: "Get detailed user profile including orders and purchase history",
    parameters: z.object({
      userId: z.string().describe("The user ID"),
    }),
    execute: async (args) => {
      const user = await prisma.user.findUnique({
        where: { id: args.userId },
        include: {
          orders: {
            include: {
              items: {
                include: {
                  product: { select: { title: true, price: true } },
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });

      if (!user) {
        return JSON.stringify({ error: "User not found" });
      }

      const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0);
      const orderCount = user.orders.length;

      return JSON.stringify({
        ...user,
        stats: {
          totalOrders: orderCount,
          totalSpent,
          averageOrderValue:
            orderCount > 0 ? totalSpent / orderCount : 0,
          lastOrder: user.orders[0]?.createdAt,
        },
      });
    },
  }),

  // List all users with stats
  listUsers: tool({
    description: "Get a list of users with optional filtering",
    parameters: z.object({
      role: z
        .enum(["USER", "ADMIN"])
        .optional()
        .describe("Filter by role"),
      limit: z.number().optional().default(20).describe("Maximum results"),
      page: z.number().optional().default(1).describe("Page number"),
    }).strict(),
    execute: async (args) => {
      const skip = (args.page - 1) * args.limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: args.role ? { role: args.role } : {},
          take: args.limit,
          skip,
          include: {
            orders: { select: { total: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.user.count({
          where: args.role ? { role: args.role } : {},
        }),
      ]);

      const usersWithStats = users.map((user) => ({
        ...user,
        totalSpent: user.orders.reduce((sum, order) => sum + order.total, 0),
        orderCount: user.orders.length,
      }));

      return JSON.stringify({
        users: usersWithStats,
        pagination: {
          page: args.page,
          limit: args.limit,
          total,
          totalPages: Math.ceil(total / args.limit),
        },
      });
    },
  }),

  // Get sales analytics
  getSalesAnalytics: tool({
    description: "Get sales metrics and analytics",
    parameters: z.object({
      period: z
        .enum(["day", "week", "month", "all"])
        .optional()
        .default("month")
        .describe("Time period for analytics"),
    }).strict(),
    execute: async (args) => {
      let dateFilter: any = {};

      const now = new Date();
      if (args.period === "day") {
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        dateFilter = { createdAt: { gte: yesterday } };
      } else if (args.period === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = { createdAt: { gte: weekAgo } };
      } else if (args.period === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = { createdAt: { gte: monthAgo } };
      }

      const orders = await prisma.order.findMany({
        where: dateFilter,
        include: { items: { include: { product: true } } },
      });

      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const totalOrders = orders.length;
      const paidOrders = orders.filter((o) => o.status === "PAID").length;
      const pendingOrders = orders.filter((o) => o.status === "PENDING").length;

      // Calculate category performance
      const categoryStats = orders
        .flatMap((o) => o.items)
        .reduce(
          (acc, item) => {
            const category = item.product.category;
            if (!acc[category]) {
              acc[category] = {
                sold: 0,
                revenue: 0,
              };
            }
            acc[category].sold += item.quantity;
            acc[category].revenue += item.product.price * item.quantity;
            return acc;
          },
          {} as Record<string, { sold: number; revenue: number }>
        );

      return JSON.stringify({
        period: args.period,
        totalRevenue,
        totalOrders,
        paidOrders,
        pendingOrders,
        averageOrderValue:
          totalOrders > 0 ? totalRevenue / totalOrders : 0,
        categoryStats,
      });
    },
  }),

  // Product inventory check
  getProductInventory: tool({
    description: "Check product inventory and sales metrics",
    parameters: z.object({
      category: z
        .enum(["MEN", "WOMEN", "ACCESSORIES", "FOOTWEAR", "GLASSES", "GADGETS"])
        .optional()
        .describe("Filter by category"),
    }).strict(),
    execute: async (args) => {
      const products = await prisma.product.findMany({
        where: args.category ? { category: args.category } : {},
        include: {
          orderItems: {
            select: { quantity: true },
          },
        },
      });

      const inventory = products.map((product) => {
        const totalSold = product.orderItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        return {
          id: product.id,
          title: product.title,
          category: product.category,
          price: product.price,
          totalSold,
          revenue: product.price * totalSold,
        };
      });

      return JSON.stringify({
        category: args.category || "all",
        products: inventory,
        totalProducts: inventory.length,
        totalRevenue: inventory.reduce((sum, p) => sum + p.revenue, 0),
        topProducts: inventory.sort((a, b) => b.totalSold - a.totalSold).slice(0, 5),
      });
    },
  }),

  // Bulk update product prices
  updateProductPrice: tool({
    description: "Update price for a product",
    parameters: z.object({
      productId: z.string().describe("The product ID"),
      newPrice: z.number().min(0).describe("New price"),
    }),
    execute: async (args) => {
      try {
        const product = await prisma.product.update({
          where: { id: args.productId },
          data: { price: args.newPrice },
        });

        return JSON.stringify({
          success: true,
          message: `Price updated to $${args.newPrice}`,
          product,
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : "Failed to update price",
        });
      }
    },
  }),

  // Generate sales report
  generateSalesReport: tool({
    description: "Generate a detailed sales report",
    parameters: z.object({
      startDate: z.string().optional().describe("Start date (ISO format)"),
      endDate: z.string().optional().describe("End date (ISO format)"),
    }),
    execute: async (args) => {
      const whereClause: any = {};

      if (args.startDate || args.endDate) {
        whereClause.createdAt = {};
        if (args.startDate)
          whereClause.createdAt.gte = new Date(args.startDate);
        if (args.endDate) whereClause.createdAt.lte = new Date(args.endDate);
      }

      const orders = await prisma.order.findMany({
        where: whereClause,
        include: {
          user: { select: { email: true } },
          items: {
            include: {
              product: { select: { title: true, price: true, category: true } },
            },
          },
        },
      });

      const report = {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
        averageOrderValue:
          orders.length > 0
            ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length
            : 0,
        ordersByStatus: {
          PENDING: orders.filter((o) => o.status === "PENDING").length,
          PAID: orders.filter((o) => o.status === "PAID").length,
        },
        topCustomers: orders
          .reduce(
            (acc, o) => {
              const idx = acc.findIndex((c) => c.email === o.user.email);
              if (idx > -1) {
                acc[idx].spending += o.total;
                acc[idx].orders += 1;
              } else {
                acc.push({ email: o.user.email, spending: o.total, orders: 1 });
              }
              return acc;
            },
            [] as Array<{ email: string; spending: number; orders: number }>
          )
          .sort((a, b) => b.spending - a.spending)
          .slice(0, 10),
      };

      return JSON.stringify(report);
    },
  }),
};
