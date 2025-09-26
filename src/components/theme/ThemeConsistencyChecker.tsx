import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import { 
  Sun, 
  Moon, 
  Palette, 
  Check, 
  X, 
  AlertTriangle,
  Eye,
  Contrast,
  Type,
  Square,
  Circle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeIssue {
  id: string
  type: 'color' | 'contrast' | 'spacing' | 'typography'
  severity: 'low' | 'medium' | 'high'
  component: string
  description: string
  suggestion: string
}

interface ColorSwatch {
  name: string
  cssVar: string
  lightValue: string
  darkValue: string
  category: 'primary' | 'neutral' | 'semantic'
}

const COLOR_SWATCHES: ColorSwatch[] = [
  { name: 'Background', cssVar: '--background', lightValue: 'hsl(222 30% 5%)', darkValue: 'hsl(222 15% 6%)', category: 'neutral' },
  { name: 'Foreground', cssVar: '--foreground', lightValue: 'hsl(210 40% 95%)', darkValue: 'hsl(210 40% 98%)', category: 'neutral' },
  { name: 'Primary', cssVar: '--primary', lightValue: 'hsl(186 100% 62%)', darkValue: 'hsl(195 100% 50%)', category: 'primary' },
  { name: 'Secondary', cssVar: '--secondary', lightValue: 'hsl(210 100% 65%)', darkValue: 'hsl(210 100% 65%)', category: 'primary' },
  { name: 'Accent', cssVar: '--accent', lightValue: 'hsl(210 100% 65%)', darkValue: 'hsl(140 100% 50%)', category: 'primary' },
  { name: 'Card', cssVar: '--card', lightValue: 'hsl(222 25% 6%)', darkValue: 'hsl(222 20% 8%)', category: 'neutral' },
  { name: 'Border', cssVar: '--border', lightValue: 'hsl(220 10% 15%)', darkValue: 'hsl(222 20% 20%)', category: 'neutral' },
  { name: 'Muted', cssVar: '--muted', lightValue: 'hsl(0 0% 8%)', darkValue: 'hsl(222 20% 15%)', category: 'neutral' },
  { name: 'Destructive', cssVar: '--destructive', lightValue: 'hsl(0 60% 50%)', darkValue: 'hsl(0 85% 55%)', category: 'semantic' },
]

const MOCK_ISSUES: ThemeIssue[] = [
  {
    id: '1',
    type: 'contrast',
    severity: 'high',
    component: 'Button (Primary)',
    description: 'Insufficient contrast ratio between text and background (3.2:1)',
    suggestion: 'Increase text darkness or button lightness to achieve 4.5:1 ratio'
  },
  {
    id: '2',
    type: 'color',
    severity: 'medium',
    component: 'Card Headers',
    description: 'Inconsistent card header colors across dark/light themes',
    suggestion: 'Use semantic color tokens instead of hardcoded values'
  },
  {
    id: '3',
    type: 'spacing',
    severity: 'low',
    component: 'Navigation Menu',
    description: 'Inconsistent padding in mobile vs desktop navigation',
    suggestion: 'Use responsive spacing tokens consistently'
  },
  {
    id: '4',
    type: 'typography',
    severity: 'medium',
    component: 'Form Labels',
    description: 'Font weight changes between themes',
    suggestion: 'Define consistent typography scales for both themes'
  }
]

function ColorPalette({ swatches }: { swatches: ColorSwatch[] }) {
  const { theme } = useTheme()
  
  const categories = ['primary', 'neutral', 'semantic'] as const
  
  return (
    <div className="space-y-6">
      {categories.map(category => (
        <div key={category} className="space-y-3">
          <h4 className="text-sm font-medium capitalize">{category} Colors</h4>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {swatches
              .filter(swatch => swatch.category === category)
              .map(swatch => (
                <div key={swatch.name} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded border border-border"
                      style={{ backgroundColor: `hsl(var(${swatch.cssVar}))` }}
                    />
                    <div>
                      <div className="text-sm font-medium">{swatch.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {swatch.cssVar}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <div>Light: {swatch.lightValue}</div>
                    <div>Dark: {swatch.darkValue}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ContrastChecker() {
  const [testResults, setTestResults] = useState<Array<{
    id: string
    element: string
    ratio: number
    status: 'pass' | 'fail' | 'aa' | 'aaa'
  }>>([])

  useEffect(() => {
    // Simulate contrast checking
    const mockResults = [
      { id: '1', element: 'Primary Button Text', ratio: 4.8, status: 'aa' as const },
      { id: '2', element: 'Secondary Button Text', ratio: 3.2, status: 'fail' as const },
      { id: '3', element: 'Card Title Text', ratio: 7.1, status: 'aaa' as const },
      { id: '4', element: 'Muted Text', ratio: 4.1, status: 'pass' as const },
      { id: '5', element: 'Link Text', ratio: 5.5, status: 'aa' as const },
    ]
    setTestResults(mockResults)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aaa': return 'text-green-400 bg-green-500/20'
      case 'aa': return 'text-green-400 bg-green-500/20'
      case 'pass': return 'text-yellow-400 bg-yellow-500/20'
      case 'fail': return 'text-red-400 bg-red-500/20'
      default: return 'text-muted-foreground bg-muted/50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aaa':
      case 'aa':
        return <Check className="h-3 w-3" />
      case 'pass':
        return <AlertTriangle className="h-3 w-3" />
      case 'fail':
        return <X className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Contrast ratios should meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
      </div>
      
      <div className="space-y-2">
        {testResults.map(result => (
          <div key={result.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
            <div className="flex items-center gap-3">
              <div className={cn("flex items-center gap-1 px-2 py-1 rounded text-xs", getStatusColor(result.status))}>
                {getStatusIcon(result.status)}
                {result.status.toUpperCase()}
              </div>
              <span className="text-sm">{result.element}</span>
            </div>
            <div className="text-sm font-mono">
              {result.ratio.toFixed(1)}:1
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ComponentPreview() {
  const { theme, setTheme } = useTheme()
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          Toggle Theme
        </Button>
        <span className="text-sm text-muted-foreground">
          Current: {theme}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Buttons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Primary</Button>
              <Button variant="secondary" size="sm">Secondary</Button>
              <Button variant="outline" size="sm">Outline</Button>
              <Button variant="ghost" size="sm">Ghost</Button>
              <Button variant="destructive" size="sm">Destructive</Button>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Badges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Typography</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Heading 1</h1>
            <h2 className="text-xl font-semibold">Heading 2</h2>
            <h3 className="text-lg font-medium">Heading 3</h3>
            <p className="text-base">Regular paragraph text</p>
            <p className="text-sm text-muted-foreground">Muted text</p>
          </CardContent>
        </Card>

        {/* Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Card Variants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Card className="p-3">
              <p className="text-sm">Nested card</p>
            </Card>
            <Card className="p-3 border-primary/30 bg-primary/5">
              <p className="text-sm">Highlighted card</p>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function ThemeConsistencyChecker() {
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState<'overview' | 'colors' | 'contrast' | 'preview'>('overview')
  const [issues, setIssues] = useState(MOCK_ISSUES)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30'
      default: return 'text-muted-foreground bg-muted/50'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'color': return <Palette className="h-4 w-4" />
      case 'contrast': return <Contrast className="h-4 w-4" />
      case 'spacing': return <Square className="h-4 w-4" />
      case 'typography': return <Type className="h-4 w-4" />
      default: return <Circle className="h-4 w-4" />
    }
  }

  const fixIssue = (issueId: string) => {
    setIssues(prev => prev.filter(issue => issue.id !== issueId))
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'contrast', label: 'Contrast', icon: Contrast },
    { id: 'preview', label: 'Preview', icon: Type }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">
          Theme Consistency Checker
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Ensure consistent theming across light and dark modes with automated checks and suggestions
        </p>
      </div>

      {/* Status Card */}
      <Card className="bg-gradient-to-r from-card/50 to-card-glow/30 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Theme Health Status</h3>
                <p className="text-sm text-muted-foreground">
                  Current theme: <span className="capitalize font-medium">{theme}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{issues.length}</div>
                <div className="text-xs text-muted-foreground">Issues</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {Math.max(0, 15 - issues.length)}
                </div>
                <div className="text-xs text-muted-foreground">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(((15 - issues.length) / 15) * 100)}%
                </div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              onClick={() => setActiveTab(tab.id as any)}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </Button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme Issues</CardTitle>
              </CardHeader>
              <CardContent>
                {issues.length === 0 ? (
                  <div className="text-center py-8">
                    <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-400">All Good!</h3>
                    <p className="text-muted-foreground">No theme consistency issues found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {issues.map(issue => (
                      <div key={issue.id} className="flex items-start gap-4 p-4 rounded-lg border border-border/50">
                        <div className="p-2 rounded-lg bg-muted/30">
                          {getTypeIcon(issue.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{issue.component}</h4>
                            <Badge className={cn("text-xs", getSeverityColor(issue.severity))}>
                              {issue.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                          <p className="text-sm text-blue-400 mb-3">{issue.suggestion}</p>
                          <Button size="sm" onClick={() => fixIssue(issue.id)}>
                            Mark as Fixed
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'colors' && (
          <Card>
            <CardHeader>
              <CardTitle>Color Palette</CardTitle>
            </CardHeader>
            <CardContent>
              <ColorPalette swatches={COLOR_SWATCHES} />
            </CardContent>
          </Card>
        )}

        {activeTab === 'contrast' && (
          <Card>
            <CardHeader>
              <CardTitle>Contrast Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ContrastChecker />
            </CardContent>
          </Card>
        )}

        {activeTab === 'preview' && (
          <Card>
            <CardHeader>
              <CardTitle>Component Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <ComponentPreview />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}