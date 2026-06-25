import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;
    const role = token?.role;

    // The leaderboard is shared by both roles.
    const isSharedLeaderboard = pathname.startsWith("/dashboard/leaderboard");

    // Staff trying to use student area → send to staff dashboard, and vice versa.
    if (pathname.startsWith("/dashboard") && role === "STAFF" && !isSharedLeaderboard) {
      return NextResponse.redirect(new URL("/staff", req.url));
    }
    if (pathname.startsWith("/staff") && role === "STUDENT") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/staff/:path*"],
};
