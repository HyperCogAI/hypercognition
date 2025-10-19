import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSolanaLimitOrders } from '@/hooks/useSolanaLimitOrders';
import { useSolanaRealtime } from '@/hooks/useSolanaRealtime';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, X, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface SolanaPool {
  id: string;
  name: string;
  base_token: string;
  quote_token: string;
  base_mint: string;
  quote_mint: string;
}

export const SolanaLimitOrderPanel = () => {
  const { connected } = useWallet();
  const { tokens } = useSolanaRealtime();
  const { orders, orderBook, loading, createLimitOrder, cancelOrder, fetchOrderBook } = useSolanaLimitOrders();
  
  const [pools, setPools] = useState<SolanaPool[]>([]);
  const [selectedPool, setSelectedPool] = useState<string>('');
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [slippage, setSlippage] = useState('1');

  useEffect(() => {
    const fetchPools = async () => {
      const { data } = await supabase
        .from('solana_pools')
        .select('*')
        .eq('is_active', true);
      if (data) {
        setPools(data);
        if (data.length > 0) {
          setSelectedPool(data[0].id);
        }
      }
    };
    fetchPools();
  }, []);

  useEffect(() => {
    if (selectedPool) {
      fetchOrderBook(selectedPool);
    }
  }, [selectedPool, fetchOrderBook]);

  const handleCreateOrder = async () => {
    if (!selectedPool || !amount || !limitPrice) return;

    const pool = pools.find(p => p.id === selectedPool);
    if (!pool) return;

    const tokenIn = orderType === 'buy' ? pool.quote_token : pool.base_token;
    const tokenOut = orderType === 'buy' ? pool.base_token : pool.quote_token;
    const mintIn = orderType === 'buy' ? pool.quote_mint : pool.base_mint;
    const mintOut = orderType === 'buy' ? pool.base_mint : pool.quote_mint;

    await createLimitOrder({
      pool_id: selectedPool,
      order_type: orderType,
      token_in: tokenIn,
      token_out: tokenOut,
      mint_in: mintIn,
      mint_out: mintOut,
      amount_in: parseFloat(amount),
      limit_price: parseFloat(limitPrice),
      amount_out: parseFloat(amount) * parseFloat(limitPrice),
      slippage_tolerance: parseFloat(slippage),
    });

    setAmount('');
    setLimitPrice('');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: any }> = {
      pending: { variant: 'outline', icon: Clock },
      filled: { variant: 'default', icon: CheckCircle2 },
      partial: { variant: 'secondary', icon: TrendingUp },
      cancelled: { variant: 'destructive', icon: X },
      expired: { variant: 'destructive', icon: AlertCircle },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Solana Limit Orders
        </CardTitle>
        <CardDescription>Set price targets for your trades</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="create" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create Order</TabsTrigger>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="book">Order Book</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <div className="space-y-2">
              <Label>Trading Pair</Label>
              <Select value={selectedPool} onValueChange={setSelectedPool}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pool" />
                </SelectTrigger>
                <SelectContent>
                  {pools.map((pool) => (
                    <SelectItem key={pool.id} value={pool.id}>
                      {pool.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Tabs value={orderType} onValueChange={(v) => setOrderType(v as 'buy' | 'sell')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="buy">Buy</TabsTrigger>
                <TabsTrigger value="sell">Sell</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Limit Price</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Slippage Tolerance (%)</Label>
              <Input
                type="number"
                placeholder="1"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
              />
            </div>

            {connected ? (
              <Button 
                className="w-full" 
                onClick={handleCreateOrder}
                disabled={!selectedPool || !amount || !limitPrice}
              >
                Create {orderType === 'buy' ? 'Buy' : 'Sell'} Order
              </Button>
            ) : (
              <Button className="w-full" disabled>
                Connect Wallet to Trade
              </Button>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No orders yet</p>
            ) : (
              <div className="space-y-2">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={order.order_type === 'buy' ? 'default' : 'secondary'}>
                          {order.order_type.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{order.token_in}/{order.token_out}</span>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Amount: </span>
                        <span>{order.amount_in}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Price: </span>
                        <span>${order.limit_price}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Filled: </span>
                        <span>{((order.filled_amount / order.amount_in) * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created: </span>
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {order.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelOrder(order.id)}
                        className="w-full"
                      >
                        Cancel Order
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="book" className="space-y-4">
            {orderBook ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg bg-green-500/10">
                    <p className="text-sm text-muted-foreground mb-1">Best Bid</p>
                    <p className="text-2xl font-bold text-green-500">${orderBook.bid_price}</p>
                    <p className="text-xs text-muted-foreground mt-1">Vol: {orderBook.bid_volume.toLocaleString()}</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-red-500/10">
                    <p className="text-sm text-muted-foreground mb-1">Best Ask</p>
                    <p className="text-2xl font-bold text-red-500">${orderBook.ask_price}</p>
                    <p className="text-xs text-muted-foreground mt-1">Vol: {orderBook.ask_volume.toLocaleString()}</p>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Spread</span>
                    <span className="font-medium">{orderBook.spread.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Select a pool to view order book</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
