import { product } from "@/productType";

export const getHomeProducts = async (): Promise<product[]> => {
  try {
    // Replaced axios with native fetch to avoid hanging in Next.js Server Components
    const res = await fetch("https://fakestoreapi.com/products", {
      next: { revalidate: 3600 },
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
    }

    return (await res.json()) as product[];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};
