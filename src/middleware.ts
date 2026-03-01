// middleware.ts (or src/middleware.ts)
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/order(.*)",
  "/api/orders(.*)",
  "/cart(.*)",

]);

export default clerkMiddleware(async (auth, req) => {
   if (isProtectedRoute(req)) {
    await auth.protect(); 
   }
});


export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|css|js)).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};