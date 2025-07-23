"use client"

interface NavigationTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  const tabs = [
    { id: "prompts", label: "Red Team Prompts" },
    { id: "protocols", label: "Evaluation Protocols" },
    { id: "testbed", label: "Testing Guide" },
    { id: "analysis", label: "Coverage Analysis" },
  ]

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-california-gold text-berkeley-blue"
                  : "border-transparent text-gray-500 hover:text-berkeley-blue"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
