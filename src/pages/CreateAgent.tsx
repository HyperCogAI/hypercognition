import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { ArrowLeft, Upload, Bot, Settings, Zap, Brain, AlertCircle } from "lucide-react"
import DOMPurify from "dompurify"
import { useAuth } from "@/contexts/AuthContext"
import { CyberButton } from "@/components/ui/cyber-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export const CreateAgent = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user, isLoading } = useAuth()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [agentCreationCount, setAgentCreationCount] = useState(0)
  const [isCheckingLimit, setIsCheckingLimit] = useState(true)
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

  // Check user's agent creation count on mount
  useEffect(() => {
    const checkCreationLimit = async () => {
      if (!user) {
        setIsCheckingLimit(false)
        return
      }

      try {
        const { data, error } = await supabase.rpc('get_user_agent_count_today')
        
        if (error) {
          console.error('Error checking creation limit:', error)
        } else {
          setAgentCreationCount(data || 0)
        }
      } catch (error) {
        console.error('Failed to check creation limit:', error)
      } finally {
        setIsCheckingLimit(false)
      }
    }

    checkCreationLimit()
  }, [user])

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
    setIsSubmitting(true)
    setErrors([])

    try {
      // Sanitize all text inputs on client side for additional security
      const sanitizedData = {
        name: DOMPurify.sanitize(agentData.name.trim(), { ALLOWED_TAGS: [] }),
        symbol: DOMPurify.sanitize(agentData.symbol.trim().toUpperCase(), { ALLOWED_TAGS: [] }),
        description: DOMPurify.sanitize(agentData.description.trim(), { ALLOWED_TAGS: [] }),
        category: DOMPurify.sanitize(agentData.category.trim(), { ALLOWED_TAGS: [] }),
        avatar_url: agentData.avatar ? DOMPurify.sanitize(agentData.avatar.trim(), { ALLOWED_TAGS: [] }) : null,
        features: agentData.features.map(f => DOMPurify.sanitize(f, { ALLOWED_TAGS: [] })),
        initial_supply: agentData.initialSupply,
        initial_price: agentData.initialPrice,
        chain: agentData.chain
      }

      const { data, error } = await supabase.functions.invoke('create-agent', {
        body: sanitizedData
      })

      if (error) {
        console.error("Edge function error:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to create agent. Please try again.",
          variant: "destructive"
        })
        return
      }
      
      if (data?.success) {
        toast({
          title: "Success! 🚀",
          description: `${data.agent.name} has been created successfully!`,
        })
        navigate(`/agent/${data.agent.id}`)
      } else if (data?.errors) {
        setErrors(data.errors)
        toast({
          title: "Validation Error",
          description: "Please fix the errors and try again.",
          variant: "destructive"
        })
      } else {
        throw new Error(data?.error || 'Failed to create agent')
      }
    } catch (error) {
      console.error("Error creating agent:", error)
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state
  if (isLoading || isCheckingLimit) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center justify-center gap-4">
          <Bot className="h-16 w-16 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Check if user has reached daily limit
  const hasReachedLimit = agentCreationCount >= 5
  const remainingCreations = Math.max(0, 5 - agentCreationCount)

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-6 md:pt-10">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-4">
          <CyberButton 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/")}
            className="hover:bg-card/50 border border-primary/20"
          >
            <ArrowLeft className="h-4 w-4" />
          </CyberButton>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            Create AI Agent
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={step >= 1 ? "default" : "outline"} className="border-primary/30">
            1. Basic Info
          </Badge>
          <Badge variant={step >= 2 ? "default" : "outline"} className="border-primary/30">
            2. Configuration
          </Badge>
          <Badge variant={step >= 3 ? "default" : "outline"} className="border-primary/30">
            3. Launch
          </Badge>
          {user && (
            <Badge variant="secondary" className="ml-auto">
              {remainingCreations} creation{remainingCreations !== 1 ? 's' : ''} remaining today
            </Badge>
          )}
        </div>
      </div>

      {/* Rate Limit Warning */}
      {hasReachedLimit && (
        <Alert variant="destructive" className="max-w-4xl mx-auto mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You've reached your daily limit of 5 agent creations. Please try again tomorrow.
          </AlertDescription>
        </Alert>
      )}

      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Error Display */}
        {errors.length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <Card className="bg-card/30 border border-border/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
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
                  <CyberButton variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </CyberButton>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <CyberButton 
                  variant="neon"
                  size="lg"
                  onClick={handleNext}
                  disabled={!agentData.name || !agentData.symbol || !agentData.description || !agentData.category}
                >
                  <span className="text-white">Next: Configuration</span>
                </CyberButton>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Configuration */}
        {step === 2 && (
          <Card className="bg-card/30 border border-border/50 backdrop-blur-sm animate-fade-in">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Settings className="h-5 w-5 text-primary" />
                Agent Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Features & Capabilities</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {features.map((feature) => (
                    <div
                      key={feature}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md ${
                        agentData.features.includes(feature)
                          ? 'border-primary bg-gradient-to-r from-primary/20 to-accent/10 shadow-md shadow-primary/20'
                          : 'border-border/20 bg-gradient-to-r from-muted/30 to-muted/10 hover:border-primary/50'
                      }`}
                      onClick={() => handleFeatureToggle(feature)}
                    >
                      <div className="text-sm font-medium text-foreground">{feature}</div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg border border-border/20">
                  💡 Select the features your agent will have. More features may require higher development costs.
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

              <div className="flex justify-between pt-4">
                <CyberButton variant="outline" onClick={handlePrev} size="lg" className="border-primary/20 hover:bg-card/50">
                  <span className="text-white">Previous</span>
                </CyberButton>
                <CyberButton 
                  variant="neon"
                  size="lg"
                  onClick={handleNext}
                  disabled={agentData.features.length === 0}
                >
                  <span className="text-white">Next: Launch</span>
                </CyberButton>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Launch */}
        {step === 3 && (
          <Card className="bg-card/30 border border-border/50 backdrop-blur-sm animate-fade-in">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Zap className="h-5 w-5 text-primary" />
                Launch Your Agent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Agent Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between p-2 rounded-lg bg-background/50">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-semibold text-foreground">{agentData.name}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-background/50">
                    <span className="text-muted-foreground">Symbol:</span>
                    <span className="font-semibold text-foreground">{agentData.symbol}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-background/50">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-semibold text-foreground">{agentData.category}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-background/50">
                    <span className="text-muted-foreground">Chain:</span>
                    <span className="font-semibold text-foreground capitalize">{agentData.chain}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-background/50">
                    <span className="text-muted-foreground">Supply:</span>
                    <span className="font-semibold text-foreground">{agentData.initialSupply || "Not set"}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-background/50">
                    <span className="text-muted-foreground">Initial Price:</span>
                    <span className="font-semibold text-foreground">{agentData.initialPrice ? `${agentData.initialPrice} ETH` : "Not set"}</span>
                  </div>
                </div>
                <div className="mt-6">
                  <span className="text-muted-foreground font-medium">Features:</span>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {agentData.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl p-6 border border-border/20">
                <h4 className="font-semibold flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20">
                    <Brain className="h-4 w-4 text-green-400" />
                  </div>
                  Launch Costs
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-background/50">
                    <span className="text-muted-foreground">Base Creation Fee:</span>
                    <span className="font-semibold">0.1 ETH</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-background/50">
                    <span className="text-muted-foreground">Feature Development:</span>
                    <span className="font-semibold">{agentData.features.length * 0.05} ETH</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-background/50">
                    <span className="text-muted-foreground">Gas Fees (est.):</span>
                    <span className="font-semibold">0.02 ETH</span>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
                    <span className="font-bold text-foreground">Total:</span>
                    <span className="font-bold text-lg text-foreground">{(0.1 + agentData.features.length * 0.05 + 0.02).toFixed(3)} ETH</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <CyberButton variant="outline" onClick={handlePrev} size="lg" className="border-primary/20 hover:bg-card/50">
                  <span className="text-white">Previous</span>
                </CyberButton>
                <CyberButton 
                  variant="neon"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting || hasReachedLimit}
                  className="px-8"
                >
                  <span className="text-white">
                    {isSubmitting ? (
                      <>
                        <Bot className="inline mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : hasReachedLimit ? (
                      "Daily Limit Reached"
                    ) : (
                      "🚀 Launch Agent"
                    )}
                  </span>
                </CyberButton>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}