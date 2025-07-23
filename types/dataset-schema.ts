/**
 * Updated TypeScript Interfaces for Dynamic Dataset Loading
 * 
 * Defines flexible schemas that work with both hardcoded data and CSV uploads,
 * with optional ID fields and support for various data sources.
 */

// Base interfaces for core data types
export interface BaseDataset {
  // Core identification (optional for uploads, can be auto-generated)
  id?: string
  
  // Required core fields
  title: string
  description: string
  
  // Source information
  source?: string
  sourceUrl?: string
  organization?: string
  
  // Dates (flexible formats)
  dateAdded?: string
  dateCreated?: string
  dateUpdated?: string
  
  // Classification and categorization  
  category?: string | string[]
  tags?: string | string[]
  
  // Technical details
  version?: string
  license?: string
  language?: string | string[]
  
  // Quality and metadata
  dataQuality?: DataQualityMetrics
  importSource?: ImportSourceMetadata
}

// Prompt/Dataset specific interface
export interface PromptDataset extends BaseDataset {
  // Attack and security specific fields
  attackType?: string | string[]
  threatDomain?: string | string[]
  riskLevel?: number | string
  
  // Technical specifications
  modalities?: string | string[]
  testedModels?: string | string[]
  targetModel?: string // Legacy field, maps to testedModels
  
  // Metrics and evaluation
  successRate?: number
  complexity?: number
  promptCount?: number
  
  // Content
  content?: string
  examples?: string | string[]
  
  // Legacy fields for backward compatibility
  threatDomain_legacy?: string
  attackType_legacy?: string
}

// Protocol/Evaluation specific interface
export interface ProtocolDataset extends BaseDataset {
  // Protocol specific information
  name?: string // Alternative to title
  methodology?: string
  version: string
  
  // Evaluation details
  metrics?: string | string[]
  compatibleModels?: string | string[]
  evaluationCriteria?: string | string[]
  
  // Research information
  paperTitle?: string
  authors?: string | string[]
  
  // Technical requirements
  dependencies?: string | string[]
  format?: string
  
  // URLs and references
  url?: string // Alternative to sourceUrl
  repositoryUrl?: string
  paperUrl?: string
  documentationUrl?: string
}

// Data quality metrics
export interface DataQualityMetrics {
  completenessScore: number // 0-100
  consistencyScore: number  // 0-100
  accuracyScore?: number    // 0-100
  validationStatus: 'valid' | 'warnings' | 'errors'
  lastValidated: string
}

// Import source metadata
export interface ImportSourceMetadata {
  type: 'hardcoded' | 'csv_upload' | 'url_import' | 'api_import'
  originalFilename?: string
  importDate: string
  importedBy?: string
  mappingUsed?: Record<string, string>
  originalFieldNames?: string[]
  transformations?: string[]
}

// Flexible data container that can hold any dataset type
export interface FlexibleDataset extends Record<string, any> {
  // Ensure core fields are always present
  id?: string
  title: string
  description: string
  
  // Allow any additional fields for maximum flexibility
  [key: string]: any
}

// Union type for all supported dataset types
export type AnyDataset = PromptDataset | ProtocolDataset | FlexibleDataset

// CSV Import specific interfaces
export interface CSVImportResult {
  success: boolean
  data: FlexibleDataset[]
  errors: string[]
  warnings: string[]
  metadata: ImportMetadata
}

export interface ImportMetadata {
  originalRowCount: number
  importedRowCount: number
  skippedRowCount: number
  duplicateCount: number
  fieldMappings: Record<string, string>
  detectedFields: string[]
  unmappedFields: string[]
  importTimestamp: string
  dataQuality: DataQualityMetrics
}

// Filter and search interfaces
export interface DynamicFilterConfig {
  field: string
  type: 'select' | 'multiselect' | 'range' | 'date' | 'boolean' | 'search'
  label: string
  options?: Array<{
    value: string
    label: string
    count?: number
  }>
  range?: {
    min: number
    max: number
    step?: number
  }
  defaultValue?: any
  enabled: boolean
}

export interface FilterState {
  [fieldName: string]: {
    type: string
    value: any
    operator?: 'equals' | 'contains' | 'in' | 'between' | 'gt' | 'lt'
  }
}

export interface SearchConfig {
  fields: Array<{
    name: string
    weight: number
    searchable: boolean
  }>
  fuzzyThreshold: number
  enableHighlighting: boolean
}

// Data transformation interfaces
export interface DataTransformConfig {
  fieldMappings: Record<string, string>
  dataTypes: Record<string, 'string' | 'number' | 'boolean' | 'date' | 'array'>
  arrayDelimiters: Record<string, string>
  requiredFields: string[]
  optionalFields: string[]
}

export interface TransformationResult {
  transformedData: FlexibleDataset[]
  errors: TransformationError[]
  warnings: TransformationWarning[]
  appliedTransformations: string[]
}

export interface TransformationError {
  row: number
  field: string
  value: any
  message: string
  type: 'validation' | 'conversion' | 'mapping'
}

export interface TransformationWarning {
  row: number
  field: string
  value: any
  message: string
  suggestion?: string
}

// Legacy compatibility types (maintain existing interfaces)
export interface LegacyPromptData {
  id: string
  title: string
  description: string
  attackType: string
  modalities: string[]
  threatDomain: string
  targetModel: string
  successRate: number
  source: string
  sourceUrl: string
  dateAdded: string
  complexity: number
  content: string
}

export interface LegacyProtocolData {
  id: string
  name: string
  description: string
  category: string
  version: string
  organization: string
  metrics: string[]
  compatibleModels: string[]
  url: string
}

// Conversion utilities types
export interface ConversionOptions {
  preserveOriginalIds?: boolean
  generateMissingIds?: boolean
  strictValidation?: boolean
  allowUnknownFields?: boolean
}

// Data management interfaces
export interface DatasetCollection {
  prompts: PromptDataset[]
  protocols: ProtocolDataset[]
  other: FlexibleDataset[]
  metadata: CollectionMetadata
}

export interface CollectionMetadata {
  totalRecords: number
  lastUpdated: string
  dataSources: Array<{
    type: string
    count: number
    lastImport: string
  }>
  availableFilters: Record<string, DynamicFilterConfig>
  searchIndices: SearchConfig[]
}

// API interfaces for data operations
export interface DatasetQuery {
  filters?: FilterState
  search?: string
  sort?: {
    field: string
    direction: 'asc' | 'desc'
  }
  pagination?: {
    page: number
    limit: number
  }
}

export interface DatasetQueryResult {
  data: AnyDataset[]
  totalCount: number
  filteredCount: number
  pagination: {
    currentPage: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
  appliedFilters: FilterState
  executionTime: number
}

// Type guards for runtime type checking
export function isPromptDataset(data: any): data is PromptDataset {
  return data && 
         typeof data.title === 'string' &&
         typeof data.description === 'string' &&
         (data.attackType !== undefined || data.modalities !== undefined)
}

export function isProtocolDataset(data: any): data is ProtocolDataset {
  return data && 
         typeof data.title === 'string' &&
         typeof data.description === 'string' &&
         (data.name !== undefined || data.methodology !== undefined || data.metrics !== undefined)
}

export function isFlexibleDataset(data: any): data is FlexibleDataset {
  return data && 
         typeof data === 'object' &&
         typeof data.title === 'string' &&
         typeof data.description === 'string'
}

// Utility type for making all fields optional except core required ones
export type PartialDataset<T extends BaseDataset> = Pick<T, 'title' | 'description'> & Partial<Omit<T, 'title' | 'description'>>

// Type for field mapping configurations
export interface FieldMappingConfig {
  standardField: string
  possibleNames: string[]
  required: boolean
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'array'
  defaultValue?: any
  validator?: (value: any) => boolean
  transformer?: (value: any) => any
}

// Comprehensive field mapping schema
export const DATASET_FIELD_SCHEMA: Record<string, FieldMappingConfig> = {
  title: {
    standardField: 'title',
    possibleNames: ['title', 'name', 'dataset_name', 'benchmark_name'],
    required: true,
    dataType: 'string'
  },
  description: {
    standardField: 'description',
    possibleNames: ['description', 'details', 'purpose', 'summary'],
    required: true,
    dataType: 'string'
  },
  category: {
    standardField: 'category',
    possibleNames: ['category', 'attack_type', 'threat_domain', 'type'],
    required: false,
    dataType: 'string'
  },
  source: {
    standardField: 'source',
    possibleNames: ['source', 'organization', 'creator', 'publisher'],
    required: false,
    dataType: 'string'
  },
  sourceUrl: {
    standardField: 'sourceUrl',
    possibleNames: ['source_url', 'url', 'link', 'website'],
    required: false,
    dataType: 'string',
    validator: (value: any) => {
      if (!value) return true
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    }
  },
  modalities: {
    standardField: 'modalities',
    possibleNames: ['modalities', 'modality', 'input_type', 'format'],
    required: false,
    dataType: 'array'
  },
  testedModels: {
    standardField: 'testedModels',
    possibleNames: ['tested_models', 'models', 'target_models'],
    required: false,
    dataType: 'array'
  }
}

// Export all types for easy importing
export type {
  BaseDataset,
  PromptDataset,
  ProtocolDataset,
  FlexibleDataset,
  AnyDataset,
  CSVImportResult,
  ImportMetadata,
  DynamicFilterConfig,
  FilterState,
  DatasetCollection,
  DatasetQuery,
  DatasetQueryResult
}