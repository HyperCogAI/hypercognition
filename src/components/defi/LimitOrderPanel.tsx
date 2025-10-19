import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLimitOrders } from '@/hooks/useLimitOrders';
import { ArrowDownUp, TrendingUp, TrendingDown, X, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Pool {
  id: string;
  name: string;
  base_token: string;
  quote_token: string;
  apy: number;
  tvl: number;
}

interface LimitOrderPanelProps {
  pools: Pool[];
}

export const LimitOrderPanel = ({ pools }: LimitOrderPanelProps) => {
  const { orders, orderBook, loading, createLimitOrder, cancelOrder, fetchOrderBook } = useLimitOrders();
  const [selectedPool, setSelectedPool] = useState<string>('');
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [slippage, setSlippage] = useState('1');

  const selectedPoolData = pools.find(p => p.id === selectedPool);

  useEffect(() => {
    if (pools.length > 0 && !selectedPool) {
      setSelectedPool(pools[0].id);
    }
  }, [pools]);

  useEffect(() => {
    if (selectedPool) {
      fetchOrderBook(selectedPool);
    }
  }, [selectedPool]);

  const handleCreateOrder = async () => {
    if (!selectedPool || !amount || !limitPrice || !selectedPoolData) return;

    const amountIn = parseFloat(amount);
    const price = parseFloat(limitPrice);
    const amountOut = amountIn * price;

    await createLimitOrder({
      pool_id: selectedPool,
      order_type: orderType,
      token_in: orderType === 'buy' ? selectedPoolData.quote_token : selectedPoolData.base_token,
      token_out: orderType === 'buy' ? selectedPoolData.base_token : selectedPoolData.quote_token,
      amount_in: amountIn,
      limit_price: price,
      amount_out: amountOut,
      slippage_tolerance: parseFloat(slippage),
    });

    setAmount('');
    setLimitPrice('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'filled':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'cancelled':
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'filled':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'cancelled':
      case 'expired':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Limit Orders
          </CardTitle>
          <CardDescription>
            Create limit orders to buy or sell tokens at specific prices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={orderType} onValueChange={(v) => setOrderType(v as 'buy' | 'sell')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buy" className="data-[state=active]:bg-green-500/10">
                <TrendingUp className="h-4 w-4 mr-2" />
                Buy
              </TabsTrigger>
              <TabsTrigger value="sell" className="data-[state=active]:bg-red-500/10">
                <TrendingDown className="h-4 w-4 mr-2" />
                Sell
              </TabsTrigger>
            </TabsList>

            <TabsContent value={orderType} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Pool</Label>
                <Select value={selectedPool} onValueChange={setSelectedPool}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pool" />
                  </SelectTrigger>
                  <SelectContent>
                    {pools.map((pool) => (
                      <SelectItem key={pool.id} value={pool.id}>
                        {pool.base_token}/{pool.quote_token}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {orderBook && (
                <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg text-sm">
                  <div>
                    <p className="text-muted-foreground">Bid Price</p>
                    <p className="text-lg font-bold text-green-500">${orderBook.bid_price.toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ask Price</p>
                    <p className="text-lg font-bold text-red-500">${orderBook.ask_price.toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Spread</p>
                    <p className="font-semibold">{orderBook.spread.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Volume</p>
                    <p className="font-semibold">${(orderBook.bid_volume + orderBook.ask_volume).toFixed(0)}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Amount ({selectedPoolData ? (orderType === 'buy' ? selectedPoolData.quote_token : selectedPoolData.base_token) : 'Token'})</Label>
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

              <div className="space-y-2">
                <Label>Slippage Tolerance (%)</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                />
              </div>

              {amount && limitPrice && (
                <div className="p-3 bg-muted/50 rounded-lg text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">You'll receive</span>
                    <span className="font-semibold">
                      {(parseFloat(amount) * parseFloat(limitPrice)).toFixed(6)} {selectedPoolData ? (orderType === 'buy' ? selectedPoolData.base_token : selectedPoolData.quote_token) : 'Token'}
                    </span>
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handleCreateOrder}
                disabled={!amount || !limitPrice || !selectedPool}
              >
                Create {orderType === 'buy' ? 'Buy' : 'Sell'} Order
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Your Orders</CardTitle>
          <CardDescription>
            Manage your active and completed limit orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <Badge variant={order.order_type === 'buy' ? 'default' : 'destructive'}>
                        {order.order_type.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold">
                      {order.amount_in.toFixed(6)} {order.token_in} → {order.amount_out.toFixed(6)} {order.token_out}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Limit: ${order.limit_price.toFixed(6)} • {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {order.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => cancelOrder(order.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
