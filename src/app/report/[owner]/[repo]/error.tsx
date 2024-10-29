'use client'

import { isKnownError } from "@/lib/errors"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const message = isKnownError(error)
        ? error.message
        : "Something went wrong! Please try again later."

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
            </Alert>
            <div className="mt-4 flex justify-center">
                <Button onClick={() => reset()}>
                    Try again
                </Button>
            </div>
        </div>
    )
}
