import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { getRepoStats } from "@/lib/github"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user || !session.githubAccessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { repoName } = await req.json()
        const stats = await getRepoStats(repoName, session.githubAccessToken)
        return NextResponse.json(stats)
    } catch (error) {
        console.error('Error analyzing repository:', error)
        return NextResponse.json(
            { error: "Failed to analyze repository" },
            { status: 500 }
        )
    }
}
