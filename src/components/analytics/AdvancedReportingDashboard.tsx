import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, Download, FileText, Mail } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ReportData {
  period: string;
  revenue: number;
  trades: number;
  users: number;
  volume: number;
  profit: number;
  loss: number;
}

interface UserSegment {
  name: string;
  value: number;
  color: string;
}

const AdvancedReportingDashboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState('30d');
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch trading data from orders
  const { data: tradingData } = useQuery({
    queryKey: ['trading-analytics', timeframe],
    queryFn: async () => {
      const daysBack = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365;
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch agents earnings for revenue data
  const { data: revenueData } = useQuery({
    queryKey: ['revenue-analytics', timeframe],
    queryFn: async () => {
      const daysBack = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365;
      const { data, error } = await supabase
        .from('agents_earnings')
        .select('*')
        .gte('created_at', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch user analytics data  
  const { data: userData } = useQuery({
    queryKey: ['user-analytics', timeframe],
    queryFn: async () => {
      const daysBack = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365;
      const { data: holdings, error } = await supabase
        .from('user_holdings')
        .select('user_id, last_updated')
        .gte('last_updated', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString());
      
      if (error) throw error;
      return holdings || [];
    }
  });

  // Process data for charts
  const reportData: ReportData[] = React.useMemo(() => {
    if (!tradingData || !revenueData) return [];

    const daysBack = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365;
    const data: ReportData[] = [];

    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      // Calculate daily metrics
      const dayTrades = tradingData.filter(order => 
        new Date(order.created_at).toISOString().split('T')[0] === dateStr
      );
      
      const dayRevenue = revenueData.filter(earning => 
        new Date(earning.created_at).toISOString().split('T')[0] === dateStr
      );

      const dayUsers = userData?.filter(user => 
        new Date(user.last_updated).toISOString().split('T')[0] === dateStr
      ).length || 0;

      const revenue = dayRevenue.reduce((sum, earning) => sum + Number(earning.amount), 0);
      const volume = dayTrades.reduce((sum, trade) => sum + (Number(trade.amount) * Number(trade.price || 0)), 0);
      const profits = dayTrades.filter(t => t.status === 'filled' && t.side === 'sell').length;
      const losses = dayTrades.filter(t => t.status === 'cancelled' || t.status === 'rejected').length;

      data.push({
        period: i < 7 ? `Day ${daysBack - i}` : dateStr,
        revenue,
        trades: dayTrades.length,
        users: dayUsers,
        volume,
        profit: profits * 100, // Simplified calculation
        loss: losses * 50 // Simplified calculation
      });
    }

    return data;
  }, [tradingData, revenueData, userData, timeframe]);

  const userSegments: UserSegment[] = [
    { name: 'Active Traders', value: 45, color: 'hsl(var(--primary))' },
    { name: 'Casual Users', value: 30, color: 'hsl(var(--secondary))' },
    { name: 'Premium Users', value: 15, color: 'hsl(var(--accent))' },
    { name: 'Inactive', value: 10, color: 'hsl(var(--muted))' }
  ];

  const generateReport = async (type: string) => {
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      // In real implementation, this would trigger download
      console.log(`Generated ${type} report`);
    }, 2000);
  };

  const totalRevenue = reportData.reduce((sum, item) => sum + item.revenue, 0);
  const totalTrades = reportData.reduce((sum, item) => sum + item.trades, 0);
  const totalUsers = reportData.reduce((sum, item) => sum + item.users, 0);
  const avgVolume = reportData.reduce((sum, item) => sum + item.volume, 0) / reportData.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics & Reporting</h1>
          <p className="text-muted-foreground">Comprehensive business intelligence and reporting</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => generateReport('comprehensive')}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12.5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrades.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +8.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(totalUsers / 30).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 inline mr-1" />
              -2.1% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgVolume.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +15.3% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="trading">Trading Performance</TabsTrigger>
          <TabsTrigger value="reports">Custom Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Daily revenue over selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={reportData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profit vs Loss</CardTitle>
                <CardDescription>Profitability analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="profit" fill="hsl(var(--primary))" />
                    <Bar dataKey="loss" fill="hsl(var(--destructive))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Segments</CardTitle>
                <CardDescription>Distribution of user types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userSegments}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {userSegments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
                <CardDescription>Daily active users</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reportData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trading" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trading Volume</CardTitle>
              <CardDescription>Daily trading volume and activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={reportData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="volume" stroke="hsl(var(--accent))" fill="hsl(var(--accent)/0.2)" />
                  <Area type="monotone" dataKey="trades" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Reports</CardTitle>
              <CardDescription>Generate and schedule custom reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center"
                  onClick={() => generateReport('financial')}
                  disabled={isGenerating}
                >
                  <FileText className="w-6 h-6 mb-2" />
                  Financial Report
                </Button>
                
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center"
                  onClick={() => generateReport('user')}
                  disabled={isGenerating}
                >
                  <Users className="w-6 h-6 mb-2" />
                  User Analytics
                </Button>
                
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center"
                  onClick={() => generateReport('trading')}
                  disabled={isGenerating}
                >
                  <Activity className="w-6 h-6 mb-2" />
                  Trading Summary
                </Button>
              </div>
              
              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Generating report...</span>
                    <Badge variant="secondary">In Progress</Badge>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedReportingDashboard;