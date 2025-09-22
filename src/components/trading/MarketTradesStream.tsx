import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { format } from 'date-fns'
import type { Database } from '@/integrations/supabase/types'

type MarketTrade = Database['public']['Tables']['market_trades']['Row']

interface MarketTradesStreamProps {
  agentSymbol?: string
  trades: MarketTrade[]
  loading?: boolean
}

export function MarketTradesStream({ agentSymbol, trades, loading }: MarketTradesStreamProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Trades
          </div>
          {agentSymbol && (
            <Badge variant="outline">{agentSymbol}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {trades.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No recent trades
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Time</TableHead>
                  <TableHead className="text-xs">Side</TableHead>
                  <TableHead className="text-xs">Price</TableHead>
                  <TableHead className="text-xs">Size</TableHead>
                  <TableHead className="text-xs">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((trade, index) => {
                  const isBuy = trade.side === 'buy'
                  const value = Number(trade.price) * Number(trade.size)
                  
                  return (
                    <TableRow 
                      key={trade.id} 
                      className={`hover:bg-muted/50 ${
                        index === 0 ? 'bg-muted/30' : ''
                      }`}
                    >
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {format(new Date(trade.timestamp), 'HH:mm:ss')}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className={`flex items-center gap-1 ${
                          isBuy ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {isBuy ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          <span className="uppercase font-medium">
                            {trade.side}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className={`text-xs font-mono ${
                        isBuy ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        ${Number(trade.price).toFixed(4)}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {Number(trade.size).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        ${value.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}