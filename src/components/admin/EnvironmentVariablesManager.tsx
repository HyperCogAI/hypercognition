import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Key, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  AlertTriangle,
  Shield,
  ExternalLink,
  RefreshCw,
  Database,
  Server,
  Globe
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

interface Secret {
  id: string
  name: string
  value: string
  description?: string
  category: 'api' | 'database' | 'service' | 'custom'
  isPublic: boolean
  lastUpdated: string
  usedInFunctions: string[]
  isActive: boolean
}

interface SecretTemplate {
  name: string
  description: string
  category: 'api' | 'database' | 'service' | 'custom'
  isPublic: boolean
  placeholder: string
  documentation?: string
}

const SECRET_TEMPLATES: SecretTemplate[] = [
  {
    name: 'OPENAI_API_KEY',
    description: 'OpenAI API key for AI features',
    category: 'api',
    isPublic: false,
    placeholder: 'sk-...',
    documentation: 'https://platform.openai.com/api-keys'
  },
  {
    name: 'STRIPE_SECRET_KEY',
    description: 'Stripe secret key for payments',
    category: 'api',
    isPublic: false,
    placeholder: 'sk_test_...',
    documentation: 'https://stripe.com/docs/keys'
  },
  {
    name: 'STRIPE_PUBLISHABLE_KEY',
    description: 'Stripe publishable key (client-side)',
    category: 'api',
    isPublic: true,
    placeholder: 'pk_test_...',
    documentation: 'https://stripe.com/docs/keys'
  },
  {
    name: 'COINBASE_API_KEY',
    description: 'Coinbase Pro API key for trading',
    category: 'api',
    isPublic: false,
    placeholder: 'cb-access-key',
    documentation: 'https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-key-authentication'
  },
  {
    name: 'BINANCE_API_KEY',
    description: 'Binance API key for trading',
    category: 'api',
    isPublic: false,
    placeholder: 'your-api-key',
    documentation: 'https://www.binance.com/en/support/faq/how-to-create-api-keys-on-binance-360002502072'
  },
  {
    name: 'WEBHOOK_SECRET',
    description: 'Webhook verification secret',
    category: 'service',
    isPublic: false,
    placeholder: 'whsec_...',
    documentation: ''
  }
]

const MOCK_SECRETS: Secret[] = [
  {
    id: '1',
    name: 'OPENAI_API_KEY',
    value: 'sk-***************************************************',
    description: 'OpenAI API key for AI trading assistant',
    category: 'api',
    isPublic: false,
    lastUpdated: '2024-01-15T10:30:00Z',
    usedInFunctions: ['ai-trading-assistant', 'market-news-sentiment'],
    isActive: true
  },
  {
    id: '2',
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    value: 'eyJ***************************************************',
    description: 'Supabase service role key for admin operations',
    category: 'database',
    isPublic: false,
    lastUpdated: '2024-01-10T15:45:00Z',
    usedInFunctions: ['security-middleware', 'admin-2fa'],
    isActive: true
  },
  {
    id: '3',
    name: 'STRIPE_PUBLISHABLE_KEY',
    value: 'pk_test_51234567890abcdef',
    description: 'Stripe publishable key for client-side payments',
    category: 'api',
    isPublic: true,
    lastUpdated: '2024-01-12T09:20:00Z',
    usedInFunctions: [],
    isActive: true
  }
]

function SecretForm({ 
  secret, 
  template,
  onSave, 
  onCancel 
}: { 
  secret?: Secret
  template?: SecretTemplate
  onSave: (secret: Omit<Secret, 'id' | 'lastUpdated'>) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    name: secret?.name || template?.name || '',
    value: secret?.value || '',
    description: secret?.description || template?.description || '',
    category: secret?.category || template?.category || 'custom' as const,
    isPublic: secret?.isPublic || template?.isPublic || false,
    isActive: secret?.isActive ?? true,
    usedInFunctions: secret?.usedInFunctions || []
  })

  const [showValue, setShowValue] = useState(false)
  const { toast } = useToast()

  const handleSave = () => {
    if (!formData.name || !formData.value) {
      toast({
        title: "Missing Information",
        description: "Please provide both name and value for the secret",
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
          <Label htmlFor="name">Secret Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="OPENAI_API_KEY"
            className="font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="api">API</option>
            <option value="database">Database</option>
            <option value="service">Service</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="value">Secret Value</Label>
        <div className="relative">
          <Input
            id="value"
            type={showValue ? "text" : "password"}
            value={formData.value}
            onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
            placeholder={template?.placeholder || "Enter secret value..."}
            className="font-mono pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-8 w-8 p-0"
            onClick={() => setShowValue(!showValue)}
          >
            {showValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe what this secret is used for..."
          rows={2}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="public"
            checked={formData.isPublic}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
          />
          <Label htmlFor="public">Public Key (safe for client-side use)</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
          />
          <Label htmlFor="active">Active</Label>
        </div>
      </div>

      {formData.isPublic && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Public keys will be accessible in client-side code. Only use for publishable keys like Stripe publishable keys.
          </AlertDescription>
        </Alert>
      )}

      {template?.documentation && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ExternalLink className="h-4 w-4" />
          <a 
            href={template.documentation} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View Documentation
          </a>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          {secret ? 'Update Secret' : 'Create Secret'}
        </Button>
      </div>
    </div>
  )
}

export function EnvironmentVariablesManager() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingSecret, setEditingSecret] = useState<Secret | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<SecretTemplate | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  const { toast } = useToast()

  // Fetch environment variables
  const { data: secrets = [], isLoading, refetch } = useQuery({
    queryKey: ['environment-variables'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('environment_variables')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform to match UI interface
      return (data || []).map(env => ({
        id: env.id,
        name: env.name,
        value: env.is_secret ? '***' + (env.value_encrypted?.slice(-4) || '****') : env.value_plain || '',
        description: env.description || '',
        category: 'custom' as const, // Map to category
        isPublic: !env.is_secret,
        lastUpdated: env.updated_at,
        usedInFunctions: [], // Could be enhanced with actual function usage tracking
        isActive: env.is_active
      }));
    }
  });

  const categories = ['all', ...new Set(secrets.map(s => s.category))]
  
  const filteredSecrets = secrets.filter(secret => {
    const categoryMatch = selectedCategory === 'all' || secret.category === selectedCategory
    const searchMatch = secret.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       secret.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return categoryMatch && searchMatch
  })

  const handleSaveSecret = async (secretData: Omit<Secret, 'id' | 'lastUpdated'>) => {
    try {
      if (editingSecret) {
        // Update existing secret
        const { error } = await supabase
          .from('environment_variables')
          .update({
            name: secretData.name,
            description: secretData.description,
            is_secret: !secretData.isPublic,
            value_encrypted: secretData.isPublic ? null : secretData.value,
            value_plain: secretData.isPublic ? secretData.value : null,
            is_active: secretData.isActive
          })
          .eq('id', editingSecret.id);

        if (error) throw error;
      toast({
        title: "Secret Updated",
        description: `${secretData.name} has been updated successfully`
      })
    } else {
      // Create new secret
      const newSecret: Secret = {
        ...secretData,
        id: Date.now().toString(),
        lastUpdated: new Date().toISOString()
      }
      setSecrets(prev => [...prev, newSecret])
      toast({
        title: "Secret Created",
        description: `${secretData.name} has been created successfully`
      })
    }
    
    setShowAddDialog(false)
    setEditingSecret(null)
    setSelectedTemplate(null)
  }

  const handleDeleteSecret = (secretId: string) => {
    const secret = secrets.find(s => s.id === secretId)
    setSecrets(prev => prev.filter(s => s.id !== secretId))
    toast({
      title: "Secret Deleted",
      description: `${secret?.name} has been deleted`
    })
  }

  const handleCopyValue = async (secret: Secret) => {
    try {
      await navigator.clipboard.writeText(secret.value)
      setCopiedId(secret.id)
      setTimeout(() => setCopiedId(null), 2000)
      toast({
        title: "Copied to Clipboard",
        description: `${secret.name} value copied`
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      })
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'api': return <Globe className="h-4 w-4" />
      case 'database': return <Database className="h-4 w-4" />
      case 'service': return <Server className="h-4 w-4" />
      default: return <Key className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'api': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'database': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'service': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Environment Variables Manager
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Securely manage API keys and secrets using Supabase Edge Functions. Private keys are encrypted and never exposed to client-side code.
        </p>
      </div>

      {/* Info Card */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          This project uses Supabase secrets management. Private keys are stored securely and only accessible in Edge Functions. 
          Public keys can be safely used in client-side code.
        </AlertDescription>
      </Alert>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Input
              placeholder="Search secrets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
          </div>
          
          <div className="flex gap-2">
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

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Secret
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSecret ? 'Edit Secret' : selectedTemplate ? `Add ${selectedTemplate.name}` : 'Add New Secret'}
              </DialogTitle>
            </DialogHeader>
            <SecretForm
              secret={editingSecret || undefined}
              template={selectedTemplate || undefined}
              onSave={handleSaveSecret}
              onCancel={() => {
                setShowAddDialog(false)
                setEditingSecret(null)
                setSelectedTemplate(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Add Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {SECRET_TEMPLATES.map(template => (
              <Card 
                key={template.name} 
                className="cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => {
                  setSelectedTemplate(template)
                  setShowAddDialog(true)
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {getCategoryIcon(template.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{template.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={cn("text-xs", getCategoryColor(template.category))}>
                          {template.category}
                        </Badge>
                        {template.isPublic && (
                          <Badge variant="outline" className="text-xs">
                            Public
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Secrets List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Secrets ({filteredSecrets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSecrets.map(secret => (
              <div key={secret.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-muted/30">
                    {getCategoryIcon(secret.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium font-mono">{secret.name}</h4>
                      <Badge className={cn("text-xs", getCategoryColor(secret.category))}>
                        {secret.category}
                      </Badge>
                      {secret.isPublic && (
                        <Badge variant="outline" className="text-xs">
                          Public
                        </Badge>
                      )}
                      {!secret.isActive && (
                        <Badge variant="destructive" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{secret.description}</p>
                    {secret.usedInFunctions.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-muted-foreground">Used in:</span>
                        {secret.usedInFunctions.map(func => (
                          <Badge key={func} variant="outline" className="text-xs">
                            {func}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyValue(secret)}
                    className="h-8 w-8 p-0"
                  >
                    {copiedId === secret.id ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingSecret(secret)
                      setShowAddDialog(true)
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSecret(secret.id)}
                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Guidelines */}
      <Card className="bg-gradient-to-r from-card/50 to-card-glow/30 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• <strong>Private Keys:</strong> Never expose API secrets in client-side code. Use Edge Functions only.</p>
          <p>• <strong>Public Keys:</strong> Publishable keys (like Stripe pk_) are safe for client-side use.</p>
          <p>• <strong>Rotation:</strong> Regularly rotate API keys and update them here.</p>
          <p>• <strong>Functions:</strong> Access secrets in Edge Functions using <code className="bg-muted px-1 rounded">Deno.env.get('SECRET_NAME')</code></p>
        </CardContent>
      </Card>
    </div>
  )
}