import Papa from 'papaparse'

export interface CSVParseOptions {
  header?: boolean
  skipEmptyLines?: boolean
  transformHeader?: (header: string) => string
  dynamicTyping?: boolean
  encoding?: string
  delimiter?: string
}

export interface CSVParseResult<T = any> {
  data: T[]
  errors: Papa.ParseError[]
  meta: Papa.ParseMeta
  success: boolean
  message?: string
}

export interface CSVParseProgress {
  loaded: number
  total: number
  percentage: number
}

export interface CSVSource {
  type: 'file' | 'url' | 'text'
  source: File | string
}

// Default parsing options
const DEFAULT_OPTIONS: Papa.ParseConfig = {
  header: true,
  skipEmptyLines: true,
  dynamicTyping: true,
  transformHeader: (header: string) => {
    // Normalize header names: trim whitespace, lowercase, replace spaces/special chars
    return header
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
      .replace(/[\s_-]+/g, '_') // Replace spaces, underscores, hyphens with single underscore
  },
  transform: (value: string) => {
    // Auto-transform common data types
    if (!value || value.trim() === '') return null
    
    const trimmedValue = value.trim()
    
    // Handle comma-separated values for array fields
    if (trimmedValue.includes(',') && !trimmedValue.match(/^\d+,\d+$/)) {
      // Split by comma but exclude numeric values like "1,234"
      return trimmedValue
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0)
    }
    
    // Handle boolean values
    if (trimmedValue.toLowerCase() === 'true') return true
    if (trimmedValue.toLowerCase() === 'false') return false
    if (trimmedValue.toLowerCase() === 'yes') return true
    if (trimmedValue.toLowerCase() === 'no') return false
    
    // Handle null/undefined values
    if (['null', 'undefined', 'n/a', 'na', ''].includes(trimmedValue.toLowerCase())) {
      return null
    }
    
    // Return the trimmed value for everything else
    return trimmedValue
  }
}

/**
 * Parse CSV from a File object
 */
export const parseCSVFromFile = <T = any>(
  file: File,
  options: CSVParseOptions = {},
  onProgress?: (progress: CSVParseProgress) => void
): Promise<CSVParseResult<T>> => {
  return new Promise((resolve) => {
    const parseOptions: Papa.ParseConfig = {
      ...DEFAULT_OPTIONS,
      ...options,
      complete: (results: Papa.ParseResult<T>) => {
        resolve(processParseResults(results))
      },
      error: (error: Error) => {
        resolve({
          data: [],
          errors: [{ type: 'Delimiter' as Papa.ParseErrorType, code: 'UndetectableDelimiter' as Papa.ParseErrorCode, message: error.message, row: 0 }],
          meta: {} as Papa.ParseMeta,
          success: false,
          message: `Failed to parse file: ${error.message}`
        })
      },
      step: onProgress ? (results: Papa.ParseStepResult<T>) => {
        if (results.meta.cursor && file.size) {
          const progress: CSVParseProgress = {
            loaded: results.meta.cursor,
            total: file.size,
            percentage: Math.round((results.meta.cursor / file.size) * 100)
          }
          onProgress(progress)
        }
      } : undefined
    }

    Papa.parse<T>(file, parseOptions)
  })
}

/**
 * Parse CSV from a URL
 */
export const parseCSVFromURL = <T = any>(
  url: string,
  options: CSVParseOptions = {},
  onProgress?: (progress: CSVParseProgress) => void
): Promise<CSVParseResult<T>> => {
  return new Promise((resolve) => {
    const parseOptions: Papa.ParseConfig = {
      ...DEFAULT_OPTIONS,
      ...options,
      complete: (results: Papa.ParseResult<T>) => {
        resolve(processParseResults(results))
      },
      error: (error: Error) => {
        resolve({
          data: [],
          errors: [{ type: 'Delimiter' as Papa.ParseErrorType, code: 'UndetectableDelimiter' as Papa.ParseErrorCode, message: error.message, row: 0 }],
          meta: {} as Papa.ParseMeta,
          success: false,
          message: `Failed to fetch CSV from URL: ${error.message}`
        })
      }
    }

    Papa.parse(url, parseOptions)
  })
}

/**
 * Parse CSV from text string
 */
export const parseCSVFromText = <T = any>(
  csvText: string,
  options: CSVParseOptions = {}
): Promise<CSVParseResult<T>> => {
  return new Promise((resolve) => {
    const parseOptions: Papa.ParseConfig = {
      ...DEFAULT_OPTIONS,
      ...options,
      complete: (results: Papa.ParseResult<T>) => {
        resolve(processParseResults(results))
      }
    }

    Papa.parse(csvText, parseOptions)
  })
}

/**
 * Generic CSV parser that handles all source types
 */
export const parseCSV = <T = any>(
  source: CSVSource,
  options: CSVParseOptions = {},
  onProgress?: (progress: CSVParseProgress) => void
): Promise<CSVParseResult<T>> => {
  switch (source.type) {
    case 'file':
      return parseCSVFromFile<T>(source.source as File, options, onProgress)
    case 'url':
      return parseCSVFromURL<T>(source.source as string, options, onProgress)
    case 'text':
      return parseCSVFromText<T>(source.source as string, options)
    default:
      return Promise.resolve({
        data: [],
        errors: [{ type: 'Delimiter' as Papa.ParseErrorType, code: 'UndetectableDelimiter' as Papa.ParseErrorCode, message: 'Invalid source type', row: 0 }],
        meta: {} as Papa.ParseMeta,
        success: false,
        message: 'Invalid CSV source type provided'
      })
  }
}

/**
 * Process Papa Parse results into our standardized format
 */
function processParseResults<T>(results: Papa.ParseResult<T>): CSVParseResult<T> {
  const hasErrors = results.errors && results.errors.length > 0
  const criticalErrors = hasErrors ? 
    results.errors.filter(error => error.type === 'Delimiter' || error.type === 'Quotes') : []
  
  const success = !hasErrors || criticalErrors.length === 0
  
  let message: string | undefined
  if (!success) {
    message = `Parsing failed: ${criticalErrors.map(e => e.message).join(', ')}`
  } else if (hasErrors) {
    message = `Parsing completed with ${results.errors.length} warnings`
  }

  return {
    data: results.data || [],
    errors: results.errors || [],
    meta: results.meta,
    success,
    message
  }
}

/**
 * Detect delimiter automatically from CSV text sample
 */
export const detectDelimiter = (csvSample: string): string => {
  const delimiters = [',', ';', '\t', '|']
  const lines = csvSample.split('\n').slice(0, 5) // Check first 5 lines
  
  let bestDelimiter = ','
  let maxColumns = 0
  
  for (const delimiter of delimiters) {
    let columnCount = 0
    let consistentCount = true
    let firstLineColumns = 0
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      const columns = line.split(delimiter).length
      if (i === 0) {
        firstLineColumns = columns
      } else if (columns !== firstLineColumns && Math.abs(columns - firstLineColumns) > 1) {
        consistentCount = false
        break
      }
      columnCount = Math.max(columnCount, columns)
    }
    
    if (consistentCount && columnCount > maxColumns && columnCount > 1) {
      maxColumns = columnCount
      bestDelimiter = delimiter
    }
  }
  
  return bestDelimiter
}

/**
 * Get a preview of CSV data (first N rows) for validation
 */
export const getCSVPreview = async <T = any>(
  source: CSVSource,
  previewRows: number = 5
): Promise<CSVParseResult<T>> => {
  const options: CSVParseOptions = {
    header: true,
    skipEmptyLines: true,
    transformHeader: DEFAULT_OPTIONS.transformHeader,
    transform: DEFAULT_OPTIONS.transform
  }
  
  return parseCSV<T>(source, options)
}

/**
 * Validate CSV structure and provide suggestions
 */
export interface CSVValidationResult {
  isValid: boolean
  issues: string[]
  suggestions: string[]
  detectedColumns: string[]
  rowCount: number
  estimatedSize: number
}

export const validateCSVStructure = async (
  source: CSVSource
): Promise<CSVValidationResult> => {
  const preview = await getCSVPreview(source, 10)
  
  const issues: string[] = []
  const suggestions: string[] = []
  
  if (!preview.success) {
    issues.push(`Parse error: ${preview.message}`)
  }
  
  if (preview.errors.length > 0) {
    issues.push(`Found ${preview.errors.length} parsing warnings`)
  }
  
  const detectedColumns = preview.meta.fields || []
  
  if (detectedColumns.length === 0) {
    issues.push('No columns detected - check if file has headers')
  } else if (detectedColumns.length === 1) {
    suggestions.push('Only one column detected - check delimiter settings')
  }
  
  if (preview.data.length === 0) {
    issues.push('No data rows found')
  }
  
  // Check for common issues
  const emptyHeaders = detectedColumns.filter(col => !col || col.trim() === '').length
  if (emptyHeaders > 0) {
    issues.push(`${emptyHeaders} empty column headers found`)
    suggestions.push('Ensure all columns have descriptive headers')
  }
  
  // Check for duplicate headers
  const duplicateHeaders = detectedColumns.filter(
    (col, index) => detectedColumns.indexOf(col) !== index
  )
  if (duplicateHeaders.length > 0) {
    issues.push(`Duplicate column headers: ${duplicateHeaders.join(', ')}`)
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
    detectedColumns,
    rowCount: preview.data.length,
    estimatedSize: 0 // Size not available in preview
  }
}