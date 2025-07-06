import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Documentation</h1>
        <p className="text-gray-700">Comprehensive user guide and technical documentation.</p>
      </main>
      <Footer />
    </div>
  )
}