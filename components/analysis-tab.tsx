"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, AlertCircle, Target, Database } from "lucide-react"
import { promptsData } from "@/lib/data"
import { useMemo } from "react"

export function AnalysisTab() {
  const totalPrompts = promptsData.length

  const attackTypeData = useMemo(() => {
    const counts: Record<string, number> = {}
    promptsData.forEach(p => {
      counts[p.attackType] = (counts[p.attackType] || 0) + 1
    })
    return Object.entries(counts).map(([attackType, count]) => ({
      name: attackType.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      count,
      percentage: Math.round((count / totalPrompts) * 100),
    }))
  }, [promptsData, totalPrompts])

  const modalityData = useMemo(() => {
    const counts: Record<string, number> = {}
    promptsData.forEach(p => {
      p.modalities.forEach(m => {
        counts[m] = (counts[m] || 0) + 1
      })
    })
    const colors: Record<string, string> = {
      text: '#3B82F6',
      image: '#F59E0B',
      audio: '#EF4444',
    }
    return Object.entries(counts).map(([modality, value]) => ({
      name: modality.charAt(0).toUpperCase() + modality.slice(1),
      value,
      color: colors[modality] || '#8884d8',
    }))
  }, [promptsData])

  const frameworkData = useMemo(() => {
    const mapping = [
      { prefix: 'BD-', name: 'BACKDOORLLM', color: '#6366F1' },
      { prefix: 'JBV-', name: 'JailBreakV', color: '#EC4899' },
      { prefix: 'AIL-', name: 'AILUMINATE', color: '#F59E0B' },
      { prefix: 'ASL-', name: 'AISafetyLab', color: '#10B981' },
      { prefix: 'SB-', name: 'SafetyBench', color: '#3B82F6' },
      { prefix: 'TG-', name: 'ToxiGen', color: '#F87171' },
      { prefix: 'BT-', name: 'BeaverTails', color: '#34D399' },
      { prefix: 'AB-', name: 'AdvBench', color: '#8B5CF6' },
      { prefix: 'CF-', name: 'Cross-Framework', color: '#FB7185' },
    ]
    const counts: Record<string, number> = {}
    promptsData.forEach(p => {
      const ft = mapping.find(m => p.id.startsWith(m.prefix))
      const name = ft ? ft.name : 'Original'
      counts[name] = (counts[name] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => {
      const color = mapping.find(m => m.name === name)?.color || '#A3A3A3'
      return { name, value, color }
    })
  }, [promptsData])

  const coverageGaps = useMemo(() => {
    const domainCounts: Record<string, number> = {}
    promptsData.forEach(p => {
      domainCounts[p.threatDomain] = (domainCounts[p.threatDomain] || 0) + 1
    })
    return Object.entries(domainCounts)
      .map(([domain, count]) => {
        const coverage = Math.round((count / totalPrompts) * 100)
        let priority: string = 'low'
        if (coverage < 20) priority = 'high'
        else if (coverage < 50) priority = 'medium'
        return { domain, coverage, priority }
      })
      .sort((a, b) => a.coverage - b.coverage)
  }, [promptsData, totalPrompts])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">Coverage Analysis</h2>
        <p className="text-gray-600">
          Comprehensive analysis of prompt coverage across attack types, modalities, and threat domains
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Prompts</p>
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
                <p className="text-sm font-medium text-gray-600">Attack Types</p>
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
                <p className="text-sm font-medium text-gray-600">Frameworks</p>
                <p className="text-2xl font-bold">{frameworkData.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority Gaps</p>
                <p className="text-2xl font-bold">{coverageGaps.filter(gap => gap.priority === 'high').length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attack Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Attack Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attackTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#003262" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Modality Coverage */}
        <Card>
          <CardHeader>
            <CardTitle>Modality Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={modalityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {modalityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
  {/* Framework Distribution */}
  <Card>
    <CardHeader>
      <CardTitle>Framework Distribution</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={frameworkData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            dataKey="value"
          >
            {frameworkData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
      </div>

      {/* Coverage Gaps */}
      <Card>
        <CardHeader>
          <CardTitle>Coverage Gaps by Domain</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coverageGaps.map((gap) => (
              <div key={gap.domain} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="font-medium">{gap.domain}</div>
                  <Badge className={getPriorityColor(gap.priority)}>{gap.priority} priority</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">{gap.coverage}% coverage</div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-berkeley-blue h-2 rounded-full" style={{ width: `${gap.coverage}%` }} />
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
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-medium text-red-800">Critical Gap: Healthcare Domain</h4>
              <p className="text-sm text-gray-600 mt-1">
                Only 23% coverage in healthcare-specific prompts. Recommend developing prompts for medical
                misinformation, patient privacy violations, and diagnostic bias scenarios.
              </p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-medium text-yellow-800">Moderate Gap: Multimodal Attacks</h4>
              <p className="text-sm text-gray-600 mt-1">
                Limited coverage of image and audio-based attacks. Consider expanding visual jailbreaks and adversarial
                audio prompts.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium text-blue-800">Opportunity: Cross-Domain Attacks</h4>
              <p className="text-sm text-gray-600 mt-1">
                Develop prompts that combine multiple attack vectors across different domains to test model robustness
                against sophisticated attacks.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
