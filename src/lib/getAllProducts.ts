import { prisma } from "@/lib/prisma";

export async function getAllProducts() {
  try {
    const prismaProducts = await prisma.product.findMany();

    const res = await fetch("https://dummyjson.com/products?limit=100", {
      next: { revalidate: 3600 },
    });
    
    if (!res.ok) {
        return prismaProducts;
    }
    
    const data = await res.json();
    
    const mappedProducts = data.products.map((p: any) => {
      let category = "unclassified";
      const slug = p.category.toLowerCase();
      
      if (slug.includes("shirt") || slug.includes("dress") || slug.includes("tops") || slug.includes("clothing")) {
        category = "cloths";
      } else if (slug.includes("shoes")) {
        category = "footwear";
      } else if (slug.includes("sunglasses")) {
        category = "glass";
      } else if (slug.includes("watch") || slug.includes("bag") || slug.includes("jewellery")) {
        category = "accessories";
      } else if (p.title.toLowerCase().includes("jean") || p.description.toLowerCase().includes("jean")) {
        category = "jean";
      }

      return {
        id: String(p.id),
        title: p.title,
        description: p.description,
        price: p.price,
        image: p.thumbnail,
        category: category,
      };
    });

    // Remove duplicates by ID
    const prismaMap = new Map(prismaProducts.map((p) => [p.id, p]));
    const newItems = mappedProducts.filter((p: any) => !prismaMap.has(p.id));

    return [...prismaProducts, ...newItems];
  } catch (error) {
    console.error("Error fetching all products:", error);
    // Fallback to Prisma only if DummyJSON fails
    return prisma.product.findMany();
  }
}
