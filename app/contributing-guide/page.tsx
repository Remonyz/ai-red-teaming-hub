"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ContributionsTab } from "@/components/contributions-tab"

export default function ContributingGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Contributing Guide</h1>
        <ContributionsTab />
      </main>
      <Footer />
    </div>
  )
}