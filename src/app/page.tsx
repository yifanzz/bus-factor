import { AnalyzeForm } from '@/components/analyze-form'
import { RecentRepos } from '@/components/recent-repos'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoCircledIcon } from "@radix-ui/react-icons"
import { CONTENT } from "@/lib/content"
import { Suspense } from 'react'

export const revalidate = 300 // 5 minutes in seconds

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">BusFactor</h1>

        {/* Bus Factor Explanation */}
        <Alert className="mb-6">
          <InfoCircledIcon className="h-4 w-4" />
          <AlertDescription>{CONTENT.BUS_FACTOR.DESCRIPTION}</AlertDescription>
        </Alert>

        <AnalyzeForm />
        <div className="mt-8">
          <Suspense fallback={<div className="animate-pulse space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>}>
            <RecentRepos />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
