"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Search, Filter, X, ChevronDown, Calendar, Slider } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Switch } from '@/components/ui/switch'
import { Slider as SliderComponent } from '@/components/ui/slider'

import { FilterOptions, FilterOptionConfig, FilterType } from '@/lib/filter-extractor'
import { DynamicFilterConfig, FilterState } from '@/types/dataset-schema'

export interface DynamicFiltersProps {
  filterOptions: FilterOptions
  onFiltersChange: (filters: FilterState) => void
  onSearchChange?: (search: string) => void
  initialFilters?: FilterState
  initialSearch?: string
  showSearch?: boolean
  showClearAll?: boolean
  showActiveCount?: boolean
  className?: string
  enableUrlParams?: boolean
}

interface FilterComponentProps {
  config: FilterOptionConfig
  fieldName: string
  value: any
  onChange: (value: any) => void
}

// Individual filter components for different types
const SelectFilter = ({ config, fieldName, value, onChange }: FilterComponentProps) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700">{config.label}</label>
    <Select value={value || 'all'} onValueChange={(val) => onChange(val === 'all' ? null : val)}>
      <SelectTrigger>
        <SelectValue placeholder={`All ${config.label}`} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {config.label}</SelectItem>
        {config.values.map(option => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)

const MultiSelectFilter = ({ config, fieldName, value, onChange }: FilterComponentProps) => {
  const selectedValues = value || []
  const [isOpen, setIsOpen] = useState(false)

  const toggleValue = (optionValue: string) => {
    const currentValues = Array.isArray(selectedValues) ? selectedValues : []
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter(v => v !== optionValue)
      : [...currentValues, optionValue]
    onChange(newValues.length === 0 ? null : newValues)
  }

  const clearAll = () => onChange(null)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{config.label}</label>
        {selectedValues.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-auto p-1 text-xs"
          >
            Clear
          </Button>
        )}
      </div>
      
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="truncate">
              {selectedValues.length === 0 
                ? `All ${config.label}`
                : selectedValues.length === 1
                ? selectedValues[0]
                : `${selectedValues.length} selected`
              }
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-2">
          <div className="border rounded-md p-2 max-h-48 overflow-y-auto space-y-2">
            {config.values.map(option => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${fieldName}-${option}`}
                  checked={selectedValues.includes(option)}
                  onCheckedChange={() => toggleValue(option)}
                />
                <label 
                  htmlFor={`${fieldName}-${option}`}
                  className="text-sm cursor-pointer flex-1 truncate"
                  title={option}
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
      
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedValues.slice(0, 3).map(val => (
            <Badge key={val} variant="secondary" className="text-xs">
              {val}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => toggleValue(val)}
              />
            </Badge>
          ))}
          {selectedValues.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{selectedValues.length - 3} more
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

const RangeFilter = ({ config, fieldName, value, onChange }: FilterComponentProps) => {
  const range = config.range || { min: 0, max: 100, step: 1 }
  const currentRange = value || [range.min, range.max]

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{config.label}</label>
      <div className="space-y-4">
        <SliderComponent
          value={currentRange}
          onValueChange={(newValue) => {
            const [min, max] = newValue
            if (min === range.min && max === range.max) {
              onChange(null) // Clear filter if full range selected
            } else {
              onChange(newValue)
            }
          }}
          min={range.min}
          max={range.max}
          step={range.step}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{currentRange[0]}</span>
          <span>{currentRange[1]}</span>
        </div>
      </div>
    </div>
  )
}

const DateFilter = ({ config, fieldName, value, onChange }: FilterComponentProps) => {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>(
    value || { from: undefined, to: undefined }
  )

  const handleDateChange = (newDateRange: { from?: Date; to?: Date }) => {
    setDateRange(newDateRange)
    if (!newDateRange.from && !newDateRange.to) {
      onChange(null)
    } else {
      onChange(newDateRange)
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{config.label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <Calendar className="h-4 w-4 mr-2" />
            {dateRange.from && dateRange.to 
              ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
              : dateRange.from
              ? dateRange.from.toLocaleDateString()
              : "Select date range"
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="range"
            selected={dateRange}
            onSelect={handleDateChange}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

const BooleanFilter = ({ config, fieldName, value, onChange }: FilterComponentProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-700">{config.label}</label>
      <Switch
        checked={value === true}
        onCheckedChange={(checked) => onChange(checked ? true : null)}
      />
    </div>
  </div>
)

const SearchFilter = ({ config, fieldName, value, onChange }: FilterComponentProps) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700">{config.label}</label>
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder={`Search ${config.label.toLowerCase()}...`}
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="pl-10"
      />
    </div>
  </div>
)

// Main filter component renderer
const FilterComponent = (props: FilterComponentProps) => {
  switch (props.config.type) {
    case 'select':
      return <SelectFilter {...props} />
    case 'multiselect':
      return <MultiSelectFilter {...props} />
    case 'range':
      return <RangeFilter {...props} />
    case 'date':
      return <DateFilter {...props} />
    case 'boolean':
      return <BooleanFilter {...props} />
    case 'search':
      return <SearchFilter {...props} />
    default:
      return <SelectFilter {...props} />
  }
}

export function DynamicFilters({
  filterOptions,
  onFiltersChange,
  onSearchChange,
  initialFilters = {},
  initialSearch = '',
  showSearch = true,
  showClearAll = true,
  showActiveCount = true,
  className = '',
  enableUrlParams = true
}: DynamicFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [expandedFilters, setExpandedFilters] = useState<Set<string>>(new Set(['category', 'source']))

  // Update URL parameters if enabled
  useEffect(() => {
    if (!enableUrlParams) return

    const params = new URLSearchParams()
    
    // Add search term
    if (searchTerm) {
      params.set('search', searchTerm)
    }
    
    // Add filters
    Object.entries(filters).forEach(([key, filterValue]) => {
      if (filterValue?.value !== null && filterValue?.value !== undefined) {
        if (Array.isArray(filterValue.value)) {
          params.set(key, filterValue.value.join(','))
        } else {
          params.set(key, String(filterValue.value))
        }
      }
    })
    
    // Update URL without page reload
    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname
    
    window.history.replaceState({}, '', newUrl)
  }, [filters, searchTerm, enableUrlParams])

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(filter => 
      filter?.value !== null && 
      filter?.value !== undefined && 
      !(Array.isArray(filter.value) && filter.value.length === 0)
    ).length + (searchTerm ? 1 : 0)
  }, [filters, searchTerm])

  // Handle filter changes
  const handleFilterChange = useCallback((fieldName: string, value: any) => {
    const newFilters = { ...filters }
    
    if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
      delete newFilters[fieldName]
    } else {
      const filterConfig = filterOptions[fieldName]
      newFilters[fieldName] = {
        type: filterConfig?.type || 'select',
        value,
        operator: getOperatorForType(filterConfig?.type || 'select')
      }
    }
    
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }, [filters, filterOptions, onFiltersChange])

  // Handle search changes
  const handleSearchChange = useCallback((search: string) => {
    setSearchTerm(search)
    onSearchChange?.(search)
  }, [onSearchChange])

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilters({})
    setSearchTerm('')
    onFiltersChange({})
    onSearchChange?.('')
  }, [onFiltersChange, onSearchChange])

  // Toggle filter expansion
  const toggleFilterExpanded = (filterName: string) => {
    const newExpanded = new Set(expandedFilters)
    if (newExpanded.has(filterName)) {
      newExpanded.delete(filterName)
    } else {
      newExpanded.add(filterName)
    }
    setExpandedFilters(newExpanded)
  }

  // Group filters by priority/importance
  const groupedFilters = useMemo(() => {
    const filterEntries = Object.entries(filterOptions)
    
    const primaryFilters = filterEntries.filter(([key]) => 
      ['category', 'attackType', 'threatDomain', 'source'].includes(key)
    )
    
    const secondaryFilters = filterEntries.filter(([key]) => 
      !['category', 'attackType', 'threatDomain', 'source'].includes(key)
    )
    
    return { primaryFilters, secondaryFilters }
  }, [filterOptions])

  const getOperatorForType = (type: FilterType): string => {
    switch (type) {
      case 'multiselect':
        return 'in'
      case 'range':
        return 'between'
      case 'date':
        return 'between'
      case 'search':
        return 'contains'
      case 'boolean':
        return 'equals'
      default:
        return 'equals'
    }
  }

  if (Object.keys(filterOptions).length === 0) {
    return null // Don't render if no filter options available
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
            {showActiveCount && activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount}</Badge>
            )}
          </div>
          {showClearAll && activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-auto p-2"
            >
              Clear All
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Global Search */}
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search all data..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Primary Filters (Always Visible) */}
        <div className="space-y-4">
          {groupedFilters.primaryFilters.map(([fieldName, config]) => (
            <FilterComponent
              key={fieldName}
              config={config}
              fieldName={fieldName}
              value={filters[fieldName]?.value}
              onChange={(value) => handleFilterChange(fieldName, value)}
            />
          ))}
        </div>

        {/* Secondary Filters (Collapsible) */}
        {groupedFilters.secondaryFilters.length > 0 && (
          <>
            <Separator />
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0">
                  <span className="text-sm font-medium">Advanced Filters</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-4">
                {groupedFilters.secondaryFilters.map(([fieldName, config]) => (
                  <FilterComponent
                    key={fieldName}
                    config={config}
                    fieldName={fieldName}
                    value={filters[fieldName]?.value}
                    onChange={(value) => handleFilterChange(fieldName, value)}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          </>
        )}

        {/* Active Filters Summary */}
        {activeFilterCount > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters</h4>
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    Search: "{searchTerm}"
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleSearchChange('')}
                    />
                  </Badge>
                )}
                {Object.entries(filters).map(([fieldName, filterValue]) => {
                  if (!filterValue?.value) return null
                  
                  const config = filterOptions[fieldName]
                  if (!config) return null
                  
                  let displayValue = String(filterValue.value)
                  if (Array.isArray(filterValue.value)) {
                    displayValue = filterValue.value.length > 2 
                      ? `${filterValue.value.slice(0, 2).join(', ')} +${filterValue.value.length - 2}`
                      : filterValue.value.join(', ')
                  }
                  
                  return (
                    <Badge key={fieldName} variant="outline" className="flex items-center gap-1">
                      {config.label}: {displayValue}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleFilterChange(fieldName, null)}
                      />
                    </Badge>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}