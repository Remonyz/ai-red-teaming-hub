"use client"

import { useState, useMemo } from "react"
import { Search, Download, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { promptsData } from "@/lib/data"
import { searchPrompts } from "@/lib/utils/searchUtils"
import { exportPromptsAsJSON, exportPromptsAsCSV, exportPromptsAsPDF } from "@/lib/utils/exportUtils"
import { PromptDetailsModal } from "@/components/modals/PromptDetailsModal"
import { DownloadDropdown } from "@/components/ui/download-dropdown"

export function PromptsTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const [attackType, setAttackType] = useState("all")
  const [modalities, setModalities] = useState<string[]>([])
  const [threatDomain, setThreatDomain] = useState("all")
  const [sortBy, setSortBy] = useState("relevance")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const itemsPerPage = 10

  const filteredPrompts = useMemo(() => {
    let results = promptsData
    
    // Apply enhanced search if search term exists
    if (searchTerm) {
      const searchResults = searchPrompts(promptsData, searchTerm)
      results = searchResults.map(result => result.item)
    }
    
    // Apply other filters
    return results.filter((prompt) => {
      const matchesAttackType = attackType === "all" || prompt.attackType === attackType
      const matchesModality = modalities.length === 0 || modalities.some((mod) => prompt.modalities.includes(mod))
      const matchesThreatDomain = threatDomain === "all" || prompt.threatDomain === threatDomain

      return matchesAttackType && matchesModality && matchesThreatDomain
    })
  }, [searchTerm, attackType, modalities, threatDomain])

  const sortedPrompts = useMemo(() => {
    const sorted = [...filteredPrompts]
    switch (sortBy) {
      case "date":
        return sorted.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
      case "success-rate":
        return sorted.sort((a, b) => b.successRate - a.successRate)
      case "complexity":
        return sorted.sort((a, b) => b.complexity - a.complexity)
      default:
        return sorted
    }
  }, [filteredPrompts, sortBy])

  const paginatedPrompts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedPrompts.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedPrompts, currentPage])

  const totalPages = Math.ceil(sortedPrompts.length / itemsPerPage)

  const handleModalityChange = (modality: string, checked: boolean) => {
    if (checked) {
      setModalities([...modalities, modality])
    } else {
      setModalities(modalities.filter((m) => m !== modality))
    }
  }

  const handleViewDetails = (prompt: any) => {
    setSelectedPrompt(prompt)
    setIsModalOpen(true)
  }

  const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
    setIsExporting(true)
    try {
      const dataToExport = filteredPrompts.map(prompt => ({
        id: prompt.id,
        title: prompt.title,
        description: prompt.description,
        attackType: prompt.attackType,
        modalities: prompt.modalities,
        targetModel: prompt.targetModel,
        successRate: prompt.successRate,
        complexity: prompt.complexity,
        source: prompt.source,
        sourceUrl: prompt.sourceUrl,
        threatDomain: prompt.threatDomain,
        dateAdded: prompt.dateAdded,
        content: prompt.content
      }))

      switch (format) {
        case 'json':
          exportPromptsAsJSON(dataToExport)
          break
        case 'csv':
          exportPromptsAsCSV(dataToExport)
          break
        case 'pdf':
          exportPromptsAsPDF(dataToExport)
          break
      }
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 70) return "text-red-600"
    if (rate >= 40) return "text-yellow-600"
    return "text-green-600"
  }

  const getAttackTypeBadgeColor = (type: string) => {
    switch (type) {
      case "jailbreak":
        return "bg-red-100 text-red-800"
      case "prompt-injection":
        return "bg-orange-100 text-orange-800"
      case "bias-exploit":
        return "bg-yellow-100 text-yellow-800"
      case "harmful-content":
        return "bg-purple-100 text-purple-800"
      case "backdoor":
        return "bg-cyan-100 text-cyan-800"
      case "multimodal-jailbreak":
        return "bg-indigo-100 text-indigo-800"
      case "misinformation":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Filters Sidebar */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Filter Prompts</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search prompts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Attack Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Attack Type</label>
              <Select value={attackType} onValueChange={setAttackType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="jailbreak">Jailbreaks</SelectItem>
                  <SelectItem value="prompt-injection">Prompt Injection</SelectItem>
                  <SelectItem value="bias-exploit">Bias Exploits</SelectItem>
                  <SelectItem value="harmful-content">Harmful Content</SelectItem>
                  <SelectItem value="misinformation">Misinformation</SelectItem>
                  <SelectItem value="backdoor">Backdoor Attacks</SelectItem>
                  <SelectItem value="multimodal-jailbreak">Multimodal Jailbreaks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Modality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Modality</label>
              <div className="space-y-2">
                {["text", "code", "image", "audio"].map((modality) => (
                  <div key={modality} className="flex items-center space-x-2">
                    <Checkbox
                      id={modality}
                      checked={modalities.includes(modality)}
                      onCheckedChange={(checked) => handleModalityChange(modality, checked as boolean)}
                    />
                    <label htmlFor={modality} className="text-sm capitalize">
                      {modality}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Threat Domain */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Threat Domain</label>
              <Select value={threatDomain} onValueChange={setThreatDomain}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                  <SelectItem value="cbrn">CBRN</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Export Options */}
            <div className="pt-4 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-2">Export Data</label>
              <DownloadDropdown
                onExport={handleExport}
                isLoading={isExporting}
                itemCount={filteredPrompts.length}
                size="sm"
                variant="outline"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Area */}
      <div className="lg:col-span-3">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Red Team Prompts ({sortedPrompts.length} results)</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="date">Date Added</SelectItem>
                <SelectItem value="success-rate">Success Rate</SelectItem>
                <SelectItem value="complexity">Complexity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Prompt Cards */}
        <div className="space-y-4">
          {paginatedPrompts.map((prompt) => (
            <Card key={prompt.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getAttackTypeBadgeColor(prompt.attackType)}>
                      {prompt.attackType.replace("-", " ")}
                    </Badge>
                    {prompt.modalities.map((modality) => (
                      <Badge key={modality} variant="secondary">
                        {modality}
                      </Badge>
                    ))}
                    <Badge variant="outline">{prompt.targetModel}</Badge>
                  </div>
                  <div className="text-sm text-gray-500">ID: {prompt.id}</div>
                </div>

                <h3 className="text-lg font-medium mb-2">{prompt.title}</h3>
                <p className="text-gray-600 mb-3">{prompt.description}</p>

                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div>
                    <span className="font-medium">Source:</span>{" "}
                    <a href={prompt.sourceUrl} className="text-berkeley-blue hover:underline">
                      {prompt.source}
                    </a>
                  </div>
                  <div>
                    <span className="font-medium">Success Rate:</span>{" "}
                    <span className={`font-medium ${getSuccessRateColor(prompt.successRate)}`}>
                      {prompt.successRate}%
                    </span>
                  </div>
                  <Button size="sm" onClick={() => handleViewDetails(prompt)}>View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex space-x-1">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              })}
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </nav>
          </div>
        )}

        {/* Prompt Details Modal */}
        <PromptDetailsModal
          prompt={selectedPrompt}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  )
}
