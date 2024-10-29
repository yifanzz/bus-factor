"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

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
                    <Button onClick={() => signIn("github")} variant="outline">
                        <GitHubLogoIcon className="mr-2 h-4 w-4" />
                        Sign In
                    </Button>
                )}
            </div>
        </nav>
    );
}
