import Button from "@mui/material/Button";
import { useCartStore } from "@/Store/cartStore";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { ShoppingBag } from "lucide-react";

type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
};

export default function AddButton({ prod }: { prod: Product }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const router = useRouter();

  // Memoize handler to prevent unnecessary re-renders
  const handleAddToCart = useCallback(() => {
    addToCart({
      id: prod.id,
      title: prod.title,
      price: prod.price,
      image: prod.image,
    });

    console.log("Added to cart:", prod);
    router.push("/cartstore");
  }, [prod, addToCart, router]);

  return (
    <Button
      variant="contained"
      className="bg-green-600 hover:bg-green-700 w-full py-2.5 rounded-full font-bold text-sm shadow-md hover:shadow-green-600/30 transition-all flex items-center gap-2 transform active:scale-95"
      onClick={handleAddToCart}
    >
      <ShoppingBag size={18} /> Add to Cart
    </Button>
  );
}