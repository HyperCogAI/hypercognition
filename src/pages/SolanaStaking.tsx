import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SEOHead } from "@/components/seo/SEOHead"
import { CyberButton } from "@/components/ui/cyber-button"
import { useSolanaWallet } from "@/hooks/useSolanaWallet"
import { 
  Coins, 
  TrendingUp, 
  Shield, 
  Zap, 
  Clock, 
  DollarSign,
  Users,
  BarChart3,
  Info,
  Star,
  Lock
} from "lucide-react"

const SolanaStaking = () => {
  const { isConnected, connectWallet } = useSolanaWallet()
  const [selectedValidator, setSelectedValidator] = useState<string | null>(null)

  const stakingPools = [
    {
      id: "sol-native",
      name: "SOL Native Staking",
      apy: 5.2,
      tvl: 45000000,
      description: "Stake SOL directly with validators",
      minStake: 0.1,
      lockPeriod: "1-3 days",
      risk: "Low",
      status: "coming-soon"
    },
    {
      id: "liquid-staking",
      name: "Liquid Staking (mSOL)",
      apy: 4.8,
      tvl: 23000000,
      description: "Stake while maintaining liquidity",
      minStake: 0.01,
      lockPeriod: "Immediate",
      risk: "Low",
      status: "coming-soon"
    },
    {
      id: "defi-pools",
      name: "DeFi Liquidity Pools",
      apy: 12.5,
      tvl: 8500000,
      description: "Provide liquidity to earn trading fees",
      minStake: 10,
      lockPeriod: "None",
      risk: "Medium",
      status: "coming-soon"
    },
    {
      id: "yield-farming",
      name: "Yield Farming",
      apy: 18.7,
      tvl: 3200000,
      description: "Farm tokens through various protocols",
      minStake: 50,
      lockPeriod: "Variable",
      risk: "High",
      status: "coming-soon"
    }
  ]

  const validators = [
    {
      id: "val-1",
      name: "Solana Foundation",
      commission: 5,
      apy: 5.4,
      reliability: 99.8,
      stake: 2500000
    },
    {
      id: "val-2",
      name: "Coinbase Cloud",
      commission: 8,
      apy: 5.1,
      reliability: 99.9,
      stake: 1800000
    },
    {
      id: "val-3",
      name: "Figment",
      commission: 7,
      apy: 5.2,
      reliability: 99.7,
      stake: 1200000
    }
  ]

  const formatCurrency = (value: number) => {
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`
    return `$${value.toFixed(2)}`
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "text-green-500"
      case "Medium": return "text-yellow-500"
      case "High": return "text-red-500"
      default: return "text-muted-foreground"
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <SEOHead 
          title="Solana Staking - HyperCognition"
          description="Stake your SOL and SPL tokens to earn rewards. Access native staking, liquid staking, and DeFi yield farming opportunities."
          keywords="Solana staking, SOL staking, liquid staking, DeFi yield farming, Solana validators"
        />
        
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Coins className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Connect Your Solana Wallet</CardTitle>
            <CardDescription>
              Connect your Solana wallet to start staking and earning rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CyberButton 
              variant="neon" 
              className="w-full"
              onClick={connectWallet}
            >
              <Shield className="h-4 w-4 mr-2" />
              Connect Wallet
            </CyberButton>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <SEOHead 
        title="Solana Staking - HyperCognition"
        description="Stake your SOL and SPL tokens to earn rewards. Access native staking, liquid staking, and DeFi yield farming opportunities."
        keywords="Solana staking, SOL staking, liquid staking, DeFi yield farming, Solana validators"
      />

      {/* Header */}
      <header className="text-center space-y-4">
        <div className="inline-flex items-center justify-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Coins className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            Solana Staking
          </h1>
        </div>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Stake your <span className="text-primary font-medium">SOL and SPL tokens</span> to earn rewards
        </p>
        
        <Badge variant="outline" className="text-sm bg-background/50 border-border/50">
          <TrendingUp className="h-3 w-3 mr-1" />
          Network APY: 5.2%
        </Badge>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border/50 bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              Your Staked SOL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.00 SOL</div>
            <p className="text-xs text-muted-foreground">$0.00 USD</p>
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Coins className="h-4 w-4 text-blue-500" />
              Pending Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.00 SOL</div>
            <p className="text-xs text-muted-foreground">$0.00 USD</p>
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-500" />
              Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.00 SOL</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-yellow-500" />
              Current APY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.0%</div>
            <p className="text-xs text-muted-foreground">Weighted average</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pools" className="space-y-8">
        <div className="relative">
          <TabsList className="grid w-full grid-cols-3 gap-2 bg-background/90 backdrop-blur-xl border border-border/50 p-2 h-auto rounded-xl">
            <TabsTrigger 
              value="pools" 
              className="px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground transition-all duration-300 hover:bg-muted/70 rounded-lg font-medium"
            >
              Staking Pools
            </TabsTrigger>
            <TabsTrigger 
              value="validators" 
              className="px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground transition-all duration-300 hover:bg-muted/70 rounded-lg font-medium"
            >
              Validators
            </TabsTrigger>
            <TabsTrigger 
              value="portfolio" 
              className="px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground transition-all duration-300 hover:bg-muted/70 rounded-lg font-medium"
            >
              My Stakes
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pools" className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stakingPools.map((pool) => (
              <Card key={pool.id} className="border border-border/50 bg-gradient-to-br from-background to-muted/20 hover-scale">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">{pool.name}</CardTitle>
                    <Badge 
                      variant={pool.status === "active" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {pool.status === "coming-soon" ? "Coming Soon" : "Active"}
                    </Badge>
                  </div>
                  <CardDescription>{pool.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-green-500">
                        {pool.apy}% APY
                      </div>
                      <p className="text-xs text-muted-foreground">Annual yield</p>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {formatCurrency(pool.tvl)}
                      </div>
                      <p className="text-xs text-muted-foreground">Total value locked</p>
                    </div>
                  </div>

                  <div className="space-y-2 p-3 bg-muted/10 rounded-lg border border-border/30">
                    <div className="flex justify-between text-sm">
                      <span>Minimum stake:</span>
                      <span className="font-medium">{pool.minStake} SOL</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Lock period:</span>
                      <span className="font-medium">{pool.lockPeriod}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Risk level:</span>
                      <span className={`font-medium ${getRiskColor(pool.risk)}`}>{pool.risk}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    disabled={pool.status === "coming-soon"}
                  >
                    {pool.status === "coming-soon" ? (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Coming Soon
                      </>
                    ) : (
                      <>
                        <Coins className="h-4 w-4 mr-2" />
                        Stake Now
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="validators" className="space-y-6 animate-fade-in">
          <Card className="border border-border/50 bg-gradient-to-br from-background to-muted/20">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Choose a Validator</CardTitle>
              <CardDescription>
                Select a validator to delegate your SOL stake
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {validators.map((validator) => (
                  <div 
                    key={validator.id}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                      selectedValidator === validator.id 
                        ? 'border-primary/50 bg-primary/10' 
                        : 'border-border/50 bg-background/50 hover:border-primary/30 hover:bg-muted/30'
                    }`}
                    onClick={() => setSelectedValidator(validator.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-semibold flex items-center gap-2">
                          {validator.name}
                          {validator.reliability > 99.5 && (
                            <Star className="h-4 w-4 text-yellow-500" />
                          )}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Commission: {validator.commission}%</span>
                          <span>APY: {validator.apy}%</span>
                          <span>Reliability: {validator.reliability}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {formatCurrency(validator.stake)}
                        </div>
                        <p className="text-xs text-muted-foreground">Total stake</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Reliability</span>
                        <span>{validator.reliability}%</span>
                      </div>
                      <Progress value={validator.reliability} className="h-1" />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-border/50">
                <Button 
                  className="w-full" 
                  disabled={!selectedValidator}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Delegate to Validator
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6 animate-fade-in">
          <Card className="border border-border/50 bg-gradient-to-br from-background to-muted/20">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">My Staking Portfolio</CardTitle>
              <CardDescription>
                View and manage your active stakes
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 w-fit mx-auto mb-6">
                <Coins className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">No Active Stakes</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed max-w-md mx-auto">
                You haven't staked any SOL yet. Start earning rewards by choosing a staking pool or validator.
              </p>
              <Button className="gap-2">
                <Zap className="h-4 w-4" />
                Start Staking
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SolanaStaking