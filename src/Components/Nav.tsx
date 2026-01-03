"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton,UserButton,SignedIn,SignedOut } from "@clerk/nextjs";
import Logo from "./Logo";



export const Nav = () => {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-950  flex flex-row justify-between items-center gap-4 p-4 ">
      <div>
          
          
           <Link 
      href="/"
      className={pathname === "/" ? "font-bold underline" : "text-indigo-600"}
      ><Logo /></Link>
          
     
      </div>

      <div>
         <Link 
      href="/cart"
      className={pathname === "/productlist" ? "font-bold underline" : "text-indigo-600"}
      >product</Link>
      </div>
    
    <div>
   <SignedOut>
           <SignInButton mode="modal"/>
      </SignedOut>
     <SignedIn>
     <UserButton/>
     </SignedIn>
    </div>
     
     
       
    </nav>
  )}