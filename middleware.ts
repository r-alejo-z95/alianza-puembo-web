import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: [
    // Excluye /_next, /api, /trpc, /static y /public
    '/((?!.+\.[\w]+$|_next).*)',
    // Incluye /api, /trpc y rutas que no tienen extensión de archivo
    '/(api|trpc)(.*)',
  ],
};