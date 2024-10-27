"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="flex justify-between items-center p-4 bg-background">
            <div className="text-2xl font-bold">BusFactor</div>
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
