import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { use } from 'react'

export async function createClient() {
    const cookieStore = await cookies()

    const client = createServerClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value }) => cookieStore.set(name, value))
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
    return client;
}

export async function getUser() {
    const { auth } = await createClient()

    const userObject = await auth.getUser()

    if (userObject.error || !userObject.data.user) {
        console.log(userObject.error)
        return null
    }

    return userObject.data.user
}