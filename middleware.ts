import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // This function runs after authentication is verified
    // You can add additional logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Only allow access if user has admin role
        return token?.role === "admin";
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
