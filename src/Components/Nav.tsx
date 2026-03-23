"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  SignInButton,
  UserButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import Logo from "./Logo";

export const Nav = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-950/95 backdrop-blur-md border-b border-gray-800 text-white sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header Row */}
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 group">
            <div className="w-24 sm:w-28 md:w-32 transition-transform duration-300 group-hover:scale-105">
              <Logo />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden sm:flex items-center gap-8 text-sm md:text-base font-semibold tracking-wide">
            <Link
              href="/cartstore"
              className={`relative group py-2 transition-colors duration-300 ${
                pathname === "/cartstore"
                  ? "text-white"
                  : "text-indigo-400 hover:text-emerald-400"
              }`}
            >
              Cart Store
              <span className={`absolute bottom-0 left-0 w-full h-[2px] rounded-full transition-transform duration-300 origin-left ${
                pathname === "/cartstore"
                  ? "bg-white scale-x-100"
                  : "bg-emerald-400 scale-x-0 group-hover:scale-x-100"
              }`} />
            </Link>

            <Link
              href="/cart"
              className={`relative group py-2 transition-colors duration-300 ${
                pathname === "/cart"
                  ? "text-white"
                  : "text-indigo-400 hover:text-emerald-400"
              }`}
            >
              Products
              <span className={`absolute bottom-0 left-0 w-full h-[2px] rounded-full transition-transform duration-300 origin-left ${
                pathname === "/cart"
                  ? "bg-white scale-x-100"
                  : "bg-emerald-400 scale-x-0 group-hover:scale-x-100"
              }`} />
            </Link>

            <Link
              href="/order"
              className={`relative group py-2 transition-colors duration-300 ${
                pathname === "/order"
                  ? "text-white"
                  : "text-indigo-400 hover:text-emerald-400"
              }`}
            >
              History
              <span className={`absolute bottom-0 left-0 w-full h-[2px] rounded-full transition-transform duration-300 origin-left ${
                pathname === "/order"
                  ? "bg-white scale-x-100"
                  : "bg-emerald-400 scale-x-0 group-hover:scale-x-100"
              }`} />
            </Link>
          </div>

          {/* Auth Section & Mobile Toggle */}
          <div className="flex items-center gap-3 sm:gap-4">
            <SignedOut>
              <div className="hover:scale-105 transition-transform duration-200">
                <SignInButton mode="modal" />
              </div>
            </SignedOut>

            <SignedIn>
              <div className="hover:scale-105 transition-transform duration-200 rounded-full ring-2 ring-transparent hover:ring-emerald-400">
                <UserButton />
              </div>
            </SignedIn>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg text-indigo-400 hover:text-emerald-400 hover:bg-gray-800/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div 
        className={`sm:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          mobileMenuOpen ? "max-h-48 opacity-100 border-t border-gray-800" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-4 space-y-2 bg-gray-950/50 backdrop-blur-lg">
          <Link
            href="/cartstore"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
              pathname === "/cartstore"
                ? "bg-indigo-600/20 text-white border border-indigo-500/30"
                : "text-indigo-400 hover:bg-gray-800/80 hover:text-emerald-400 hover:shadow-sm hover:-translate-y-0.5"
            }`}
          >
            Cart Store
          </Link>

          <Link
            href="/cart"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
              pathname === "/cart"
                ? "bg-indigo-600/20 text-white border border-indigo-500/30"
                : "text-indigo-400 hover:bg-gray-800/80 hover:text-emerald-400 hover:shadow-sm hover:-translate-y-0.5"
            }`}
          >
            Products
          </Link>

          <Link
            href="/order"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
              pathname === "/order"
                ? "bg-indigo-600/20 text-white border border-indigo-500/30"
                : "text-indigo-400 hover:bg-gray-800/80 hover:text-emerald-400 hover:shadow-sm hover:-translate-y-0.5"
            }`}
          >
            History
          </Link>
        </div>
      </div>
    </nav>
  );
};