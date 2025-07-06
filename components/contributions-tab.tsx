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
    successRate: 0,
    complexity: 1,
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
      successRate: 0,
      complexity: 1,
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
    if (!modelsRaw) errors["compatibleModels"] = "Models are required"
    setProtocolErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleProtocolSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateProtocol()) return
    const metrics = metricsRaw.split(",").map(s => s.trim()).filter(Boolean)
    const models = modelsRaw.split(",").map(s => s.trim()).filter(Boolean)
    const submission: ProtocolData = { ...protocolForm, metrics, compatibleModels: models }
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
          Submit Prompt
        </Button>
        <Button variant={step === "protocol" ? "default" : "outline"} onClick={() => setStep("protocol")}>
          Submit Protocol
        </Button>
      </div>

      {step === "prompt" ? (
        <>
          <form onSubmit={handlePromptSubmit} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>New Prompt Submission</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm">ID</label>
                  <Input value={promptForm.id} onChange={e => updatePromptField("id", e.target.value)} />
                  {promptErrors.id && <p className="text-red-600 text-sm">{promptErrors.id}</p>}
                </div>
                <div>
                  <label className="block text-sm">Title</label>
                  <Input value={promptForm.title} onChange={e => updatePromptField("title", e.target.value)} />
                  {promptErrors.title && <p className="text-red-600 text-sm">{promptErrors.title}</p>}
                </div>
                <div>
                  <label className="block text-sm">Description</label>
                  <Textarea value={promptForm.description} onChange={e => updatePromptField("description", e.target.value)} />
                  {promptErrors.description && <p className="text-red-600 text-sm">{promptErrors.description}</p>}
                </div>
                <div>
                  <label className="block text-sm">Attack Type</label>
                  <Select value={promptForm.attackType} onValueChange={val => updatePromptField("attackType", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {attackTypes.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {promptErrors.attackType && <p className="text-red-600 text-sm">{promptErrors.attackType}</p>}
                </div>
                <div>
                  <label className="block text-sm">Modalities</label>
                  <div className="flex space-x-2">
                    {modalitiesList.map(m => (
                      <label key={m} className="flex items-center space-x-1">
                        <Checkbox
                          checked={promptForm.modalities.includes(m)}
                          onCheckedChange={() => toggleModality(m)}
                        />
                        <span className="text-sm">{m}</span>
                      </label>
                    ))}
                  </div>
                  {promptErrors.modalities && <p className="text-red-600 text-sm">{promptErrors.modalities}</p>}
                </div>
                <div>
                  <label className="block text-sm">Threat Domain</label>
                  <Select value={promptForm.threatDomain} onValueChange={val => updatePromptField("threatDomain", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {threatDomains.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {promptErrors.threatDomain && <p className="text-red-600 text-sm">{promptErrors.threatDomain}</p>}
                </div>
                <div>
                  <label className="block text-sm">Target Model</label>
                  <Input value={promptForm.targetModel} onChange={e => updatePromptField("targetModel", e.target.value)} />
                  {promptErrors.targetModel && <p className="text-red-600 text-sm">{promptErrors.targetModel}</p>}
                </div>
                <div>
                  <label className="block text-sm">Content</label>
                  <Textarea
                    rows={4}
                    value={promptForm.content}
                    onChange={e => updatePromptField("content", e.target.value)}
                  />
                  {promptErrors.content && <p className="text-red-600 text-sm">{promptErrors.content}</p>}
                </div>
                <Separator />
                <Button type="submit">Submit Prompt</Button>
              </CardContent>
            </Card>
          </form>
          <Card>
            <CardHeader>
              <CardTitle>Prompt Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>ID:</strong> {promptForm.id}</p>
              <p><strong>Title:</strong> {promptForm.title}</p>
              <p><strong>Description:</strong> {promptForm.description}</p>
              <p><strong>Attack Type:</strong> {promptForm.attackType}</p>
              <p><strong>Modalities:</strong> {promptForm.modalities.join(", ")}</p>
              <p><strong>Threat Domain:</strong> {promptForm.threatDomain}</p>
              <p><strong>Target Model:</strong> {promptForm.targetModel}</p>
              <p><strong>Content:</strong> {promptForm.content}</p>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <form onSubmit={handleProtocolSubmit} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>New Protocol Submission</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm">ID</label>
                  <Input value={protocolForm.id} onChange={e => updateProtocolField("id", e.target.value)} />
                  {protocolErrors.id && <p className="text-red-600 text-sm">{protocolErrors.id}</p>}
                </div>
                <div>
                  <label className="block text-sm">Name</label>
                  <Input value={protocolForm.name} onChange={e => updateProtocolField("name", e.target.value)} />
                  {protocolErrors.name && <p className="text-red-600 text-sm">{protocolErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm">Description</label>
                  <Textarea value={protocolForm.description} onChange={e => updateProtocolField("description", e.target.value)} />
                  {protocolErrors.description && <p className="text-red-600 text-sm">{protocolErrors.description}</p>}
                </div>
                <div>
                  <label className="block text-sm">Category</label>
                  <Select value={protocolForm.category} onValueChange={val => updateProtocolField("category", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {protocolCategories.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {protocolErrors.category && <p className="text-red-600 text-sm">{protocolErrors.category}</p>}
                </div>
                <div>
                  <label className="block text-sm">Version</label>
                  <Input value={protocolForm.version} onChange={e => updateProtocolField("version", e.target.value)} />
                  {protocolErrors.version && <p className="text-red-600 text-sm">{protocolErrors.version}</p>}
                </div>
                <div>
                  <label className="block text-sm">Organization</label>
                  <Input value={protocolForm.organization} onChange={e => updateProtocolField("organization", e.target.value)} />
                  {protocolErrors.organization && <p className="text-red-600 text-sm">{protocolErrors.organization}</p>}
                </div>
                <div>
                  <label className="block text-sm">Metrics (comma separated)</label>
                  <Input value={metricsRaw} onChange={e => setMetricsRaw(e.target.value)} />
                  {protocolErrors.metrics && <p className="text-red-600 text-sm">{protocolErrors.metrics}</p>}
                </div>
                <div>
                  <label className="block text-sm">Compatible Models (comma separated)</label>
                  <Input value={modelsRaw} onChange={e => setModelsRaw(e.target.value)} />
                  {protocolErrors.compatibleModels && <p className="text-red-600 text-sm">{protocolErrors.compatibleModels}</p>}
                </div>
                <div>
                  <label className="block text-sm">Official URL</label>
                  <Input value={protocolForm.url} onChange={e => updateProtocolField("url", e.target.value)} />
                  {protocolErrors.url && <p className="text-red-600 text-sm">{protocolErrors.url}</p>}
                </div>
                <Separator />
                <Button type="submit">Submit Protocol</Button>
              </CardContent>
            </Card>
          </form>
          <Card>
            <CardHeader>
              <CardTitle>Protocol Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>ID:</strong> {protocolForm.id}</p>
              <p><strong>Name:</strong> {protocolForm.name}</p>
              <p><strong>Description:</strong> {protocolForm.description}</p>
              <p><strong>Category:</strong> {protocolForm.category}</p>
              <p><strong>Version:</strong> {protocolForm.version}</p>
              <p><strong>Organization:</strong> {protocolForm.organization}</p>
              <p><strong>Metrics:</strong> {metricsRaw}</p>
              <p><strong>Compatible Models:</strong> {modelsRaw}</p>
              <p><strong>URL:</strong> {protocolForm.url}</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
)
}