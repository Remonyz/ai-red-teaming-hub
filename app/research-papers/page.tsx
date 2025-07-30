import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UnderConstructionBanner } from "@/components/under-construction-banner"

export default function ResearchPapersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <UnderConstructionBanner />
        <h1 className="text-2xl font-semibold mb-4">Research Papers</h1>
        <p className="text-gray-700">Bibliography of all referenced papers and datasets.</p>
      </main>
      <Footer />
    </div>
  )
}