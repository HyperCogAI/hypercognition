import { useState } from "react";
import { useKOLPerformance } from "@/hooks/useKOLPerformance";
import { useTwitterKOLWatchlists } from "@/hooks/useTwitterKOLWatchlists";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react";
import { KOLPerformanceCard } from "@/components/kol/KOLPerformanceCard";

export default function KOLAnalytics() {
  const [selectedWatchlist, setSelectedWatchlist] = useState<string>("all");
  const [sortBy, setSortBy] = useState<'success_rate' | 'total_signals' | 'avg_return'>('success_rate');
  
  const { watchlists } = useTwitterKOLWatchlists();
  const { kolPerformance, topPerformers, stats, isLoading } = useKOLPerformance(
    selectedWatchlist === "all" ? undefined : selectedWatchlist
  );

  const sortedKOLs = [...kolPerformance].sort((a, b) => {
    switch (sortBy) {
      case 'success_rate':
        return (b.success_rate || 0) - (a.success_rate || 0);
      case 'total_signals':
        return (b.total_signals || 0) - (a.total_signals || 0);
      case 'avg_return':
        return (b.avg_return_24h || 0) - (a.avg_return_24h || 0);
      default:
        return 0;
    }
  });

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 70) return 'text-success';
    if (rate >= 50) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">KOL Performance Analytics</h1>
        <p className="text-muted-foreground">
          Track which Key Opinion Leaders provide the most profitable signals
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total KOLs</p>
              <p className="text-2xl font-bold">{stats.totalKOLs}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-success/10">
              <Target className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Success Rate</p>
              <p className="text-2xl font-bold">{stats.avgSuccessRate.toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-chart-1/10">
              <TrendingUp className="h-6 w-6 text-chart-1" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg 24h Return</p>
              <p className="text-2xl font-bold">{stats.avgReturn24h.toFixed(2)}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-chart-2/10">
              <Activity className="h-6 w-6 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Signals</p>
              <p className="text-2xl font-bold">{stats.totalSignalsTracked}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Performers */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Top Performers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topPerformers.slice(0, 6).map((kol) => (
            <KOLPerformanceCard key={kol.kol_account_id} kol={kol} />
          ))}
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Watchlist</label>
            <Select value={selectedWatchlist} onValueChange={setSelectedWatchlist}>
              <SelectTrigger>
                <SelectValue placeholder="All Watchlists" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Watchlists</SelectItem>
                {watchlists?.map((watchlist) => (
                  <SelectItem key={watchlist.id} value={watchlist.id}>
                    {watchlist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Sort By</label>
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="success_rate">Success Rate</SelectItem>
                <SelectItem value="total_signals">Total Signals</SelectItem>
                <SelectItem value="avg_return">Avg Return</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Performance Table */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">All KOLs Performance</h2>
          
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading analytics...</div>
          ) : sortedKOLs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No performance data available yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead className="text-center">Total Signals</TableHead>
                    <TableHead className="text-center">Success Rate</TableHead>
                    <TableHead className="text-center">Avg 24h Return</TableHead>
                    <TableHead className="text-center">Best Return</TableHead>
                    <TableHead className="text-center">Kaito Yaps</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedKOLs.map((kol) => (
                    <TableRow key={kol.kol_account_id}>
                      <TableCell className="font-medium">
                        <a
                          href={`https://twitter.com/${kol.twitter_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          @{kol.twitter_username}
                        </a>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{kol.total_signals || 0}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={getSuccessRateColor(kol.success_rate || 0)}>
                          {kol.success_rate?.toFixed(1) || '0.0'}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {(kol.avg_return_24h || 0) >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-success" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-destructive" />
                          )}
                          <span className={(kol.avg_return_24h || 0) >= 0 ? 'text-success' : 'text-destructive'}>
                            {kol.avg_return_24h?.toFixed(2) || '0.00'}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-success font-semibold">
                          +{kol.best_signal_return?.toFixed(2) || '0.00'}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {kol.yaps_30d ? `${(kol.yaps_30d / 1000).toFixed(1)}K` : 'N/A'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
