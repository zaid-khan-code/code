import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { ROLE_ROUTES, type Role } from '@/lib/auth/roles';

async function getRole(supabase: ReturnType<typeof createServerClient>, userId: string): Promise<Role | null> {
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  return (data?.role as Role) ?? null;
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // Auth pages: redirect authed users to their dashboard
  if (path === '/login' || path === '/signup') {
    if (user) {
      const role = await getRole(supabase, user.id);
      const dest = role ? ROLE_ROUTES[role] : '/user';
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return supabaseResponse;
  }

  // Protected dashboard routes
  const dashboardRoutes = Object.values(ROLE_ROUTES);
  const matchedBase = dashboardRoutes.find((r) => path.startsWith(r));

  if (matchedBase) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const role = await getRole(supabase, user.id);
    const expectedPath = role ? ROLE_ROUTES[role] : '/user';
    if (!path.startsWith(expectedPath)) {
      return NextResponse.redirect(new URL(expectedPath, request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*', '/login', '/signup'],
};
