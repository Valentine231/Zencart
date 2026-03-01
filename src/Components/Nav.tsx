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
    <nav className="bg-gray-950 text-white px-3 sm:px-6 py-3 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto">
        {/* Desktop/Tablet Layout */}
        <div className="hidden sm:flex sm:items-center sm:justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <div className="w-24 sm:w-28 md:w-32">
              <Logo />
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex gap-6 text-sm md:text-base font-medium">
            <Link
              href="/cart"
              className={`transition-colors duration-200 ${
                pathname === "/cart"
                  ? "text-white underline"
                  : "text-indigo-400 hover:text-white"
              }`}
            >
              Products
            </Link>

            <Link
              href="/order"
              className={`transition-colors duration-200 ${
                pathname === "/order"
                  ? "text-white underline"
                  : "text-indigo-400 hover:text-white"
              }`}
            >
              History
            </Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal" />
            </SignedOut>

            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="sm:hidden flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <div className="w-20">
              <Logo />
            </div>
          </Link>

          {/* Mobile Menu Button + Auth */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-800 transition"
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

            <SignedOut>
              <SignInButton mode="modal" />
            </SignedOut>

            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-4 pb-4 border-t border-gray-700 pt-4">
            <div className="flex flex-col gap-3">
              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded transition-colors duration-200 ${
                  pathname === "/cart"
                    ? "bg-indigo-600 text-white"
                    : "text-indigo-400 hover:bg-gray-800"
                }`}
              >
                Products
              </Link>

              <Link
                href="/order"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded transition-colors duration-200 ${
                  pathname === "/order"
                    ? "bg-indigo-600 text-white"
                    : "text-indigo-400 hover:bg-gray-800"
                }`}
              >
                History
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};