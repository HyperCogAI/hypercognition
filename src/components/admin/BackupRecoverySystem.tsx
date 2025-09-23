import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Download, 
  Upload, 
  Database, 
  Shield, 
  Clock, 
  Check, 
  X, 
  AlertTriangle,
  RefreshCw,
  FileText,
  Save,
  Trash2,
  Copy,
  Settings,
  Calendar,
  History,
  HardDrive,
  Cloud,
  Zap,
  Plus
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface BackupConfig {
  id: string
  name: string
  description: string
  frequency: 'manual' | 'daily' | 'weekly' | 'monthly'
  retention: number // days
  includeData: boolean
  includeSchema: boolean
  includeSecrets: boolean
  includeFiles: boolean
  isActive: boolean
  lastRun?: string
  nextRun?: string
  storage: 'local' | 'supabase' | 'external'
}

interface BackupRecord {
  id: string
  configId: string
  configName: string
  timestamp: string
  status: 'success' | 'failed' | 'in_progress'
  size: number
  type: 'full' | 'incremental' | 'schema'
  downloadUrl?: string
  error?: string
  duration: number
}

interface RecoveryPlan {
  id: string
  name: string
  description: string
  steps: RecoveryStep[]
  priority: 'high' | 'medium' | 'low'
  estimatedTime: number
  lastTested?: string
}

interface RecoveryStep {
  id: string
  order: number
  title: string
  description: string
  action: string
  isRequired: boolean
  estimatedTime: number
}

const MOCK_BACKUP_CONFIGS: BackupConfig[] = [
  {
    id: '1',
    name: 'Daily Full Backup',
    description: 'Complete backup of all data and schema',
    frequency: 'daily',
    retention: 30,
    includeData: true,
    includeSchema: true,
    includeSecrets: false,
    includeFiles: true,
    isActive: true,
    lastRun: '2024-01-15T02:00:00Z',
    nextRun: '2024-01-16T02:00:00Z',
    storage: 'supabase'
  },
  {
    id: '2',
    name: 'Weekly Schema Backup',
    description: 'Schema and configuration backup',
    frequency: 'weekly',
    retention: 90,
    includeData: false,
    includeSchema: true,
    includeSecrets: true,
    includeFiles: false,
    isActive: true,
    lastRun: '2024-01-14T03:00:00Z',
    nextRun: '2024-01-21T03:00:00Z',
    storage: 'external'
  }
]

const MOCK_BACKUP_RECORDS: BackupRecord[] = [
  {
    id: '1',
    configId: '1',
    configName: 'Daily Full Backup',
    timestamp: '2024-01-15T02:00:00Z',
    status: 'success',
    size: 125000000, // 125MB
    type: 'full',
    downloadUrl: '#',
    duration: 180
  },
  {
    id: '2',
    configId: '2',
    configName: 'Weekly Schema Backup',
    timestamp: '2024-01-14T03:00:00Z',
    status: 'success',
    size: 1500000, // 1.5MB
    type: 'schema',
    downloadUrl: '#',
    duration: 45
  },
  {
    id: '3',
    configId: '1',
    configName: 'Daily Full Backup',
    timestamp: '2024-01-14T02:00:00Z',
    status: 'failed',
    size: 0,
    type: 'full',
    error: 'Storage quota exceeded',
    duration: 0
  }
]

const MOCK_RECOVERY_PLANS: RecoveryPlan[] = [
  {
    id: '1',
    name: 'Complete System Recovery',
    description: 'Full system recovery from catastrophic failure',
    priority: 'high',
    estimatedTime: 120,
    lastTested: '2024-01-10T10:00:00Z',
    steps: [
      {
        id: '1',
        order: 1,
        title: 'Assess System Status',
        description: 'Determine extent of system failure and identify affected components',
        action: 'manual_assessment',
        isRequired: true,
        estimatedTime: 15
      },
      {
        id: '2',
        order: 2,
        title: 'Restore Database Schema',
        description: 'Restore database structure from latest schema backup',
        action: 'restore_schema',
        isRequired: true,
        estimatedTime: 30
      },
      {
        id: '3',
        order: 3,
        title: 'Restore Application Data',
        description: 'Restore user data and application state from backup',
        action: 'restore_data',
        isRequired: true,
        estimatedTime: 60
      },
      {
        id: '4',
        order: 4,
        title: 'Verify System Integrity',
        description: 'Run comprehensive tests to ensure system functionality',
        action: 'verify_integrity',
        isRequired: true,
        estimatedTime: 15
      }
    ]
  },
  {
    id: '2',
    name: 'Data Corruption Recovery',
    description: 'Recovery from data corruption while preserving system availability',
    priority: 'medium',
    estimatedTime: 60,
    lastTested: '2024-01-08T14:00:00Z',
    steps: [
      {
        id: '1',
        order: 1,
        title: 'Identify Corrupted Data',
        description: 'Scan and identify extent of data corruption',
        action: 'scan_corruption',
        isRequired: true,
        estimatedTime: 15
      },
      {
        id: '2',
        order: 2,
        title: 'Isolate Affected Systems',
        description: 'Temporarily isolate corrupted components',
        action: 'isolate_systems',
        isRequired: true,
        estimatedTime: 10
      },
      {
        id: '3',
        order: 3,
        title: 'Restore Clean Data',
        description: 'Restore clean data from most recent backup',
        action: 'restore_clean_data',
        isRequired: true,
        estimatedTime: 30
      },
      {
        id: '4',
        order: 4,
        title: 'Resume Operations',
        description: 'Gradually resume normal operations with monitoring',
        action: 'resume_operations',
        isRequired: true,
        estimatedTime: 5
      }
    ]
  }
]

function BackupConfigForm({ 
  config, 
  onSave, 
  onCancel 
}: { 
  config?: BackupConfig
  onSave: (config: Omit<BackupConfig, 'id' | 'lastRun' | 'nextRun'>) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    name: config?.name || '',
    description: config?.description || '',
    frequency: config?.frequency || 'daily' as const,
    retention: config?.retention || 30,
    includeData: config?.includeData ?? true,
    includeSchema: config?.includeSchema ?? true,
    includeSecrets: config?.includeSecrets ?? false,
    includeFiles: config?.includeFiles ?? true,
    isActive: config?.isActive ?? true,
    storage: config?.storage || 'supabase' as const
  })

  const { toast } = useToast()

  const handleSave = () => {
    if (!formData.name) {
      toast({
        title: "Missing Information",
        description: "Please provide a name for the backup configuration",
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
          <Label htmlFor="name">Configuration Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Daily Full Backup"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency">Frequency</Label>
          <Select value={formData.frequency} onValueChange={(value: any) => setFormData(prev => ({ ...prev, frequency: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe what this backup includes..."
          rows={2}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="retention">Retention (days)</Label>
          <Input
            id="retention"
            type="number"
            value={formData.retention}
            onChange={(e) => setFormData(prev => ({ ...prev, retention: parseInt(e.target.value) || 30 }))}
            min={1}
            max={365}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="storage">Storage Location</Label>
          <Select value={formData.storage} onValueChange={(value: any) => setFormData(prev => ({ ...prev, storage: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="supabase">Supabase Storage</SelectItem>
              <SelectItem value="local">Local Download</SelectItem>
              <SelectItem value="external">External Storage</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Include in Backup</Label>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeData"
              checked={formData.includeData}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeData: !!checked }))}
            />
            <Label htmlFor="includeData">Application Data</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeSchema"
              checked={formData.includeSchema}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeSchema: !!checked }))}
            />
            <Label htmlFor="includeSchema">Database Schema</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeSecrets"
              checked={formData.includeSecrets}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeSecrets: !!checked }))}
            />
            <Label htmlFor="includeSecrets">Secrets & Config</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeFiles"
              checked={formData.includeFiles}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeFiles: !!checked }))}
            />
            <Label htmlFor="includeFiles">Uploaded Files</Label>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: !!checked }))}
        />
        <Label htmlFor="isActive">Enable automatic backups</Label>
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

export function BackupRecoverySystem() {
  const [backupConfigs, setBackupConfigs] = useState<BackupConfig[]>(MOCK_BACKUP_CONFIGS)
  const [backupRecords, setBackupRecords] = useState<BackupRecord[]>(MOCK_BACKUP_RECORDS)
  const [recoveryPlans, setRecoveryPlans] = useState<RecoveryPlan[]>(MOCK_RECOVERY_PLANS)
  const [activeTab, setActiveTab] = useState<'backups' | 'recovery' | 'monitoring'>('backups')
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [editingConfig, setEditingConfig] = useState<BackupConfig | null>(null)
  const [isRunningBackup, setIsRunningBackup] = useState<string | null>(null)
  
  const { toast } = useToast()

  const handleSaveConfig = (configData: Omit<BackupConfig, 'id' | 'lastRun' | 'nextRun'>) => {
    if (editingConfig) {
      setBackupConfigs(prev => prev.map(c => 
        c.id === editingConfig.id 
          ? { ...configData, id: editingConfig.id, lastRun: editingConfig.lastRun, nextRun: editingConfig.nextRun }
          : c
      ))
      toast({
        title: "Configuration Updated",
        description: `${configData.name} has been updated successfully`
      })
    } else {
      const newConfig: BackupConfig = {
        ...configData,
        id: Date.now().toString()
      }
      setBackupConfigs(prev => [...prev, newConfig])
      toast({
        title: "Configuration Created",
        description: `${configData.name} has been created successfully`
      })
    }
    
    setShowConfigDialog(false)
    setEditingConfig(null)
  }

  const runBackup = async (configId: string) => {
    const config = backupConfigs.find(c => c.id === configId)
    if (!config) return

    setIsRunningBackup(configId)
    
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 3000))

    const newRecord: BackupRecord = {
      id: Date.now().toString(),
      configId,
      configName: config.name,
      timestamp: new Date().toISOString(),
      status: 'success',
      size: Math.floor(Math.random() * 200000000) + 10000000, // Random size
      type: config.includeData ? 'full' : 'schema',
      downloadUrl: '#',
      duration: Math.floor(Math.random() * 300) + 60
    }

    setBackupRecords(prev => [newRecord, ...prev])
    setIsRunningBackup(null)
    
    toast({
      title: "Backup Completed",
      description: `${config.name} backup completed successfully`
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'failed': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'in_progress': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      default: return 'text-muted-foreground bg-muted/50'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30'
      default: return 'text-muted-foreground bg-muted/50'
    }
  }

  const tabs = [
    { id: 'backups', label: 'Backup Management', icon: Save },
    { id: 'recovery', label: 'Recovery Plans', icon: RefreshCw },
    { id: 'monitoring', label: 'Monitoring', icon: HardDrive }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Backup & Recovery System
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive data protection with automated backups and disaster recovery procedures
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Save className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{backupConfigs.filter(c => c.isActive).length}</div>
                <div className="text-sm text-muted-foreground">Active Configs</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Check className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{backupRecords.filter(r => r.status === 'success').length}</div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <HardDrive className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">
                  {formatFileSize(backupRecords.reduce((sum, r) => sum + r.size, 0))}
                </div>
                <div className="text-sm text-muted-foreground">Total Size</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{recoveryPlans.length}</div>
                <div className="text-sm text-muted-foreground">Recovery Plans</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
      <div className="min-h-[500px]">
        {activeTab === 'backups' && (
          <div className="space-y-6">
            {/* Backup Configurations */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Backup Configurations</CardTitle>
                  <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Configuration
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingConfig ? 'Edit Backup Configuration' : 'New Backup Configuration'}
                        </DialogTitle>
                      </DialogHeader>
                      <BackupConfigForm
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
                  {backupConfigs.map(config => (
                    <div key={config.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Database className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{config.name}</h4>
                            <Badge variant={config.isActive ? "default" : "secondary"}>
                              {config.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {config.frequency}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Retention: {config.retention} days</span>
                            {config.lastRun && (
                              <span>Last run: {new Date(config.lastRun).toLocaleDateString()}</span>
                            )}
                            {config.nextRun && (
                              <span>Next run: {new Date(config.nextRun).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => runBackup(config.id)}
                          disabled={isRunningBackup === config.id}
                        >
                          {isRunningBackup === config.id ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Running...
                            </>
                          ) : (
                            <>
                              <Zap className="h-4 w-4 mr-2" />
                              Run Now
                            </>
                          )}
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

            {/* Recent Backups */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Backups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {backupRecords.map(record => (
                    <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                      <div className="flex items-center gap-3">
                        <Badge className={cn("text-xs", getStatusColor(record.status))}>
                          {record.status === 'success' && <Check className="h-3 w-3 mr-1" />}
                          {record.status === 'failed' && <X className="h-3 w-3 mr-1" />}
                          {record.status === 'in_progress' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                          {record.status}
                        </Badge>
                        <div>
                          <div className="font-medium text-sm">{record.configName}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(record.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <span>{formatFileSize(record.size)}</span>
                        <span>{formatDuration(record.duration)}</span>
                        <Badge variant="outline" className="capitalize text-xs">
                          {record.type}
                        </Badge>
                        {record.downloadUrl && record.status === 'success' && (
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'recovery' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Disaster Recovery Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {recoveryPlans.map(plan => (
                    <Card key={plan.id} className="border-border/50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold">{plan.name}</h4>
                            <Badge className={cn("text-xs", getPriorityColor(plan.priority))}>
                              {plan.priority} priority
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ETA: {plan.estimatedTime} minutes
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                        {plan.lastTested && (
                          <div className="text-xs text-muted-foreground">
                            Last tested: {new Date(plan.lastTested).toLocaleDateString()}
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {plan.steps.map(step => (
                            <div key={step.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                                {step.order}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h5 className="font-medium text-sm">{step.title}</h5>
                                  {step.isRequired && (
                                    <Badge variant="outline" className="text-xs">Required</Badge>
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    ~{step.estimatedTime}min
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Edit Plan
                          </Button>
                          <Button variant="outline" size="sm">
                            <Zap className="h-4 w-4 mr-2" />
                            Test Plan
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Backup Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Success Rate (7 days)</span>
                      <span className="font-medium text-green-400">98.5%</span>
                    </div>
                    <Progress value={98.5} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average Duration</span>
                      <span className="font-medium">2m 45s</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Storage Usage</span>
                      <span className="font-medium">1.2GB / 5GB</span>
                    </div>
                    <Progress value={24} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm">Database</span>
                      </div>
                      <Badge variant="outline" className="text-green-400">Healthy</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm">Storage</span>
                      </div>
                      <Badge variant="outline" className="text-green-400">Healthy</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <span className="text-sm">Edge Functions</span>
                      </div>
                      <Badge variant="outline" className="text-yellow-400">Warning</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm">Backup Schedule</span>
                      </div>
                      <Badge variant="outline" className="text-green-400">On Track</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Regular testing of recovery procedures is recommended. Last full recovery test was performed on January 10, 2024.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  )
}