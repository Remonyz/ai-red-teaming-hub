"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ExternalLink, Download } from "lucide-react"
import { protocolsData } from "@/lib/data"
import { searchProtocols } from "@/lib/utils/searchUtils"
import { exportProtocolsAsJSON, exportProtocolsAsCSV, exportProtocolsAsPDF } from "@/lib/utils/exportUtils"
import { ProtocolDetailsModal } from "@/components/modals/ProtocolDetailsModal"
import { DownloadDropdown } from "@/components/ui/download-dropdown"

export function ProtocolsTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedProtocol, setSelectedProtocol] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Enhanced search with fuzzy matching
  const filteredProtocols = searchTerm 
    ? searchProtocols(protocolsData, searchTerm, { category: categoryFilter }).map(result => result.item)
    : protocolsData.filter((protocol) => {
        const matchesCategory = categoryFilter === "all" || protocol.category === categoryFilter
        return matchesCategory
      })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "safety":
        return "bg-red-100 text-red-800"
      case "bias":
        return "bg-yellow-100 text-yellow-800"
      case "robustness":
        return "bg-blue-100 text-blue-800"
      case "alignment":
        return "bg-purple-100 text-purple-800"
      default:
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
        id: protocol.id,
        name: protocol.name,
        description: protocol.description,
        category: protocol.category,
        version: protocol.version,
        organization: protocol.organization,
        metrics: protocol.metrics,
        compatibleModels: protocol.compatibleModels,
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
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="safety">Safety</SelectItem>
              <SelectItem value="bias">Bias</SelectItem>
              <SelectItem value="robustness">Robustness</SelectItem>
              <SelectItem value="alignment">Alignment</SelectItem>
            </SelectContent>
          </Select>
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
          <Card key={protocol.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{protocol.name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge className={getCategoryColor(protocol.category)}>{protocol.category}</Badge>
                    <Badge variant="outline">{protocol.version}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{protocol.description}</p>

              <div className="space-y-3">
                <div>
                  <span className="font-medium text-sm">Organization:</span>
                  <span className="text-sm text-gray-600 ml-2">{protocol.organization}</span>
                </div>

                <div>
                  <span className="font-medium text-sm">Metrics:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {protocol.metrics.map((metric) => (
                      <Badge key={metric} variant="secondary" className="text-xs">
                        {metric}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-medium text-sm">Compatible Models:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {protocol.compatibleModels.map((model) => (
                      <Badge key={model} variant="outline" className="text-xs">
                        {model}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" className="flex-1" onClick={() => handleViewProtocol(protocol)}>
                  <ExternalLink className="h-4 w-4 mr-1" />
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
