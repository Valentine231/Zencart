import { product } from "@/productType"
import axios from "axios";



export const getHomeProducts = async (): Promise<product[]> => {
  try {
    const res = await axios.get<product[]>("https://fakestoreapi.com/products",{timeout: 10000});
     return res.data as product[];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}