"use client";

import { useProductStore } from "@/Store/productStore";
import { Search, X } from "lucide-react";

export default function SearchBar() {
  const searchQuery = useProductStore((state) => state.searchQuery);
  const setSearchQuery = useProductStore((state) => state.setSearchQuery);

  return (
    <div className="relative w-full mb-8 group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors duration-200" />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search products..."
        className="block w-full pl-11 pr-12 py-3.5 bg-white border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 shadow-sm hover:shadow-md hover:border-gray-200"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery("")}
          className="absolute inset-y-0 right-0 pr-4 flex items-center"
        >
          <X className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors duration-200" />
        </button>
      )}
    </div>
  );
}
