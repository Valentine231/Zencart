import { tool } from "ai";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

/**
 * AI Agent Tools - Reusable tools for autonomous task execution
 */

export const agentTools = {
  // Product search and retrieval
  searchProducts: tool({
    description: "Search for products in the store by query, category, or price range",
    parameters: z.object({
      query: z
        .string()
        .optional()
        .describe("Search term (e.g., 'shoes', 'glasses')"),
      category: z
        .enum(["MEN", "WOMEN", "ACCESSORIES", "FOOTWEAR", "GLASSES", "GADGETS"])
        .optional()
        .describe("Product category"),
      maxPrice: z.number().optional().describe("Maximum price filter"),
      minPrice: z.number().optional().describe("Minimum price filter"),
      limit: z.number().optional().describe("Number of results"),
    }).strict(),
    execute: async (args) => {
      const { query, category, maxPrice, minPrice, limit } = args;
      let whereClause: any = {};

      if (query) {
        whereClause.OR = [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ];
      }

      if (category) {
        whereClause.category = category;
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        whereClause.price = {};
        if (minPrice !== undefined) whereClause.price.gte = minPrice;
        if (maxPrice !== undefined) whereClause.price.lte = maxPrice;
      }

      const products = await prisma.product.findMany({
        where: whereClause,
        take: limit || 10,
        select: {
          id: true,
          title: true,
          price: true,
          description: true,
          category: true,
          image: true,
        },
        orderBy: { price: "asc" },
      });

      return JSON.stringify(products);
    },
  }),

  // Get product details
  getProductDetails: tool({
    description: "Get detailed information about a specific product",
    parameters: z.object({
      productId: z.string().describe("The product ID"),
    }).strict(),
    execute: async (args) => {
      const product = await prisma.product.findUnique({
        where: { id: args.productId },
        include: {
          orderItems: {
            select: { quantity: true },
          },
        },
      });

      if (!product) {
        return JSON.stringify({ error: "Product not found" });
      }

      const totalSold = product.orderItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      return JSON.stringify({ ...product, totalSold });
    },
  }),

  // Get user's orders
  getUserOrders: tool({
    description: "Retrieve all orders for a specific user",
    parameters: z.object({
      userId: z.string().describe("The user's ID"),
      limit: z.number().optional().default(10).describe("Number of orders to return"),
    }).strict(),
    execute: async (args) => {
      const orders = await prisma.order.findMany({
        where: { userId: args.userId },
        take: args.limit,
        include: {
          items: {
            include: {
              product: { select: { title: true, price: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return JSON.stringify(orders);
    },
  }),

  // Get order details
  getOrderDetails: tool({
    description: "Get detailed information about a specific order",
    parameters: z.object({
      orderId: z.string().describe("The order ID"),
    }).strict(),
    execute: async (args) => {
      const order = await prisma.order.findUnique({
        where: { id: args.orderId },
        include: {
          items: {
            include: {
              product: { select: { title: true, price: true, image: true } },
            },
          },
          user: { select: { email: true } },
        },
      });

      if (!order) {
        return JSON.stringify({ error: "Order not found" });
      }

      return JSON.stringify(order);
    },
  }),

  // Track order status
  trackOrder: tool({
    description: "Track the status of an order",
    parameters: z.object({
      orderId: z.string().describe("The order ID to track"),
    }).strict(),
    execute: async (args) => {
      const order = await prisma.order.findUnique({
        where: { id: args.orderId },
        select: { id: true, status: true, total: true, createdAt: true, updatedAt: true },
      });

      if (!order) {
        return JSON.stringify({ error: "Order not found" });
      }

      return JSON.stringify({
        orderId: order.id,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        lastUpdated: order.updatedAt,
        isDelivered: order.status === "PAID",
      });
    },
  }),

  // Get category statistics
  getCategoryStats: tool({
    description: "Get statistics about products in a category",
    parameters: z.object({
      category: z
        .enum(["MEN", "WOMEN", "ACCESSORIES", "FOOTWEAR", "GLASSES", "GADGETS"])
        .describe("The product category"),
    }).strict(),
    execute: async (args) => {
      const products = await prisma.product.findMany({
        where: { category: args.category },
        select: { id: true, price: true },
      });

      if (products.length === 0) {
        return JSON.stringify({ count: 0, message: "No products in this category" });
      }

      const prices = products.map((p) => p.price);
      const avgPrice = prices.reduce((a, b) => a + b) / prices.length;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      return JSON.stringify({
        category: args.category,
        totalProducts: products.length,
        averagePrice: parseFloat(avgPrice.toFixed(2)),
        priceRange: { min: minPrice, max: maxPrice },
      });
    },
  }),

  // Browse by category
  browseCategory: tool({
    description: "Get products from a specific category with pagination",
    parameters: z.object({
      category: z
        .enum(["MEN", "WOMEN", "ACCESSORIES", "FOOTWEAR", "GLASSES", "GADGETS"])
        .describe("The product category"),
      page: z.number().optional().default(1).describe("Page number (1-indexed)"),
      pageSize: z.number().optional().default(6).describe("Items per page"),
    }).strict(),
    execute: async (args) => {
      const skip = (args.page - 1) * args.pageSize;

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: { category: args.category },
          skip,
          take: args.pageSize,
          select: {
            id: true,
            title: true,
            price: true,
            description: true,
            image: true,
          },
        }),
        prisma.product.count({ where: { category: args.category } }),
      ]);

      return JSON.stringify({
        category: args.category,
        products,
        pagination: {
          page: args.page,
          pageSize: args.pageSize,
          total,
          totalPages: Math.ceil(total / args.pageSize),
        },
      });
    },
  }),

  // Compare products
  compareProducts: tool({
    description: "Compare specifications and prices of multiple products",
    parameters: z.object({
      productIds: z
        .array(z.string())
        .min(2)
        .max(5)
        .describe("Array of product IDs to compare"),
    }).strict(),
    execute: async (args) => {
      const products = await prisma.product.findMany({
        where: { id: { in: args.productIds } },
        select: {
          id: true,
          title: true,
          price: true,
          category: true,
          description: true,
        },
      });

      if (products.length === 0) {
        return JSON.stringify({ error: "No products found" });
      }

      return JSON.stringify({
        comparison: products,
        priceRange: {
          min: Math.min(...products.map((p) => p.price)),
          max: Math.max(...products.map((p) => p.price)),
          avg:
            products.reduce((sum, p) => sum + p.price, 0) / products.length,
        },
      });
    },
  }),

  // Recommended products based on purchase history
  getRecommendations: tool({
    description: "Get product recommendations for a user based on their purchase history",
    parameters: z.object({
      userId: z.string().describe("The user ID"),
      limit: z.number().optional().default(5).describe("Number of recommendations"),
    }).strict(),
    execute: async (args) => {
      // Get user's purchase history
      const userOrders = await prisma.order.findMany({
        where: { userId: args.userId },
        include: {
          items: { select: { product: { select: { category: true } } } },
        },
      });

      if (userOrders.length === 0) {
        // If no history, return trending products
        const products = await prisma.product.findMany({
          take: args.limit,
          select: {
            id: true,
            title: true,
            price: true,
            category: true,
          },
        });
        return JSON.stringify({
          type: "trending",
          recommendations: products,
        });
      }

      // Get categories from purchase history
      const categories = new Set(
        userOrders
          .flatMap((o) => o.items)
          .map((item) => item.product.category)
      );

      // Find similar products not yet purchased
      const purchasedProductIds = userOrders
        .flatMap((o) => o.items)
        .map((item) => item.product.id);

      const recommendations = await prisma.product.findMany({
        where: {
          category: { in: Array.from(categories) },
          id: { notIn: purchasedProductIds },
        },
        take: args.limit,
        select: {
          id: true,
          title: true,
          price: true,
          category: true,
        },
      });

      return JSON.stringify({
        type: "personalized",
        recommendations,
      });
    },
  }),

  // Create order
  createOrder: tool({
    description: "Create a new order for a user with specified items",
    parameters: z.object({
      userId: z.string().describe("The user ID"),
      items: z
        .array(
          z.object({
            productId: z.string().describe("Product ID"),
            quantity: z.number().min(1).describe("Quantity"),
          })
        )
        .min(1)
        .describe("Items to order"),
    }).strict(),
    execute: async (args) => {
      try {
        // Calculate total
        const products = await prisma.product.findMany({
          where: { id: { in: args.items.map((i) => i.productId) } },
        });

        const total = args.items.reduce((sum, item) => {
          const product = products.find((p) => p.id === item.productId);
          return sum + (product?.price || 0) * item.quantity;
        }, 0);

        // Create order
        const order = await prisma.order.create({
          data: {
            userId: args.userId,
            total,
            items: {
              create: args.items,
            },
          },
          include: { items: true },
        });

        return JSON.stringify({
          success: true,
          orderId: order.id,
          total: order.total,
          items: order.items,
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : "Failed to create order",
        });
      }
    },
  }),

  // Add to cart (simulate or use actual cart management)
  addToCart: tool({
    description: "Add a product to user's shopping cart (client-side action)",
    parameters: z.object({
      productId: z.string().describe("The product ID to add"),
      quantity: z.number().min(1).optional().default(1).describe("Quantity to add"),
    }).strict(),
    execute: async (args) => {
      return JSON.stringify({
        action: "addToCart",
        productId: args.productId,
        quantity: args.quantity,
        message: `Added ${args.quantity} item(s) to cart`,
      });
    },
  }),

  // Checkout action
  checkout: tool({
    description: "Redirect user to checkout",
    parameters: z.object({
      orderId: z.string().optional().describe("Optional order ID"),
    }).strict(),
    execute: async (args) => {
      return JSON.stringify({
        action: "checkout",
        orderId: args.orderId,
        message: "Redirecting to checkout...",
      });
    },
  }),

  // View cart action
  viewCart: tool({
    description: "Show user's shopping cart",
    parameters: z.object({}).strict(),
    execute: async () => {
      return JSON.stringify({
        action: "viewCart",
        message: "Opening your cart...",
      });
    },
  }),
};
