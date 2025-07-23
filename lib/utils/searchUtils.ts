import Fuse, { FuseResult, IFuseOptions } from 'fuse.js'
import { PromptData, ProtocolData } from './exportUtils'

// Fuse.js configuration for prompt search
const promptSearchOptions: IFuseOptions<PromptData> = {
  keys: [
    { name: 'title', weight: 0.3 },
    { name: 'description', weight: 0.25 },
    { name: 'attackType', weight: 0.15 },
    { name: 'source', weight: 0.1 },
    { name: 'testedModels', weight: 0.1 },
    { name: 'threatDomain', weight: 0.05 },
    { name: 'modalities', weight: 0.05 }
  ],
  threshold: 0.4, // More lenient matching
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
  findAllMatches: true
}

// Fuse.js configuration for protocol search
const protocolSearchOptions: IFuseOptions<ProtocolData> = {
  keys: [
    { name: 'name', weight: 0.3 },
    { name: 'description', weight: 0.25 },
    { name: 'organization', weight: 0.15 },
    { name: 'category', weight: 0.1 },
    { name: 'metrics', weight: 0.1 },
    { name: 'testedModels', weight: 0.1 }
  ],
  threshold: 0.4,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
  findAllMatches: true
}

// Enhanced search result interface
export interface SearchResult<T> {
  item: T
  score?: number
  matches?: readonly Fuse.FuseResultMatch[]
}

// Search prompts with fuzzy matching
export const searchPrompts = (
  prompts: PromptData[], 
  searchTerm: string,
  filters?: {
    attackType?: string
    modalities?: string[]
    threatDomain?: string
    testedModels?: string[]
  }
): SearchResult<PromptData>[] => {
  let results = prompts

  // Apply filters first
  if (filters) {
    results = prompts.filter(prompt => {
      if (filters.attackType && filters.attackType !== 'all' && prompt.attackType !== filters.attackType) {
        return false
      }
      
      if (filters.modalities && filters.modalities.length > 0) {
        const hasMatchingModality = filters.modalities.some(mod => 
          prompt.modalities.includes(mod)
        )
        if (!hasMatchingModality) return false
      }
      
      if (filters.threatDomain && filters.threatDomain !== 'all' && prompt.threatDomain !== filters.threatDomain) {
        return false
      }
      
      if (filters.testedModels && filters.testedModels.length > 0) {
        const hasMatchingModel = filters.testedModels.some(model => 
          prompt.testedModels && prompt.testedModels.includes(model)
        )
        if (!hasMatchingModel) return false
      }
      
      return true
    })
  }

  // If no search term, return all filtered results
  if (!searchTerm.trim()) {
    return results.map(item => ({ item }))
  }

  // Perform fuzzy search
  const fuse = new Fuse(results, promptSearchOptions)
  const fuseResults = fuse.search(searchTerm)
  
  return fuseResults.map(result => ({
    item: result.item,
    score: result.score,
    matches: result.matches
  }))
}

// Search protocols with fuzzy matching
export const searchProtocols = (
  protocols: ProtocolData[],
  searchTerm: string,
  filters?: {
    category?: string
    organization?: string
    compatibleModels?: string[]
  }
): SearchResult<ProtocolData>[] => {
  let results = protocols

  // Apply filters first
  if (filters) {
    results = protocols.filter(protocol => {
      if (filters.category && filters.category !== 'all' && protocol.category !== filters.category) {
        return false
      }
      
      if (filters.organization && filters.organization !== 'all' && protocol.organization !== filters.organization) {
        return false
      }
      
      if (filters.compatibleModels && filters.compatibleModels.length > 0) {
        const hasMatchingModel = filters.compatibleModels.some(model => 
          protocol.compatibleModels.includes(model)
        )
        if (!hasMatchingModel) return false
      }
      
      return true
    })
  }

  // If no search term, return all filtered results
  if (!searchTerm.trim()) {
    return results.map(item => ({ item }))
  }

  // Perform fuzzy search
  const fuse = new Fuse(results, protocolSearchOptions)
  const fuseResults = fuse.search(searchTerm)
  
  return fuseResults.map(result => ({
    item: result.item,
    score: result.score,
    matches: result.matches
  }))
}

// Get search suggestions based on current data
export const getPromptSearchSuggestions = (prompts: PromptData[], partial: string): string[] => {
  if (!partial || partial.length < 2) return []
  
  const suggestions = new Set<string>()
  const lowerPartial = partial.toLowerCase()
  
  prompts.forEach(prompt => {
    // Extract relevant terms for suggestions
    const terms = [
      prompt.title,
      prompt.attackType,
      prompt.source,
      prompt.targetModel,
      prompt.threatDomain,
      ...prompt.modalities
    ]
    
    terms.forEach(term => {
      if (term.toLowerCase().includes(lowerPartial)) {
        // Add the full term if it contains the partial
        suggestions.add(term)
      }
      
      // Also add words from the term that start with the partial
      const words = term.split(/\s+/)
      words.forEach(word => {
        if (word.toLowerCase().startsWith(lowerPartial)) {
          suggestions.add(word)
        }
      })
    })
  })
  
  return Array.from(suggestions)
    .sort((a, b) => {
      // Prioritize exact matches at the beginning
      const aStartsWithPartial = a.toLowerCase().startsWith(lowerPartial)
      const bStartsWithPartial = b.toLowerCase().startsWith(lowerPartial)
      
      if (aStartsWithPartial && !bStartsWithPartial) return -1
      if (!aStartsWithPartial && bStartsWithPartial) return 1
      
      // Then sort by length (shorter first)
      return a.length - b.length
    })
    .slice(0, 10) // Limit to 10 suggestions
}

// Get protocol search suggestions
export const getProtocolSearchSuggestions = (protocols: ProtocolData[], partial: string): string[] => {
  if (!partial || partial.length < 2) return []
  
  const suggestions = new Set<string>()
  const lowerPartial = partial.toLowerCase()
  
  protocols.forEach(protocol => {
    const terms = [
      protocol.name,
      protocol.organization,
      protocol.category,
      ...protocol.metrics,
      ...protocol.compatibleModels
    ]
    
    terms.forEach(term => {
      if (term.toLowerCase().includes(lowerPartial)) {
        suggestions.add(term)
      }
      
      const words = term.split(/\s+/)
      words.forEach(word => {
        if (word.toLowerCase().startsWith(lowerPartial)) {
          suggestions.add(word)
        }
      })
    })
  })
  
  return Array.from(suggestions)
    .sort((a, b) => {
      const aStartsWithPartial = a.toLowerCase().startsWith(lowerPartial)
      const bStartsWithPartial = b.toLowerCase().startsWith(lowerPartial)
      
      if (aStartsWithPartial && !bStartsWithPartial) return -1
      if (!aStartsWithPartial && bStartsWithPartial) return 1
      
      return a.length - b.length
    })
    .slice(0, 10)
}

// Helper function to highlight search matches in text
export const highlightMatches = (text: string, matches?: readonly Fuse.FuseResultMatch[]): string => {
  if (!matches || matches.length === 0) return text
  
  let highlightedText = text
  const ranges: Array<{ start: number; end: number }> = []
  
  // Collect all match ranges
  matches.forEach(match => {
    if (match.indices) {
      match.indices.forEach(([start, end]: [number, number]) => {
        ranges.push({ start, end })
      })
    }
  })
  
  // Sort ranges by start position in descending order to avoid offset issues
  ranges.sort((a, b) => b.start - a.start)
  
  // Apply highlighting from right to left
  ranges.forEach(({ start, end }) => {
    const before = highlightedText.slice(0, start)
    const match = highlightedText.slice(start, end + 1)
    const after = highlightedText.slice(end + 1)
    highlightedText = `${before}<mark>${match}</mark>${after}`
  })
  
  return highlightedText
}

// Extract unique values for filter options
export const getUniqueAttackTypes = (prompts: PromptData[]): string[] => {
  return Array.from(new Set(prompts.map(p => p.attackType))).sort()
}

export const getUniqueModalities = (prompts: PromptData[]): string[] => {
  const modalities = new Set<string>()
  prompts.forEach(p => p.modalities.forEach(m => modalities.add(m)))
  return Array.from(modalities).sort()
}

export const getUniqueThreatDomains = (prompts: PromptData[]): string[] => {
  return Array.from(new Set(prompts.map(p => p.threatDomain))).sort()
}

export const getUniqueTargetModels = (prompts: PromptData[]): string[] => {
  return Array.from(new Set(prompts.map(p => p.targetModel))).sort()
}

export const getUniqueCategories = (protocols: ProtocolData[]): string[] => {
  return Array.from(new Set(protocols.map(p => p.category))).sort()
}

export const getUniqueOrganizations = (protocols: ProtocolData[]): string[] => {
  return Array.from(new Set(protocols.map(p => p.organization))).sort()
}

export const getUniqueCompatibleModels = (protocols: ProtocolData[]): string[] => {
  const models = new Set<string>()
  protocols.forEach(p => p.compatibleModels.forEach(m => models.add(m)))
  return Array.from(models).sort()
}