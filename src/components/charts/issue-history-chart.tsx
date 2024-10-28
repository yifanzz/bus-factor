"use client"

import { IssueTimeSeries } from "@/types/repo"
import { LineChart, Line, XAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface IssueHistoryChartProps {
    data: IssueTimeSeries
}

export function IssueHistoryChart({ data }: IssueHistoryChartProps) {
    // Combine and sort all dates to get the full range
    const allDates = [...new Set([
        ...data.openIssues.map(d => d.date),
        ...data.closedIssues.map(d => d.date)
    ])].sort()

    // Create combined dataset with both open and closed issues
    const chartData = allDates.map(date => ({
        date,
        open: data.openIssues.find(d => d.date === date)?.value || 0,
        closed: data.closedIssues.find(d => d.date === date)?.value || 0
    }))

    return (
        <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="date"
                    tickFormatter={(value) => value.split('-')[1]} // Show only week number
                />
                {/* <YAxis /> */}
                <Tooltip
                    formatter={(value: number, name: string) => [value, name === 'open' ? 'Open Issues' : 'Closed Issues']}
                    labelFormatter={(label) => `Week ${label.split('-')[1]}`}
                />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="open"
                    stroke="hsl(var(--destructive))"
                    name="Open Issues"
                />
                <Line
                    type="monotone"
                    dataKey="closed"
                    stroke="hsl(var(--primary))"
                    name="Closed Issues"
                />
            </LineChart>
        </ResponsiveContainer>
    )
}
