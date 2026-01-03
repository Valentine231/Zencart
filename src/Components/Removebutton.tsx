import Button from "@mui/material/Button";
import { useCartStore } from "@/Store/cartStore";

type Product = {
  id: string;
 
};

export default function RemoveButton({ prod }: { prod: Product }) {
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  return (
    <Button
      variant="outlined"
      color="secondary"
      className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
      onClick={() => removeFromCart(prod.id)}
    >
      Remove
    </Button>
  );
}