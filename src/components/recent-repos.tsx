import { getRecentRepos } from "@/app/actions/get-recent-repos"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { StarIcon } from "@radix-ui/react-icons"
import { formatDistanceToNow } from "date-fns"

// Add color constants for the traffic light system
const BUS_FACTOR_COLORS = {
    red: "bg-gradient-to-br from-red-500 to-red-600",
    amber: "bg-gradient-to-br from-amber-500 to-amber-600",
    green: "bg-gradient-to-br from-green-500 to-green-600"
} as const

function getBusFactorColor(factor: number) {
    if (factor === 1) return BUS_FACTOR_COLORS.red
    if (factor >= 2 && factor <= 3) return BUS_FACTOR_COLORS.amber
    return BUS_FACTOR_COLORS.green
}

export async function RecentRepos() {
    const recentRepos = await getRecentRepos()

    if (recentRepos.length === 0) {
        return null
    }

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Recently Analyzed Repositories</h2>
            <div className="grid gap-2">
                {recentRepos.map(({ repoName, stats, calculatedAt }) => (
                    <Link
                        key={repoName}
                        href={`/report/${repoName}`}
                        className="block transition-transform hover:scale-[1.02]"
                    >
                        <Card className="p-4 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="font-medium">{repoName}</span>
                                <span className="text-sm text-muted-foreground">
                                    updated {calculatedAt && formatDistanceToNow(calculatedAt, { addSuffix: true })}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    <StarIcon className="h-4 w-4" />
                                    <span>{stats.stars}</span>
                                </div>
                                <div className={`${getBusFactorColor(stats.busFactor)} text-white font-bold px-4 py-2 rounded-md`}>
                                    {stats.busFactor}
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
