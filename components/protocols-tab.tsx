"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ExternalLink, Download } from "lucide-react"
import { getAllProtocols } from "@/lib/data"
import { searchProtocols } from "@/lib/utils/searchUtils"
import { exportProtocolsAsJSON, exportProtocolsAsCSV, exportProtocolsAsPDF } from "@/lib/utils/exportUtils"
import { ProtocolDetailsModal } from "@/components/modals/ProtocolDetailsModal"
import { DownloadDropdown } from "@/components/ui/download-dropdown"

export function ProtocolsTab() {
  const [protocols, setProtocols] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProtocol, setSelectedProtocol] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Load combined protocols (hardcoded + CSV) on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const protocolData = await getAllProtocols()
        setProtocols(protocolData)
      } catch (error) {
        console.error('Failed to load protocols:', error)
        setProtocols([])
      }
    }
    loadData()
  }, [])

  // Enhanced search with fuzzy matching
  const filteredProtocols = searchTerm 
    ? searchProtocols(protocols, searchTerm).map(result => result.item)
    : protocols

  const getCategoryColor = (category: string) => {
    const lowerCategory = category.toLowerCase()
    
    if (lowerCategory.includes('holistic') || lowerCategory.includes('comprehensive')) {
      return "bg-purple-100 text-purple-800"
    } else if (lowerCategory.includes('regulatory') || lowerCategory.includes('policy')) {
      return "bg-blue-100 text-blue-800"
    } else if (lowerCategory.includes('safety') || lowerCategory.includes('hazard')) {
      return "bg-red-100 text-red-800"
    } else if (lowerCategory.includes('bias') || lowerCategory.includes('fairness')) {
      return "bg-yellow-100 text-yellow-800"
    } else if (lowerCategory.includes('robustness') || lowerCategory.includes('adversarial')) {
      return "bg-orange-100 text-orange-800"
    } else if (lowerCategory.includes('privacy') || lowerCategory.includes('security')) {
      return "bg-indigo-100 text-indigo-800"
    } else if (lowerCategory.includes('trustworthiness') || lowerCategory.includes('ethics')) {
      return "bg-green-100 text-green-800"
    } else if (lowerCategory.includes('backdoor') || lowerCategory.includes('attack')) {
      return "bg-pink-100 text-pink-800"
    } else if (lowerCategory.includes('alignment') || lowerCategory.includes('instruction')) {
      return "bg-teal-100 text-teal-800"
    } else {
      return "bg-gray-100 text-gray-800"
    }
  }

  const handleViewProtocol = (protocol: any) => {
    setSelectedProtocol(protocol)
    setIsModalOpen(true)
  }

  const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
    setIsExporting(true)
    try {
      const dataToExport = filteredProtocols.map(protocol => ({
        name: protocol.name,
        description: protocol.description,
        category: protocol.category,
        ...(protocol.version && protocol.version !== "v1.0" && protocol.version !== "Unknown" && { version: protocol.version }),
        ...(protocol.organization && protocol.organization !== "Unknown" && { organization: protocol.organization }),
        ...(protocol.metrics && protocol.metrics.length > 0 && { metrics: protocol.metrics }),
        testedModels: protocol.testedModels || [],
        url: protocol.url
      }))

      switch (format) {
        case 'json':
          exportProtocolsAsJSON(dataToExport)
          break
        case 'csv':
          exportProtocolsAsCSV(dataToExport)
          break
        case 'pdf':
          exportProtocolsAsPDF(dataToExport)
          break
      }
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Evaluation Protocols</h2>
          <p className="text-gray-600 mt-1">Standardized frameworks for assessing AI safety and robustness</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search protocols..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <DownloadDropdown
            onExport={handleExport}
            isLoading={isExporting}
            itemCount={filteredProtocols.length}
            size="sm"
          />
        </div>
      </div>

      {/* Results */}
      <div className="text-sm text-gray-600 mb-4">Showing {filteredProtocols.length} protocols</div>

      {/* Protocol Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProtocols.map((protocol) => (
          <Card key={protocol.id} className="hover:shadow-lg transition-all duration-200 border-0 hover:border-berkeley-blue/20">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-wrap gap-2">
                  <Badge className={getCategoryColor(protocol.category)}>{protocol.category}</Badge>
                  {protocol.version && protocol.version !== "v1.0" && protocol.version !== "Unknown" && (
                    <Badge variant="outline">{protocol.version}</Badge>
                  )}
                  {protocol.modalities && protocol.modalities.length > 0 && (
                    <Badge variant="secondary">{protocol.modalities[0]}</Badge>
                  )}
                </div>
              </div>
              
              <h3 className="text-lg font-medium mb-2">{protocol.name}</h3>
              
              <p className="text-gray-600 mb-4">{protocol.description}</p>

              <div className="space-y-3">
                {protocol.organization && protocol.organization !== "Unknown" && (
                  <div>
                    <span className="font-medium text-sm">Organization:</span>
                    <span className="text-sm text-gray-600 ml-2">{protocol.organization}</span>
                  </div>
                )}

                {protocol.metrics && protocol.metrics.length > 0 ? (
                  <div>
                    <span className="font-medium text-sm">Metrics:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {protocol.metrics.map((metric: string) => (
                        <Badge key={metric} variant="secondary" className="text-xs">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="font-medium text-sm">Metrics:</span>
                    <span className="text-sm text-gray-500 ml-2">No metrics specified in source data</span>
                  </div>
                )}

                {protocol.testedModels && protocol.testedModels.length > 0 && (
                  <div>
                    <span className="font-medium text-sm">Tested Models:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {protocol.testedModels.map((model: string) => (
                        <Badge key={model} variant="outline" className="text-xs">
                          {model}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-6">
                <Button size="sm" className="flex-1" onClick={() => handleViewProtocol(protocol)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Protocol
                </Button>
                <DownloadDropdown
                  onExport={(format) => handleExport(format)}
                  isLoading={isExporting}
                  itemCount={1}
                  size="sm"
                  variant="outline"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Protocol Details Modal */}
      <ProtocolDetailsModal
        protocol={selectedProtocol}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
