"use client"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalyzeForm } from "@/components/analyze-form"

export async function BusFactor() {
  const session = await getServerSession(authOptions)

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">BusFactor</h1>
      {session?.user ? (
        <AnalyzeForm />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Sign in to analyze repositories</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please sign in with your GitHub account to use BusFactor.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
