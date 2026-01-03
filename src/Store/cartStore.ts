import { create } from "zustand";
import { persist } from "zustand/middleware";


type CartItem = {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
};

type CartStore = {
  items: CartItem[];

  addToCart: (product: Omit<CartItem, "quantity">) => void;
  increaseQty: (id: string) => void;
  decreaseQty: (id: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],

      addToCart: (product) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === product.id);

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === product.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          
          }

          return {
            items: [...state.items, { ...product, quantity: 1 }],
          };
        }),

      increaseQty: (id) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        })),

      decreaseQty: (id) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.id === id ? { ...i, quantity: i.quantity - 1 } : i
            )
            .filter((i) => i.quantity > 0),
        })),

      removeFromCart: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage", // 👈 localStorage key
    }
  )
);
