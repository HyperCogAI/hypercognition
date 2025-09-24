import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Circle, ArrowRight, Wallet, Bot, TrendingUp, User, Shield, FileText, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: any
  completed: boolean
  component?: React.ComponentType<any>
}

interface KYCFormData {
  firstName: string
  lastName: string
  dateOfBirth: string
  address: string
  city: string
  country: string
  phoneNumber: string
  idDocument: File | null
}

// KYC Form Component
function KYCForm({ onComplete }: { onComplete: () => void }) {
  const [formData, setFormData] = useState<KYCFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    address: '',
    city: '',
    country: '',
    phoneNumber: '',
    idDocument: null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate KYC submission
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "KYC Verification Submitted",
        description: "Your documents are being reviewed. You'll receive an email within 24 hours.",
      })
      
      onComplete()
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact support.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="dateOfBirth">Date of Birth</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="idDocument">Government ID Document</Label>
        <Input
          id="idDocument"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => setFormData(prev => ({ ...prev, idDocument: e.target.files?.[0] || null }))}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Upload a clear photo of your passport, driver's license, or national ID
        </p>
      </div>
      
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Submitting...
          </>
        ) : (
          'Submit KYC Documents'
        )}
      </Button>
    </form>
  )
}

export function OnboardingFlow() {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: "profile",
      title: "Complete Profile",
      description: "Set up your trading profile and preferences",
      icon: User,
      completed: false
    },
    {
      id: "kyc",
      title: "Identity Verification",
      description: "Complete KYC verification for regulatory compliance",
      icon: Shield,
      completed: false,
      component: KYCForm
    },
    {
      id: "wallet",
      title: "Connect Wallet",
      description: "Connect your Web3 wallet to start trading",
      icon: Wallet,
      completed: false
    },
    {
      id: "funding",
      title: "Fund Account",
      description: "Add funds to start trading with real money",
      icon: CreditCard,
      completed: false
    },
    {
      id: "explore",
      title: "Explore Agents",
      description: "Browse our AI trading agent marketplace",
      icon: Bot,
      completed: false
    },
    {
      id: "trade",
      title: "Make Your First Trade",
      description: "Start trading with paper money or real funds",
      icon: TrendingUp,
      completed: false
    }
  ])
  const [showStepDetails, setShowStepDetails] = useState<string | null>(null)

  useEffect(() => {
    // Auto-complete profile step if user is logged in
    if (user && !steps[0].completed) {
      completeStep(0)
    }
  }, [user])

  const completeStep = (stepIndex: number) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, completed: true } : step
    ))
    
    setShowStepDetails(null)
    
    if (stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1)
    }
  }

  const handleStepAction = (step: OnboardingStep, index: number) => {
    if (step.component) {
      setShowStepDetails(step.id)
    } else {
      completeStep(index)
    }
  }

  const completedSteps = steps.filter(step => step.completed).length
  const progressPercentage = (completedSteps / steps.length) * 100

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-card/80 to-card-glow/50 border border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Get Started with HyperCognition
            </CardTitle>
            <Badge variant="outline" className="text-primary bg-primary/60 border border-white">
              {completedSteps}/{steps.length}
            </Badge>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isCurrent = index === currentStep
            const isCompleted = step.completed
            const isDetailed = showStepDetails === step.id
            
            return (
              <div key={step.id} className="space-y-2">
                <div
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-lg border transition-all duration-200",
                    isCurrent && !isCompleted && "border-primary/50 bg-primary/5",
                    isCompleted && "border-green-500/50 bg-green-500/5",
                    !isCurrent && !isCompleted && "border-border/50 opacity-60"
                  )}
                >
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <h3 className="font-medium">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  </div>
                  
                  {isCurrent && !isCompleted && (
                    <Button
                      size="sm"
                      onClick={() => handleStepAction(step, index)}
                      className="bg-primary/60 hover:bg-primary/70 text-primary-foreground border border-white"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {isDetailed && step.component && (
                  <Card className="ml-10 border-primary/30">
                    <CardHeader>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                      <Separator />
                    </CardHeader>
                    <CardContent>
                      <step.component onComplete={() => completeStep(index)} />
                    </CardContent>
                  </Card>
                )}
              </div>
            )
          })}
          
          {completedSteps === steps.length && (
            <div className="text-center py-6 border-t border-border/50">
              <div className="text-green-500 font-medium mb-2 text-lg">
                🎉 Welcome to HyperCognition!
              </div>
              <p className="text-muted-foreground">
                You're all set to start trading with AI agents
              </p>
              <Button className="mt-4" onClick={() => window.location.href = '/marketplace'}>
                Start Trading
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}