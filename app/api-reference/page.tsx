import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UnderConstructionBanner } from "@/components/under-construction-banner"

export default function APIReferencePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <UnderConstructionBanner />
        <h1 className="text-2xl font-semibold mb-4">API Reference</h1>
        <p className="text-gray-700">API endpoints and usage examples.</p>
      </main>
      <Footer />
    </div>
  )
}