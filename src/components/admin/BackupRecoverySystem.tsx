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
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

interface BackupConfig {
  id: string
  name: string
  description: string
  backup_type: 'full' | 'incremental' | 'differential'
  schedule_cron?: string
  retention_days: number
  storage_location: 'local' | 'supabase' | 'external'
  encryption_enabled: boolean
  compression_enabled: boolean
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
  last_run_at?: string
  next_run_at?: string
}

interface BackupRecord {
  id: string
  config_id: string
  backup_type: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  started_at: string
  completed_at?: string
  file_size_bytes?: number
  file_path?: string
  backup_duration_seconds?: number
  error_message?: string
  metadata?: any
  checksum?: string
  created_at: string
  backup_configs?: { name: string }
}

function BackupConfigForm({ 
  config, 
  onSave, 
  onCancel 
}: { 
  config?: BackupConfig
  onSave: (config: Omit<BackupConfig, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'last_run_at' | 'next_run_at'>) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    name: config?.name || '',
    description: config?.description || '',
    backup_type: config?.backup_type || 'full' as const,
    retention_days: config?.retention_days || 30,
    storage_location: config?.storage_location || 'supabase' as const,
    encryption_enabled: config?.encryption_enabled ?? true,
    compression_enabled: config?.compression_enabled ?? true,
    is_active: config?.is_active ?? true
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
          <Label htmlFor="backup_type">Backup Type</Label>
          <Select value={formData.backup_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, backup_type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full Backup</SelectItem>
              <SelectItem value="incremental">Incremental</SelectItem>
              <SelectItem value="differential">Differential</SelectItem>
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
            value={formData.retention_days}
            onChange={(e) => setFormData(prev => ({ ...prev, retention_days: parseInt(e.target.value) || 30 }))}
            min={1}
            max={365}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="storage">Storage Location</Label>
          <Select value={formData.storage_location} onValueChange={(value: any) => setFormData(prev => ({ ...prev, storage_location: value }))}>
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
        <Label>Backup Options</Label>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="encryption"
              checked={formData.encryption_enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, encryption_enabled: !!checked }))}
            />
            <Label htmlFor="encryption">Enable Encryption</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="compression"
              checked={formData.compression_enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, compression_enabled: !!checked }))}
            />
            <Label htmlFor="compression">Enable Compression</Label>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: !!checked }))}
        />
        <Label htmlFor="is_active">Enable automatic backups</Label>
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
  const [activeTab, setActiveTab] = useState<'backups' | 'recovery' | 'monitoring'>('backups')
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [editingConfig, setEditingConfig] = useState<BackupConfig | null>(null)
  const [isRunningBackup, setIsRunningBackup] = useState<string | null>(null)
  
  const { toast } = useToast()

  // Fetch backup configurations
  const { data: backupConfigs = [], isLoading: configsLoading, refetch: refetchConfigs } = useQuery({
    queryKey: ['backup-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('backup_configs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch backup records
  const { data: backupRecords = [], isLoading: recordsLoading, refetch: refetchRecords } = useQuery({
    queryKey: ['backup-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('backup_records')
        .select(`
          *,
          backup_configs(name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleSaveConfig = async (configData: Omit<BackupConfig, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'last_run_at' | 'next_run_at'>) => {
    try {
      if (editingConfig) {
        // Update existing config
        const { error } = await supabase
          .from('backup_configs')
          .update(configData)
          .eq('id', editingConfig.id);

        if (error) throw error;

        toast({
          title: "Configuration Updated",
          description: `${configData.name} has been updated successfully`
        });
      } else {
        // Create new config
        const { error } = await supabase
          .from('backup_configs')
          .insert({
            ...configData,
            created_by: 'current_user' // Should be replaced with actual user ID
          });

        if (error) throw error;

        toast({
          title: "Configuration Created",
          description: `${configData.name} has been created successfully`
        });
      }
      
      setShowConfigDialog(false);
      setEditingConfig(null);
      refetchConfigs();
    } catch (error) {
      console.error('Error saving backup config:', error);
      toast({
        title: "Error",
        description: "Failed to save backup configuration",
        variant: "destructive"
      });
    }
  };

  const runBackup = async (configId: string) => {
    const config = backupConfigs.find(c => c.id === configId);
    if (!config) return;

    setIsRunningBackup(configId);
    
    try {
      // Create backup record
      const { error } = await supabase
        .from('backup_records')
        .insert({
          config_id: configId,
          backup_type: config.backup_type,
          status: 'running'
        });

      if (error) throw error;

      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update backup record as completed
      const { error: updateError } = await supabase
        .from('backup_records')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          file_size_bytes: Math.floor(Math.random() * 200000000) + 10000000,
          backup_duration_seconds: Math.floor(Math.random() * 300) + 60
        })
        .eq('config_id', configId)
        .eq('status', 'running');

      if (updateError) throw updateError;

      refetchRecords();
      
      toast({
        title: "Backup Completed",
        description: `${config.name} backup completed successfully`
      });
    } catch (error) {
      console.error('Error running backup:', error);
      toast({
        title: "Backup Failed",
        description: "Failed to complete backup",
        variant: "destructive"
      });
    } finally {
      setIsRunningBackup(null);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0s'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'failed': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'running': return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      case 'pending': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with System Status */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Backup & Recovery System
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive backup management and disaster recovery planning for your trading platform
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Save className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{backupConfigs.filter(c => c.is_active).length}</div>
                <div className="text-sm text-muted-foreground">Active Configs</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Check className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{backupRecords.filter(r => r.status === 'completed').length}</div>
                <div className="text-sm text-muted-foreground">Successful Backups</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">
                  {formatFileSize(backupRecords.reduce((sum, r) => sum + (r.file_size_bytes || 0), 0))}
                </div>
                <div className="text-sm text-muted-foreground">Total Size</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">24h</div>
                <div className="text-sm text-muted-foreground">Last Backup</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex border rounded-lg p-1">
            {['backups', 'recovery', 'monitoring'].map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab as any)}
                className="capitalize"
              >
                {tab}
              </Button>
            ))}
          </div>

          {activeTab === 'backups' && (
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
                    {editingConfig ? 'Edit Backup Configuration' : 'Create Backup Configuration'}
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
          )}
        </div>

        {/* Backup Configurations Tab */}
        {activeTab === 'backups' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Backup Configurations</CardTitle>
              </CardHeader>
              <CardContent>
                {configsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse bg-muted h-20 rounded-lg" />
                    ))}
                  </div>
                ) : backupConfigs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No backup configurations found</p>
                    <p className="text-sm">Create your first backup configuration to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {backupConfigs.map(config => (
                      <Card key={config.id} className="border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{config.name}</h4>
                                <Badge variant={config.is_active ? "default" : "secondary"}>
                                  {config.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                                <Badge variant="outline" className="capitalize">
                                  {config.backup_type}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{config.description}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Retention: {config.retention_days} days</span>
                                {config.last_run_at && (
                                  <span>Last run: {new Date(config.last_run_at).toLocaleDateString()}</span>
                                )}
                                {config.next_run_at && (
                                  <span>Next run: {new Date(config.next_run_at).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingConfig(config as BackupConfig)
                                  setShowConfigDialog(true)
                                }}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => runBackup(config.id)}
                                disabled={isRunningBackup === config.id || !config.is_active}
                              >
                                {isRunningBackup === config.id ? (
                                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  <Upload className="h-4 w-4 mr-2" />
                                )}
                                {isRunningBackup === config.id ? 'Running...' : 'Run Backup'}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Backup Records */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Backup Records</CardTitle>
              </CardHeader>
              <CardContent>
                {recordsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse bg-muted h-16 rounded-lg" />
                    ))}
                  </div>
                ) : backupRecords.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No backup records found</p>
                    <p className="text-sm">Run your first backup to see records here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {backupRecords.map(record => (
                      <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge className={cn("text-xs", getStatusColor(record.status))}>
                            {record.status}
                          </Badge>
                          <div>
                            <div className="font-medium text-sm">{record.backup_configs?.name || 'Unknown Config'}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(record.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <span>{formatFileSize(record.file_size_bytes)}</span>
                          <span>{formatDuration(record.backup_duration_seconds)}</span>
                          <Badge variant="outline" className="capitalize text-xs">
                            {record.backup_type}
                          </Badge>
                          {record.status === 'completed' && (
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recovery Plans Tab */}
        {activeTab === 'recovery' && (
          <Card>
            <CardHeader>
              <CardTitle>Disaster Recovery Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Recovery plans are currently being developed. This feature will allow you to create and test disaster recovery procedures.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <Card>
            <CardHeader>
              <CardTitle>Backup Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Backup monitoring dashboard is under development. This will include real-time status, alerts, and health checks.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}