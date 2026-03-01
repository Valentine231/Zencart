"use client";

import { useCartStore } from "@/Store/cartStore";
import Button from "@mui/material/Button";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useUser } from "@clerk/nextjs";
import axios from "axios";


export default function OrderButton() {
  const cartitems = useCartStore((state) => state.items);
  const { user } = useUser();

  const handleOrder = async () => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    if (cartitems.length === 0) return;

    try {
      const totalAmount = cartitems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      const res = await axios.post("/api/monnifycheckout", {
        email: user.primaryEmailAddress?.emailAddress,
        amount: totalAmount,
      }, { withCredentials: true });

      console.log("Payment initialization response:", res.data);
    

      if (res.status === 200 && res.data.paymentUrl) {
        // Redirect to Paystack checkout
        
        window.location.href = res.data.paymentUrl;
      }
    } catch (error: any) {
      console.error(
        "Error during payment initiation:",
        error.response?.data || error.message
      );
    }
    
  };

  return (
    <Button
      variant="contained"
      startIcon={<ShoppingCartIcon />}
      onClick={handleOrder}
      disabled={cartitems.length === 0}
    >
      Place Order
    </Button>
  );
}







// import { useCartStore } from "@/Store/cartStore";
// import Button from "@mui/material/Button";
// import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
// // import { useRouter } from "next/navigation";
// import { useUser } from "@clerk/nextjs";
// import axios from "axios";

// export default function OrderButton() {
//   const cartitems = useCartStore((state) => state.items);
//   const clearCart = useCartStore((state) => state.clearCart);
//   // const router = useRouter();
//   const { user } = useUser();

//   const handleOrder = async () => {

//     if (!user) {
//       console.error("User not authenticated");
//       return;
//     }
//     try{
//    const res = await axios.post('/api/monnifycheckout', {
//       email: user.primaryEmailAddress?.emailAddress,
//       amount: cartitems.reduce((total, item) => total + item.price * item.quantity, 0),
//       total: cartitems.reduce((total, item) => total + item.price * item.quantity, 0),
//       userId: user.id,
//     });
    
//     console.log("intiating payment Reponse:", res);
    
//      const data = res.data;
    
//     if (res.status === 200) {
//       clearCart();
//       window.location.href = data.paymentUrl;
//     }
    
//   } catch (error) {
//     console.error("Error during payment initiation:", error);
//   }
//   };

//   return (
//     <Button
//       variant="contained"
//       startIcon={<ShoppingCartIcon />}
//       onClick={handleOrder}
//       disabled={cartitems.length === 0}
//     >
//         Place Order
//       </Button>
//     );
//   }
