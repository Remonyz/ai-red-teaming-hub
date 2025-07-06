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
    switch (category) {
      case "safety":
        return "bg-red-100 text-red-800"
      case "bias":
        return "bg-yellow-100 text-yellow-800"
      case "robustness":
        return "bg-blue-100 text-blue-800"
      case "alignment":
        return "bg-purple-100 text-purple-800"
      case "security":
        return "bg-cyan-100 text-cyan-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getProtocolDescription = (category: string) => {
    switch (category) {
      case "safety":
        return "Evaluates model safety mechanisms, harmful content detection, and refusal capabilities."
      case "bias":
        return "Measures social biases and fairness in model outputs across demographic groups."
      case "robustness":
        return "Tests model resilience against adversarial attacks and edge cases."
      case "alignment":
        return "Assesses how well models follow human values and intended objectives."
      case "security":
        return "Evaluates security vulnerabilities including backdoors and injection attacks."
      default:
        return "Comprehensive evaluation framework for AI model assessment."
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div className="space-y-3">
                  {protocol.metrics.map((metric, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">{metric}</span>
                    </div>
                  ))}
                </div>
                {protocol.metrics.length === 0 && (
                  <p className="text-gray-500 text-sm">No specific metrics listed</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Compatible Models</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {protocol.compatibleModels.map((model, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {model}
                    </Badge>
                  ))}
                </div>
                {protocol.compatibleModels.length === 0 && (
                  <p className="text-gray-500 text-sm">Universal compatibility</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Implementation Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Implementation Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Setup Requirements</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Access to target language models</li>
                    <li>• Evaluation dataset preparation</li>
                    <li>• Baseline performance metrics</li>
                    <li>• Statistical analysis tools</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">Evaluation Process</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Pre-evaluation model calibration</li>
                    <li>• Systematic prompt testing</li>
                    <li>• Response quality assessment</li>
                    <li>• Comparative analysis</li>
                  </ul>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Best Practices</h4>
                <div className="text-sm text-purple-700 space-y-2">
                  <p>• Ensure diverse and representative test cases</p>
                  <p>• Use multiple evaluation runs for statistical significance</p>
                  <p>• Document all model configurations and parameters</p>
                  <p>• Compare results against established baselines</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                <span className="font-medium text-sm">Protocol ID:</span>
                <span className="ml-2 text-sm text-gray-600 font-mono">{protocol.id}</span>
              </div>

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