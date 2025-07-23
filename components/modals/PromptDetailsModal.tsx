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
  Copy,
  Download,
  Database
} from "lucide-react"
import { PromptData, exportPromptsAsJSON, exportPromptsAsPDF, exportPromptsAsText } from "@/lib/utils/exportUtils"
import { useState } from "react"

interface PromptDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  prompt: PromptData | null
}

export function PromptDetailsModal({ isOpen, onClose, prompt }: PromptDetailsModalProps) {
  if (!prompt) return null


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
          <div className="grid grid-cols-1 gap-4">
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

          {/* Dataset Information Notice */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5" />
                Dataset Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-900 mb-2">
                  This is a dataset entry from the <strong>{prompt.source}</strong> benchmark.
                </p>
                <p className="text-sm text-blue-700">
                  To access the actual prompts and data samples, please visit the dataset URL below. 
                  The dataset contains {prompt.promptCount || 'multiple'} samples for {prompt.category || 'evaluation'}.
                </p>
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
                  <span className="font-medium text-sm">Tested Models:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(prompt.testedModels || [prompt.targetModel] || []).filter(Boolean).map((model, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {model}
                      </Badge>
                    ))}
                    {!(prompt.testedModels || [prompt.targetModel]).filter(Boolean).length && (
                      <span className="text-sm text-gray-500">Not specified</span>
                    )}
                  </div>
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
                  <span className="font-medium text-sm">Dataset Source:</span>
                  <div className="mt-1">
                    {prompt.sourceUrl ? (
                      <a 
                        href={prompt.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline break-all"
                      >
                        {prompt.source}
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    ) : (
                      <span className="text-sm text-gray-600">{prompt.source}</span>
                    )}
                  </div>
                </div>
                
                {prompt.sourceUrl && (
                  <div>
                    <span className="font-medium text-sm">Direct Dataset Access:</span>
                    <div className="mt-1">
                      <a 
                        href={prompt.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline text-sm break-all"
                      >
                        {prompt.sourceUrl}
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Additional context based on attack type */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-medium text-sm text-blue-900 mb-1">Attack Vector Context</h4>
                  <p className="text-xs text-blue-700">
                    {prompt.attackType === 'jailbreak' && "This dataset contains prompts that attempt to bypass safety measures through roleplaying or instruction manipulation."}
                    {prompt.attackType === 'prompt-injection' && "This dataset focuses on prompts that try to inject malicious instructions into the model's context."}
                    {prompt.attackType === 'bias-exploit' && "This dataset is designed to test and elicit biased responses from language models."}
                    {prompt.attackType === 'harmful-content' && "This dataset contains prompts that attempt to generate harmful or inappropriate content."}
                    {prompt.attackType === 'misinformation' && "This dataset tests model's tendency to generate false or misleading information."}
                    {prompt.attackType === 'backdoor' && "This dataset tests for backdoor vulnerabilities using specific trigger phrases and patterns."}
                    {prompt.attackType === 'multimodal-jailbreak' && "This dataset combines text and other modalities to test safety measure bypasses."}
                    {prompt.attackType === 'classification' && "This dataset contains classification tasks for evaluating model performance and robustness."}
                    {prompt.attackType === 'reasoning' && "This dataset focuses on mathematical and logical reasoning tasks to test model capabilities."}
                    {prompt.attackType === 'instruction-following' && "This dataset evaluates how well models follow instructions and handle edge cases."}
                    {prompt.attackType === 'evaluation' && "This is a general evaluation dataset for testing various model capabilities and safety measures."}
                    {!prompt.attackType && "This dataset is used for AI safety evaluation and red teaming purposes."}
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