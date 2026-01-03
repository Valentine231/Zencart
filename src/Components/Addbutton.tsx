import Button from "@mui/material/Button";
import { useCartStore } from "@/Store/cartStore";
import { useRouter } from "next/navigation";


type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
};

export default function AddButton({ prod }: { prod: Product }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const router = useRouter();
  

   const handleAddToCart = () => {
    addToCart({
      id: prod.id,
      title: prod.title,
      price: prod.price,
      image: prod.image,
    });

    console.log("Added to cart:", prod);

    router.push("/cartstore"); // ✅ navigate AFTER click
  };

  return (
    <Button
      variant="contained"
      color="primary"
      className="bg-indigo-600 hover:bg-indigo-700"
      onClick={handleAddToCart}
    >
      Add to Cart
    </Button>
    
  );
}