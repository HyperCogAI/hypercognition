import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAgentLogo } from '@/hooks/useAgentLogo'
import { Loader2, Download, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

const LogoGenerator = () => {
  const [agentName, setAgentName] = useState('')
  const [agentSymbol, setAgentSymbol] = useState('')
  const [style, setStyle] = useState('modern minimalist')
  const [generatedLogo, setGeneratedLogo] = useState<string | null>(null)
  
  const { generateLogo, isGenerating } = useAgentLogo()

  const handleGenerate = async () => {
    if (!agentName || !agentSymbol) {
      toast.error('Please fill in both agent name and symbol')
      return
    }

    try {
      const result = await generateLogo(agentName, agentSymbol, style)
      if (result) {
        setGeneratedLogo(result.imageUrl)
        toast.success('Logo generated successfully!')
      }
    } catch (error) {
      toast.error('Failed to generate logo. Please try again.')
      console.error('Logo generation error:', error)
    }
  }

  const handleDownload = () => {
    if (!generatedLogo) return
    
    const link = document.createElement('a')
    link.href = generatedLogo
    link.download = `${agentSymbol}-logo.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const styleOptions = [
    { value: 'modern minimalist', label: 'Modern Minimalist' },
    { value: 'futuristic tech', label: 'Futuristic Tech' },
    { value: 'quantum geometric', label: 'Quantum Geometric' },
    { value: 'defi minimalist', label: 'DeFi Minimalist' },
    { value: 'phoenix rising', label: 'Phoenix Rising' },
    { value: 'neural network', label: 'Neural Network' },
    { value: 'predator elegant', label: 'Predator Elegant' },
    { value: 'cyberpunk neon', label: 'Cyberpunk Neon' },
    { value: 'corporate professional', label: 'Corporate Professional' }
  ]

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Agent Logo Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agentName">Agent Name</Label>
              <Input
                id="agentName"
                placeholder="e.g., AI Prophet"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="agentSymbol">Symbol</Label>
              <Input
                id="agentSymbol"
                placeholder="e.g., AIPT"
                value={agentSymbol}
                onChange={(e) => setAgentSymbol(e.target.value.toUpperCase())}
                maxLength={6}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="style">Logo Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger>
                <SelectValue placeholder="Select a style" />
              </SelectTrigger>
              <SelectContent>
                {styleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !agentName || !agentSymbol}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Logo...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Logo
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedLogo && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Logo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <img 
                  src={generatedLogo} 
                  alt={`${agentName} Logo`}
                  className="max-w-xs max-h-64 object-contain rounded-lg border border-border/50"
                />
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button onClick={handleDownload} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Logo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default LogoGenerator