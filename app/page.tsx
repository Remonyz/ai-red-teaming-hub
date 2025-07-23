"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { NavigationTabs } from "@/components/navigation-tabs"
import { PromptsTab } from "@/components/prompts-tab"
import { ProtocolsTab } from "@/components/protocols-tab"
import { TestingDocumentation } from "@/components/testing-documentation"
import { AnalysisTab } from "@/components/analysis-tab"
import { Footer } from "@/components/footer"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("prompts")

  const renderTabContent = () => {
    switch (activeTab) {
      case "prompts":
        return <PromptsTab />
      case "protocols":
        return <ProtocolsTab />
      case "testbed":
        return <TestingDocumentation />
      case "analysis":
        return <AnalysisTab />
      default:
        return <PromptsTab />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container mx-auto px-4 py-8">{renderTabContent()}</main>
      <Footer />
    </div>
  )
}
