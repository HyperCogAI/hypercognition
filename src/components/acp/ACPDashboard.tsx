import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SearchInput } from "@/components/ui/search-input"
import { 
  Bot, DollarSign, Activity, Users, Zap, Clock, CheckCircle, AlertCircle,
  ArrowLeft, Briefcase, FileText, Star, TrendingUp, Package
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DashboardStats {
  total_earnings: number
  active_services: number
  completed_jobs: number
  pending_transactions: number
}

interface Service {
  id: string
  title: string
  description: string
  category: string
  price: number
  currency: string
  status: string
  rating: number
  total_orders: number
  agent: { name: string; avatar_url: string } | null
}

interface Job {
  id: string
  title: string
  description: string
  budget: number
  currency: string
  status: string
  bids_count: number
  created_at: string
  deadline: string | null
}

interface Transaction {
  id: string
  transaction_type: string
  amount: number
  currency: string
  status: string
  created_at: string
  agent: { name: string } | null
}

export function ACPDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [stats, setStats] = useState<DashboardStats>({
    total_earnings: 0,
    active_services: 0,
    completed_jobs: 0,
    pending_transactions: 0
  })
  const [services, setServices] = useState<Service[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
      
      // Set up realtime subscriptions for live updates
      const servicesChannel = supabase
        .channel('acp-services-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'acp_services',
            filter: `creator_id=eq.${user.id}`
          },
          () => {
            fetchDashboardData()
          }
        )
        .subscribe()

      const jobsChannel = supabase
        .channel('acp-jobs-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'acp_jobs'
          },
          () => {
            fetchDashboardData()
          }
        )
        .subscribe()

      const transactionsChannel = supabase
        .channel('acp-transactions-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'acp_transactions'
          },
          () => {
            fetchDashboardData()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(servicesChannel)
        supabase.removeChannel(jobsChannel)
        supabase.removeChannel(transactionsChannel)
      }
    }
  }, [user])

  const fetchDashboardData = async () => {
    if (!user) return
    
    try {
      setLoading(true)

      // Fetch dashboard stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_acp_dashboard_stats', { user_id_param: user.id })

      if (statsError) throw statsError
      if (statsData && typeof statsData === 'object' && statsData !== null) {
        const data = statsData as any
        setStats({
          total_earnings: Number(data.total_earnings) || 0,
          active_services: Number(data.active_services) || 0,
          completed_jobs: Number(data.completed_jobs) || 0,
          pending_transactions: Number(data.pending_transactions) || 0
        })
      }

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('acp_services')
        .select('*, agent:agents(name, avatar_url)')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (servicesError) throw servicesError
      setServices(servicesData || [])

      // Fetch jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('acp_jobs')
        .select('*')
        .or(`poster_id.eq.${user.id},assignee_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(20)

      if (jobsError) throw jobsError
      setJobs(jobsData || [])

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('acp_transactions')
        .select('*, agent:agents(name)')
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(20)

      if (transactionsError) throw transactionsError
      setTransactions(transactionsData || [])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'default'
      case 'pending':
      case 'processing':
      case 'in_progress':
        return 'secondary'
      case 'failed':
      case 'disputed':
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8">
        {/* Header with back button */}
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Agent Commerce Protocol
          </h1>
          <p className="text-muted-foreground">
            Manage services, jobs, and transactions for autonomous agents
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchInput
            placeholder="Search services, jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.total_earnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">USDC</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Services</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_services}</div>
              <p className="text-xs text-muted-foreground">Services available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed_jobs}</div>
              <p className="text-xs text-muted-foreground">Jobs finished</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Transactions</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending_transactions}</div>
              <p className="text-xs text-muted-foreground">Awaiting processing</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full overflow-x-auto flex lg:grid lg:grid-cols-5 gap-1 scrollbar-hide bg-[#16181f]">
            <TabsTrigger value="overview" className="flex-shrink-0">
              Overview
            </TabsTrigger>
            <TabsTrigger value="services" className="flex-shrink-0 gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Services</span>
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex-shrink-0 gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Jobs</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex-shrink-0 gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex-shrink-0 gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Services */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Recent Services
                  </CardTitle>
                  <CardDescription>Your latest service offerings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : services.slice(0, 5).map(service => (
                    <div key={service.id} className="flex items-start justify-between p-3 rounded-lg border hover:shadow-md transition-shadow">
                      <div className="flex-1">
                        <h4 className="font-medium">{service.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={getStatusColor(service.status)} className="text-xs">
                            {service.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{service.category}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">${service.price}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {service.rating.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {!loading && services.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No services yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Jobs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Recent Jobs
                  </CardTitle>
                  <CardDescription>Active and completed job postings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : jobs.slice(0, 5).map(job => (
                    <div key={job.id} className="flex items-start justify-between p-3 rounded-lg border hover:shadow-md transition-shadow">
                      <div className="flex-1">
                        <h4 className="font-medium">{job.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={getStatusColor(job.status)} className="text-xs">
                            {job.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {job.bids_count} bids
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">${job.budget}</p>
                        <p className="text-xs text-muted-foreground">{job.currency}</p>
                      </div>
                    </div>
                  ))}
                  {!loading && jobs.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No jobs yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>Latest payment activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : transactions.slice(0, 10).map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          {tx.transaction_type.includes('payment') && <DollarSign className="h-4 w-4 text-primary" />}
                          {tx.transaction_type.includes('refund') && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                          {tx.transaction_type.includes('escrow') && <Clock className="h-4 w-4 text-blue-500" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm capitalize">
                            {tx.transaction_type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">${tx.amount.toFixed(2)}</p>
                        <Badge variant={getStatusColor(tx.status)} className="text-xs">
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {!loading && transactions.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No transactions yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Services</CardTitle>
                    <CardDescription>Manage your service offerings</CardDescription>
                  </div>
                  <Button>
                    <Package className="h-4 w-4 mr-2" />
                    Create Service
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredServices.map(service => (
                    <Card key={service.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{service.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {service.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Price:</span>
                            <span className="font-bold">${service.price} {service.currency}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Orders:</span>
                            <span className="font-medium">{service.total_orders}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <Badge variant={getStatusColor(service.status)}>
                              {service.status}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{service.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {filteredServices.length === 0 && !loading && (
                  <p className="text-center text-muted-foreground py-12">
                    No services found. Create your first service to get started!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Jobs</CardTitle>
                    <CardDescription>Browse and manage job postings</CardDescription>
                  </div>
                  <Button>
                    <Briefcase className="h-4 w-4 mr-2" />
                    Post Job
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredJobs.map(job => (
                    <Card key={job.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{job.title}</CardTitle>
                            <CardDescription className="line-clamp-2 mt-1">
                              {job.description}
                            </CardDescription>
                          </div>
                          <Badge variant={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Budget: ${job.budget} {job.currency}</span>
                            <span>{job.bids_count} bids</span>
                            {job.deadline && (
                              <span>Due: {new Date(job.deadline).toLocaleDateString()}</span>
                            )}
                          </div>
                          <Button variant="outline" size="sm">View Details</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {filteredJobs.length === 0 && !loading && (
                  <p className="text-center text-muted-foreground py-12">
                    No jobs found. Post a job or browse available opportunities!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>View all payment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-primary/10">
                          <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium capitalize">
                            {tx.transaction_type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(tx.created_at).toLocaleString()}
                          </p>
                          {tx.agent && (
                            <p className="text-xs text-muted-foreground">
                              Agent: {tx.agent.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${tx.amount.toFixed(2)}</p>
                        <Badge variant={getStatusColor(tx.status)} className="mt-1">
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                {transactions.length === 0 && !loading && (
                  <p className="text-center text-muted-foreground py-12">
                    No transactions yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Average Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">4.8</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Success Rate</span>
                    <span className="font-bold">94.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Response Time</span>
                    <span className="font-bold">2.3 hrs</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">This Month</span>
                    <span className="font-bold text-green-500">+$2,450</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Last Month</span>
                    <span className="font-bold">$2,120</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Growth</span>
                    <span className="font-bold text-green-500">+15.6%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
