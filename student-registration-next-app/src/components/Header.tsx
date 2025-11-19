import Link from "next/link"
import Image from "next/image"
import { shadow } from "@/styles/utils"
import { Button } from "@/components/ui/button"
import { DarkModeToggle } from "./DarkModeToggle"
import LogOutButton from "./LogOutButton"
import { getUser } from "@/auth/server"
import { House } from "lucide-react"

async function Header() {
    const user = await getUser(); // Replace with actual user authentication logic

    return (
        <header
            className="relative flex h-28 w-full items-center justify-between bg-popover px-3 shadow-md dark:bg-popover-dark md:px-8 sm:px-6"
            style={{
                boxShadow: shadow
            }}
        >
            <Link href="/" className="flex items-end gap-2">
                <Image src="/wlc.png" alt="Logo" width={100} height={100} priority />
                <h1 className="flex flex-col pb-1 text-2xl font-semibold leading-6">
                    WLC Ormoc <span>Student Registration</span>
                </h1>
            </Link>
            <div className="flex gap-4">
                {user ? (
                    <LogOutButton />
                ) : (
                    <>
                        <Button asChild>
                            <Link href="/login" className="text-sm text-primary hover:underline">
                                Log In
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/" className="text-sm text-primary hover:underline">
                                <House />
                            </Link>
                        </Button>
                    </>
                )}
                <DarkModeToggle />
            </div>
        </header>
    )
}

export default Header