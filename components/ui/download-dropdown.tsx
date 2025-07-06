"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Download, FileText, FileSpreadsheet, FileImage, ChevronDown } from "lucide-react"
import { useState } from "react"

interface DownloadDropdownProps {
  onExport: (format: 'json' | 'csv' | 'pdf') => void
  size?: "default" | "sm" | "lg"
  variant?: "default" | "outline" | "secondary" | "ghost"
  disabled?: boolean
  isLoading?: boolean
  itemCount?: number
}

export function DownloadDropdown({ 
  onExport, 
  size = "sm", 
  variant = "outline",
  disabled = false,
  isLoading = false,
  itemCount 
}: DownloadDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleExport = (format: 'json' | 'csv' | 'pdf') => {
    onExport(format)
    setIsOpen(false)
  }

  const getFormatDescription = (format: string) => {
    switch (format) {
      case 'json':
        return 'Structured data format'
      case 'csv':
        return 'Spreadsheet compatible'
      case 'pdf':
        return 'Formatted document'
      default:
        return ''
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          disabled={disabled || isLoading}
          className="flex items-center gap-1"
        >
          <Download className="h-4 w-4" />
          {isLoading ? 'Exporting...' : 'Download'}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {itemCount && (
          <>
            <div className="px-2 py-1.5 text-xs text-gray-500">
              Exporting {itemCount} item{itemCount === 1 ? '' : 's'}
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem 
          onClick={() => handleExport('json')}
          className="flex items-center gap-3 cursor-pointer"
        >
          <FileText className="h-4 w-4 text-blue-600" />
          <div className="flex-1">
            <div className="font-medium">JSON</div>
            <div className="text-xs text-gray-500">{getFormatDescription('json')}</div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleExport('csv')}
          className="flex items-center gap-3 cursor-pointer"
        >
          <FileSpreadsheet className="h-4 w-4 text-green-600" />
          <div className="flex-1">
            <div className="font-medium">CSV</div>
            <div className="text-xs text-gray-500">{getFormatDescription('csv')}</div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleExport('pdf')}
          className="flex items-center gap-3 cursor-pointer"
        >
          <FileImage className="h-4 w-4 text-red-600" />
          <div className="flex-1">
            <div className="font-medium">PDF</div>
            <div className="text-xs text-gray-500">{getFormatDescription('pdf')}</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}