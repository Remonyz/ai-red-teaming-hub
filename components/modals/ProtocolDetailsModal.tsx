"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ExternalLink, 
  Building, 
  BarChart3, 
  Download,
  Copy,
  CheckCircle,
  FileText,
  Globe,
  Database
} from "lucide-react"
import { ProtocolData } from "@/lib/utils/exportUtils"
import { exportProtocolsAsJSON, exportProtocolsAsCSV, exportProtocolsAsPDF } from "@/lib/utils/exportUtils"
import { useState } from "react"

interface ProtocolDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  protocol: ProtocolData | null
}

export function ProtocolDetailsModal({ isOpen, onClose, protocol }: ProtocolDetailsModalProps) {
  const [copySuccess, setCopySuccess] = useState(false)

  if (!protocol) return null

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(protocol.url)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  const handleExportSingle = (format: 'json' | 'csv' | 'pdf') => {
    const data = [protocol]
    switch (format) {
      case 'json':
        exportProtocolsAsJSON(data)
        break
      case 'csv':
        exportProtocolsAsCSV(data)
        break
      case 'pdf':
        exportProtocolsAsPDF(data)
        break
    }
  }

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

  const getProtocolDescription = (category: string) => {
    const lowerCategory = category.toLowerCase()
    
    if (lowerCategory.includes('holistic')) {
      return "Comprehensive evaluation covering multiple dimensions of model performance including safety, bias, fairness, and robustness."
    } else if (lowerCategory.includes('regulatory') || lowerCategory.includes('policy')) {
      return "Evaluates model compliance with government regulations and corporate policies across various risk categories."
    } else if (lowerCategory.includes('safety') || lowerCategory.includes('hazard')) {
      return "Assesses model safety mechanisms, harmful content detection, and risk mitigation capabilities."
    } else if (lowerCategory.includes('bias') || lowerCategory.includes('fairness')) {
      return "Measures social biases and fairness in model outputs across different demographic groups and use cases."
    } else if (lowerCategory.includes('robustness') || lowerCategory.includes('adversarial')) {
      return "Tests model resilience against adversarial attacks, edge cases, and unexpected inputs."
    } else if (lowerCategory.includes('trustworthiness')) {
      return "Evaluates multiple dimensions of trustworthiness including truthfulness, safety, fairness, robustness, privacy, and ethics."
    } else if (lowerCategory.includes('backdoor')) {
      return "Tests for backdoor vulnerabilities and model poisoning attacks across various tasks."
    } else if (lowerCategory.includes('red team')) {
      return "Automated red teaming framework for systematically testing model vulnerabilities."
    } else {
      return "Evaluation framework for assessing AI model performance and safety characteristics."
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            {protocol.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Category</span>
                </div>
                <Badge className={`${getCategoryColor(protocol.category)} mt-2 capitalize`}>
                  {protocol.category}
                </Badge>
              </CardContent>
            </Card>

            {protocol.organization && protocol.organization !== "Unknown" && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Organization</span>
                  </div>
                  <div className="mt-2 text-sm font-medium">
                    {protocol.organization}
                  </div>
                </CardContent>
              </Card>
            )}

            {protocol.version && protocol.version !== "v1.0" && protocol.version !== "Unknown" && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">Version</span>
                  </div>
                  <Badge variant="outline" className="mt-2">
                    {protocol.version}
                  </Badge>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Protocol Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">{protocol.description}</p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Category Focus</h4>
                <p className="text-sm text-blue-700">
                  {getProtocolDescription(protocol.category)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Metrics and Models */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Evaluation Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {protocol.metrics && protocol.metrics.length > 0 ? (
                  <div className="space-y-3">
                    {protocol.metrics.map((metric, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">{metric}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-600 text-sm">
                      Specific evaluation metrics are not provided in the source data. 
                      Please refer to the paper or project repository for detailed metric definitions.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tested Models</CardTitle>
              </CardHeader>
              <CardContent>
                {(protocol.testedModels || protocol.compatibleModels || []).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {(protocol.testedModels || protocol.compatibleModels || []).map((model, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {model}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-600 text-sm">
                      Model compatibility information is not specified in the source data. 
                      This protocol may be applicable to various language models - check the documentation for details.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>


          {/* Access Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Access & Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              <div>
                <span className="font-medium text-sm">Official URL:</span>
                <div className="mt-1 flex items-center gap-2">
                  <a 
                    href={protocol.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm break-all"
                  >
                    {protocol.url}
                  </a>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyUrl}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  {copySuccess && (
                    <span className="text-green-600 text-xs">Copied!</span>
                  )}
                </div>
              </div>

              {/* Project/Repository URL from CSV */}
              {(protocol as any).projectUrl && (
                <div>
                  <span className="font-medium text-sm">Project/Repository:</span>
                  <div className="mt-1">
                    <a 
                      href={(protocol as any).projectUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline text-sm break-all flex items-center gap-1"
                    >
                      {(protocol as any).projectUrl}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Dataset Links - if available in the protocol data */}
              {(protocol as any).datasets && (
                <div>
                  <span className="font-medium text-sm">Associated Datasets:</span>
                  <div className="mt-2 space-y-1">
                    {(protocol as any).datasets.map((dataset: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <ExternalLink className="h-3 w-3 text-gray-400" />
                        <a 
                          href={dataset} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline text-xs break-all"
                        >
                          {dataset}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Separator />
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Protocol documentation for AI safety evaluation and research.
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExportSingle('json')}
              >
                <Download className="h-4 w-4 mr-1" />
                JSON
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExportSingle('csv')}
              >
                <Download className="h-4 w-4 mr-1" />
                CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExportSingle('pdf')}
              >
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
              <Button onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}