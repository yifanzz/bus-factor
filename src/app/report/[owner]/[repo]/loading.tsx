export default function Loading() {
    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted rounded w-3/4 mx-auto" />
                <div className="h-[400px] bg-muted rounded" />
            </div>
        </div>
    )
}
