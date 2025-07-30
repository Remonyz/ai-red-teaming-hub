"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Construction, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UnderConstructionBannerProps {
  show?: boolean
}

export function UnderConstructionBanner({ show = true }: UnderConstructionBannerProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      const dismissed = sessionStorage.getItem("under-construction-dismissed")
      setIsVisible(!dismissed)
    } else {
      setIsVisible(false)
    }
  }, [show])

  const handleDismiss = () => {
    sessionStorage.setItem("under-construction-dismissed", "true")
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <Alert className="mb-6 border-yellow-600 bg-yellow-50 relative">
      <Construction className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800 pr-8">
        This page is under construction. We're working on adding comprehensive content here. Check back soon!
      </AlertDescription>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDismiss}
        className="absolute right-2 top-2 h-6 w-6 rounded-md hover:bg-yellow-100"
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4 text-yellow-600" />
      </Button>
    </Alert>
  )
}