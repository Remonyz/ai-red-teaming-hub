import jsPDF from "jspdf"

export interface PromptData {
  id?: string
  title: string
  description: string
  attackType: string
  threatDomain: string
  testedModels?: string[]
  source: string
  sourceUrl?: string
  dateAdded: string
  content?: string
  targetModel?: string
  successRate?: number
  complexity?: number
}

export interface ProtocolData {
  id: string
  name: string
  description: string
  category: string
  version?: string
  organization?: string
  metrics?: string[]
  testedModels?: string[]
  compatibleModels?: string[]
  url?: string
}

// Helper function to generate timestamp for file names
const getTimestamp = (): string => {
  const now = new Date()
  return now.toISOString().split('T')[0].replace(/-/g, '')
}

// Helper function to trigger download
const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Export Prompts as JSON
export const exportPromptsAsJSON = (data: PromptData[]): void => {
  const jsonContent = JSON.stringify(data, null, 2)
  const filename = `red-team-prompts-${getTimestamp()}.json`
  downloadFile(jsonContent, filename, 'application/json')
}

// Export Protocols as JSON
export const exportProtocolsAsJSON = (data: ProtocolData[]): void => {
  const jsonContent = JSON.stringify(data, null, 2)
  const filename = `evaluation-protocols-${getTimestamp()}.json`
  downloadFile(jsonContent, filename, 'application/json')
}

// Export Prompts as CSV
export const exportPromptsAsCSV = (data: PromptData[]): void => {
  const headers = [
    'Title', 'Description', 'Attack Type', 
    'Threat Domain', 'Tested Models', 'Source', 
    'Source URL', 'Date Added'
  ]
  
  const csvRows = [
    headers.join(','),
    ...data.map(prompt => [
      `"${(prompt.title || '').replace(/"/g, '""')}"`,
      `"${(prompt.description || '').replace(/"/g, '""')}"`,
      `"${prompt.attackType || ''}"`,
      `"${prompt.threatDomain || ''}"`,
      `"${(prompt.testedModels || []).join('; ')}"`,
      `"${(prompt.source || '').replace(/"/g, '""')}"`,
      `"${prompt.sourceUrl || ''}"`,
      `"${prompt.dateAdded || ''}"`
    ].join(','))
  ]
  
  const csvContent = csvRows.join('\n')
  const filename = `red-team-prompts-${getTimestamp()}.csv`
  downloadFile(csvContent, filename, 'text/csv')
}

// Export Protocols as CSV
export const exportProtocolsAsCSV = (data: ProtocolData[]): void => {
  const headers = [
    'Name', 'Description', 'Category', 'Version', 
    'Organization', 'Metrics', 'Tested Models', 'URL'
  ]
  
  const csvRows = [
    headers.join(','),
    ...data.map(protocol => [
      `"${(protocol.name || '').replace(/"/g, '""')}"`,
      `"${(protocol.description || '').replace(/"/g, '""')}"`,
      `"${protocol.category || ''}"`,
      `"${protocol.version || ''}"`,
      `"${(protocol.organization || '').replace(/"/g, '""')}"`,
      `"${(protocol.metrics || []).join('; ')}"`,
      `"${(protocol.testedModels || []).join('; ')}"`,
      `"${protocol.url || ''}"`
    ].join(','))
  ]
  
  const csvContent = csvRows.join('\n')
  const filename = `evaluation-protocols-${getTimestamp()}.csv`
  downloadFile(csvContent, filename, 'text/csv')
}

// Export Prompts as PDF
export const exportPromptsAsPDF = (data: PromptData[]): void => {
  const doc = new jsPDF()
  const pageHeight = doc.internal.pageSize.height
  let yPosition = 20
  
  // Title
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Red Team Prompts Database', 20, yPosition)
  yPosition += 15
  
  // Metadata
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition)
  doc.text(`Total Prompts: ${data.length}`, 120, yPosition)
  yPosition += 20
  
  // Process each prompt
  data.forEach((prompt, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage()
      yPosition = 20
    }
    
    // Prompt header
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`${index + 1}. ${prompt.title}`, 20, yPosition)
    yPosition += 8
    
    // Prompt details
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    
    // Basic info
    doc.text(`Attack Type: ${prompt.attackType}`, 20, yPosition)
    doc.text(`Threat Domain: ${prompt.threatDomain}`, 100, yPosition)
    yPosition += 6
    
    // Tested models
    if (prompt.testedModels && prompt.testedModels.length > 0) {
      doc.text(`Tested Models: ${prompt.testedModels.join(', ')}`, 20, yPosition)
      yPosition += 6
    }
    
    // Skip modalities section (removed from interface)
    
    // Description
    doc.setFont('helvetica', 'italic')
    const descriptionLines = doc.splitTextToSize(prompt.description, 160)
    doc.text(descriptionLines, 20, yPosition)
    yPosition += descriptionLines.length * 4 + 4
    
    // Source
    doc.setFont('helvetica', 'normal')
    doc.text(`Source: ${prompt.source} (${prompt.dateAdded})`, 20, yPosition)
    yPosition += 10
    
    // Separator line
    doc.setDrawColor(200, 200, 200)
    doc.line(20, yPosition, 190, yPosition)
    yPosition += 10
  })
  
  // Save the PDF
  const filename = `red-team-prompts-${getTimestamp()}.pdf`
  doc.save(filename)
}

// Export Protocols as PDF
export const exportProtocolsAsPDF = (data: ProtocolData[]): void => {
  const doc = new jsPDF()
  const pageHeight = doc.internal.pageSize.height
  let yPosition = 20
  
  // Title
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('AI Safety Evaluation Protocols', 20, yPosition)
  yPosition += 15
  
  // Metadata
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition)
  doc.text(`Total Protocols: ${data.length}`, 120, yPosition)
  yPosition += 20
  
  // Process each protocol
  data.forEach((protocol, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 80) {
      doc.addPage()
      yPosition = 20
    }
    
    // Protocol header
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`${index + 1}. ${protocol.name}`, 20, yPosition)
    yPosition += 10
    
    // Protocol details
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    
    // ID and basic info
    doc.text(`ID: ${protocol.id}`, 20, yPosition)
    doc.text(`Version: ${protocol.version}`, 80, yPosition)
    doc.text(`Category: ${protocol.category}`, 140, yPosition)
    yPosition += 6
    
    // Organization
    if (protocol.organization) {
      doc.text(`Organization: ${protocol.organization}`, 20, yPosition)
      yPosition += 8
    }
    
    // Description
    doc.setFont('helvetica', 'italic')
    const descriptionLines = doc.splitTextToSize(protocol.description, 160)
    doc.text(descriptionLines, 20, yPosition)
    yPosition += descriptionLines.length * 4 + 6
    
    // Metrics
    if (protocol.metrics && protocol.metrics.length > 0) {
      doc.setFont('helvetica', 'bold')
      doc.text('Metrics:', 20, yPosition)
      yPosition += 4
      doc.setFont('helvetica', 'normal')
      const metricsText = protocol.metrics.join(', ')
      const metricsLines = doc.splitTextToSize(metricsText, 160)
      doc.text(metricsLines, 25, yPosition)
      yPosition += metricsLines.length * 4 + 4
    }
    
    // Compatible Models
    const models = protocol.compatibleModels || protocol.testedModels || []
    if (models.length > 0) {
      doc.setFont('helvetica', 'bold')
      doc.text('Compatible Models:', 20, yPosition)
      yPosition += 4
      doc.setFont('helvetica', 'normal')
      const modelsText = models.join(', ')
      const modelsLines = doc.splitTextToSize(modelsText, 160)
      doc.text(modelsLines, 25, yPosition)
      yPosition += modelsLines.length * 4 + 4
    }
    
    // URL
    doc.text(`URL: ${protocol.url}`, 20, yPosition)
    yPosition += 10
    
    // Separator line
    doc.setDrawColor(200, 200, 200)
    doc.line(20, yPosition, 190, yPosition)
    yPosition += 15
  })
  
  // Save the PDF
  const filename = `evaluation-protocols-${getTimestamp()}.pdf`
  doc.save(filename)
}

// Export Prompts as Text
export const exportPromptsAsText = (data: PromptData[]): void => {
  const timestamp = getTimestamp()
  data.forEach((prompt, index) => {
    const content = [
      `Title: ${prompt.title}`,
      ...(prompt.id ? [`ID: ${prompt.id}`] : []),
      `Description: ${prompt.description}`,
      `Attack Type: ${prompt.attackType}`,
      `Threat Domain: ${prompt.threatDomain}`,
      ...(prompt.targetModel ? [`Target Model: ${prompt.targetModel}`] : []),
      ...(prompt.testedModels && prompt.testedModels.length > 0 ? [`Tested Models: ${prompt.testedModels.join(', ')}`] : []),
      ...(prompt.successRate ? [`Success Rate: ${prompt.successRate}%`] : []),
      `Source: ${prompt.source}${prompt.sourceUrl ? ` (${prompt.sourceUrl})` : ''}`,
      `Date Added: ${prompt.dateAdded}`,
      ...(prompt.complexity ? [`Complexity: ${prompt.complexity}/5`] : []),
      ``,
      ...(prompt.content ? [`Prompt Content:`, `${prompt.content}`] : [])
    ].join('\n')
    const filename = `red-team-prompt-${prompt.id || index + 1}-${timestamp}.txt`
    downloadFile(content, filename, 'text/plain')
  })
}

// Export Protocols as Text
export const exportProtocolsAsText = (data: ProtocolData[]): void => {
  const timestamp = getTimestamp()
  data.forEach((protocol, index) => {
    const content = [
      `Name: ${protocol.name}`,
      `ID: ${protocol.id}`,
      `Description: ${protocol.description}`,
      `Category: ${protocol.category}`,
      ...(protocol.version ? [`Version: ${protocol.version}`] : []),
      ...(protocol.organization ? [`Organization: ${protocol.organization}`] : []),
      ...(protocol.metrics && protocol.metrics.length > 0 ? [`Metrics: ${protocol.metrics.join(', ')}`] : []),
      ...(protocol.testedModels && protocol.testedModels.length > 0 ? [`Tested Models: ${protocol.testedModels.join(', ')}`] : []),
      ...(protocol.compatibleModels && protocol.compatibleModels.length > 0 ? [`Compatible Models: ${protocol.compatibleModels.join(', ')}`] : []),
      ...(protocol.url ? [`URL: ${protocol.url}`] : [])
    ].join('\n')
    const filename = `evaluation-protocol-${protocol.id}-${timestamp}.txt`
    downloadFile(content, filename, 'text/plain')
  })
}