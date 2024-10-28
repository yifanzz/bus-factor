'use client'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <div className="container mx-auto p-4 max-w-2xl text-center">
            <h2 className="text-xl font-bold mb-4">Something went wrong!</h2>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <button
                onClick={() => reset()}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
            >
                Try again
            </button>
        </div>
    )
}
