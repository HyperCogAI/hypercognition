import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
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
  imageUrl?: string
  features: string[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  verified: boolean
  trending: boolean
}

export function AdvancedSearchSystem() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    category: "all",
    priceRange: [0, 10000],
    marketCapRange: [0, 1000000000],
    volumeRange: [0, 100000000],
    changeRange: [-50, 50],
    chains: [],
    features: [],
    riskLevel: "all",
    sortBy: "market_cap",
    sortOrder: "desc",
    timeframe: "24h"
  })

  const [showFilters, setShowFilters] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState(filters.query)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(filters.query)
    }, 300)
    return () => clearTimeout(timer)
  }, [filters.query])

  // Real data from multiple Supabase tables
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['search-results', debouncedQuery, filters],
    queryFn: async () => {
      const results: SearchResult[] = [];

      // Search agents
      if (filters.category === 'all' || filters.category === 'agents') {
        const { data: agents } = await supabase
          .from('agents')
          .select('*')
          .or(`name.ilike.%${debouncedQuery}%,symbol.ilike.%${debouncedQuery}%,description.ilike.%${debouncedQuery}%`)
          .gte('price', filters.priceRange[0])
          .lte('price', filters.priceRange[1])
          .gte('market_cap', filters.marketCapRange[0])
          .lte('market_cap', filters.marketCapRange[1])
          .order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });

        if (agents) {
          results.push(...agents.map(agent => ({
            id: agent.id,
            type: 'agent' as const,
            name: agent.name,
            symbol: agent.symbol,
            description: agent.description || '',
            price: Number(agent.price),
            marketCap: Number(agent.market_cap),
            volume24h: Number(agent.volume_24h),
            change24h: Number(agent.change_24h),
            chain: agent.chain,
            imageUrl: agent.avatar_url,
            features: [],
            riskLevel: 'medium' as const,
            verified: false,
            trending: agent.change_24h > 5
          })));
        }
      }

      // Search Solana tokens
      if (filters.category === 'all' || filters.category === 'tokens') {
        const { data: tokens } = await supabase
          .from('solana_tokens')
          .select('*')
          .eq('is_active', true)
          .or(`name.ilike.%${debouncedQuery}%,symbol.ilike.%${debouncedQuery}%`)
          .gte('price', filters.priceRange[0])
          .lte('price', filters.priceRange[1])
          .gte('market_cap', filters.marketCapRange[0])
          .lte('market_cap', filters.marketCapRange[1])
          .order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });

        if (tokens) {
          results.push(...tokens.map(token => ({
            id: token.id,
            type: 'token' as const,
            name: token.name,
            symbol: token.symbol,
            description: token.description || '',
            price: Number(token.price),
            marketCap: Number(token.market_cap),
            volume24h: Number(token.volume_24h),
            change24h: Number(token.change_24h),
            chain: 'Solana',
            imageUrl: token.image_url,
            features: [],
            riskLevel: 'low' as const,
            verified: true,
            trending: token.change_24h > 5
          })));
        }
      }

      return results;
    },
    enabled: debouncedQuery.length > 0 || filters.category !== 'all'
  });

  const updateFilters = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = () => {
    setFilters({
      query: "",
      category: "all",
      priceRange: [0, 10000],
      marketCapRange: [0, 1000000000],
      volumeRange: [0, 100000000],
      changeRange: [-50, 50],
      chains: [],
      features: [],
      riskLevel: "all",
      sortBy: "market_cap",
      sortOrder: "desc",
      timeframe: "24h"
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'agent': return <Bot className="h-4 w-4" />
      case 'token': return <DollarSign className="h-4 w-4" />
      case 'pool': return <BarChart3 className="h-4 w-4" />
      case 'strategy': return <Zap className="h-4 w-4" />
      default: return <Search className="h-4 w-4" />
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">
          Advanced Search
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Find exactly what you're looking for with powerful search and filtering tools.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search agents, tokens, pools, strategies..."
                  value={filters.query}
                  onChange={(e) => updateFilters('query', e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="shrink-0"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {showFilters && (
              <>
                <Separator />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-3">
                    <Label>Category</Label>
                    <Select value={filters.category} onValueChange={(value) => updateFilters('category', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="agents">AI Agents</SelectItem>
                        <SelectItem value="tokens">Tokens</SelectItem>
                        <SelectItem value="pools">Liquidity Pools</SelectItem>
                        <SelectItem value="strategies">Strategies</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Price Range ($)</Label>
                    <Slider
                      value={filters.priceRange}
                      onValueChange={(value) => updateFilters('priceRange', value)}
                      max={10000}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>${filters.priceRange[0]}</span>
                      <span>${filters.priceRange[1]}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Sort By</Label>
                    <Select value={filters.sortBy} onValueChange={(value) => updateFilters('sortBy', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="market_cap">Market Cap</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="volume_24h">24h Volume</SelectItem>
                        <SelectItem value="change_24h">24h Change</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : searchResults.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No results found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
            </CardContent>
          </Card>
        ) : (
          searchResults.map((result) => (
            <Card key={result.id} className="cursor-pointer hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{result.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {result.symbol}
                        </Badge>
                        {result.verified && (
                          <Badge className="text-xs bg-blue-500">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {result.trending && (
                          <Badge className="text-xs bg-green-500">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground max-w-md">
                        {result.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">Chain: {result.chain}</span>
                        <Badge className={cn("text-xs", getRiskColor(result.riskLevel))}>
                          {result.riskLevel} risk
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <div className="text-2xl font-bold">
                      ${result.price.toLocaleString()}
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 text-sm",
                      result.change24h >= 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {result.change24h >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {result.change24h.toFixed(2)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Vol: ${result.volume24h.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      MCap: ${result.marketCap.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}