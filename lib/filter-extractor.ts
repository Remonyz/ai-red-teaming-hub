/**
 * Dynamic Filter Extraction System
 * 
 * Automatically extracts unique values from datasets to generate
 * filter options without requiring hardcoded categories.
 */

export interface FilterOptions {
  [fieldName: string]: FilterOptionConfig
}

export interface FilterOptionConfig {
  values: string[]
  type: FilterType
  label: string
  multiSelect?: boolean
  sortBy?: 'alphabetical' | 'frequency' | 'none'
}

export type FilterType = 
  | 'select' 
  | 'multiselect' 
  | 'range' 
  | 'date' 
  | 'boolean' 
  | 'search'

export interface FilterExtractionOptions {
  maxOptionsPerField?: number
  minFrequency?: number
  excludeEmpty?: boolean
  caseSensitive?: boolean
  sortBy?: 'alphabetical' | 'frequency'
  customLabels?: Record<string, string>
}

export interface FilterStats {
  fieldName: string
  totalValues: number
  uniqueValues: number
  nullCount: number
  emptyCount: number
  averageLength: number
  mostCommon: Array<{ value: string; count: number }>
  suggestedType: FilterType
}

// Default configuration for different field types
const FIELD_TYPE_CONFIG: Record<string, Partial<FilterOptionConfig>> = {
  // Categorical fields (typically multi-select)
  category: { type: 'multiselect', multiSelect: true, label: 'Category' },
  attackType: { type: 'multiselect', multiSelect: true, label: 'Attack Type' },
  threatDomain: { type: 'select', label: 'Threat Domain' },
  testedModels: { type: 'multiselect', multiSelect: true, label: 'Tested Models' },
  source: { type: 'multiselect', multiSelect: true, label: 'Source' },
  organization: { type: 'multiselect', multiSelect: true, label: 'Organization' },
  tags: { type: 'multiselect', multiSelect: true, label: 'Tags' },
  
  // Range/numeric fields
  successRate: { type: 'range', label: 'Success Rate' },
  complexity: { type: 'range', label: 'Complexity' },
  promptCount: { type: 'range', label: 'Prompt Count' },
  riskLevel: { type: 'range', label: 'Risk Level' },
  
  // Date fields
  dateAdded: { type: 'date', label: 'Date Added' },
  dateCreated: { type: 'date', label: 'Date Created' },
  dateUpdated: { type: 'date', label: 'Date Updated' },
  
  // Boolean fields
  isPublic: { type: 'boolean', label: 'Public' },
  isActive: { type: 'boolean', label: 'Active' },
  
  // Text search fields
  title: { type: 'search', label: 'Title' },
  description: { type: 'search', label: 'Description' },
  content: { type: 'search', label: 'Content' }
}

/**
 * Extract unique values from a field, handling various data types
 */
function extractUniqueValues(
  data: any[], 
  fieldName: string,
  options: FilterExtractionOptions = {}
): string[] {
  const values = new Set<string>()
  const excludeEmpty = options.excludeEmpty ?? true
  
  for (const item of data) {
    const value = item[fieldName]
    
    if (value === null || value === undefined) {
      if (!excludeEmpty) values.add('(null)')
      continue
    }
    
    if (Array.isArray(value)) {
      // Handle array fields (like tags)
      value.forEach(v => {
        const stringValue = String(v).trim()
        if (stringValue || !excludeEmpty) {
          values.add(stringValue)
        }
      })
    } else if (typeof value === 'string' && value.includes(',')) {
      // Handle comma-separated values
      value.split(',').forEach(v => {
        const stringValue = v.trim()
        if (stringValue || !excludeEmpty) {
          values.add(stringValue)
        }
      })
    } else {
      // Handle single values
      const stringValue = String(value).trim()
      if (stringValue || !excludeEmpty) {
        values.add(stringValue)
      }
    }
  }
  
  return Array.from(values)
}

/**
 * Calculate frequency of each value
 */
function calculateFrequencies(
  data: any[],
  fieldName: string
): Map<string, number> {
  const frequencies = new Map<string, number>()
  
  for (const item of data) {
    const value = item[fieldName]
    
    if (value === null || value === undefined) continue
    
    if (Array.isArray(value)) {
      value.forEach(v => {
        const stringValue = String(v).trim()
        if (stringValue) {
          frequencies.set(stringValue, (frequencies.get(stringValue) || 0) + 1)
        }
      })
    } else if (typeof value === 'string' && value.includes(',')) {
      value.split(',').forEach(v => {
        const stringValue = v.trim()
        if (stringValue) {
          frequencies.set(stringValue, (frequencies.get(stringValue) || 0) + 1)
        }
      })
    } else {
      const stringValue = String(value).trim()
      if (stringValue) {
        frequencies.set(stringValue, (frequencies.get(stringValue) || 0) + 1)
      }
    }
  }
  
  return frequencies
}

/**
 * Determine the most appropriate filter type for a field
 */
function suggestFilterType(
  fieldName: string,
  values: string[],
  frequencies: Map<string, number>
): FilterType {
  // Check for predefined field types
  if (FIELD_TYPE_CONFIG[fieldName]) {
    return FIELD_TYPE_CONFIG[fieldName].type!
  }
  
  // Infer based on field name patterns
  const lowerFieldName = fieldName.toLowerCase()
  
  // Date fields
  if (lowerFieldName.includes('date') || lowerFieldName.includes('time')) {
    return 'date'
  }
  
  // Numeric/range fields
  if (lowerFieldName.includes('rate') || 
      lowerFieldName.includes('score') || 
      lowerFieldName.includes('count') || 
      lowerFieldName.includes('level') ||
      lowerFieldName.includes('percentage')) {
    return 'range'
  }
  
  // Boolean fields
  if (values.length <= 2 && 
      values.every(v => ['true', 'false', 'yes', 'no', '1', '0'].includes(v.toLowerCase()))) {
    return 'boolean'
  }
  
  // Check if all values are numeric
  const numericValues = values.filter(v => !isNaN(Number(v)) && v.trim() !== '')
  if (numericValues.length === values.length && values.length > 2) {
    return 'range'
  }
  
  // Large text fields should be search
  if (lowerFieldName.includes('description') || 
      lowerFieldName.includes('content') || 
      lowerFieldName.includes('text')) {
    return 'search'
  }
  
  // Many unique values suggest search
  if (values.length > 50) {
    return 'search'
  }
  
  // Few unique values suggest select/multiselect
  if (values.length <= 20) {
    // Check if commonly multiple values per record (suggests multiselect)
    const avgFrequency = Array.from(frequencies.values()).reduce((a, b) => a + b, 0) / frequencies.size
    return avgFrequency > 1 ? 'multiselect' : 'select'
  }
  
  // Default to multiselect for categorical data
  return 'multiselect'
}

/**
 * Generate statistics for a field
 */
export function analyzeField(
  data: any[],
  fieldName: string,
  options: FilterExtractionOptions = {}
): FilterStats {
  const values = extractUniqueValues(data, fieldName, options)
  const frequencies = calculateFrequencies(data, fieldName)
  
  let nullCount = 0
  let emptyCount = 0
  let totalLength = 0
  let nonEmptyCount = 0
  
  for (const item of data) {
    const value = item[fieldName]
    if (value === null || value === undefined) {
      nullCount++
    } else if (String(value).trim() === '') {
      emptyCount++
    } else {
      totalLength += String(value).length
      nonEmptyCount++
    }
  }
  
  const mostCommon = Array.from(frequencies.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([value, count]) => ({ value, count }))
  
  const suggestedType = suggestFilterType(fieldName, values, frequencies)
  
  return {
    fieldName,
    totalValues: data.length,
    uniqueValues: values.length,
    nullCount,
    emptyCount,
    averageLength: nonEmptyCount > 0 ? totalLength / nonEmptyCount : 0,
    mostCommon,
    suggestedType
  }
}

/**
 * Extract filter options from dataset
 */
export function extractFilterOptions(
  data: any[],
  filterableFields: string[] = [],
  options: FilterExtractionOptions = {}
): FilterOptions {
  const {
    maxOptionsPerField = 100,
    minFrequency = 1,
    sortBy = 'alphabetical',
    customLabels = {}
  } = options
  
  const filterOptions: FilterOptions = {}
  
  // Auto-detect filterable fields if not provided
  if (filterableFields.length === 0) {
    const sampleItem = data[0] || {}
    filterableFields = Object.keys(sampleItem).filter(field => {
      const stats = analyzeField(data, field, options)
      // Include fields that have reasonable number of unique values
      return stats.uniqueValues > 1 && stats.uniqueValues <= maxOptionsPerField && 
             stats.suggestedType !== 'search'
    })
  }
  
  for (const fieldName of filterableFields) {
    const stats = analyzeField(data, fieldName, options)
    
    // Skip fields with too few or too many unique values for filtering
    if (stats.uniqueValues <= 1 || stats.uniqueValues > maxOptionsPerField) {
      continue
    }
    
    const values = extractUniqueValues(data, fieldName, options)
    const frequencies = calculateFrequencies(data, fieldName)
    
    // Filter by minimum frequency
    const filteredValues = values.filter(value => 
      (frequencies.get(value) || 0) >= minFrequency
    )
    
    if (filteredValues.length === 0) continue
    
    // Sort values
    let sortedValues = filteredValues
    if (sortBy === 'alphabetical') {
      sortedValues = filteredValues.sort((a, b) => 
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
      )
    } else if (sortBy === 'frequency') {
      sortedValues = filteredValues.sort((a, b) => 
        (frequencies.get(b) || 0) - (frequencies.get(a) || 0)
      )
    }
    
    // Get field configuration
    const fieldConfig = FIELD_TYPE_CONFIG[fieldName] || {}
    const label = customLabels[fieldName] || 
                  fieldConfig.label || 
                  fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
    
    filterOptions[fieldName] = {
      values: sortedValues.slice(0, maxOptionsPerField),
      type: stats.suggestedType,
      label,
      multiSelect: fieldConfig.multiSelect ?? (stats.suggestedType === 'multiselect'),
      sortBy: sortBy
    }
  }
  
  return filterOptions
}

/**
 * Extract filter options from multiple datasets (combined)
 */
export function extractCombinedFilterOptions(
  datasets: Array<{ data: any[]; name: string }>,
  filterableFields: string[] = [],
  options: FilterExtractionOptions = {}
): FilterOptions {
  // Combine all data
  const combinedData = datasets.flatMap(dataset => 
    dataset.data.map(item => ({
      ...item,
      _datasetSource: dataset.name // Add source tracking
    }))
  )
  
  // Include dataset source as a filterable field
  const allFilterableFields = filterableFields.length > 0 
    ? [...filterableFields, '_datasetSource']
    : []
  
  const filterOptions = extractFilterOptions(combinedData, allFilterableFields, options)
  
  // Rename the source field for better UX
  if (filterOptions._datasetSource) {
    filterOptions.datasetSource = {
      ...filterOptions._datasetSource,
      label: 'Dataset Source'
    }
    delete filterOptions._datasetSource
  }
  
  return filterOptions
}

/**
 * Update filter options when new data is added
 */
export function updateFilterOptions(
  currentOptions: FilterOptions,
  newData: any[],
  options: FilterExtractionOptions = {}
): FilterOptions {
  const updatedOptions: FilterOptions = { ...currentOptions }
  
  for (const [fieldName, config] of Object.entries(currentOptions)) {
    const newValues = extractUniqueValues(newData, fieldName, options)
    const existingValues = new Set(config.values)
    
    // Add new unique values
    const uniqueNewValues = newValues.filter(value => !existingValues.has(value))
    
    if (uniqueNewValues.length > 0) {
      const combinedValues = [...config.values, ...uniqueNewValues]
      
      // Re-sort if needed
      let sortedValues = combinedValues
      if (config.sortBy === 'alphabetical') {
        sortedValues = combinedValues.sort((a, b) => 
          a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
        )
      }
      // Note: Frequency sorting would require recalculating with full dataset
      
      updatedOptions[fieldName] = {
        ...config,
        values: sortedValues.slice(0, options.maxOptionsPerField || 100)
      }
    }
  }
  
  return updatedOptions
}

/**
 * Get field analysis summary for UI display
 */
export interface DatasetAnalysis {
  totalRecords: number
  totalFields: number
  filterableFields: FilterStats[]
  recommendedFilters: string[]
  dataQuality: {
    completeness: number // Percentage of non-null values across all fields
    consistency: number  // How consistent are the field types
  }
}

export function analyzeDataset(
  data: any[],
  options: FilterExtractionOptions = {}
): DatasetAnalysis {
  if (data.length === 0) {
    return {
      totalRecords: 0,
      totalFields: 0,
      filterableFields: [],
      recommendedFilters: [],
      dataQuality: { completeness: 0, consistency: 0 }
    }
  }
  
  const sampleItem = data[0]
  const fieldNames = Object.keys(sampleItem)
  const fieldStats = fieldNames.map(field => analyzeField(data, field, options))
  
  // Calculate data quality metrics
  let totalCells = data.length * fieldNames.length
  let nonNullCells = 0
  
  for (const item of data) {
    for (const field of fieldNames) {
      if (item[field] !== null && item[field] !== undefined && String(item[field]).trim() !== '') {
        nonNullCells++
      }
    }
  }
  
  const completeness = totalCells > 0 ? (nonNullCells / totalCells) * 100 : 0
  
  // Recommend filters based on field characteristics
  const recommendedFilters = fieldStats
    .filter(stat => 
      stat.uniqueValues > 1 && 
      stat.uniqueValues <= 50 && 
      stat.suggestedType !== 'search' &&
      (stat.totalValues - stat.nullCount - stat.emptyCount) / stat.totalValues > 0.5 // At least 50% non-empty
    )
    .sort((a, b) => b.uniqueValues - a.uniqueValues) // Prefer more diverse fields
    .slice(0, 10) // Top 10 recommendations
    .map(stat => stat.fieldName)
  
  return {
    totalRecords: data.length,
    totalFields: fieldNames.length,
    filterableFields: fieldStats,
    recommendedFilters,
    dataQuality: {
      completeness,
      consistency: 85 // Placeholder - could implement more sophisticated consistency analysis
    }
  }
}