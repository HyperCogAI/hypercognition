import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Play, 
  Pause, 
  Square, 
  BarChart3, 
  Zap, 
  Clock, 
  Users, 
  Cpu, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Server,
  Database,
  Globe,
  Shield,
  Target,
  Settings,
  RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface LoadTestConfig {
  id: string
  name: string
  description: string
  type: 'api' | 'database' | 'frontend' | 'full_system'
  duration: number // minutes
  maxUsers: number
  rampUpTime: number // seconds
  targetRPS: number // requests per second
  endpoints: string[]
  isActive: boolean
}

interface TestMetrics {
  timestamp: string
  currentUsers: number
  requestsPerSecond: number
  averageResponseTime: number
  errorRate: number
  cpuUsage: number
  memoryUsage: number
  databaseConnections: number
  throughput: number
}

interface TestResult {
  id: string
  configId: string
  configName: string
  startTime: string
  endTime?: string
  status: 'running' | 'completed' | 'failed' | 'stopped'
  maxUsers: number
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  maxResponseTime: number
  minResponseTime: number
  errorRate: number
  throughput: number
  bottlenecks: string[]
  recommendations: string[]
}

interface PerformanceThreshold {
  metric: string
  warning: number
  critical: number
  unit: string
}

const LOAD_TEST_CONFIGS: LoadTestConfig[] = [
  {
    id: '1',
    name: 'API Stress Test',
    description: 'High-load test for API endpoints',
    type: 'api',
    duration: 10,
    maxUsers: 1000,
    rampUpTime: 300,
    targetRPS: 500,
    endpoints: ['/api/agents', '/api/portfolio', '/api/trading'],
    isActive: true
  },
  {
    id: '2',
    name: 'Database Load Test',
    description: 'Database performance under load',
    type: 'database',
    duration: 15,
    maxUsers: 500,
    rampUpTime: 180,
    targetRPS: 200,
    endpoints: ['/api/data/query', '/api/data/insert'],
    isActive: true
  },
  {
    id: '3',
    name: 'Frontend Performance',
    description: 'Client-side performance testing',
    type: 'frontend',
    duration: 5,
    maxUsers: 100,
    rampUpTime: 60,
    targetRPS: 50,
    endpoints: ['/', '/marketplace', '/portfolio'],
    isActive: false
  }
]

const PERFORMANCE_THRESHOLDS: PerformanceThreshold[] = [
  { metric: 'Response Time', warning: 500, critical: 1000, unit: 'ms' },
  { metric: 'Error Rate', warning: 1, critical: 5, unit: '%' },
  { metric: 'CPU Usage', warning: 70, critical: 90, unit: '%' },
  { metric: 'Memory Usage', warning: 80, critical: 95, unit: '%' },
  { metric: 'Database Connections', warning: 80, critical: 95, unit: '%' },
  { metric: 'Throughput', warning: 100, critical: 50, unit: 'RPS' }
]

const MOCK_TEST_RESULTS: TestResult[] = [
  {
    id: '1',
    configId: '1',
    configName: 'API Stress Test',
    startTime: '2024-01-15T10:00:00Z',
    endTime: '2024-01-15T10:10:00Z',
    status: 'completed',
    maxUsers: 1000,
    totalRequests: 15000,
    successfulRequests: 14850,
    failedRequests: 150,
    averageResponseTime: 245,
    maxResponseTime: 1200,
    minResponseTime: 45,
    errorRate: 1.0,
    throughput: 485,
    bottlenecks: ['Database connection pool', 'Rate limiting'],
    recommendations: [
      'Increase database connection pool size',
      'Implement request queuing',
      'Add caching layer for frequent queries'
    ]
  },
  {
    id: '2',
    configId: '2',
    configName: 'Database Load Test',
    startTime: '2024-01-14T15:30:00Z',
    endTime: '2024-01-14T15:45:00Z',
    status: 'completed',
    maxUsers: 500,
    totalRequests: 8000,
    successfulRequests: 7920,
    failedRequests: 80,
    averageResponseTime: 180,
    maxResponseTime: 800,
    minResponseTime: 25,
    errorRate: 1.0,
    throughput: 195,
    bottlenecks: ['Complex query optimization'],
    recommendations: [
      'Add database indexes for frequent queries',
      'Implement read replicas',
      'Optimize expensive JOIN operations'
    ]
  }
]

function generateMockMetrics(): TestMetrics {
  return {
    timestamp: new Date().toISOString(),
    currentUsers: Math.floor(Math.random() * 800) + 100,
    requestsPerSecond: Math.floor(Math.random() * 400) + 100,
    averageResponseTime: Math.floor(Math.random() * 300) + 50,
    errorRate: Math.random() * 3,
    cpuUsage: Math.floor(Math.random() * 40) + 30,
    memoryUsage: Math.floor(Math.random() * 30) + 50,
    databaseConnections: Math.floor(Math.random() * 20) + 60,
    throughput: Math.floor(Math.random() * 200) + 200
  }
}

function LoadTestConfigForm({ 
  config, 
  onSave, 
  onCancel 
}: { 
  config?: LoadTestConfig
  onSave: (config: Omit<LoadTestConfig, 'id'>) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    name: config?.name || '',
    description: config?.description || '',
    type: config?.type || 'api' as const,
    duration: config?.duration || 10,
    maxUsers: config?.maxUsers || 100,
    rampUpTime: config?.rampUpTime || 60,
    targetRPS: config?.targetRPS || 50,
    endpoints: config?.endpoints || [],
    isActive: config?.isActive ?? true
  })

  const [endpointInput, setEndpointInput] = useState('')
  const { toast } = useToast()

  const addEndpoint = () => {
    if (endpointInput && !formData.endpoints.includes(endpointInput)) {
      setFormData(prev => ({
        ...prev,
        endpoints: [...prev.endpoints, endpointInput]
      }))
      setEndpointInput('')
    }
  }

  const removeEndpoint = (endpoint: string) => {
    setFormData(prev => ({
      ...prev,
      endpoints: prev.endpoints.filter(e => e !== endpoint)
    }))
  }

  const handleSave = () => {
    if (!formData.name || formData.endpoints.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please provide a name and at least one endpoint",
        variant: "destructive"
      })
      return
    }

    onSave(formData)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Test Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="API Load Test"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Test Type</Label>
          <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="api">API Test</SelectItem>
              <SelectItem value="database">Database Test</SelectItem>
              <SelectItem value="frontend">Frontend Test</SelectItem>
              <SelectItem value="full_system">Full System Test</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe the test purpose..."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Duration: {formData.duration} minutes</Label>
          <Slider
            value={[formData.duration]}
            onValueChange={([value]) => setFormData(prev => ({ ...prev, duration: value }))}
            max={60}
            min={1}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <Label>Max Users: {formData.maxUsers}</Label>
          <Slider
            value={[formData.maxUsers]}
            onValueChange={([value]) => setFormData(prev => ({ ...prev, maxUsers: value }))}
            max={5000}
            min={10}
            step={10}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Ramp-up Time: {formData.rampUpTime}s</Label>
          <Slider
            value={[formData.rampUpTime]}
            onValueChange={([value]) => setFormData(prev => ({ ...prev, rampUpTime: value }))}
            max={600}
            min={10}
            step={10}
          />
        </div>

        <div className="space-y-2">
          <Label>Target RPS: {formData.targetRPS}</Label>
          <Slider
            value={[formData.targetRPS]}
            onValueChange={([value]) => setFormData(prev => ({ ...prev, targetRPS: value }))}
            max={1000}
            min={10}
            step={10}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Test Endpoints</Label>
        <div className="flex gap-2">
          <Input
            value={endpointInput}
            onChange={(e) => setEndpointInput(e.target.value)}
            placeholder="/api/endpoint"
            onKeyDown={(e) => e.key === 'Enter' && addEndpoint()}
          />
          <Button type="button" onClick={addEndpoint}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.endpoints.map(endpoint => (
            <Badge key={endpoint} variant="outline" className="gap-1">
              {endpoint}
              <button onClick={() => removeEndpoint(endpoint)} className="ml-1 text-xs">×</button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          {config ? 'Update Configuration' : 'Create Configuration'}
        </Button>
      </div>
    </div>
  )
}

export function LoadTestingSystem() {
  const [testConfigs, setTestConfigs] = useState<LoadTestConfig[]>(LOAD_TEST_CONFIGS)
  const [testResults, setTestResults] = useState<TestResult[]>(MOCK_TEST_RESULTS)
  const [currentMetrics, setCurrentMetrics] = useState<TestMetrics | null>(null)
  const [activeTest, setActiveTest] = useState<string | null>(null)
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [editingConfig, setEditingConfig] = useState<LoadTestConfig | null>(null)
  const [selectedTab, setSelectedTab] = useState<'configs' | 'monitoring' | 'results'>('configs')
  
  const { toast } = useToast()

  // Simulate real-time metrics during active test
  useEffect(() => {
    if (activeTest) {
      const interval = setInterval(() => {
        setCurrentMetrics(generateMockMetrics())
      }, 2000)

      return () => clearInterval(interval)
    } else {
      setCurrentMetrics(null)
    }
  }, [activeTest])

  const startTest = async (configId: string) => {
    const config = testConfigs.find(c => c.id === configId)
    if (!config) return

    setActiveTest(configId)
    toast({
      title: "Load Test Started",
      description: `${config.name} is now running`
    })

    // Simulate test completion after duration
    setTimeout(() => {
      const newResult: TestResult = {
        id: Date.now().toString(),
        configId,
        configName: config.name,
        startTime: new Date(Date.now() - config.duration * 60000).toISOString(),
        endTime: new Date().toISOString(),
        status: 'completed',
        maxUsers: config.maxUsers,
        totalRequests: Math.floor(config.targetRPS * config.duration * 60),
        successfulRequests: Math.floor(config.targetRPS * config.duration * 60 * 0.99),
        failedRequests: Math.floor(config.targetRPS * config.duration * 60 * 0.01),
        averageResponseTime: Math.floor(Math.random() * 200) + 100,
        maxResponseTime: Math.floor(Math.random() * 800) + 500,
        minResponseTime: Math.floor(Math.random() * 50) + 20,
        errorRate: Math.random() * 2,
        throughput: config.targetRPS * 0.95,
        bottlenecks: ['Database queries', 'Memory usage'],
        recommendations: ['Optimize database indexes', 'Increase server memory']
      }

      setTestResults(prev => [newResult, ...prev])
      setActiveTest(null)
      
      toast({
        title: "Load Test Completed",
        description: `${config.name} has finished successfully`
      })
    }, config.duration * 1000) // Simulate faster for demo
  }

  const stopTest = () => {
    if (activeTest) {
      setActiveTest(null)
      toast({
        title: "Load Test Stopped",
        description: "Test has been manually stopped"
      })
    }
  }

  const handleSaveConfig = (configData: Omit<LoadTestConfig, 'id'>) => {
    if (editingConfig) {
      setTestConfigs(prev => prev.map(c => 
        c.id === editingConfig.id 
          ? { ...configData, id: editingConfig.id }
          : c
      ))
      toast({
        title: "Configuration Updated",
        description: `${configData.name} has been updated`
      })
    } else {
      const newConfig: LoadTestConfig = {
        ...configData,
        id: Date.now().toString()
      }
      setTestConfigs(prev => [...prev, newConfig])
      toast({
        title: "Configuration Created",
        description: `${configData.name} has been created`
      })
    }
    
    setShowConfigDialog(false)
    setEditingConfig(null)
  }

  const getThresholdStatus = (value: number, threshold: PerformanceThreshold) => {
    if (value >= threshold.critical) return 'critical'
    if (value >= threshold.warning) return 'warning'
    return 'good'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-400 bg-green-500/20'
      case 'warning': return 'text-yellow-400 bg-yellow-500/20'
      case 'critical': return 'text-red-400 bg-red-500/20'
      default: return 'text-muted-foreground bg-muted/50'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'api': return <Globe className="h-4 w-4" />
      case 'database': return <Database className="h-4 w-4" />
      case 'frontend': return <Activity className="h-4 w-4" />
      case 'full_system': return <Server className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  const tabs = [
    { id: 'configs', label: 'Test Configurations', icon: Settings },
    { id: 'monitoring', label: 'Live Monitoring', icon: Activity },
    { id: 'results', label: 'Test Results', icon: BarChart3 }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Load Testing & Stress Testing
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive performance testing to ensure your application can handle expected load and identify bottlenecks
        </p>
      </div>

      {/* Status Bar */}
      {activeTest && (
        <Alert className="border-yellow-500/30 bg-yellow-500/5">
          <Zap className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Load test in progress: {testConfigs.find(c => c.id === activeTest)?.name}</span>
            <Button variant="outline" size="sm" onClick={stopTest}>
              <Square className="h-4 w-4 mr-2" />
              Stop Test
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-border">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <Button
              key={tab.id}
              variant={selectedTab === tab.id ? "default" : "ghost"}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              onClick={() => setSelectedTab(tab.id as any)}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </Button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {selectedTab === 'configs' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Test Configurations</CardTitle>
                  <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Settings className="h-4 w-4 mr-2" />
                        New Configuration
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingConfig ? 'Edit Test Configuration' : 'New Test Configuration'}
                        </DialogTitle>
                      </DialogHeader>
                      <LoadTestConfigForm
                        config={editingConfig || undefined}
                        onSave={handleSaveConfig}
                        onCancel={() => {
                          setShowConfigDialog(false)
                          setEditingConfig(null)
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testConfigs.map(config => (
                    <div key={config.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          {getTypeIcon(config.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{config.name}</h4>
                            <Badge variant="outline" className="capitalize">
                              {config.type.replace('_', ' ')}
                            </Badge>
                            <Badge variant={config.isActive ? "default" : "secondary"}>
                              {config.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Duration: {config.duration}m</span>
                            <span>Max Users: {config.maxUsers}</span>
                            <span>Target: {config.targetRPS} RPS</span>
                            <span>Endpoints: {config.endpoints.length}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startTest(config.id)}
                          disabled={!!activeTest || !config.isActive}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Test
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingConfig(config)
                            setShowConfigDialog(true)
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Thresholds */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Thresholds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {PERFORMANCE_THRESHOLDS.map(threshold => (
                    <div key={threshold.metric} className="p-3 rounded-lg border border-border/50">
                      <h4 className="font-medium text-sm">{threshold.metric}</h4>
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        <Badge className="bg-yellow-500/20 text-yellow-400">
                          Warning: {threshold.warning}{threshold.unit}
                        </Badge>
                        <Badge className="bg-red-500/20 text-red-400">
                          Critical: {threshold.critical}{threshold.unit}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === 'monitoring' && (
          <div className="space-y-6">
            {!activeTest && !currentMetrics ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">No Active Test</h3>
                <p className="text-muted-foreground">Start a load test to view real-time monitoring</p>
              </div>
            ) : (
              <>
                {/* Real-time Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Users className="h-8 w-8 text-blue-500" />
                        <div>
                          <div className="text-2xl font-bold">{currentMetrics?.currentUsers || 0}</div>
                          <div className="text-sm text-muted-foreground">Active Users</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Zap className="h-8 w-8 text-green-500" />
                        <div>
                          <div className="text-2xl font-bold">{currentMetrics?.requestsPerSecond || 0}</div>
                          <div className="text-sm text-muted-foreground">Requests/sec</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Clock className="h-8 w-8 text-yellow-500" />
                        <div>
                          <div className="text-2xl font-bold">{currentMetrics?.averageResponseTime || 0}ms</div>
                          <div className="text-sm text-muted-foreground">Avg Response</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                        <div>
                          <div className="text-2xl font-bold">{currentMetrics?.errorRate?.toFixed(1) || 0}%</div>
                          <div className="text-sm text-muted-foreground">Error Rate</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* System Resources */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">System Resources</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">CPU Usage</span>
                          <span className="text-sm font-medium">{currentMetrics?.cpuUsage || 0}%</span>
                        </div>
                        <Progress value={currentMetrics?.cpuUsage || 0} />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Memory Usage</span>
                          <span className="text-sm font-medium">{currentMetrics?.memoryUsage || 0}%</span>
                        </div>
                        <Progress value={currentMetrics?.memoryUsage || 0} />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Database Connections</span>
                          <span className="text-sm font-medium">{currentMetrics?.databaseConnections || 0}%</span>
                        </div>
                        <Progress value={currentMetrics?.databaseConnections || 0} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Performance Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {PERFORMANCE_THRESHOLDS.slice(0, 4).map(threshold => {
                        let currentValue = 0
                        switch (threshold.metric) {
                          case 'Response Time':
                            currentValue = currentMetrics?.averageResponseTime || 0
                            break
                          case 'Error Rate':
                            currentValue = currentMetrics?.errorRate || 0
                            break
                          case 'CPU Usage':
                            currentValue = currentMetrics?.cpuUsage || 0
                            break
                          case 'Memory Usage':
                            currentValue = currentMetrics?.memoryUsage || 0
                            break
                        }
                        
                        const status = getThresholdStatus(currentValue, threshold)
                        
                        return (
                          <div key={threshold.metric} className="flex items-center justify-between">
                            <span className="text-sm">{threshold.metric}</span>
                            <Badge className={cn("text-xs", getStatusColor(status))}>
                              {status === 'good' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {status === 'warning' && <AlertTriangle className="h-3 w-3 mr-1" />}
                              {status === 'critical' && <XCircle className="h-3 w-3 mr-1" />}
                              {currentValue}{threshold.unit}
                            </Badge>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        )}

        {selectedTab === 'results' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Results History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {testResults.map(result => (
                    <Card key={result.id} className="border-border/50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold">{result.configName}</h4>
                            <Badge className={cn(
                              "text-xs",
                              result.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              result.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            )}>
                              {result.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(result.startTime).toLocaleString()}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Total Requests</div>
                            <div className="text-lg font-semibold">{result.totalRequests.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Success Rate</div>
                            <div className="text-lg font-semibold text-green-400">
                              {((result.successfulRequests / result.totalRequests) * 100).toFixed(1)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Avg Response Time</div>
                            <div className="text-lg font-semibold">{result.averageResponseTime}ms</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Throughput</div>
                            <div className="text-lg font-semibold">{result.throughput} RPS</div>
                          </div>
                        </div>

                        {result.bottlenecks.length > 0 && (
                          <div className="mb-4">
                            <h5 className="font-medium mb-2">Identified Bottlenecks</h5>
                            <div className="flex flex-wrap gap-2">
                              {result.bottlenecks.map(bottleneck => (
                                <Badge key={bottleneck} variant="outline" className="text-red-400 border-red-500/30">
                                  {bottleneck}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {result.recommendations.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-2">Recommendations</h5>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {result.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <TrendingUp className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}