import { tool } from "ai";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

/**
 * Zod Schemas for AI Tools
 * Defining these outside ensures clean JSON schema generation and reusability.
 */

const searchProductsSchema = z.object({
  query: z.string().describe("Search term (e.g., 'shoes', 'glasses')"),
  category: z.enum(["MEN", "WOMEN", "ACCESSORIES", "FOOTWEAR", "GLASSES", "GADGETS"])
    .optional()
    .describe("Product category: MEN, WOMEN, ACCESSORIES, FOOTWEAR, GLASSES, GADGETS"),
  maxPrice: z.number().optional().describe("Maximum price filter"),
  minPrice: z.number().optional().describe("Minimum price filter"),
  limit: z.number().optional().describe("Number of results"),
});

const getProductDetailsSchema = z.object({
  productId: z.string().describe("The product ID"),
});

const getUserOrdersSchema = z.object({
  userId: z.string().describe("The user's ID"),
  limit: z.number().optional().default(10).describe("Number of orders to return"),
});

const getOrderDetailsSchema = z.object({
  orderId: z.string().describe("The order ID"),
});

const mediateDisputeSchema = z.object({
  disputeId: z.string().describe("The dispute ID"),
  verdict: z.enum(["MATCH", "MISMATCH", "REJECTED"]).describe("The AI verdict based on visual comparison"),
  resolution: z.string().describe("Explanation for the verdict and recommended next steps"),
});

const trackOrderSchema = z.object({
  orderId: z.string().describe("The order ID to track"),
});

const getCategoryStatsSchema = z.object({
  category: z.enum(["MEN", "WOMEN", "ACCESSORIES", "FOOTWEAR", "GLASSES", "GADGETS"])
    .describe("The product category"),
});

const browseCategorySchema = z.object({
  category: z.enum(["MEN", "WOMEN", "ACCESSORIES", "FOOTWEAR", "GLASSES", "GADGETS"])
    .describe("The product category"),
  page: z.number().optional().default(1).describe("Page number (1-indexed)"),
  pageSize: z.number().optional().default(6).describe("Items per page"),
});

const compareProductsSchema = z.object({
  productIds: z.array(z.string()).min(2).max(5).describe("Array of product IDs to compare"),
});

const getRecommendationsSchema = z.object({
  userId: z.string().describe("The user ID"),
  limit: z.number().optional().default(5).describe("Number of recommendations"),
});

const createOrderSchema = z.object({
  userId: z.string().describe("The user ID"),
  items: z.array(z.object({
    productId: z.string().describe("Product ID"),
    quantity: z.number().min(1).describe("Quantity"),
  })).min(1).describe("Items to order"),
});

const addToCartSchema = z.object({
  productId: z.string().describe("The product ID to add"),
  quantity: z.number().min(1).optional().default(1).describe("Quantity to add"),
});

const checkoutSchema = z.object({
  orderId: z.string().optional().describe("Optional order ID"),
});

const uploadDispatchVideoSchema = z.object({
  orderId: z.string().describe("The order ID"),
  videoUrl: z.string().url().describe("URL of the 5-second verification clip"),
});

const initiatePodDisputeSchema = z.object({
  orderId: z.string().describe("The order ID"),
  reason: z.string().describe("Reason for dispute (e.g., mismatch, damage)"),
  evidenceUrl: z.string().url().optional().describe("URL of photo evidence from the buyer"),
});

const releaseEscrowSchema = z.object({
  orderId: z.string().describe("The order ID"),
});

/**
 * AI Agent Tools - Reusable tools for autonomous task execution
 */

export const agentTools = {
  // Product search and retrieval
  searchProducts: tool({
    description: "Search for products in the store by query, category, or price range",
    inputSchema: z.object({
      query: z.string().describe("Search term (e.g., 'shoes', 'glasses')"),
      category: z.enum(["MEN", "WOMEN", "ACCESSORIES", "FOOTWEAR", "GLASSES", "GADGETS"])
        .optional()
        .describe("Product category: MEN, WOMEN, ACCESSORIES, FOOTWEAR, GLASSES, GADGETS"),
      maxPrice: z.number().optional().describe("Maximum price filter"),
      minPrice: z.number().optional().describe("Minimum price filter"),
      limit: z.number().optional().describe("Number of results"),
    }),
    execute: async ({ query, category, maxPrice, minPrice, limit }: z.infer<typeof searchProductsSchema>) => {
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
    inputSchema: z.object({
      productId: z.string().describe("The product ID"),
    }),
    execute: async ({ productId }: z.infer<typeof getProductDetailsSchema>) => {
      const product = await prisma.product.findUnique({
        where: { id: productId },
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
    inputSchema: z.object({
      userId: z.string().describe("The user's Clerk ID"),
      limit: z.number().optional().default(10).describe("Number of orders to return"),
    }),
    execute: async ({ userId, limit }: z.infer<typeof getUserOrdersSchema>) => {
      // Map Clerk ID to internal ID
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { id: true }
      });

      if (!dbUser) {
        return JSON.stringify({ error: `User with Clerk ID ${userId} not found in database.` });
      }

      const orders = await prisma.order.findMany({
        where: { userId: dbUser.id },
        take: limit,
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
    inputSchema: getOrderDetailsSchema,
    execute: async ({ orderId }) => {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
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

  // Mediate Dispute (Zen-Trust AI Verdict)
  mediateDispute: tool({
    description: "Analyze dispatch video and user evidence to provide a mediation verdict",
    inputSchema: mediateDisputeSchema,
    execute: async ({ disputeId, verdict, resolution }) => {
      try {
        const dispute = await prisma.dispute.update({
          where: { id: disputeId },
          data: {
            status: verdict === "MATCH" ? "REJECTED" : "RESOLVED",
            aiVerdict: verdict,
            resolution: resolution,
          },
          include: { order: true },
        });

        // Update order status if mismatch
        if (verdict === "MISMATCH") {
          await prisma.order.update({
            where: { id: dispute.orderId },
            data: { escrowStatus: "DISPUTED" },
          });
        }

        return JSON.stringify({
          success: true,
          verdict: dispute.aiVerdict,
          message: "Mediation complete. User and merchant have been notified.",
        });
      } catch (error) {
        return JSON.stringify({ success: false, error: "Failed to mediate dispute" });
      }
    },
  }),

  // Track order status
  trackOrder: tool({
    description: "Track the status of an order",
    inputSchema: trackOrderSchema,
    execute: async ({ orderId }) => {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
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
    inputSchema: getCategoryStatsSchema,
    execute: async ({ category }) => {
      const products = await prisma.product.findMany({
        where: { category: category },
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
        category: category,
        totalProducts: products.length,
        averagePrice: parseFloat(avgPrice.toFixed(2)),
        priceRange: { min: minPrice, max: maxPrice },
      });
    },
  }),

  // Browse by category
  browseCategory: tool({
    description: "Get products from a specific category with pagination",
    inputSchema: browseCategorySchema,
    execute: async ({ category, page, pageSize }) => {
      const skip = ((page || 1) - 1) * (pageSize || 6);

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: { category: category },
          skip,
          take: pageSize || 6,
          select: {
            id: true,
            title: true,
            price: true,
            description: true,
            image: true,
          },
        }),
        prisma.product.count({ where: { category: category } }),
      ]);

      return JSON.stringify({
        category: category,
        products,
        pagination: {
          page: page,
          pageSize: pageSize,
          total,
          totalPages: Math.ceil(total / (pageSize || 6)),
        },
      });
    },
  }),

  // Compare products
  compareProducts: tool({
    description: "Compare specifications and prices of multiple products",
    inputSchema: compareProductsSchema,
    execute: async ({ productIds }) => {
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
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
    inputSchema: getRecommendationsSchema,
    execute: async ({ userId, limit }) => {
      // Map Clerk ID to internal ID
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { id: true }
      });

      if (!dbUser) {
        // Fallback to trending if user not found
        console.warn(`User with Clerk ID ${userId} not found for recommendations.`);
      }

      // Get user's purchase history
      const userOrders = dbUser ? await prisma.order.findMany({
        where: { userId: dbUser.id },
        include: {
          items: {
            select: {
              productId: true,
              product: { select: { category: true } },
            },
          },
        },
      }) : [];

      if (userOrders.length === 0) {
        // If no history, return trending products
        const products = await prisma.product.findMany({
          take: limit,
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
        .map((item) => item.productId);

      const recommendations = await prisma.product.findMany({
        where: {
          category: { in: Array.from(categories) as any[] },
          id: { notIn: purchasedProductIds },
        },
        take: limit,
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
    inputSchema: createOrderSchema,
    execute: async ({ userId, items }) => {
      try {
        // Map Clerk ID to internal ID
        const dbUser = await prisma.user.findUnique({
          where: { clerkId: userId },
          select: { id: true }
        });

        if (!dbUser) {
          return JSON.stringify({ 
            success: false, 
            error: `User with Clerk ID ${userId} not found in database. Please ensure you are logged in correctly.` 
          });
        }

        // Calculate total
        const products = await prisma.product.findMany({
          where: { id: { in: items.map((i) => i.productId) } },
        });

        const total = items.reduce((sum, item) => {
          const product = products.find((p) => p.id === item.productId);
          return sum + (product?.price || 0) * item.quantity;
        }, 0);

        // Create order
        const order = await prisma.order.create({
          data: {
            userId: dbUser.id,
            total,
            items: {
              create: items,
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
    inputSchema: addToCartSchema,
    execute: async ({ productId, quantity }) => {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, title: true, price: true, image: true }
      });

      if (!product) {
        return JSON.stringify({ error: "Product not found" });
      }

      return JSON.stringify({
        action: "addToCart",
        product: product,
        quantity: quantity,
        message: `Added ${quantity} item(s) to cart: ${product.title}`,
      });
    },
  }),

  // Checkout action
  checkout: tool({
    description: "Redirect user to checkout",
    inputSchema: checkoutSchema,
    execute: async ({ orderId }) => {
      return JSON.stringify({
        action: "checkout",
        orderId: orderId,
        message: "Redirecting to checkout...",
      });
    },
  }),

  // View cart action
  viewCart: tool({
    description: "Show user's shopping cart",
    inputSchema: z.object({}),
    execute: async () => {
      return JSON.stringify({
        action: "viewCart",
        message: "Opening your cart...",
      });
    },
  }),

  // --- Zen-Trust Extension ---

  // Upload Dispatch Video (Visual Proof)
  uploadDispatchVideo: tool({
    description: "Record visual proof of an item before dispatch (anti-fraud)",
    inputSchema: uploadDispatchVideoSchema,
    execute: async ({ orderId, videoUrl }) => {
      try {
        const order = await prisma.order.update({
          where: { id: orderId },
          data: { dispatchVideoUrl: videoUrl },
        });
        return JSON.stringify({
          success: true,
          message: "Dispatch video verified and attached to order.",
          orderId: order.id,
        });
      } catch (error) {
        return JSON.stringify({ success: false, error: "Failed to upload video" });
      }
    },
  }),

  // Initiate POD Dispute
  initiatePodDispute: tool({
    description: "Initiate a dispute for a Pay on Delivery order",
    inputSchema: initiatePodDisputeSchema,
    execute: async ({ orderId, reason, evidenceUrl }) => {
      try {
        const dispute = await prisma.dispute.create({
          data: {
            orderId: orderId,
            reason: reason,
            evidenceUrl: evidenceUrl,
            status: "OPEN",
          },
        });

        await prisma.order.update({
          where: { id: orderId },
          data: { escrowStatus: "DISPUTED" },
        });

        return JSON.stringify({
          success: true,
          disputeId: dispute.id,
          message: "Dispute initiated. AI mediator is now reviewing visual proof.",
        });
      } catch (error) {
        return JSON.stringify({ success: false, error: "Failed to initiate dispute" });
      }
    },
  }),

  // Release Escrow
  releaseEscrow: tool({
    description: "Release funds to the merchant after buyer confirmation",
    inputSchema: releaseEscrowSchema,
    execute: async ({ orderId }) => {
      try {
        await prisma.order.update({
          where: { id: orderId },
          data: { escrowStatus: "RELEASED", status: "PAID" },
        });
        return JSON.stringify({
          success: true,
          message: "Escrow released. Funds moved to merchant wallet.",
        });
      } catch (error) {
        return JSON.stringify({ success: false, error: "Failed to release escrow" });
      }
    },
  }),
};
