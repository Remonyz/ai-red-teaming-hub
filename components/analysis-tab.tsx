"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from "recharts"
import { TrendingUp, Target, Database } from "lucide-react"
import { getAllDatasets } from "@/lib/data"
import { useMemo, useEffect, useState } from "react"

export function AnalysisTab() {
  const [promptsData, setPromptsData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const datasets = await getAllDatasets()
        setPromptsData(datasets)
      } catch (error) {
        console.error('Failed to load datasets:', error)
        setPromptsData([])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const totalPrompts = promptsData.length

  const attackTypeData = useMemo(() => {
    if (!promptsData.length) return []
    const counts: Record<string, number> = {}
    promptsData.forEach(p => {
      if (p.attackType) {
        counts[p.attackType] = (counts[p.attackType] || 0) + 1
      }
    })
    return Object.entries(counts).map(([attackType, count]) => ({
      name: attackType.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      count,
      percentage: Math.round((count / totalPrompts) * 100),
    }))
  }, [promptsData, totalPrompts])


  const frameworkData = useMemo(() => {
    if (!promptsData.length) return []
    const counts: Record<string, number> = {}
    promptsData.forEach(p => {
      if (p.source) {
        counts[p.source] = (counts[p.source] || 0) + 1
      }
    })
    const colors = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#06B6D4']
    return Object.entries(counts).map(([name, value], index) => ({
      name: name.length > 20 ? name.substring(0, 20) + '...' : name,
      value,
      color: colors[index % colors.length]
    }))
  }, [promptsData])

  const taskCategoryInsights = useMemo(() => {
    if (!promptsData.length) return []
    
    // Group datasets by attack type
    const categoryGroups: Record<string, string[]> = {}
    promptsData.forEach(p => {
      if (p.attackType && p.title) {
        if (!categoryGroups[p.attackType]) {
          categoryGroups[p.attackType] = []
        }
        categoryGroups[p.attackType].push(p.title)
      }
    })
    
    // Create insights about each category
    return Object.entries(categoryGroups)
      .map(([category, datasets]) => ({
        category: category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        count: datasets.length,
        percentage: Math.round((datasets.length / totalPrompts) * 100),
        examples: datasets.slice(0, 3) // Show first 3 examples
      }))
      .sort((a, b) => b.count - a.count)
  }, [promptsData, totalPrompts])


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analysis data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">Coverage Analysis</h2>
        <p className="text-gray-600">
          Analysis of AI safety dataset coverage across different task categories and benchmark protocols
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Datasets</p>
                <p className="text-2xl font-bold">{totalPrompts}</p>
              </div>
              <Database className="h-8 w-8 text-berkeley-blue" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Task Categories</p>
                <p className="text-2xl font-bold">{attackTypeData.length}</p>
              </div>
              <Target className="h-8 w-8 text-california-gold" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Benchmark Protocols</p>
                <p className="text-2xl font-bold">{frameworkData.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Task Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Task Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart 
                data={attackTypeData} 
                margin={{ top: 20, right: 30, left: 40, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  interval={0}
                  tick={{ fontSize: 11 }}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(value: any) => [`${value} datasets`, 'Count']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                <Bar dataKey="count" fill="#003262" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="count" position="top" fill="#333" fontSize={10} />
                  {attackTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(211, 100%, ${45 - index * 3}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Benchmark Protocol Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Benchmark Protocols</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {frameworkData.slice(0, 10).map((entry, index) => {
                const percentage = Math.round((entry.value / totalPrompts) * 100)
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium truncate mr-2" title={entry.name}>
                        {entry.name}
                      </span>
                      <span className="text-gray-600 flex-shrink-0">
                        {entry.value} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: entry.color 
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {taskCategoryInsights.slice(0, 4).map((insight, index) => {
          const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500']
          const lightColors = ['bg-blue-50', 'bg-green-50', 'bg-purple-50', 'bg-orange-50']
          const textColors = ['text-blue-700', 'text-green-700', 'text-purple-700', 'text-orange-700']
          
          return (
            <Card key={insight.category} className={`${lightColors[index % 4]} border-0`}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className={`text-sm font-medium ${textColors[index % 4]}`}>
                    {insight.category}
                  </p>
                  <p className="text-2xl font-bold">{insight.count}</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${colors[index % 4]}`}
                      style={{ width: `${insight.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600">{insight.percentage}% of total</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed Task Category Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Task Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {taskCategoryInsights.map((insight, index) => (
              <div key={insight.category} className="p-4 bg-gray-50 rounded-lg">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-base">{insight.category}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {insight.count} datasets
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Coverage</span>
                      <span className="font-medium">{insight.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                        style={{ width: `${insight.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-600 font-medium mb-1">Sample Datasets:</p>
                    <div className="flex flex-wrap gap-1">
                      {insight.examples.map((example, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Research Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-medium text-purple-800">Dataset Distribution Insights</h4>
              <p className="text-sm text-gray-600 mt-1">
                The current collection shows concentration in specific task categories. Consider expanding datasets
                that cover emerging evaluation needs like multimodal understanding, code generation safety, and 
                real-world deployment scenarios.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium text-blue-800">Benchmark Protocol Coverage</h4>
              <p className="text-sm text-gray-600 mt-1">
                Multiple benchmark protocols contribute datasets to the hub. Opportunities exist to integrate
                newer evaluation frameworks and standardized testing protocols as they emerge in the field.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-medium text-green-800">Task Category Diversity</h4>
              <p className="text-sm text-gray-600 mt-1">
                The analysis reveals varying coverage across different task categories. Focus on underrepresented
                areas could strengthen the comprehensive nature of AI safety evaluation coverage.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
