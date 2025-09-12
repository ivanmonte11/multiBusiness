import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Rutas que requieren autenticación
  const protectedRoutes = ['/dashboard', '/:tenant']
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route.replace('/:path*', ''))
  )

  // Rutas de auth (login/register)
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register')

  // Si está en ruta protegida y no tiene token → redirigir a login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si está en ruta de auth y ya tiene token → redirigir al TENANT del usuario
  if (isAuthRoute && token) {
    // ✅ CORRECCIÓN: Redirigir al tenant del usuario en lugar de /dashboard
    if (token.tenant) {
      return NextResponse.redirect(new URL(`/${token.tenant}`, request.url))
    } else {
      // Fallback si no hay tenant
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/:tenant/:path*',
    '/login',
    '/register'
  ]
}