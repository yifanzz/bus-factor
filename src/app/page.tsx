import { AnalyzeForm } from '@/components/analyze-form'
import { RecentRepos } from '@/components/recent-repos'
import { Suspense } from 'react'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">BusFactor</h1>
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
