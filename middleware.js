import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { session } } = await supabase.auth.getSession()
  const path = req.nextUrl.pathname
  const protectedPaths = ['/admin', '/profile', '/post']
  const isProtected = protectedPaths.some((p) => path.startsWith(p))

  if (isProtected && !session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/'
    redirectUrl.searchParams.set('login_required', '1')
    return NextResponse.redirect(redirectUrl)
  }

  if (path.startsWith('/admin') && session) {
    const { data: profile } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (!profile?.is_admin) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/'
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*', '/post/:path*'],
}
