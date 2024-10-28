import { AnalyzeForm } from '@/components/analyze-form'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">BusFactor</h1>
        <AnalyzeForm />
      </div>
    </main>
  )
}
