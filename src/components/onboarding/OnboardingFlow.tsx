import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, ArrowRight, Wallet, Bot, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: any
  completed: boolean
}

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: "wallet",
      title: "Connect Wallet",
      description: "Connect your Web3 wallet to start trading",
      icon: Wallet,
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

  const completeStep = (stepIndex: number) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, completed: true } : step
    ))
    
    if (stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1)
    }
  }

  const completedSteps = steps.filter(step => step.completed).length
  const progressPercentage = (completedSteps / steps.length) * 100

  return (
    <Card className="bg-gradient-to-br from-card/80 to-card-glow/50 border border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Get Started with HyperCognition
          </CardTitle>
          <Badge variant="outline" className="text-primary border-primary/30">
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
          
          return (
            <div
              key={step.id}
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
                  onClick={() => completeStep(index)}
                  className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          )
        })}
        
        {completedSteps === steps.length && (
          <div className="text-center py-4 border-t border-border/50">
            <div className="text-green-500 font-medium mb-2">
              🎉 Welcome to HyperCognition!
            </div>
            <p className="text-sm text-muted-foreground">
              You're all set to start trading with AI agents
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}