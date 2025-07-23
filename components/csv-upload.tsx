"use client"

import { useState, useCallback, useRef } from 'react'
import { Upload, File, AlertCircle, CheckCircle, X, Download, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { parseCSV, CSVSource, CSVParseResult, CSVParseProgress, getCSVPreview, validateCSVStructure } from '@/lib/csv-parser'
import { mapFields, getMappingSuggestions, MappingSuggestion, MappingResult } from '@/lib/field-mapper'
import { validateData, ValidationResult, generateValidationReport, cleanData } from '@/lib/data-validator'
import { extractFilterOptions, analyzeDataset, DatasetAnalysis } from '@/lib/filter-extractor'
import { FlexibleDataset } from '@/types/dataset-schema'

export interface CSVUploadProps {
  onDataImported?: (data: FlexibleDataset[], metadata: any) => void
  onError?: (error: string) => void
  acceptedFields?: string[]
  requiredFields?: string[]
  maxFileSize?: number // in MB
  allowUrlImport?: boolean
  enablePreview?: boolean
}

interface UploadState {
  stage: 'upload' | 'mapping' | 'validation' | 'preview' | 'complete' | 'error'
  progress: number
  message: string
}

interface ParsedData {
  raw: any[]
  mapped: FlexibleDataset[]
  validation: ValidationResult
  analysis: DatasetAnalysis
  suggestions: MappingSuggestion[]
  mapping: MappingResult
}

export function CSVUpload({
  onDataImported,
  onError,
  acceptedFields = [],
  requiredFields = ['title', 'description'],
  maxFileSize = 50,
  allowUrlImport = true,
  enablePreview = true
}: CSVUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    stage: 'upload',
    progress: 0,
    message: ''
  })
  
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [csvUrl, setCsvUrl] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [customMapping, setCustomMapping] = useState<Record<string, string>>({})
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleProgress = useCallback((progress: CSVParseProgress) => {
    setUploadState(prev => ({
      ...prev,
      progress: progress.percentage,
      message: `Processing... ${progress.percentage}%`
    }))
  }, [])

  const processCSVData = async (source: CSVSource) => {
    try {
      setUploadState({
        stage: 'upload',
        progress: 0,
        message: 'Parsing CSV data...'
      })

      // Parse the CSV
      const parseResult = await parseCSV(source, {}, handleProgress)
      
      if (!parseResult.success || parseResult.data.length === 0) {
        throw new Error(parseResult.message || 'Failed to parse CSV data')
      }

      setUploadState({
        stage: 'mapping',
        progress: 30,
        message: 'Analyzing data structure...'
      })

      // Get column names and create field mappings
      const columnNames = parseResult.meta.fields || []
      const mapping = mapFields(columnNames)
      const suggestions = getMappingSuggestions(columnNames)

      setUploadState({
        stage: 'mapping',
        progress: 50,
        message: 'Mapping fields...'
      })

      // Apply field mapping to transform data
      const mappedData = parseResult.data.map(row => {
        const transformedRow: FlexibleDataset = {
          title: '',
          description: '',
          ...row
        }
        
        // Apply field mappings
        for (const [standardField, csvColumn] of Object.entries(mapping)) {
          if (csvColumn && row[csvColumn] !== undefined) {
            transformedRow[standardField] = row[csvColumn]
          }
        }
        
        // Generate ID if not present
        if (!transformedRow.id) {
          const sourceKey = transformedRow.source || transformedRow.organization || 'unknown'
          const titleKey = transformedRow.title?.slice(0, 20).replace(/\s+/g, '-') || 'untitled'
          transformedRow.id = `${sourceKey}-${titleKey}-${Math.random().toString(36).slice(2, 8)}`
        }

        return transformedRow
      })

      setUploadState({
        stage: 'validation',
        progress: 70,
        message: 'Validating data quality...'
      })

      // Validate the mapped data
      const validation = validateData(mappedData, {
        requiredFields,
        duplicateDetection: { enabled: true }
      })

      setUploadState({
        stage: 'validation',
        progress: 90,
        message: 'Analyzing dataset...'
      })

      // Analyze dataset for filter extraction
      const analysis = analyzeDataset(mappedData)

      const processedData: ParsedData = {
        raw: parseResult.data,
        mapped: mappedData,
        validation,
        analysis,
        suggestions,
        mapping
      }

      setParsedData(processedData)
      
      setUploadState({
        stage: validation.isValid ? 'preview' : 'validation',
        progress: 100,
        message: validation.isValid 
          ? `Successfully processed ${mappedData.length} records`
          : `Processed with ${validation.errors.length} errors and ${validation.warnings.length} warnings`
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setUploadState({
        stage: 'error',
        progress: 0,
        message: errorMessage
      })
      onError?.(errorMessage)
    }
  }

  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    const csvFile = files.find(file => 
      file.type === 'text/csv' || 
      file.name.toLowerCase().endsWith('.csv') ||
      file.type === 'application/csv'
    )
    
    if (csvFile) {
      if (csvFile.size > maxFileSize * 1024 * 1024) {
        onError?.(`File size exceeds maximum limit of ${maxFileSize}MB`)
        return
      }
      processCSVData({ type: 'file', source: csvFile })
    } else {
      onError?.('Please drop a valid CSV file')
    }
  }, [maxFileSize, onError])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > maxFileSize * 1024 * 1024) {
        onError?.(`File size exceeds maximum limit of ${maxFileSize}MB`)
        return
      }
      processCSVData({ type: 'file', source: file })
    }
  }

  const handleUrlImport = () => {
    if (!csvUrl.trim()) {
      onError?.('Please enter a valid CSV URL')
      return
    }
    
    try {
      new URL(csvUrl)
      processCSVData({ type: 'url', source: csvUrl })
    } catch {
      onError?.('Please enter a valid URL')
    }
  }

  const handleImportConfirm = () => {
    if (!parsedData) return

    // Apply any custom mappings
    let finalData = parsedData.mapped
    
    // Clean data if validation had issues
    if (!parsedData.validation.isValid) {
      const { cleanedData } = cleanData(finalData, {
        removeDuplicates: true,
        fixCommonIssues: true
      })
      finalData = cleanedData
    }

    // Extract filter options for the new data
    const filterOptions = extractFilterOptions(finalData)

    const metadata = {
      originalRowCount: parsedData.raw.length,
      importedRowCount: finalData.length,
      fieldMappings: parsedData.mapping,
      validation: parsedData.validation,
      analysis: parsedData.analysis,
      filterOptions,
      importTimestamp: new Date().toISOString()
    }

    onDataImported?.(finalData, metadata)
    
    setUploadState({
      stage: 'complete',
      progress: 100,
      message: `Successfully imported ${finalData.length} records`
    })
  }

  const resetUpload = () => {
    setUploadState({ stage: 'upload', progress: 0, message: '' })
    setParsedData(null)
    setCustomMapping({})
    setCsvUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'upload': return <Upload className="h-4 w-4" />
      case 'mapping': case 'validation': case 'preview': return <File className="h-4 w-4" />
      case 'complete': return <CheckCircle className="h-4 w-4" />
      case 'error': return <AlertCircle className="h-4 w-4" />
      default: return <Upload className="h-4 w-4" />
    }
  }

  const renderUploadStage = () => (
    <div className="space-y-6">
      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">Upload File</TabsTrigger>
          {allowUrlImport && <TabsTrigger value="url">Import from URL</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="file" className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleFileDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">Drop your CSV file here</p>
              <p className="text-sm text-gray-600">
                or <button
                  type="button"
                  className="text-blue-600 hover:underline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  browse to upload
                </button>
              </p>
              <p className="text-xs text-gray-500">
                Maximum file size: {maxFileSize}MB
              </p>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv,application/csv"
            onChange={handleFileSelect}
            className="hidden"
          />
        </TabsContent>
        
        {allowUrlImport && (
          <TabsContent value="url" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">CSV URL</label>
                <Input
                  type="url"
                  placeholder="https://example.com/data.csv"
                  value={csvUrl}
                  onChange={(e) => setCsvUrl(e.target.value)}
                />
              </div>
              <Button onClick={handleUrlImport} className="w-full">
                Import from URL
              </Button>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )

  const renderValidationStage = () => {
    if (!parsedData) return null

    const report = generateValidationReport(parsedData.validation)

    return (
      <div className="space-y-6">
        <Alert className={report.status === 'errors' ? 'border-red-500' : report.status === 'warnings' ? 'border-yellow-500' : 'border-green-500'}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{report.message}</AlertDescription>
        </Alert>

        {report.details.errors.length > 0 && (
          <div>
            <h4 className="font-medium text-red-600 mb-2">Errors ({report.details.errors.length})</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {report.details.errors.slice(0, 10).map((error, i) => (
                <li key={i} className="text-red-600">{error}</li>
              ))}
              {report.details.errors.length > 10 && (
                <li className="text-gray-500">...and {report.details.errors.length - 10} more</li>
              )}
            </ul>
          </div>
        )}

        {report.details.warnings.length > 0 && (
          <div>
            <h4 className="font-medium text-yellow-600 mb-2">Warnings ({report.details.warnings.length})</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {report.details.warnings.slice(0, 5).map((warning, i) => (
                <li key={i} className="text-yellow-600">{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {report.details.duplicates.length > 0 && (
          <div>
            <h4 className="font-medium text-orange-600 mb-2">Potential Duplicates ({report.details.duplicates.length})</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {report.details.duplicates.slice(0, 3).map((duplicate, i) => (
                <li key={i} className="text-orange-600">{duplicate}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-4">
          <Button 
            onClick={handleImportConfirm}
            disabled={report.status === 'errors'}
          >
            {report.status === 'errors' ? 'Fix Errors First' : 'Import Anyway'}
          </Button>
          <Button variant="outline" onClick={resetUpload}>
            Start Over
          </Button>
          {enablePreview && (
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Data
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Data Preview</DialogTitle>
                </DialogHeader>
                <div className="max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(parsedData.mapped[0] || {}).slice(0, 6).map(key => (
                          <TableHead key={key}>{key}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.mapped.slice(0, 10).map((row, i) => (
                        <TableRow key={i}>
                          {Object.entries(row).slice(0, 6).map(([key, value]) => (
                            <TableCell key={key} className="max-w-xs truncate">
                              {Array.isArray(value) ? value.join(', ') : String(value || '')}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    )
  }

  const renderPreviewStage = () => {
    if (!parsedData) return null

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{parsedData.mapped.length}</div>
              <div className="text-sm text-gray-600">Records</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{parsedData.analysis.totalFields}</div>
              <div className="text-sm text-gray-600">Fields</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{Math.round(parsedData.analysis.dataQuality.completeness)}%</div>
              <div className="text-sm text-gray-600">Completeness</div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h4 className="font-medium mb-3">Field Mappings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parsedData.suggestions.slice(0, 8).map((suggestion, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{suggestion.standardField}</div>
                  <div className="text-sm text-gray-600">← {suggestion.csvColumn}</div>
                </div>
                <Badge variant={suggestion.confidence > 0.8 ? 'default' : 'secondary'}>
                  {Math.round(suggestion.confidence * 100)}%
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={handleImportConfirm}>
            Import {parsedData.mapped.length} Records
          </Button>
          <Button variant="outline" onClick={resetUpload}>
            Start Over
          </Button>
        </div>
      </div>
    )
  }

  const renderCompleteStage = () => (
    <div className="text-center space-y-4">
      <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
      <div>
        <h3 className="text-lg font-medium">Import Complete!</h3>
        <p className="text-gray-600">{uploadState.message}</p>
      </div>
      <Button onClick={resetUpload}>Import Another File</Button>
    </div>
  )

  const renderErrorStage = () => (
    <div className="text-center space-y-4">
      <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
      <div>
        <h3 className="text-lg font-medium">Import Failed</h3>
        <p className="text-red-600">{uploadState.message}</p>
      </div>
      <Button onClick={resetUpload}>Try Again</Button>
    </div>
  )

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStageIcon(uploadState.stage)}
          CSV Data Import
        </CardTitle>
        {uploadState.stage !== 'upload' && uploadState.stage !== 'error' && (
          <div className="space-y-2">
            <Progress value={uploadState.progress} />
            <p className="text-sm text-gray-600">{uploadState.message}</p>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {uploadState.stage === 'upload' && renderUploadStage()}
        {uploadState.stage === 'validation' && renderValidationStage()}
        {uploadState.stage === 'preview' && renderPreviewStage()}
        {uploadState.stage === 'complete' && renderCompleteStage()}
        {uploadState.stage === 'error' && renderErrorStage()}
      </CardContent>
    </Card>
  )
}