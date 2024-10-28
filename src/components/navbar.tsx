"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="flex justify-between items-center p-4 bg-background">
            <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
                BusFactor
            </Link>
            <div>
                {session ? (
                    <Button onClick={() => signOut()}>Sign Out</Button>
                ) : (
                    <Button onClick={() => signIn("github")}>Sign In with GitHub</Button>
                )}
            </div>
        </nav>
    );
}
