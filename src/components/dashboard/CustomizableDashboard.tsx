import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { 
  Layout,
  Grid3X3,
  Plus,
  Settings,
  Trash2,
  Move,
  Eye,
  EyeOff,
  BarChart3,
  TrendingUp,
  Wallet,
  Bot,
  Newspaper,
  Calendar,
  Bell,
  Target,
  Activity,
  DollarSign,
  Users,
  Zap,
  Shield
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardWidget {
  id: string
  type: string
  title: string
  description: string
  icon: any
  size: 'sm' | 'md' | 'lg' | 'xl'
  position: { x: number; y: number }
  visible: boolean
  config?: Record<string, any>
}

interface DashboardLayout {
  id: string
  name: string
  description: string
  widgets: DashboardWidget[]
  columns: number
  isDefault?: boolean
}

const WIDGET_TYPES = [
  {
    type: 'portfolio-overview',
    title: 'Portfolio Overview',
    description: 'Total portfolio value and performance metrics',
    icon: Wallet,
    defaultSize: 'md' as const,
    category: 'Portfolio'
  },
  {
    type: 'price-chart',
    title: 'Price Chart',
    description: 'Real-time price charts for selected assets',
    icon: BarChart3,
    defaultSize: 'lg' as const,
    category: 'Trading'
  },
  {
    type: 'active-agents',
    title: 'Active Agents',
    description: 'Your currently running AI trading agents',
    icon: Bot,
    defaultSize: 'md' as const,
    category: 'AI'
  },
  {
    type: 'market-news',
    title: 'Market News',
    description: 'Latest market news and updates',
    icon: Newspaper,
    defaultSize: 'md' as const,
    category: 'News'
  },
  {
    type: 'notifications',
    title: 'Notifications',
    description: 'Recent alerts and notifications',
    icon: Bell,
    defaultSize: 'sm' as const,
    category: 'Alerts'
  },
  {
    type: 'trading-signals',
    title: 'Trading Signals',
    description: 'AI-generated trading recommendations',
    icon: Target,
    defaultSize: 'md' as const,
    category: 'AI'
  },
  {
    type: 'performance-metrics',
    title: 'Performance Metrics',
    description: 'Detailed performance analytics',
    icon: Activity,
    defaultSize: 'lg' as const,
    category: 'Analytics'
  },
  {
    type: 'top-movers',
    title: 'Top Movers',
    description: 'Biggest price movements in your watchlist',
    icon: TrendingUp,
    defaultSize: 'sm' as const,
    category: 'Market'
  },
  {
    type: 'pnl-summary',
    title: 'P&L Summary',
    description: 'Profit and loss breakdown',
    icon: DollarSign,
    defaultSize: 'md' as const,
    category: 'Trading'
  },
  {
    type: 'social-sentiment',
    title: 'Social Sentiment',
    description: 'Market sentiment from social media',
    icon: Users,
    defaultSize: 'sm' as const,
    category: 'Analytics'
  }
]

const DEFAULT_LAYOUTS: DashboardLayout[] = [
  {
    id: 'trading-focused',
    name: 'Trading Focused',
    description: 'Optimized for active trading',
    columns: 4,
    isDefault: true,
    widgets: [
      {
        id: 'portfolio-1',
        type: 'portfolio-overview',
        title: 'Portfolio Overview',
        description: 'Total portfolio value and performance metrics',
        icon: Wallet,
        size: 'md',
        position: { x: 0, y: 0 },
        visible: true
      },
      {
        id: 'chart-1',
        type: 'price-chart',
        title: 'Price Chart',
        description: 'Real-time price charts for selected assets',
        icon: BarChart3,
        size: 'lg',
        position: { x: 2, y: 0 },
        visible: true
      },
      {
        id: 'agents-1',
        type: 'active-agents',
        title: 'Active Agents',
        description: 'Your currently running AI trading agents',
        icon: Bot,
        size: 'md',
        position: { x: 0, y: 1 },
        visible: true
      },
      {
        id: 'signals-1',
        type: 'trading-signals',
        title: 'Trading Signals',
        description: 'AI-generated trading recommendations',
        icon: Target,
        size: 'md',
        position: { x: 2, y: 1 },
        visible: true
      }
    ]
  },
  {
    id: 'analytics-focused',
    name: 'Analytics Dashboard',
    description: 'Comprehensive market analytics',
    columns: 3,
    widgets: [
      {
        id: 'performance-1',
        type: 'performance-metrics',
        title: 'Performance Metrics',
        description: 'Detailed performance analytics',
        icon: Activity,
        size: 'lg',
        position: { x: 0, y: 0 },
        visible: true
      },
      {
        id: 'movers-1',
        type: 'top-movers',
        title: 'Top Movers',
        description: 'Biggest price movements in your watchlist',
        icon: TrendingUp,
        size: 'sm',
        position: { x: 2, y: 0 },
        visible: true
      },
      {
        id: 'sentiment-1',
        type: 'social-sentiment',
        title: 'Social Sentiment',
        description: 'Market sentiment from social media',
        icon: Users,
        size: 'sm',
        position: { x: 2, y: 1 },
        visible: true
      }
    ]
  }
]

function WidgetCard({ widget, onEdit, onDelete, isDragMode }: {
  widget: DashboardWidget
  onEdit: (widget: DashboardWidget) => void
  onDelete: (widgetId: string) => void
  isDragMode: boolean
}) {
  const Icon = widget.icon
  
  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm': return 'col-span-1 row-span-1'
      case 'md': return 'col-span-2 row-span-1'
      case 'lg': return 'col-span-2 row-span-2'
      case 'xl': return 'col-span-3 row-span-2'
      default: return 'col-span-2 row-span-1'
    }
  }

  return (
    <Card 
      className={cn(
        getSizeClasses(widget.size),
        "relative group transition-all duration-200",
        isDragMode && "cursor-move hover:scale-[1.02]",
        !widget.visible && "opacity-50"
      )}
    >
      {isDragMode && (
        <div className="absolute inset-0 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
          <Move className="h-6 w-6 text-primary" />
        </div>
      )}
      
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onEdit(widget)}
          className="h-6 w-6 p-0"
        >
          <Settings className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(widget.id)}
          className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className="h-4 w-4" />
          {widget.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="h-full flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">{widget.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function WidgetLibrary({ onAddWidget }: { onAddWidget: (type: string) => void }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  
  const categories = ['All', ...new Set(WIDGET_TYPES.map(w => w.category))]
  const filteredWidgets = selectedCategory === 'All' 
    ? WIDGET_TYPES 
    : WIDGET_TYPES.filter(w => w.category === selectedCategory)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>
      
      <div className="grid gap-3 md:grid-cols-2">
        {filteredWidgets.map(widget => {
          const Icon = widget.icon
          return (
            <Card key={widget.type} className="cursor-pointer hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{widget.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{widget.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-xs">
                        {widget.category}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => onAddWidget(widget.type)}
                        className="h-6 px-2 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export function CustomizableDashboard() {
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout>(DEFAULT_LAYOUTS[0])
  const [isDragMode, setIsDragMode] = useState(false)
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false)
  const [editingWidget, setEditingWidget] = useState<DashboardWidget | null>(null)

  const addWidget = useCallback((type: string) => {
    const widgetType = WIDGET_TYPES.find(w => w.type === type)
    if (!widgetType) return

    const newWidget: DashboardWidget = {
      id: `${type}-${Date.now()}`,
      type,
      title: widgetType.title,
      description: widgetType.description,
      icon: widgetType.icon,
      size: widgetType.defaultSize,
      position: { x: 0, y: currentLayout.widgets.length },
      visible: true
    }

    setCurrentLayout(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget]
    }))
    setShowWidgetLibrary(false)
  }, [currentLayout.widgets.length])

  const removeWidget = useCallback((widgetId: string) => {
    setCurrentLayout(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== widgetId)
    }))
  }, [])

  const updateWidget = useCallback((updatedWidget: DashboardWidget) => {
    setCurrentLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => w.id === updatedWidget.id ? updatedWidget : w)
    }))
  }, [])

  const toggleWidgetVisibility = useCallback((widgetId: string) => {
    setCurrentLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.id === widgetId ? { ...w, visible: !w.visible } : w
      )
    }))
  }, [])

  const switchLayout = useCallback((layoutId: string) => {
    const layout = DEFAULT_LAYOUTS.find(l => l.id === layoutId)
    if (layout) {
      setCurrentLayout(layout)
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Customizable Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Personalize your trading experience with custom widgets and layouts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={currentLayout.id} onValueChange={switchLayout}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEFAULT_LAYOUTS.map(layout => (
                <SelectItem key={layout.id} value={layout.id}>
                  {layout.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setIsDragMode(!isDragMode)}
            className={cn(isDragMode && "bg-primary/10 border-primary/30")}
          >
            <Move className="h-4 w-4 mr-2" />
            {isDragMode ? 'Exit Edit' : 'Edit Layout'}
          </Button>

          <Dialog open={showWidgetLibrary} onOpenChange={setShowWidgetLibrary}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Widget Library</DialogTitle>
              </DialogHeader>
              <WidgetLibrary onAddWidget={addWidget} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Layout Info */}
      <Card className="bg-gradient-to-r from-card/50 to-card-glow/30 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{currentLayout.name}</h3>
              <p className="text-sm text-muted-foreground">{currentLayout.description}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{currentLayout.widgets.length} widgets</span>
              <span>{currentLayout.widgets.filter(w => w.visible).length} visible</span>
              <span>{currentLayout.columns} columns</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Widget Management */}
      {isDragMode && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-yellow-400">
                <Settings className="h-4 w-4" />
                <span className="font-medium">Edit Mode Active</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentLayout.widgets.map(widget => (
                  <div key={widget.id} className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleWidgetVisibility(widget.id)}
                      className="h-6 px-2 text-xs"
                    >
                      {widget.visible ? (
                        <Eye className="h-3 w-3 mr-1" />
                      ) : (
                        <EyeOff className="h-3 w-3 mr-1" />
                      )}
                      {widget.title}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Grid */}
      <div 
        className={cn(
          "grid gap-4 auto-rows-fr",
          currentLayout.columns === 3 && "grid-cols-3",
          currentLayout.columns === 4 && "grid-cols-4",
          currentLayout.columns === 6 && "grid-cols-6"
        )}
        style={{ minHeight: '600px' }}
      >
        {currentLayout.widgets
          .filter(widget => widget.visible || isDragMode)
          .map(widget => (
            <WidgetCard
              key={widget.id}
              widget={widget}
              onEdit={setEditingWidget}
              onDelete={removeWidget}
              isDragMode={isDragMode}
            />
          ))}
      </div>

      {/* Widget Editor Dialog */}
      <Dialog open={!!editingWidget} onOpenChange={() => setEditingWidget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Widget</DialogTitle>
          </DialogHeader>
          {editingWidget && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Widget Size</Label>
                <Select
                  value={editingWidget.size}
                  onValueChange={(size: any) => 
                    setEditingWidget({ ...editingWidget, size })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Small (1x1)</SelectItem>
                    <SelectItem value="md">Medium (2x1)</SelectItem>
                    <SelectItem value="lg">Large (2x2)</SelectItem>
                    <SelectItem value="xl">Extra Large (3x2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="visible"
                  checked={editingWidget.visible}
                  onCheckedChange={(visible) => 
                    setEditingWidget({ ...editingWidget, visible: !!visible })
                  }
                />
                <Label htmlFor="visible">Widget visible</Label>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    updateWidget(editingWidget)
                    setEditingWidget(null)
                  }}
                >
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingWidget(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}