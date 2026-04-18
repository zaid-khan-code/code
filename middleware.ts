import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const AUTH_ROUTES = ["/login", "/signup"];
const APP_ROUTES = [
  "/dashboard",
  "/explore",
  "/requests",
  "/messages",
  "/leaderboard",
  "/notifications",
  "/profile",
  "/ai",
];

function isRouteMatch(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const pathname = request.nextUrl.pathname;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile:
    | {
        role: "admin" | "user";
        onboarded: boolean;
      }
    | null
    | undefined;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("role, onboarded")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  if (AUTH_ROUTES.includes(pathname)) {
    if (!user) return response;

    if (profile?.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.redirect(
      new URL(profile?.onboarded ? "/dashboard" : "/onboarding", request.url)
    );
  }

  const requiresAuth =
    pathname === "/onboarding" ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    isRouteMatch(pathname, APP_ROUTES);

  if (requiresAuth && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!user || !profile) {
    return response;
  }

  if (pathname === "/onboarding" && profile.role === "admin") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if ((pathname === "/onboarding" || pathname.startsWith("/onboarding/")) && profile.onboarded && profile.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if ((pathname === "/admin" || pathname.startsWith("/admin/")) && profile.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    profile.role !== "admin" &&
    !profile.onboarded &&
    isRouteMatch(pathname, APP_ROUTES)
  ) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/onboarding/:path*",
    "/dashboard/:path*",
    "/explore/:path*",
    "/requests/:path*",
    "/messages/:path*",
    "/leaderboard/:path*",
    "/notifications/:path*",
    "/profile/:path*",
    "/ai/:path*",
    "/admin/:path*",
  ],
};
