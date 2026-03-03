import { type NextRequest, NextResponse } from 'next/server';

const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie =
    request.cookies.get('better-auth.session_token') ??
    request.cookies.get('__Secure-better-auth.session_token');

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // No session cookie → redirect to login (unless already on an auth route)
  if (!sessionCookie && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Has session cookie + on auth route → redirect to dashboard
  if (sessionCookie && isAuthRoute) {
    return NextResponse.redirect(new URL('/up-next', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
