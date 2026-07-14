import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPrefixes = ['/employee', '/manager', '/senior-manager', '/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  // Access token is in localStorage (client-only); middleware handles auth path redirects
  // when a session hint cookie is present (set client-side on login).
  const sessionHint = request.cookies.get('expenseflow_session')?.value;

  if (isProtected && !sessionHint) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/employee/:path*', '/manager/:path*', '/senior-manager/:path*', '/admin/:path*'],
};
