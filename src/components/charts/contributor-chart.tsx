"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import type { ContributorShare } from "@/types/repo"

interface ContributorChartProps {
    data: ContributorShare[]
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))']

export function ContributorChart({ data }: ContributorChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    nameKey="name"
                    dataKey="percentage"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, commits, percentage }) => `${name} (${commits})`}
                >
                    {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    )
}
