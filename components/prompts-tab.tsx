"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAllDatasets } from "@/lib/data"
import { searchPrompts } from "@/lib/utils/searchUtils"
import { exportPromptsAsJSON, exportPromptsAsCSV, exportPromptsAsPDF } from "@/lib/utils/exportUtils"
import { PromptDetailsModal } from "@/components/modals/PromptDetailsModal"
import { DownloadDropdown } from "@/components/ui/download-dropdown"
import { DynamicFilters } from "@/components/dynamic-filters"
import { extractFilterOptions } from "@/lib/filter-extractor"
import { FilterState, FlexibleDataset } from "@/types/dataset-schema"
import { ExternalLink } from "lucide-react"

export function PromptsTab() {
  // Core data state
  const [allData, setAllData] = useState<FlexibleDataset[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilters, setActiveFilters] = useState<FilterState>({})
  const [sortBy, setSortBy] = useState("relevance")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const itemsPerPage = 10

  // Load combined datasets (hardcoded + CSV) on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const datasets = await getAllDatasets()
        setAllData(datasets)
      } catch (error) {
        console.error('Failed to load datasets:', error)
        setAllData([])
      }
    }
    loadData()
  }, [])

  // Generate dynamic filter options from current data
  const filterOptions = useMemo(() => {
    return extractFilterOptions(allData, [
      'category', 'attackType', 'threatDomain', 'modalities', 
      'source', 'testedModels'
    ])
  }, [allData])


  // Apply filters and search
  const filteredPrompts = useMemo(() => {
    let results = [...allData]
    
    // Apply search if search term exists
    if (searchTerm) {
      const searchResults = searchPrompts(results, searchTerm)
      results = searchResults.map(result => result.item)
    }
    
    // Apply active filters
    Object.entries(activeFilters).forEach(([fieldName, filter]) => {
      if (!filter.value) return
      
      results = results.filter(item => {
        const fieldValue = item[fieldName]
        
        switch (filter.operator) {
          case 'in':
            if (Array.isArray(filter.value)) {
              if (Array.isArray(fieldValue)) {
                return filter.value.some(v => fieldValue.includes(v))
              }
              return filter.value.includes(String(fieldValue))
            }
            return String(fieldValue) === String(filter.value)
            
          case 'between':
            if (Array.isArray(filter.value) && filter.value.length === 2) {
              const numValue = Number(fieldValue)
              return numValue >= filter.value[0] && numValue <= filter.value[1]
            }
            return true
            
          case 'contains':
            return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase())
            
          case 'equals':
          default:
            return String(fieldValue) === String(filter.value)
        }
      })
    })
    
    return results
  }, [allData, searchTerm, activeFilters])

  const sortedPrompts = useMemo(() => {
    const sorted = [...filteredPrompts]
    switch (sortBy) {
      case "date":
        return sorted.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
      default:
        return sorted
    }
  }, [filteredPrompts, sortBy])

  const paginatedPrompts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedPrompts.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedPrompts, currentPage])

  const totalPages = Math.ceil(sortedPrompts.length / itemsPerPage)

  const handleViewDetails = (prompt: any) => {
    setSelectedPrompt(prompt)
    setIsModalOpen(true)
  }

  const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
    setIsExporting(true)
    try {
      const dataToExport = filteredPrompts.map(prompt => ({
        title: prompt.title,
        description: prompt.description,
        attackType: prompt.attackType,
        modalities: prompt.modalities,
        testedModels: prompt.testedModels || [],
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
      case "classification":
        return "bg-blue-100 text-blue-800"
      case "reasoning":
        return "bg-green-100 text-green-800"
      case "instruction-following":
        return "bg-teal-100 text-teal-800"
      case "evaluation":
        return "bg-slate-100 text-slate-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Dynamic Filters Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        <DynamicFilters
          filterOptions={filterOptions}
          onFiltersChange={setActiveFilters}
          onSearchChange={setSearchTerm}
          initialSearch={searchTerm}
          showSearch={true}
          showClearAll={true}
          showActiveCount={true}
        />
        
        {/* Import and Export Options */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div>
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
          <div>
            <h2 className="text-xl font-semibold">
              Red Team Prompts ({filteredPrompts.length} results)
            </h2>
            <p className="text-sm text-gray-600">
              {allData.length} total records from {
                [...new Set(allData.map(item => item.importSource?.type || 'unknown'))].join(', ')
              } sources
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="date">Date Added</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Prompt Cards */}
        <div className="space-y-4">
          {paginatedPrompts.map((prompt) => (
            <Card key={prompt.id} className="hover:shadow-lg transition-all duration-200 border-0 hover:border-berkeley-blue/20">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-wrap gap-2">
                    {prompt.attackType && (
                      <Badge className={getAttackTypeBadgeColor(prompt.attackType)}>
                        {prompt.attackType.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                      </Badge>
                    )}
                    {prompt.category && prompt.category !== prompt.attackType && (
                      <Badge variant="outline">
                        {prompt.category}
                      </Badge>
                    )}
                    {(prompt.modalities || []).slice(0, 3).map((modality) => (
                      <Badge key={modality} variant="secondary">
                        {typeof modality === 'string' ? modality : String(modality)}
                      </Badge>
                    ))}
                    {prompt.testedModels && prompt.testedModels.length > 0 && (
                      <Badge variant="outline">{prompt.testedModels[0]}</Badge>
                    )}
                    {prompt.importSource?.type === 'csv_file' && (
                      <Badge variant="outline" className="text-xs">
                        From CSV
                      </Badge>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-medium mb-2">{prompt.title}</h3>
                <p className="text-gray-600 mb-3">{prompt.description}</p>

                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div>
                    {prompt.source && (
                      <>
                        <span className="font-medium">Source:</span>{" "}
                        {prompt.sourceUrl ? (
                          <a href={prompt.sourceUrl} className="text-berkeley-blue hover:underline">
                            {prompt.source}
                          </a>
                        ) : (
                          <span>{prompt.source}</span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {prompt.testedModels && prompt.testedModels.length > 0 && (
                      <div>
                        <span className="font-medium">Tested Models:</span>{" "}
                        <span>{prompt.testedModels.join(', ')}</span>
                      </div>
                    )}
                    <Button size="sm" onClick={() => handleViewDetails(prompt)}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
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
