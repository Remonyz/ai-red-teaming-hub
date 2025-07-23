/**
 * Data Validation and Duplicate Detection System
 * 
 * Provides validation for imported CSV data and intelligent duplicate detection
 * without requiring persistent IDs.
 */

export interface ValidationRule {
  field: string
  type: 'required' | 'format' | 'range' | 'custom'
  message: string
  validator?: (value: any, item: any, allData: any[]) => boolean
  params?: any
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  duplicates: DuplicateGroup[]
  summary: ValidationSummary
}

export interface ValidationError {
  row: number
  field: string
  value: any
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationWarning extends ValidationError {
  suggestion?: string
}

export interface DuplicateGroup {
  indices: number[]
  matchType: 'exact' | 'similar' | 'potential'
  confidence: number
  matchingFields: string[]
  items: any[]
}

export interface ValidationSummary {
  totalRows: number
  validRows: number
  errorCount: number
  warningCount: number
  duplicateCount: number
  completenessScore: number
  qualityScore: number
}

export interface ValidationOptions {
  requiredFields?: string[]
  allowEmptyOptionalFields?: boolean
  duplicateDetection?: DuplicateDetectionOptions
  customRules?: ValidationRule[]
  strictMode?: boolean
}

export interface DuplicateDetectionOptions {
  enabled?: boolean
  keyFields?: string[]
  similarity?: {
    threshold?: number
    algorithm?: 'levenshtein' | 'jaccard' | 'cosine'
  }
  ignoreCase?: boolean
  trimWhitespace?: boolean
}

// Default validation rules for common data types
const DEFAULT_VALIDATION_RULES: ValidationRule[] = [
  {
    field: 'title',
    type: 'required',
    message: 'Title is required and cannot be empty'
  },
  {
    field: 'description', 
    type: 'required',
    message: 'Description is required and cannot be empty'
  },
  {
    field: 'sourceUrl',
    type: 'format',
    message: 'Source URL must be a valid URL format',
    validator: (value) => {
      if (!value) return true // Optional field
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    }
  },
  {
    field: 'dateAdded',
    type: 'format',
    message: 'Date must be in a valid format (YYYY-MM-DD, MM/DD/YYYY, etc.)',
    validator: (value) => {
      if (!value) return true // Optional field
      const date = new Date(value)
      return !isNaN(date.getTime())
    }
  },
  {
    field: 'successRate',
    type: 'range',
    message: 'Success rate must be between 0 and 100',
    validator: (value) => {
      if (!value && value !== 0) return true // Optional field
      const num = Number(value)
      return !isNaN(num) && num >= 0 && num <= 100
    }
  },
  {
    field: 'complexity',
    type: 'range',
    message: 'Complexity must be between 1 and 5',
    validator: (value) => {
      if (!value && value !== 0) return true // Optional field
      const num = Number(value)
      return !isNaN(num) && num >= 1 && num <= 5
    }
  }
]

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  const matrix: number[][] = []

  if (len1 === 0) return len2
  if (len2 === 0) return len1

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[len1][len2]
}

/**
 * Calculate string similarity (0-1 scale)
 */
function calculateSimilarity(str1: string, str2: string, algorithm: 'levenshtein' | 'jaccard' | 'cosine' = 'levenshtein'): number {
  if (!str1 || !str2) return 0
  if (str1 === str2) return 1

  switch (algorithm) {
    case 'levenshtein': {
      const maxLen = Math.max(str1.length, str2.length)
      const distance = levenshteinDistance(str1, str2)
      return (maxLen - distance) / maxLen
    }
    
    case 'jaccard': {
      const set1 = new Set(str1.toLowerCase().split(''))
      const set2 = new Set(str2.toLowerCase().split(''))
      const intersection = new Set([...set1].filter(x => set2.has(x)))
      const union = new Set([...set1, ...set2])
      return intersection.size / union.size
    }
    
    case 'cosine': {
      // Simple word-based cosine similarity
      const words1 = str1.toLowerCase().split(/\s+/)
      const words2 = str2.toLowerCase().split(/\s+/)
      const allWords = new Set([...words1, ...words2])
      
      const vector1 = Array.from(allWords).map(word => words1.filter(w => w === word).length)
      const vector2 = Array.from(allWords).map(word => words2.filter(w => w === word).length)
      
      const dotProduct = vector1.reduce((sum, v1, i) => sum + v1 * vector2[i], 0)
      const magnitude1 = Math.sqrt(vector1.reduce((sum, v) => sum + v * v, 0))
      const magnitude2 = Math.sqrt(vector2.reduce((sum, v) => sum + v * v, 0))
      
      return magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0
    }
    
    default:
      return 0
  }
}

/**
 * Normalize value for comparison
 */
function normalizeValue(value: any, options: { ignoreCase?: boolean; trimWhitespace?: boolean } = {}): string {
  let normalized = String(value || '')
  
  if (options.trimWhitespace !== false) {
    normalized = normalized.trim()
  }
  
  if (options.ignoreCase !== false) {
    normalized = normalized.toLowerCase()
  }
  
  return normalized
}

/**
 * Generate content-based key for duplicate detection
 */
function generateContentKey(item: any, keyFields: string[]): string {
  const keyParts = keyFields
    .map(field => normalizeValue(item[field], { ignoreCase: true, trimWhitespace: true }))
    .filter(part => part.length > 0)
  
  return keyParts.join('|')
}

/**
 * Detect duplicate items in dataset
 */
export function detectDuplicates(
  data: any[],
  options: DuplicateDetectionOptions = {}
): DuplicateGroup[] {
  const {
    keyFields = ['title', 'source'],
    similarity = { threshold: 0.85, algorithm: 'levenshtein' },
    ignoreCase = true,
    trimWhitespace = true
  } = options

  const duplicateGroups: DuplicateGroup[] = []
  const processed = new Set<number>()

  // First pass: exact matches
  const exactMatches = new Map<string, number[]>()
  
  data.forEach((item, index) => {
    if (processed.has(index)) return
    
    const key = generateContentKey(item, keyFields)
    if (!key) return // Skip items without key fields
    
    if (!exactMatches.has(key)) {
      exactMatches.set(key, [])
    }
    exactMatches.get(key)!.push(index)
  })

  // Process exact match groups
  for (const [key, indices] of exactMatches) {
    if (indices.length > 1) {
      duplicateGroups.push({
        indices,
        matchType: 'exact',
        confidence: 1.0,
        matchingFields: keyFields.filter(field => 
          data[indices[0]][field] && String(data[indices[0]][field]).trim()
        ),
        items: indices.map(i => data[i])
      })
      
      // Mark as processed
      indices.forEach(i => processed.add(i))
    }
  }

  // Second pass: similarity matching for remaining items
  const remaining = data
    .map((item, index) => ({ item, index }))
    .filter(({ index }) => !processed.has(index))

  for (let i = 0; i < remaining.length; i++) {
    if (processed.has(remaining[i].index)) continue
    
    const similarGroup = [remaining[i].index]
    const matchingFields: string[] = []
    
    for (let j = i + 1; j < remaining.length; j++) {
      if (processed.has(remaining[j].index)) continue
      
      let totalSimilarity = 0
      let validComparisons = 0
      const fieldMatches: string[] = []
      
      // Compare each key field
      for (const field of keyFields) {
        const value1 = normalizeValue(remaining[i].item[field], { ignoreCase, trimWhitespace })
        const value2 = normalizeValue(remaining[j].item[field], { ignoreCase, trimWhitespace })
        
        if (value1 && value2) {
          const fieldSimilarity = calculateSimilarity(value1, value2, similarity.algorithm)
          totalSimilarity += fieldSimilarity
          validComparisons++
          
          if (fieldSimilarity > (similarity.threshold || 0.85)) {
            fieldMatches.push(field)
          }
        }
      }
      
      const averageSimilarity = validComparisons > 0 ? totalSimilarity / validComparisons : 0
      
      if (averageSimilarity > (similarity.threshold || 0.85)) {
        similarGroup.push(remaining[j].index)
        matchingFields.push(...fieldMatches)
      }
    }
    
    if (similarGroup.length > 1) {
      const averageConfidence = similarGroup.length > 2 ? 
        similarity.threshold || 0.85 : // Multiple matches suggest high confidence
        (similarity.threshold || 0.85) * 0.9 // Two matches slightly lower confidence
      
      duplicateGroups.push({
        indices: similarGroup,
        matchType: averageConfidence > 0.95 ? 'similar' : 'potential',
        confidence: averageConfidence,
        matchingFields: [...new Set(matchingFields)],
        items: similarGroup.map(index => data[index])
      })
      
      similarGroup.forEach(index => processed.add(index))
    }
  }

  return duplicateGroups.sort((a, b) => b.confidence - a.confidence)
}

/**
 * Validate individual field value
 */
function validateField(
  value: any,
  field: string,
  rule: ValidationRule,
  item: any,
  allData: any[]
): ValidationError | null {
  if (rule.type === 'required') {
    if (value === null || value === undefined || String(value).trim() === '') {
      return {
        row: -1, // Will be set by caller
        field,
        value,
        message: rule.message,
        severity: 'error'
      }
    }
  }
  
  if (rule.validator && value !== null && value !== undefined) {
    if (!rule.validator(value, item, allData)) {
      return {
        row: -1, // Will be set by caller
        field,
        value,
        message: rule.message,
        severity: rule.type === 'required' ? 'error' : 'warning'
      }
    }
  }
  
  return null
}

/**
 * Calculate data completeness score
 */
function calculateCompletenessScore(data: any[], requiredFields: string[]): number {
  if (data.length === 0) return 0
  
  let totalCells = 0
  let completedCells = 0
  
  for (const item of data) {
    for (const field of requiredFields) {
      totalCells++
      if (item[field] !== null && item[field] !== undefined && String(item[field]).trim() !== '') {
        completedCells++
      }
    }
  }
  
  return totalCells > 0 ? (completedCells / totalCells) * 100 : 0
}

/**
 * Calculate overall data quality score
 */
function calculateQualityScore(
  errors: ValidationError[],
  warnings: ValidationWarning[],
  duplicates: DuplicateGroup[],
  totalRows: number
): number {
  if (totalRows === 0) return 0
  
  const errorPenalty = (errors.length / totalRows) * 40 // Errors have high penalty
  const warningPenalty = (warnings.length / totalRows) * 20 // Warnings have moderate penalty
  const duplicatePenalty = (duplicates.reduce((sum, group) => sum + group.indices.length - 1, 0) / totalRows) * 30
  
  const score = Math.max(0, 100 - errorPenalty - warningPenalty - duplicatePenalty)
  return Math.round(score)
}

/**
 * Validate complete dataset
 */
export function validateData(
  data: any[],
  options: ValidationOptions = {}
): ValidationResult {
  const {
    requiredFields = ['title', 'description'],
    allowEmptyOptionalFields = true,
    duplicateDetection = { enabled: true },
    customRules = [],
    strictMode = false
  } = options

  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  
  // Combine default and custom validation rules
  const allRules = [...DEFAULT_VALIDATION_RULES, ...customRules]
  const applicableRules = allRules.filter(rule => 
    requiredFields.includes(rule.field) || rule.type !== 'required'
  )

  // Validate each row
  data.forEach((item, rowIndex) => {
    for (const rule of applicableRules) {
      const fieldError = validateField(item[rule.field], rule.field, rule, item, data)
      
      if (fieldError) {
        fieldError.row = rowIndex
        
        if (fieldError.severity === 'error') {
          errors.push(fieldError)
        } else {
          warnings.push(fieldError as ValidationWarning)
        }
      }
    }
    
    // Check for completely empty rows
    const hasAnyData = Object.values(item).some(value => 
      value !== null && value !== undefined && String(value).trim() !== ''
    )
    
    if (!hasAnyData) {
      errors.push({
        row: rowIndex,
        field: 'row',
        value: item,
        message: 'Row is completely empty',
        severity: 'error'
      })
    }
    
    // Strict mode: check for suspicious patterns
    if (strictMode) {
      // Check for placeholder values
      const placeholderPatterns = ['todo', 'tbd', 'placeholder', 'example', 'test']
      for (const [field, value] of Object.entries(item)) {
        const stringValue = String(value || '').toLowerCase()
        if (placeholderPatterns.some(pattern => stringValue.includes(pattern))) {
          warnings.push({
            row: rowIndex,
            field,
            value,
            message: `Field appears to contain placeholder text: "${value}"`,
            severity: 'warning',
            suggestion: `Replace placeholder with actual ${field} information`
          })
        }
      }
    }
  })

  // Detect duplicates
  let duplicates: DuplicateGroup[] = []
  if (duplicateDetection.enabled) {
    duplicates = detectDuplicates(data, duplicateDetection)
  }

  // Calculate metrics
  const completenessScore = calculateCompletenessScore(data, requiredFields)
  const qualityScore = calculateQualityScore(errors, warnings, duplicates, data.length)

  const summary: ValidationSummary = {
    totalRows: data.length,
    validRows: data.length - errors.filter(e => e.field === 'row').length,
    errorCount: errors.length,
    warningCount: warnings.length,
    duplicateCount: duplicates.reduce((sum, group) => sum + group.indices.length, 0),
    completenessScore,
    qualityScore
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    duplicates,
    summary
  }
}

/**
 * Generate validation report for display
 */
export interface ValidationReport {
  status: 'valid' | 'warnings' | 'errors'
  message: string
  details: {
    errors: string[]
    warnings: string[]
    duplicates: string[]
    recommendations: string[]
  }
  stats: ValidationSummary
}

export function generateValidationReport(result: ValidationResult): ValidationReport {
  const { errors, warnings, duplicates, summary } = result
  
  let status: 'valid' | 'warnings' | 'errors' = 'valid'
  let message = 'Data validation passed successfully'
  
  if (errors.length > 0) {
    status = 'errors'
    message = `Validation failed with ${errors.length} error(s)`
  } else if (warnings.length > 0 || duplicates.length > 0) {
    status = 'warnings' 
    message = `Validation passed with ${warnings.length} warning(s) and ${duplicates.length} duplicate group(s)`
  }

  const details = {
    errors: errors.map(e => `Row ${e.row + 1}, ${e.field}: ${e.message}`),
    warnings: warnings.map(w => `Row ${w.row + 1}, ${w.field}: ${w.message}`),
    duplicates: duplicates.map(d => 
      `Potential duplicates found in rows ${d.indices.map(i => i + 1).join(', ')} ` +
      `(${d.confidence * 100}% confidence, matching: ${d.matchingFields.join(', ')})`
    ),
    recommendations: []
  }

  // Generate recommendations
  if (summary.completenessScore < 90) {
    details.recommendations.push('Consider filling in missing required fields to improve data completeness')
  }
  
  if (duplicates.length > 0) {
    details.recommendations.push('Review and resolve duplicate entries to ensure data quality')
  }
  
  if (warnings.length > 0) {
    details.recommendations.push('Address validation warnings to improve data consistency')
  }
  
  if (summary.qualityScore < 80) {
    details.recommendations.push('Overall data quality could be improved - review errors and warnings')
  }

  return {
    status,
    message,
    details,
    stats: summary
  }
}

/**
 * Clean and prepare data for import
 */
export function cleanData(
  data: any[],
  options: {
    removeDuplicates?: boolean
    fixCommonIssues?: boolean
    trimWhitespace?: boolean
  } = {}
): { cleanedData: any[]; removedItems: any[]; changes: string[] } {
  const {
    removeDuplicates = false,
    fixCommonIssues = true,
    trimWhitespace = true
  } = options

  let cleanedData = [...data]
  const removedItems: any[] = []
  const changes: string[] = []

  // Fix common issues
  if (fixCommonIssues) {
    cleanedData = cleanedData.map((item, index) => {
      const cleaned = { ...item }
      let itemChanged = false

      for (const [field, value] of Object.entries(cleaned)) {
        if (typeof value === 'string') {
          let newValue = value

          if (trimWhitespace) {
            newValue = newValue.trim()
          }

          // Fix common URL issues
          if (field.toLowerCase().includes('url') && newValue && !newValue.startsWith('http')) {
            newValue = 'https://' + newValue
            itemChanged = true
          }

          // Normalize boolean values
          if (['true', 'yes', '1'].includes(newValue.toLowerCase())) {
            cleaned[field] = true
            itemChanged = true
          } else if (['false', 'no', '0'].includes(newValue.toLowerCase())) {
            cleaned[field] = false
            itemChanged = true
          } else if (newValue !== value) {
            cleaned[field] = newValue
            itemChanged = true
          }
        }
      }

      if (itemChanged) {
        changes.push(`Row ${index + 1}: Fixed formatting issues`)
      }

      return cleaned
    })
  }

  // Remove duplicates if requested
  if (removeDuplicates) {
    const duplicates = detectDuplicates(cleanedData)
    const indicesToRemove = new Set<number>()

    for (const group of duplicates) {
      // Keep the first item in each duplicate group, remove the rest
      group.indices.slice(1).forEach(index => indicesToRemove.add(index))
    }

    const originalCount = cleanedData.length
    cleanedData = cleanedData.filter((_, index) => !indicesToRemove.has(index))
    removedItems.push(...Array.from(indicesToRemove).map(index => data[index]))

    if (indicesToRemove.size > 0) {
      changes.push(`Removed ${indicesToRemove.size} duplicate items`)
    }
  }

  return {
    cleanedData,
    removedItems,
    changes
  }
}