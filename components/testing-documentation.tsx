"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  BookOpen, 
  Code, 
  Database, 
  Settings, 
  BarChart3, 
  Copy, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Download,
  Play,
  Terminal
} from "lucide-react"

export function TestingDocumentation() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(id)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const CodeBlock = ({ code, language = "python", id }: { code: string, language?: string, id: string }) => {
    return (
      <div className="relative">
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
          <code className={`language-${language}`}>{code}</code>
        </pre>
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
          onClick={() => copyToClipboard(code, id)}
        >
          {copiedCode === id ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <BookOpen className="h-8 w-8 text-berkeley-blue" />
          <h1 className="text-3xl font-bold text-berkeley-blue">AI Red Teaming Framework Guide</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-4xl mx-auto">
          Comprehensive documentation for conducting AI safety evaluations using the datasets and protocols 
          available in this hub. Learn how to integrate these resources into your red teaming workflows.
        </p>
      </div>

      {/* Quick Start Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Red Teaming Fundamentals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Red teaming evaluates AI model safety by systematically testing for vulnerabilities, 
              harmful outputs, and failure modes using adversarial prompts and scenarios.
            </p>
            <ul className="text-sm space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Systematic vulnerability assessment</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Adversarial prompt testing</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Safety mechanism evaluation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Bias and fairness assessment</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              Available Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              This hub provides curated datasets and evaluation protocols from leading AI safety research.
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Safety Datasets</span>
                <Badge variant="secondary">50+</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Evaluation Protocols</span>
                <Badge variant="secondary">34+</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Task Categories</span>
                <Badge variant="secondary">10+</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Benchmark Frameworks</span>
                <Badge variant="secondary">20+</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-500" />
              Methodology
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Follow established academic standards for reproducible and ethical AI safety evaluation.
            </p>
            <ol className="text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="bg-berkeley-blue text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                <span>Select appropriate datasets and protocols</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-berkeley-blue text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                <span>Configure evaluation environment</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-berkeley-blue text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                <span>Run systematic evaluations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-berkeley-blue text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">4</span>
                <span>Analyze and report results</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Quick Start Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-green-500" />
            Quick Start Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Prerequisites</h4>
            <p className="text-sm text-blue-800 mb-2">Before starting, ensure you have:</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Python 3.8+ installed</li>
              <li>• API keys for target models (OpenAI, Anthropic, etc.)</li>
              <li>• Required packages: pandas, requests, transformers</li>
              <li>• Understanding of your evaluation objectives</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Step 1: Environment Setup</h4>
              <CodeBlock 
                code={`# Install required packages
pip install pandas requests transformers
pip install openai anthropic datasets

# Set up environment variables
export OPENAI_API_KEY="your-key-here"
export ANTHROPIC_API_KEY="your-key-here"`}
                language="bash"
                id="setup"
              />
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Step 2: Download Dataset</h4>
              <CodeBlock 
                code={`import pandas as pd
import requests

# Download dataset from hub
url = "https://your-hub.com/data/datasets.csv"
df = pd.read_csv(url)

# Filter for specific task
safety_data = df[df['Task/Purpose'].str.contains('safety')]
print(f"Found {len(safety_data)} safety datasets")`}
                id="download"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentation Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer">
          <CardContent className="p-6 text-center">
            <Database className="h-8 w-8 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Dataset Usage</h3>
            <p className="text-sm text-gray-600">Learn how to load and format datasets for evaluation</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 hover:border-green-400 transition-colors cursor-pointer">
          <CardContent className="p-6 text-center">
            <Code className="h-8 w-8 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Framework Integration</h3>
            <p className="text-sm text-gray-600">Code examples for HuggingFace, OpenAI, and local models</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors cursor-pointer">
          <CardContent className="p-6 text-center">
            <Settings className="h-8 w-8 text-purple-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Evaluation Workflows</h3>
            <p className="text-sm text-gray-600">Complete pipelines for systematic red teaming</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 hover:border-orange-400 transition-colors cursor-pointer">
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-8 w-8 text-orange-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Results Analysis</h3>
            <p className="text-sm text-gray-600">Statistical analysis and reporting guidelines</p>
          </CardContent>
        </Card>
      </div>

      {/* Ethical Guidelines */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="h-5 w-5" />
            Ethical Guidelines & Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-yellow-900 mb-2">Research Ethics</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Use red teaming only for safety research</li>
                <li>• Follow institutional review board guidelines</li>
                <li>• Protect sensitive information in datasets</li>
                <li>• Document methodology for reproducibility</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-900 mb-2">Technical Standards</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Use appropriate statistical tests</li>
                <li>• Report confidence intervals</li>
                <li>• Account for multiple comparisons</li>
                <li>• Validate on held-out test sets</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Resources */}
      <Card className="bg-berkeley-blue text-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Additional Resources
              </h4>
              <ul className="text-sm space-y-1 text-blue-100">
                <li>• HELM Safety Documentation</li>
                <li>• AI Safety Evaluation Guidelines</li>
                <li>• Red Teaming Best Practices</li>
                <li>• Statistical Analysis Methods</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Code className="h-4 w-4" />
                Code Examples
              </h4>
              <ul className="text-sm space-y-1 text-blue-100">
                <li>• Complete evaluation pipelines</li>
                <li>• Custom metric implementations</li>
                <li>• Visualization templates</li>
                <li>• Report generation scripts</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                External Links
              </h4>
              <ul className="text-sm space-y-1 text-blue-100">
                <li>• HuggingFace Model Hub</li>
                <li>• OpenAI API Documentation</li>
                <li>• Anthropic Claude API</li>
                <li>• Academic Paper Templates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}