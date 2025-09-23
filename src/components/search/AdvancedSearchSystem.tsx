import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { 
  Search, 
  Filter, 
  X, 
  TrendingUp, 
  TrendingDown, 
  Bot, 
  Star,
  Calendar,
  DollarSign,
  BarChart3,
  Zap,
  Shield
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/useDebounceThrottle"

interface SearchFilters {
  query: string
  category: string
  priceRange: [number, number]
  marketCapRange: [number, number]
  volumeRange: [number, number]
  changeRange: [number, number]
  chains: string[]
  features: string[]
  riskLevel: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  timeframe: string
}

interface SearchResult {
  id: string
  type: 'agent' | 'token' | 'pool' | 'strategy'
  name: string
  symbol: string
  description: string
  price: number
  marketCap: number
  volume24h: number
  change24h: number
  chain: string
  features: string[]
  riskLevel: 'low' | 'medium' | 'high'
  rating: number
  verified: boolean
  category: string
  image?: string
}

const MOCK_RESULTS: SearchResult[] = [
  {
    id: '1',
    type: 'agent',
    name: 'Alpha Trading Agent',
    symbol: 'ALPHA',
    description: 'Advanced DeFi arbitrage specialist with high-frequency trading capabilities',
    price: 2.45,
    marketCap: 12500000,
    volume24h: 850000,
    change24h: 8.5,
    chain: 'Ethereum',
    features: ['Arbitrage', 'DeFi', 'High Frequency'],
    riskLevel: 'medium',
    rating: 4.8,
    verified: true,
    category: 'DeFi'
  },
  {
    id: '2',
    type: 'agent',
    name: 'Stable Yield Bot',
    symbol: 'YIELD',
    description: 'Conservative yield farming strategy focused on stable returns',
    price: 1.89,
    marketCap: 8900000,
    volume24h: 420000,
    change24h: 2.1,
    chain: 'Polygon',
    features: ['Yield Farming', 'Stable', 'Conservative'],
    riskLevel: 'low',
    rating: 4.6,
    verified: true,
    category: 'Yield'
  },
  {
    id: '3',
    type: 'agent',
    name: 'Momentum Hunter',
    symbol: 'MOMENTUM',
    description: 'Trend-following agent that captures market momentum',
    price: 5.67,
    marketCap: 23400000,
    volume24h: 1200000,
    change24h: -3.2,
    chain: 'Solana',
    features: ['Momentum', 'Trend Following', 'Technical Analysis'],
    riskLevel: 'high',
    rating: 4.3,
    verified: false,
    category: 'Trading'
  }
]

const CATEGORIES = ['All', 'DeFi', 'Yield', 'Trading', 'NFT', 'Gaming', 'Meme']
const CHAINS = ['Ethereum', 'Polygon', 'Solana', 'BSC', 'Arbitrum', 'Optimism']
const FEATURES = ['Arbitrage', 'DeFi', 'Yield Farming', 'Momentum', 'Technical Analysis', 'Conservative', 'High Frequency']
const RISK_LEVELS = ['All', 'Low', 'Medium', 'High']
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price', label: 'Price' },
  { value: 'marketCap', label: 'Market Cap' },
  { value: 'volume', label: '24h Volume' },
  { value: 'change', label: '24h Change' },
  { value: 'rating', label: 'Rating' }
]

export function AdvancedSearchSystem() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'All',
    priceRange: [0, 100],
    marketCapRange: [0, 100000000],
    volumeRange: [0, 10000000],
    changeRange: [-50, 50],
    chains: [],
    features: [],
    riskLevel: 'All',
    sortBy: 'relevance',
    sortOrder: 'desc',
    timeframe: '24h'
  })

  const [results, setResults] = useState<SearchResult[]>(MOCK_RESULTS)
  const [isSearching, setIsSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  // Simple debounced search without the custom hook
  const [debouncedQuery, setDebouncedQuery] = useState(filters.query)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(filters.query)
    }, 300)
    return () => clearTimeout(timer)
  }, [filters.query])

  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const performSearch = useCallback(async () => {
    setIsSearching(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    let filteredResults = MOCK_RESULTS.filter(result => {
      // Text search
      if (filters.query && !result.name.toLowerCase().includes(filters.query.toLowerCase()) &&
          !result.symbol.toLowerCase().includes(filters.query.toLowerCase()) &&
          !result.description.toLowerCase().includes(filters.query.toLowerCase())) {
        return false
      }

      // Category filter
      if (filters.category !== 'All' && result.category !== filters.category) {
        return false
      }

      // Price range
      if (result.price < filters.priceRange[0] || result.price > filters.priceRange[1]) {
        return false
      }

      // Market cap range
      if (result.marketCap < filters.marketCapRange[0] || result.marketCap > filters.marketCapRange[1]) {
        return false
      }

      // Volume range
      if (result.volume24h < filters.volumeRange[0] || result.volume24h > filters.volumeRange[1]) {
        return false
      }

      // Change range
      if (result.change24h < filters.changeRange[0] || result.change24h > filters.changeRange[1]) {
        return false
      }

      // Chain filter
      if (filters.chains.length > 0 && !filters.chains.includes(result.chain)) {
        return false
      }

      // Features filter
      if (filters.features.length > 0 && !filters.features.some(f => result.features.includes(f))) {
        return false
      }

      // Risk level filter
      if (filters.riskLevel !== 'All' && result.riskLevel !== filters.riskLevel.toLowerCase()) {
        return false
      }

      return true
    })

    // Apply sorting
    filteredResults.sort((a, b) => {
      let aValue: any, bValue: any

      switch (filters.sortBy) {
        case 'price':
          aValue = a.price
          bValue = b.price
          break
        case 'marketCap':
          aValue = a.marketCap
          bValue = b.marketCap
          break
        case 'volume':
          aValue = a.volume24h
          bValue = b.volume24h
          break
        case 'change':
          aValue = a.change24h
          bValue = b.change24h
          break
        case 'rating':
          aValue = a.rating
          bValue = b.rating
          break
        default:
          return 0
      }

      return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })

    setResults(filteredResults)
    setIsSearching(false)
  }, [filters])

  useEffect(() => {
    performSearch()
  }, [debouncedQuery, filters])

  useEffect(() => {
    // Update active filters for display
    const active: string[] = []
    
    if (filters.category !== 'All') active.push(`Category: ${filters.category}`)
    if (filters.chains.length > 0) active.push(`Chains: ${filters.chains.join(', ')}`)
    if (filters.features.length > 0) active.push(`Features: ${filters.features.join(', ')}`)
    if (filters.riskLevel !== 'All') active.push(`Risk: ${filters.riskLevel}`)
    
    setActiveFilters(active)
  }, [filters])

  const clearFilters = () => {
    setFilters({
      query: '',
      category: 'All',
      priceRange: [0, 100],
      marketCapRange: [0, 100000000],
      volumeRange: [0, 10000000],
      changeRange: [-50, 50],
      chains: [],
      features: [],
      riskLevel: 'All',
      sortBy: 'relevance',
      sortOrder: 'desc',
      timeframe: '24h'
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`
    return `$${num.toFixed(2)}`
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'high': return 'text-red-400 bg-red-500/20'
      default: return 'text-muted-foreground bg-muted/50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Advanced Search & Discovery
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Find the perfect AI agents, tokens, and strategies with powerful filtering and search capabilities
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agents, tokens, strategies..."
                value={filters.query}
                onChange={(e) => updateFilter('query', e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {activeFilters.map((filter, index) => (
                <Badge key={index} variant="outline" className="gap-2">
                  {filter}
                  <X className="h-3 w-3 cursor-pointer" onClick={clearFilters} />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Advanced Filters</span>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Risk Level */}
              <div className="space-y-2">
                <Label>Risk Level</Label>
                <Select value={filters.riskLevel} onValueChange={(value) => updateFilter('riskLevel', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RISK_LEVELS.map(level => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label>Sort By</Label>
                <div className="flex gap-2">
                  <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {filters.sortOrder === 'asc' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Range Filters */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <Label>Price Range</Label>
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => updateFilter('priceRange', value)}
                  max={100}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${filters.priceRange[0]}</span>
                  <span>${filters.priceRange[1]}</span>
                </div>
              </div>

              <div className="space-y-4">
                <Label>24h Change Range (%)</Label>
                <Slider
                  value={filters.changeRange}
                  onValueChange={(value) => updateFilter('changeRange', value)}
                  min={-50}
                  max={50}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{filters.changeRange[0]}%</span>
                  <span>{filters.changeRange[1]}%</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Multi-select Filters */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Blockchain Networks</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CHAINS.map(chain => (
                    <div key={chain} className="flex items-center space-x-2">
                      <Checkbox
                        id={chain}
                        checked={filters.chains.includes(chain)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateFilter('chains', [...filters.chains, chain])
                          } else {
                            updateFilter('chains', filters.chains.filter(c => c !== chain))
                          }
                        }}
                      />
                      <label htmlFor={chain} className="text-sm">{chain}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Features</Label>
                <div className="grid grid-cols-2 gap-2">
                  {FEATURES.map(feature => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox
                        id={feature}
                        checked={filters.features.includes(feature)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateFilter('features', [...filters.features, feature])
                          } else {
                            updateFilter('features', filters.features.filter(f => f !== feature))
                          }
                        }}
                      />
                      <label htmlFor={feature} className="text-sm">{feature}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Search Results ({results.length})
            </CardTitle>
            {isSearching && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Searching...
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.map(result => (
              <Card key={result.id} className="p-4 hover:border-primary/30 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Bot className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{result.name}</h3>
                        <Badge variant="outline">{result.symbol}</Badge>
                        {result.verified && <Shield className="h-4 w-4 text-green-500" />}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{result.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-sm">{result.rating}</span>
                        </div>
                        <Badge className={cn("text-xs", getRiskColor(result.riskLevel))}>
                          {result.riskLevel} risk
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {result.chain}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-semibold">${result.price}</div>
                    <div className={cn(
                      "text-sm font-medium",
                      result.change24h >= 0 ? "text-green-400" : "text-red-400"
                    )}>
                      {result.change24h >= 0 ? '+' : ''}{result.change24h.toFixed(2)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Vol: {formatNumber(result.volume24h)}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}