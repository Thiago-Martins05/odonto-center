import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "admin";

  // Proteger rotas admin
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!isLoggedIn || !isAdmin) {
      return Response.redirect(new URL("/login", req.nextUrl));
    }

  }
});

export const config = {
  matcher: ["/admin/:path*"],
};

