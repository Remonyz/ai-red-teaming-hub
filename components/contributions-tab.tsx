"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import type { PromptData, ProtocolData } from "@/lib/utils/exportUtils"

export function ContributionsTab() {
  const [step, setStep] = useState<"prompt" | "protocol">("prompt")

  const [promptForm, setPromptForm] = useState<PromptData>({
    id: "",
    title: "",
    description: "",
    attackType: "",
    modalities: [],
    threatDomain: "",
    targetModel: "",
    source: "",
    sourceUrl: "",
    dateAdded: "",
    content: "",
  })
  const [promptErrors, setPromptErrors] = useState<{ [key: string]: string }>({})

  const [protocolForm, setProtocolForm] = useState<ProtocolData>({
    id: "",
    name: "",
    description: "",
    category: "",
    version: "",
    organization: "",
    metrics: [],
    compatibleModels: [],
    url: "",
  })
  const [protocolErrors, setProtocolErrors] = useState<{ [key: string]: string }>({})
  const [metricsRaw, setMetricsRaw] = useState("")
  const [modelsRaw, setModelsRaw] = useState("")

  const attackTypes = ["jailbreak", "prompt-injection", "bias-exploit", "harmful-content", "misinformation", "backdoor", "multimodal-jailbreak"]
  const modalitiesList = ["text", "code", "image", "audio"]
  const threatDomains = ["general", "cybersecurity", "cbrn", "healthcare", "finance"]
  const protocolCategories = ["safety", "bias", "robustness", "alignment", "security"]

  const updatePromptField = (field: keyof PromptData, value: any) => {
    setPromptForm({ ...promptForm, [field]: value })
    if (promptErrors[field]) {
      setPromptErrors({ ...promptErrors, [field]: "" })
    }
  }

  const toggleModality = (mod: string) => {
    const newMods = promptForm.modalities.includes(mod)
      ? promptForm.modalities.filter(m => m !== mod)
      : [...promptForm.modalities, mod]
    updatePromptField("modalities", newMods)
  }

  const validatePrompt = () => {
    const errors: { [key: string]: string } = {}
    const required: (keyof PromptData)[] = ["id","title","description","attackType","modalities","threatDomain","targetModel","content"]
    required.forEach(field => {
      const val = promptForm[field]
      if (Array.isArray(val) ? val.length === 0 : !val) {
        errors[field] = "This field is required"
      }
    })
    setPromptErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePrompt()) return
    alert("Prompt submitted for review")
    setPromptForm({
      id: "",
      title: "",
      description: "",
      attackType: "",
      modalities: [],
      threatDomain: "",
      targetModel: "",
      source: "",
      sourceUrl: "",
      dateAdded: "",
      content: "",
    })
  }

  const updateProtocolField = (field: keyof ProtocolData, value: any) => {
    setProtocolForm({ ...protocolForm, [field]: value })
    if (protocolErrors[field]) {
      setProtocolErrors({ ...protocolErrors, [field]: "" })
    }
  }

  const validateProtocol = () => {
    const errors: { [key: string]: string } = {}
    const required: (keyof ProtocolData)[] = ["id","name","description","category","version","organization","url"]
    required.forEach(field => {
      const val = protocolForm[field]
      if (Array.isArray(val) ? val.length === 0 : !val) {
        errors[field] = "This field is required"
      }
    })
    if (!metricsRaw) errors["metrics"] = "Metrics are required"
    if (!modelsRaw) errors["testedModels"] = "Models are required"
    setProtocolErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleProtocolSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateProtocol()) return
    const metrics = metricsRaw.split(",").map(s => s.trim()).filter(Boolean)
    const models = modelsRaw.split(",").map(s => s.trim()).filter(Boolean)
    const submission: ProtocolData = { ...protocolForm, metrics, testedModels: models }
    console.log("Protocol submitted", submission)
    alert("Protocol submitted for review")
    setProtocolForm({
      id: "",
      name: "",
      description: "",
      category: "",
      version: "",
      organization: "",
      metrics: [],
      compatibleModels: [],
      url: "",
    })
    setMetricsRaw("")
    setModelsRaw("")
  }

  return (
    <div id="contributions" className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Guidelines for Contributors</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
            <li>Provide clear titles and descriptions.</li>
            <li>Select accurate metadata fields.</li>
            <li>Use valid domains and attack types.</li>
            <li>Review examples for style guidance.</li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex space-x-4">
        <Button variant={step === "prompt" ? "default" : "outline"} onClick={() => setStep("prompt")}>
          Submit Benchmark
        </Button>
        <Button variant={step === "protocol" ? "default" : "outline"} onClick={() => setStep("protocol")}>
          Submit Dataset
        </Button>
      </div>

      {step === "prompt" ? (
        <Card>
          <CardHeader>
            <CardTitle>Submit Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <iframe 
              src="https://docs.google.com/forms/d/e/1FAIpQLSc_C2R7hX1dgeQT7CQ0J1bCNe4DUeWs4OLaOKAAGE97z2r13Q/viewform?embedded=true" 
              width="100%" 
              height="1094" 
              frameBorder="0" 
              marginHeight="0" 
              marginWidth="0"
              className="w-full"
            >
              Loading…
            </iframe>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Submit Protocol</CardTitle>
          </CardHeader>
          <CardContent>
            <iframe 
              src="https://docs.google.com/forms/d/e/1FAIpQLSc5Clpl56VZbPjC67qj8g1P5QKN5ogPZOlv84OjoeVqHmo2_Q/viewform?embedded=true" 
              width="100%" 
              height="959" 
              frameBorder="0" 
              marginHeight="0" 
              marginWidth="0"
              className="w-full"
            >
              Loading…
            </iframe>
          </CardContent>
        </Card>
      )}
    </div>
)
}