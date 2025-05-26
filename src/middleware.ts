import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/home', '/shared', '/trash', '/starred', '/file']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  const isProtected = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  if (isProtected && !token) {
    const signInUrl = new URL('/sign-in', request.url)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/home/:path*', '/shared/:path*', '/starred/:path*', '/trash/:path*', '/file/:path*'],
}