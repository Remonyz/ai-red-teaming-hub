import { promptsData } from "@/lib/data"
import { protocolsData } from "@/lib/data"

export function Header() {
  const totalPrompts = promptsData.length
  const totalProtocols = protocolsData.length
  
  return (
    <header className="bg-berkeley-blue text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/brsl-logo.png" alt="BRSL Logo" className="h-8 w-auto" />
            <div>
              <h1 className="text-3xl font-bold">AI Red Teaming Knowledge Hub</h1>
              <p className="text-blue-200 mt-2">Prompt and Evaluation Protocol Explorer</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="bg-california-gold text-berkeley-blue px-3 py-1 rounded-full text-sm font-semibold">
              {totalPrompts}+ Prompts
            </span>
            <span className="bg-california-gold text-berkeley-blue px-3 py-1 rounded-full text-sm font-semibold">
              {totalProtocols}+ Protocols
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
