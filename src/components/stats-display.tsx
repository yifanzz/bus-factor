import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Suspense } from "react"
import { ContributorChart } from "@/components/charts/contributor-chart"


interface ContributorShare {
    name: string
    percentage: number
}

interface Stats {
    busFactor: number
    contributors: number
    commits: number
    openIssues: number
    closedIssues: number
    contributorShares: ContributorShare[]
    analyzedMonths: number
}

interface StatsDisplayProps {
    stats: Stats
}

// Define colors for the pie chart
const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))']

// Add color constants for the traffic light system
const BUS_FACTOR_COLORS = {
    red: "from-red-500 to-red-600",
    amber: "from-amber-500 to-amber-600",
    green: "from-green-500 to-green-600"
} as const

export function StatsDisplay({ stats }: StatsDisplayProps) {
    const Trendline = ({ trend }: { trend: "up" | "down" | "stable" }) => {
        const d = trend === "up" ? "M0 10 L10 0 L20 5" :
            trend === "down" ? "M0 0 L10 10 L20 5" :
                "M0 5 L20 5"
        const stroke = trend === "up" ? "stroke-green-500" :
            trend === "down" ? "stroke-red-500" :
                "stroke-yellow-500"
        return (
            <svg className="w-20 h-10">
                <path d={d} className={`${stroke} fill-none stroke-2`} />
            </svg>
        )
    }

    // Helper function to determine background color class
    function getBusFactorColor(factor: number) {
        if (factor === 1) return BUS_FACTOR_COLORS.red
        if (factor >= 2 && factor <= 3) return BUS_FACTOR_COLORS.amber
        return BUS_FACTOR_COLORS.green
    }

    // Helper function to calculate progress percentage (1-10 scale)
    function getProgressPercentage(factor: number) {
        return Math.min((factor / 10) * 100, 100)
    }

    const pieData = stats.contributorShares.map(share => ({
        name: share.name,
        value: share.percentage
    }))

    return (
        <div className="space-y-6">
            {/* Analysis Period Notice */}
            <p className="text-sm text-muted-foreground text-center">
                This analysis is based on repository activity in the last {stats.analyzedMonths} months
            </p>

            {/* Bus Factor Card */}
            <Card className={`bg-gradient-to-br ${getBusFactorColor(stats.busFactor)}`}>
                <CardHeader>
                    <CardTitle className="text-white text-center">Bus Factor</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-6xl font-bold text-white text-center">{stats.busFactor}</p>
                </CardContent>
            </Card>

            {/* Scale indicator below the card */}
            <div className="space-y-1">
                {/* Arrow indicator */}
                <div className="relative h-3">
                    <div
                        className="absolute w-0 h-0 
                            border-l-[8px] border-l-transparent 
                            border-r-[8px] border-r-transparent 
                            border-t-[8px] border-t-slate-900 dark:border-t-slate-100"
                        style={{
                            left: `${getProgressPercentage(stats.busFactor)}%`,
                            transform: 'translateX(-50%)'
                        }}
                    />
                </div>

                {/* Progress bar */}
                <div className="relative h-3 rounded-full overflow-hidden">
                    <div className="absolute inset-0 flex">
                        <div className="h-full bg-red-500 relative" style={{ width: '10%' }} />
                        <div className="h-full bg-amber-500 relative" style={{ width: '20%' }} />
                        <div className="h-full bg-green-500 relative" style={{ width: '70%' }} />
                    </div>
                </div>

                {/* Scale labels */}
                <div className="relative flex justify-between text-xs text-muted-foreground px-0.5">
                    <span>0</span>
                    <span style={{ position: 'absolute', left: '10%', transform: 'translateX(-50%)' }}>1</span>
                    <span style={{ position: 'absolute', left: '30%', transform: 'translateX(-50%)' }}>3</span>
                    <span>10</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Contributors</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-between items-center">
                        <span className="text-2xl font-semibold">{stats.contributors}</span>
                        <Trendline trend="up" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Commits</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-between items-center">
                        <span className="text-2xl font-semibold">{stats.commits}</span>
                        <Trendline trend="stable" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Issues</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-2xl font-semibold">
                                {stats.openIssues}/{stats.closedIssues}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Open/Closed
                            </span>
                        </div>
                        <Trendline
                            trend={stats.openIssues > stats.closedIssues ? "up" : "down"}
                        />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Contributor Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<div className="h-[300px] animate-pulse bg-muted" />}>
                        <ContributorChart data={stats.contributorShares} />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}
