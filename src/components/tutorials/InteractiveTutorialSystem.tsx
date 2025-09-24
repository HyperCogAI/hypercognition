import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  CheckCircle, 
  Circle, 
  Target,
  TrendingUp,
  Bot,
  Wallet,
  BarChart3,
  Shield,
  Book
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useTutorialProgress } from "@/hooks/useTutorialProgress"

interface TutorialStep {
  id: string
  title: string
  description: string
  content: string
  action?: string
  targetSelector?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  completed: boolean
}

interface Tutorial {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  icon: any
  steps: TutorialStep[]
  completed: boolean
}

// Icon mapping for tutorial icons
const ICON_MAP: Record<string, any> = {
  TrendingUp,
  Bot,
  BarChart3,
  Wallet,
  Shield,
  Book
}

interface TutorialPlayerProps {
  tutorial: any
  onComplete: () => void
  onClose: () => void
  onStepComplete: (stepId: string) => Promise<boolean>
  isStepCompleted: (stepId: string) => boolean
}

function TutorialPlayer({ tutorial, onComplete, onClose, onStepComplete, isStepCompleted }: TutorialPlayerProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const { toast } = useToast()

  const currentStepData = tutorial.steps[currentStep]
  const progress = ((currentStep + 1) / tutorial.steps.length) * 100

  const handleNext = async () => {
    // Mark current step as completed
    const success = await onStepComplete(currentStepData.id)
    if (!success) return

    if (currentStep < tutorial.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
      toast({
        title: "Tutorial Completed!",
        description: `You've finished "${tutorial.title}". Great job!`,
      })
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleReset = () => {
    setCurrentStep(0)
    setIsPlaying(false)
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">{tutorial.title}</h3>
          <Badge variant="outline">
            Step {currentStep + 1} of {tutorial.steps.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Current Step Content */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {currentStepData.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{currentStepData.description}</p>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p>{currentStepData.content}</p>
          </div>
          {currentStepData.action && (
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
              {isStepCompleted(currentStepData.id) ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Circle className="h-4 w-4 text-primary" />
              )}
              <span className="text-sm font-medium">{currentStepData.action}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button onClick={handleNext}>
            {currentStep === tutorial.steps.length - 1 ? 'Complete' : 'Next'}
            <SkipForward className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function InteractiveTutorialSystem() {
  const { 
    tutorials, 
    loading, 
    markStepCompleted, 
    getTutorialProgress, 
    isTutorialCompleted, 
    isStepCompleted 
  } = useTutorialProgress()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [activeTutorial, setActiveTutorial] = useState<any>(null)

  const categories = ['all', ...new Set(tutorials.map(t => t.category))]
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced']

  const filteredTutorials = tutorials.filter(tutorial => {
    const categoryMatch = selectedCategory === 'all' || tutorial.category === selectedCategory
    const difficultyMatch = selectedDifficulty === 'all' || tutorial.difficulty === selectedDifficulty
    return categoryMatch && difficultyMatch
  })

  const completeTutorial = () => {
    setActiveTutorial(null)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Interactive Tutorials
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Master trading features with step-by-step interactive guides designed to enhance your trading skills
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Difficulty</label>
          <div className="flex flex-wrap gap-2">
            {difficulties.map(difficulty => (
              <Button
                key={difficulty}
                variant={selectedDifficulty === difficulty ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDifficulty(difficulty)}
                className="capitalize"
              >
                {difficulty}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Tutorial Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="p-6 space-y-4">
                <div className="h-6 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-10 bg-muted rounded" />
              </div>
            </Card>
          ))
        ) : (
          filteredTutorials.map(tutorial => {
            const Icon = ICON_MAP[tutorial.icon] || Book
            const progress = getTutorialProgress(tutorial.id)
            const completed = isTutorialCompleted(tutorial.id)
            return (
              <Card key={tutorial.id} className="relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300">
                {completed && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                )}
                
                {progress.percentage > 0 && progress.percentage < 100 && (
                  <div className="absolute top-3 right-3">
                    <div className="relative">
                      <Circle className="h-5 w-5 text-muted-foreground" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium">{Math.round(progress.percentage)}%</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", getDifficultyColor(tutorial.difficulty))}
                        >
                          {tutorial.difficulty}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{tutorial.duration}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{tutorial.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {tutorial.steps.length} steps
                    </span>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm"
                          onClick={() => setActiveTutorial(tutorial)}
                          disabled={completed}
                          variant={progress.percentage > 0 && !completed ? "outline" : "default"}
                        >
                          {completed ? 'Completed' : progress.percentage > 0 ? 'Continue' : 'Start Tutorial'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Interactive Tutorial</DialogTitle>
                        </DialogHeader>
                        {activeTutorial && (
                          <TutorialPlayer
                            tutorial={activeTutorial}
                            onComplete={completeTutorial}
                            onClose={() => setActiveTutorial(null)}
                            onStepComplete={(stepId) => markStepCompleted(activeTutorial.id, stepId)}
                            isStepCompleted={(stepId) => isStepCompleted(activeTutorial.id, stepId)}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Progress Summary */}
      <Card className="bg-gradient-to-r from-card/50 to-card-glow/30 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5 text-primary" />
            Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {tutorials.filter(t => isTutorialCompleted(t.id)).length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">
                {tutorials.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Tutorials</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {tutorials.length > 0 ? Math.round((tutorials.filter(t => isTutorialCompleted(t.id)).length / tutorials.length) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}