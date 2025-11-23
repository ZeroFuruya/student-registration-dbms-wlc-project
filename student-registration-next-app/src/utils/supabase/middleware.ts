import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    return await updateSession(request)
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value }) => supabaseResponse.cookies.set(name, value))
                },
            },
        }
    )

    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
    const pathname = request.nextUrl.pathname

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/auth', '/register', '/unauthorized']
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    // Get admin status
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || []
    const isAdmin = user && adminEmails.includes(user.email || "")

    // Redirect logged-in users away from home page
    if (user && pathname === '/') {
        const url = request.nextUrl.clone()
        url.pathname = isAdmin ? '/admin/dashboard' : '/student/dashboard'
        return NextResponse.redirect(url)
    }

    // Redirect unauthenticated users to login (except for public routes and home)
    if (!user && !isPublicRoute && pathname !== '/') {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Protect admin routes
    if (pathname.startsWith("/admin")) {
        if (!user || !adminEmails.includes(user.email || "")) {
            const url = request.nextUrl.clone()
            url.pathname = '/unauthorized'
            return NextResponse.redirect(url)
        }
    }

    // Prevent admins from accessing student routes
    if (pathname.startsWith("/student")) {
        if (isAdmin) {
            const url = request.nextUrl.clone()
            url.pathname = '/admin/dashboard'
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}