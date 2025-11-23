import { getUser } from "@/auth/server";

export async function requireAdmin() {
    const user = await getUser();

    if (!user) {
        throw new Error("AUTH:NOT_LOGGED_IN");
    }

    const adminEmails = process.env.ADMIN_EMAILS
        ? process.env.ADMIN_EMAILS.split(",").map(e => e.trim())
        : [];

    if (!adminEmails.includes(user.email)) {
        throw new Error("AUTH:NOT_ADMIN");
    }

    return user; // return in case you need user data
}
