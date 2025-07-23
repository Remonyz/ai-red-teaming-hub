// Field mappings for CSV files
const datasetFieldMapping = {
  title: ['Dataset Name'],
  source: ['Benchmark'], 
  sourceUrl: ['Dataset URL'],
  category: ['Task/Purpose'],
  description: ['Details'],
  promptCount: ['Prompt Count'],
  dateAdded: ['Date Added']
}

const protocolFieldMapping = {
  name: ['Benchmark Name'],
  category: ['Primary Focus'],
  modalities: ['Modality'],
  description: ['Description'],
  url: ['Paper URL'],
  projectUrl: ['Project/GitHub/Dataset URL'],
  dateAdded: ['Date Added']
}

// Default values for missing fields
const datasetDefaults = {
  promptCount: "Unknown",
  dateAdded: "Unknown",
  modalities: ["text"],
  testedModels: [],
  attackType: "evaluation", // More accurate default
  threatDomain: "general",
  importSource: {
    type: 'csv_file' as const,
    importDate: new Date().toISOString(),
    originalFieldNames: [],
    transformations: []
  }
}

const protocolDefaults = {
  dateAdded: "Unknown",
  version: "v1.0",
  organization: "Unknown",
  metrics: [],
  testedModels: [],
  importSource: {
    type: 'csv_file' as const,
    importDate: new Date().toISOString(),
    originalFieldNames: [],
    transformations: []
  }
}

// Helper function to apply defaults and clean data
const applyDefaults = (parsedData: any[], defaults: any, fieldMapping: any): any[] => {
  return parsedData.map((item, index) => {
    const result = { ...defaults }
    
    // Apply CSV data, overriding defaults
    Object.keys(fieldMapping).forEach(standardField => {
      const csvColumns = fieldMapping[standardField]
      for (const csvCol of csvColumns) {
        if (item[csvCol] && String(item[csvCol]).trim()) {
          let value = String(item[csvCol]).trim()
          
          // Handle special cases
          if (standardField === 'modalities' && value) {
            result[standardField] = value.split(',').map(m => m.trim()).filter(m => m.length > 0)
          } else {
            result[standardField] = value
          }
          break
        }
      }
    })
    
    // For datasets, if we have a category (Task/Purpose), use it to derive a better attackType
    if (result.category && defaults === datasetDefaults) {
      const category = result.category.toLowerCase()
      if (category.includes('backdoor')) {
        result.attackType = 'backdoor'
      } else if (category.includes('jailbreak')) {
        result.attackType = 'jailbreak'
      } else if (category.includes('classification')) {
        result.attackType = 'classification'
      } else if (category.includes('sentiment') || category.includes('bias')) {
        result.attackType = 'bias-exploit'
      } else if (category.includes('toxicity') || category.includes('harmful')) {
        result.attackType = 'harmful-content'
      } else if (category.includes('math') || category.includes('reasoning')) {
        result.attackType = 'reasoning'
      } else if (category.includes('generative') || category.includes('instruction')) {
        result.attackType = 'instruction-following'
      } else {
        result.attackType = 'evaluation'
      }
    }
    
    // Generate ID if missing
    if (!result.id) {
      const sourcePrefix = (result.source || 'Unknown').replace(/\s+/g, '').substring(0, 10)
      const titlePrefix = (result.title || result.name || 'Unknown').replace(/\s+/g, '').substring(0, 10)
      result.id = `CSV-${sourcePrefix}-${titlePrefix}-${index + 1}`
    }
    
    return result
  })
}

// Helper function to parse CSV line with proper handling of quoted fields
const parseCSVLine = (line: string): string[] => {
  const result = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  // Don't forget the last field
  result.push(current.trim())
  
  return result
}

// Function to load datasets from CSV
let cachedDatasets: any[] | null = null
const loadDatasetsFromCSV = async (): Promise<any[]> => {
  if (cachedDatasets) return cachedDatasets
  
  try {
    const response = await fetch('/data/datasets.csv')
    if (!response.ok) throw new Error('Failed to fetch datasets.csv')
    
    const csvText = await response.text()
    const lines = csvText.split('\n').filter(line => line.trim())
    
    if (lines.length <= 1) return [] // No data rows
    
    const headers = parseCSVLine(lines[0])
    const data = lines.slice(1).map(line => {
      const values = parseCSVLine(line)
      const row: any = {}
      headers.forEach((header, i) => {
        row[header] = values[i] || ''
      })
      return row
    })
    
    cachedDatasets = applyDefaults(data, datasetDefaults, datasetFieldMapping)
    return cachedDatasets
  } catch (error) {
    console.warn('Failed to load datasets.csv, using empty array:', error)
    return []
  }
}

// Function to load protocols from CSV
let cachedProtocols: any[] | null = null
const loadProtocolsFromCSV = async (): Promise<any[]> => {
  if (cachedProtocols) return cachedProtocols
  
  try {
    const response = await fetch('/data/protocols.csv')
    if (!response.ok) throw new Error('Failed to fetch protocols.csv')
    
    const csvText = await response.text()
    const lines = csvText.split('\n').filter(line => line.trim())
    
    if (lines.length <= 1) return [] // No data rows
    
    const headers = parseCSVLine(lines[0])
    const data = lines.slice(1).map(line => {
      const values = parseCSVLine(line)
      const row: any = {}
      headers.forEach((header, i) => {
        row[header] = values[i] || ''
      })
      return row
    })
    
    cachedProtocols = applyDefaults(data, protocolDefaults, protocolFieldMapping)
    return cachedProtocols
  } catch (error) {
    console.warn('Failed to load protocols.csv, using empty array:', error)
    return []
  }
}

// Function to get all datasets from CSV only
export const getAllDatasets = async () => {
  return await loadDatasetsFromCSV()
}

// Function to get all protocols from CSV only
export const getAllProtocols = async () => {
  return await loadProtocolsFromCSV()
}


