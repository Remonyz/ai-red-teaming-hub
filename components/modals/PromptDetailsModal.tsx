"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {  
  ExternalLink,  
  Calendar,  
  Target,  
  BarChart3,  
  Copy,
  Download,
  AlertTriangle
} from "lucide-react"
import { PromptData, exportPromptsAsJSON, exportPromptsAsPDF, exportPromptsAsText } from "@/lib/utils/exportUtils"
import { useState } from "react"

interface PromptDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  prompt: PromptData | null
}

export function PromptDetailsModal({ isOpen, onClose, prompt }: PromptDetailsModalProps) {
  const [copySuccess, setCopySuccess] = useState(false)

  if (!prompt) return null

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy content:', err)
    }
  }

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 70) return "text-berkeley-blue bg-red-50"
    if (rate >= 40) return "text-yellow-600 bg-yellow-50"
    return "text-green-600 bg-green-50"
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
      case "misinformation":
        return "bg-pink-100 text-pink-800"
      case "backdoor":
        return "bg-cyan-100 text-cyan-800"
      case "multimodal-jailbreak":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getComplexityLevel = (complexity: number) => {
    const levels = ["Very Low", "Low", "Medium", "High", "Very High"]
    return levels[complexity - 1] || "Unknown"
  }

  const formatAttackType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const handleExportSingle = (format: 'json' | 'text' | 'pdf') => {
    const data = [prompt]
    switch (format) {
      case 'json':
        exportPromptsAsJSON(data)
        break
      case 'pdf':
        exportPromptsAsPDF(data)
        break
      case 'text':
        exportPromptsAsText(data)
        break
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-berkeley-blue">
            <img src="/brsl-logo.png" alt="BRSL Logo" className="h-5 w-5" />
            {prompt.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with key information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Attack Type</span>
                </div>
                <Badge className={`${getAttackTypeBadgeColor(prompt.attackType)} mt-2`}>
                  {formatAttackType(prompt.attackType)}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Success Rate</span>
                </div>
                <div className={`mt-2 px-2 py-1 rounded text-sm font-medium ${getSuccessRateColor(prompt.successRate)}`}>
                  {prompt.successRate}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Complexity</span>
                </div>
                <div className="mt-2 text-sm font-medium">
                  {getComplexityLevel(prompt.complexity)} ({prompt.complexity}/5)
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{prompt.description}</p>
            </CardContent>
          </Card>

          {/* Prompt Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Prompt Content
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyContent}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {copySuccess ? "Copied!" : "Copy"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
                  {prompt.content}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Technical Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="font-medium text-sm">Prompt ID:</span>
                  <span className="ml-2 text-sm text-gray-600 font-mono">{prompt.id}</span>
                </div>
                
                <div>
                  <span className="font-medium text-sm">Target Model:</span>
                  <Badge variant="outline" className="ml-2">{prompt.targetModel}</Badge>
                </div>
                
                <div>
                  <span className="font-medium text-sm">Threat Domain:</span>
                  <Badge variant="secondary" className="ml-2 capitalize">{prompt.threatDomain}</Badge>
                </div>
                
                <div>
                  <span className="font-medium text-sm">Modalities:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {prompt.modalities.map((modality) => (
                      <Badge key={modality} variant="outline" className="text-xs capitalize">
                        {modality}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Added: {prompt.dateAdded}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Source Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="font-medium text-sm">Source:</span>
                  <div className="mt-1">
                    <a 
                      href={prompt.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {prompt.source}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                {/* Additional context based on attack type */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-medium text-sm text-blue-900 mb-1">Attack Vector Context</h4>
                  <p className="text-xs text-blue-700">
                    {prompt.attackType === 'jailbreak' && "This prompt attempts to bypass safety measures by roleplaying or instruction manipulation."}
                    {prompt.attackType === 'prompt-injection' && "This prompt tries to inject malicious instructions into the model's context."}
                    {prompt.attackType === 'bias-exploit' && "This prompt is designed to elicit biased responses from the model."}
                    {prompt.attackType === 'harmful-content' && "This prompt attempts to generate harmful or inappropriate content."}
                    {prompt.attackType === 'misinformation' && "This prompt tries to generate false or misleading information."}
                    {prompt.attackType === 'backdoor' && "This prompt tests for backdoor vulnerabilities using trigger phrases."}
                    {prompt.attackType === 'multimodal-jailbreak' && "This prompt combines text and other modalities to bypass safety measures."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <Separator />
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Use this prompt responsibly for security research and testing purposes only.
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExportSingle('json')} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                JSON
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExportSingle('text')} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                TEXT
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExportSingle('pdf')} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
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