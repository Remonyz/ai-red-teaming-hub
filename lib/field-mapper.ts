/**
 * Field Mapping System for CSV Data Import
 * 
 * Provides flexible column name mapping to standardized field names,
 * handling various naming conventions from different data sources.
 */

export interface FieldMapping {
  [standardField: string]: string[]
}

export interface MappingResult {
  [standardField: string]: string | null
}

export interface FieldMappingOptions {
  caseSensitive?: boolean
  fuzzyMatching?: boolean
  customMappings?: FieldMapping
}

// Comprehensive field mappings for different data sources
export const DEFAULT_FIELD_MAPPINGS: FieldMapping = {
  // Core Dataset Fields
  title: [
    'title', 'name', 'dataset_name', 'benchmark_name', 'prompt_title',
    'dataset_title', 'evaluation_name', 'test_name', 'benchmark_title'
  ],
  
  description: [
    'description', 'details', 'purpose', 'task_purpose', 'summary',
    'overview', 'prompt_description', 'test_description', 'explanation',
    'background', 'context', 'task_description'
  ],
  
  category: [
    'category', 'attack_type', 'threat_domain', 'task_type', 'safety_category',
    'vulnerability_type', 'risk_category', 'evaluation_category', 'type',
    'classification', 'domain', 'test_type', 'attack_category'
  ],
  
  // Source Information
  source: [
    'source', 'organization', 'creator', 'publisher', 'author', 'origin',
    'provider', 'institution', 'company', 'research_group', 'dataset_source',
    'data_source', 'benchmark_source'
  ],
  
  sourceUrl: [
    'source_url', 'url', 'dataset_url', 'paper_url', 'link', 'reference_url',
    'benchmark_url', 'homepage', 'website', 'repository', 'github_url',
    'huggingface_url', 'arxiv_url', 'doi'
  ],
  
  // Testing and Evaluation Fields
  testedModels: [
    'tested_models', 'evaluated_models', 'target_models', 'models',
    'compatible_models', 'supported_models', 'model_list', 'llm_models',
    'ai_models', 'language_models', 'target_systems', 'evaluated_systems'
  ],
  
  promptCount: [
    'prompt_count', 'size', 'num_prompts', 'examples', 'sample_count',
    'test_cases', 'dataset_size', 'num_examples', 'total_prompts',
    'record_count', 'instance_count', 'evaluation_count'
  ],
  
  // Technical Details
  modalities: [
    'modalities', 'modality', 'input_type', 'data_type', 'format',
    'media_type', 'content_type', 'input_modalities', 'supported_formats',
    'data_formats', 'input_formats'
  ],
  
  // Dates and Versioning
  dateAdded: [
    'date_added', 'date_created', 'created_date', 'publication_date',
    'release_date', 'last_updated', 'timestamp', 'created_at', 'published',
    'date_published', 'creation_date', 'upload_date'
  ],
  
  dateUpdated: [
    'date_updated', 'last_modified', 'updated_at', 'modified_date',
    'last_updated', 'revision_date', 'updated'
  ],
  
  version: [
    'version', 'version_number', 'release_version', 'dataset_version',
    'benchmark_version', 'revision', 'v', 'ver'
  ],
  
  // Legal and Usage
  license: [
    'license', 'license_type', 'usage_rights', 'copyright', 'terms',
    'usage_license', 'data_license', 'licensing', 'legal_status',
    'rights', 'permissions'
  ],
  
  // Quality and Metrics
  successRate: [
    'success_rate', 'attack_success_rate', 'effectiveness', 'success_percentage',
    'pass_rate', 'failure_rate', 'accuracy', 'performance_score',
    'evaluation_score', 'benchmark_score'
  ],
  
  complexity: [
    'complexity', 'difficulty', 'severity', 'risk_level', 'challenge_level',
    'sophistication', 'complexity_score', 'difficulty_rating',
    'technical_complexity', 'complexity_level'
  ],
  
  // Content and Examples
  content: [
    'content', 'prompt_content', 'example', 'sample', 'text', 'prompt_text',
    'test_content', 'example_prompt', 'sample_prompt', 'prompt_example',
    'demonstration', 'template'
  ],
  
  // Additional Metadata
  tags: [
    'tags', 'keywords', 'labels', 'categories', 'topics', 'subjects',
    'themes', 'annotations', 'metadata_tags', 'classification_tags'
  ],
  
  language: [
    'language', 'lang', 'locale', 'primary_language', 'languages',
    'supported_languages', 'text_language'
  ],
  
  // Research and Academic Fields
  paperTitle: [
    'paper_title', 'publication_title', 'research_title', 'article_title',
    'study_title', 'paper_name'
  ],
  
  authors: [
    'authors', 'researchers', 'creators', 'contributors', 'author_list',
    'research_team', 'investigators'
  ],
  
  // Risk and Safety Assessment
  threatDomain: [
    'threat_domain', 'risk_domain', 'security_domain', 'safety_domain',
    'application_domain', 'use_case', 'scenario', 'context_domain',
    'target_domain', 'threat_category'
  ],
  
  riskLevel: [
    'risk_level', 'threat_level', 'danger_level', 'safety_risk',
    'security_risk', 'risk_score', 'threat_score', 'severity_level'
  ],
  
  // Protocol and Evaluation Specific
  metrics: [
    'metrics', 'evaluation_metrics', 'measurement_criteria', 'assessments',
    'evaluation_criteria', 'performance_metrics', 'quality_metrics',
    'benchmark_metrics', 'scoring_criteria'
  ],
  
  methodology: [
    'methodology', 'method', 'approach', 'technique', 'evaluation_method',
    'testing_method', 'assessment_approach', 'evaluation_approach'
  ],
  
  // Technical Implementation
  format: [
    'format', 'file_format', 'data_format', 'output_format',
    'structure', 'schema', 'encoding'
  ],
  
  dependencies: [
    'dependencies', 'requirements', 'prerequisites', 'needed_libraries',
    'required_packages', 'system_requirements'
  ]
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  const matrix: number[][] = []

  if (len1 === 0) return len2
  if (len2 === 0) return len1

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        )
      }
    }
  }

  const maxLen = Math.max(len1, len2)
  return (maxLen - matrix[len1][len2]) / maxLen
}

/**
 * Normalize column names for consistent matching
 */
function normalizeColumnName(columnName: string): string {
  return columnName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .replace(/[\s_-]+/g, '_') // Replace spaces, underscores, hyphens with single underscore
    .replace(/^_+|_+$/g, '')  // Remove leading/trailing underscores
}

/**
 * Find the best matching field for a column name
 */
function findBestMatch(
  columnName: string,
  fieldMappings: FieldMapping,
  options: FieldMappingOptions = {}
): { field: string; confidence: number } | null {
  const normalizedColumn = normalizeColumnName(columnName)
  const caseSensitive = options.caseSensitive ?? false
  const fuzzyMatching = options.fuzzyMatching ?? true
  
  let bestMatch: { field: string; confidence: number } | null = null
  let bestConfidence = 0
  
  for (const [standardField, possibleNames] of Object.entries(fieldMappings)) {
    for (const possibleName of possibleNames) {
      const normalizedPossible = normalizeColumnName(possibleName)
      
      // Exact match (highest confidence)
      if (normalizedColumn === normalizedPossible) {
        return { field: standardField, confidence: 1.0 }
      }
      
      // Case-sensitive exact match if enabled
      if (caseSensitive && columnName === possibleName) {
        return { field: standardField, confidence: 1.0 }
      }
      
      // Partial match (contains)
      if (normalizedColumn.includes(normalizedPossible) || normalizedPossible.includes(normalizedColumn)) {
        const confidence = Math.max(
          normalizedPossible.length / normalizedColumn.length,
          normalizedColumn.length / normalizedPossible.length
        ) * 0.8 // Slightly lower confidence for partial matches
        
        if (confidence > bestConfidence) {
          bestConfidence = confidence
          bestMatch = { field: standardField, confidence }
        }
      }
      
      // Fuzzy matching using string similarity
      if (fuzzyMatching) {
        const similarity = calculateSimilarity(normalizedColumn, normalizedPossible)
        const fuzzyConfidence = similarity * 0.7 // Lower confidence for fuzzy matches
        
        if (fuzzyConfidence > 0.6 && fuzzyConfidence > bestConfidence) {
          bestConfidence = fuzzyConfidence
          bestMatch = { field: standardField, confidence: fuzzyConfidence }
        }
      }
    }
  }
  
  return bestMatch
}

/**
 * Map CSV column names to standardized field names
 */
export function mapFields(
  columnNames: string[],
  options: FieldMappingOptions = {}
): MappingResult {
  const fieldMappings = {
    ...DEFAULT_FIELD_MAPPINGS,
    ...(options.customMappings || {})
  }
  
  const result: MappingResult = {}
  const usedColumns = new Set<string>()
  
  // First pass: Find high-confidence exact matches
  for (const columnName of columnNames) {
    if (usedColumns.has(columnName)) continue
    
    const match = findBestMatch(columnName, fieldMappings, options)
    if (match && match.confidence >= 0.9) {
      result[match.field] = columnName
      usedColumns.add(columnName)
    }
  }
  
  // Second pass: Find remaining matches with lower confidence threshold
  for (const columnName of columnNames) {
    if (usedColumns.has(columnName)) continue
    
    const match = findBestMatch(columnName, fieldMappings, options)
    if (match && match.confidence >= 0.6) {
      // Only assign if this standard field hasn't been mapped yet
      if (!result[match.field]) {
        result[match.field] = columnName
        usedColumns.add(columnName)
      }
    }
  }
  
  return result
}

/**
 * Get mapping suggestions with confidence scores
 */
export interface MappingSuggestion {
  standardField: string
  csvColumn: string
  confidence: number
  alternatives?: Array<{ csvColumn: string; confidence: number }>
}

export function getMappingSuggestions(
  columnNames: string[],
  options: FieldMappingOptions = {}
): MappingSuggestion[] {
  const fieldMappings = {
    ...DEFAULT_FIELD_MAPPINGS,
    ...(options.customMappings || {})
  }
  
  const suggestions: MappingSuggestion[] = []
  const usedColumns = new Set<string>()
  
  // For each standard field, find all possible matches
  for (const standardField of Object.keys(fieldMappings)) {
    const candidateMatches: Array<{ csvColumn: string; confidence: number }> = []
    
    for (const columnName of columnNames) {
      if (usedColumns.has(columnName)) continue
      
      const match = findBestMatch(columnName, { [standardField]: fieldMappings[standardField] }, options)
      if (match && match.confidence > 0.3) {
        candidateMatches.push({
          csvColumn: columnName,
          confidence: match.confidence
        })
      }
    }
    
    // Sort by confidence and take the best match
    candidateMatches.sort((a, b) => b.confidence - a.confidence)
    
    if (candidateMatches.length > 0) {
      const bestMatch = candidateMatches[0]
      usedColumns.add(bestMatch.csvColumn)
      
      suggestions.push({
        standardField,
        csvColumn: bestMatch.csvColumn,
        confidence: bestMatch.confidence,
        alternatives: candidateMatches.slice(1, 4) // Include top 3 alternatives
      })
    }
  }
  
  return suggestions.sort((a, b) => b.confidence - a.confidence)
}

/**
 * Apply field mapping to transform CSV data
 */
export function transformData<T extends Record<string, any>>(
  data: T[],
  mapping: MappingResult
): Array<Record<string, any>> {
  return data.map(row => {
    const transformedRow: Record<string, any> = {}
    
    // Apply field mapping
    for (const [standardField, csvColumn] of Object.entries(mapping)) {
      if (csvColumn && row.hasOwnProperty(csvColumn)) {
        transformedRow[standardField] = row[csvColumn]
      }
    }
    
    // Include unmapped fields with their original names
    for (const [csvColumn, value] of Object.entries(row)) {
      const isAlreadyMapped = Object.values(mapping).includes(csvColumn)
      if (!isAlreadyMapped) {
        transformedRow[csvColumn] = value
      }
    }
    
    return transformedRow
  })
}

/**
 * Get unmapped columns (columns that couldn't be automatically mapped)
 */
export function getUnmappedColumns(
  columnNames: string[],
  mapping: MappingResult
): string[] {
  const mappedColumns = new Set(Object.values(mapping).filter(Boolean))
  return columnNames.filter(column => !mappedColumns.has(column))
}

/**
 * Validate mapping completeness for required fields
 */
export interface MappingValidation {
  isValid: boolean
  missingRequiredFields: string[]
  suggestions: string[]
  unmappedColumns: string[]
}

export function validateMapping(
  mapping: MappingResult,
  columnNames: string[],
  requiredFields: string[] = ['title', 'description']
): MappingValidation {
  const missingRequiredFields = requiredFields.filter(field => !mapping[field])
  const unmappedColumns = getUnmappedColumns(columnNames, mapping)
  
  const suggestions: string[] = []
  
  if (missingRequiredFields.length > 0) {
    suggestions.push(`Required fields missing: ${missingRequiredFields.join(', ')}`)
  }
  
  if (unmappedColumns.length > 0) {
    suggestions.push(`Consider mapping these columns: ${unmappedColumns.slice(0, 5).join(', ')}`)
  }
  
  return {
    isValid: missingRequiredFields.length === 0,
    missingRequiredFields,
    suggestions,
    unmappedColumns
  }
}