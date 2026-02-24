"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SignInButton,
  UserButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import Logo from "./Logo";

export const Nav = () => {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-950 text-white px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        {/* Logo */}
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center"
          >
            <div className="w-28 sm:w-32 md:w-36">
              <Logo />
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-6 text-sm sm:text-base font-medium">
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
        <div className="flex justify-center sm:justify-end">
          <SignedOut>
            <SignInButton mode="modal" />
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
};