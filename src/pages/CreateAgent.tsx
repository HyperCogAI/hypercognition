import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { ArrowLeft, Upload, Bot, Settings, Zap, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export const CreateAgent = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [agentData, setAgentData] = useState({
    name: "",
    symbol: "",
    description: "",
    category: "",
    avatar: "",
    features: [] as string[],
    initialSupply: "",
    initialPrice: "",
    chain: "base"
  })

  const categories = [
    "Trading", "Analytics", "Social", "Gaming", "DeFi", "NFT", "Utility", "Entertainment"
  ]

  const features = [
    "Automated Trading", "Risk Management", "Multi-Chain", "Real-time Analytics",
    "Social Integration", "AI Learning", "Custom Strategies", "Portfolio Management",
    "Market Making", "Arbitrage", "Yield Farming", "Governance"
  ]

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handlePrev = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleFeatureToggle = (feature: string) => {
    setAgentData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const handleSubmit = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .insert([{
          name: agentData.name,
          symbol: agentData.symbol,
          description: agentData.description,
          chain: agentData.chain,
          avatar_url: agentData.avatar || null,
          price: parseFloat(agentData.initialPrice) || 0.001,
          market_cap: (parseFloat(agentData.initialSupply) || 1000000) * (parseFloat(agentData.initialPrice) || 0.001)
        }])
        .select()
        .single()

      if (error) throw error
      
      console.log("Agent created successfully:", data)
      navigate(`/agent/${data.id}`)
    } catch (error) {
      console.error("Error creating agent:", error)
      // Could add toast notification here
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/20 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/")}
                className="hover:bg-card/50"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Create AI Agent</h1>
                <p className="text-muted-foreground">Launch your own AI agent in minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={step >= 1 ? "default" : "outline"}>1. Basic Info</Badge>
              <Badge variant={step >= 2 ? "default" : "outline"}>2. Configuration</Badge>
              <Badge variant={step >= 3 ? "default" : "outline"}>3. Launch</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <Card className="bg-card/30 border-border/50 backdrop-blur-sm animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Agent Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., CryptoSage"
                    value={agentData.name}
                    onChange={(e) => setAgentData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="symbol">Token Symbol *</Label>
                  <Input
                    id="symbol"
                    placeholder="e.g., SAGE"
                    value={agentData.symbol}
                    onChange={(e) => setAgentData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what your AI agent does..."
                  value={agentData.description}
                  onChange={(e) => setAgentData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={agentData.category} onValueChange={(value) => setAgentData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Agent Avatar</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={agentData.avatar} alt="Agent avatar" />
                    <AvatarFallback className="bg-primary/20 text-primary font-semibold text-lg">
                      {agentData.name ? agentData.name.substring(0, 2).toUpperCase() : "AI"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Input
                      placeholder="Avatar URL (optional)"
                      value={agentData.avatar}
                      onChange={(e) => setAgentData(prev => ({ ...prev, avatar: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Paste an image URL or leave blank for auto-generated avatar
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleNext}
                  disabled={!agentData.name || !agentData.symbol || !agentData.description || !agentData.category}
                >
                  Next: Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Configuration */}
        {step === 2 && (
          <Card className="bg-card/30 border-border/50 backdrop-blur-sm animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Agent Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Features & Capabilities</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {features.map((feature) => (
                    <div
                      key={feature}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
                        agentData.features.includes(feature)
                          ? 'border-primary bg-primary/10'
                          : 'border-border/50 bg-card/20'
                      }`}
                      onClick={() => handleFeatureToggle(feature)}
                    >
                      <div className="text-sm font-medium">{feature}</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select the features your agent will have. More features may require higher development costs.
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="supply">Initial Token Supply</Label>
                  <Input
                    id="supply"
                    placeholder="e.g., 1000000000"
                    value={agentData.initialSupply}
                    onChange={(e) => setAgentData(prev => ({ ...prev, initialSupply: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">Total number of tokens to create</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Initial Price (ETH)</Label>
                  <Input
                    id="price"
                    placeholder="e.g., 0.001"
                    value={agentData.initialPrice}
                    onChange={(e) => setAgentData(prev => ({ ...prev, initialPrice: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">Starting price per token</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Blockchain</Label>
                <Select value={agentData.chain} onValueChange={(value) => setAgentData(prev => ({ ...prev, chain: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="base">Base</SelectItem>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="polygon">Polygon</SelectItem>
                    <SelectItem value="arbitrum">Arbitrum</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrev}>
                  Previous
                </Button>
                <Button 
                  onClick={handleNext}
                  disabled={agentData.features.length === 0}
                >
                  Next: Launch
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Launch */}
        {step === 3 && (
          <Card className="bg-card/30 border-border/50 backdrop-blur-sm animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Launch Your Agent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">Agent Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <span className="ml-2 font-medium">{agentData.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Symbol:</span>
                    <span className="ml-2 font-medium">{agentData.symbol}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <span className="ml-2 font-medium">{agentData.category}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Chain:</span>
                    <span className="ml-2 font-medium capitalize">{agentData.chain}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Supply:</span>
                    <span className="ml-2 font-medium">{agentData.initialSupply || "Not set"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Initial Price:</span>
                    <span className="ml-2 font-medium">{agentData.initialPrice ? `${agentData.initialPrice} ETH` : "Not set"}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-muted-foreground">Features:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {agentData.features.map((feature) => (
                      <Badge key={feature} variant="secondary">{feature}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-card/50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Launch Costs
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Creation Fee:</span>
                    <span>0.1 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Feature Development:</span>
                    <span>{agentData.features.length * 0.05} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gas Fees (est.):</span>
                    <span>0.02 ETH</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>{(0.1 + agentData.features.length * 0.05 + 0.02).toFixed(3)} ETH</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrev}>
                  Previous
                </Button>
                <Button 
                  onClick={handleSubmit}
                  className="bg-primary/60 border border-white hover:bg-primary/70"
                >
                  Launch Agent
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}