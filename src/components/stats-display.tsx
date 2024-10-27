import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Stats {
    busFactor: number
    contributors: number
    commits: number
    issues: number
}

interface StatsDisplayProps {
    stats: Stats
}

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

    return (
        <div className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-500 to-indigo-500">
                <CardHeader>
                    <CardTitle className="text-white text-center">Bus Factor</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-6xl font-bold text-white text-center">{stats.busFactor}/10</p>
                </CardContent>
            </Card>

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
                        <CardTitle className="text-lg">Open Issues</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-between items-center">
                        <span className="text-2xl font-semibold">{stats.issues}</span>
                        <Trendline trend="down" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
