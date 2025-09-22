import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Image, ShoppingCart, Tag, Verified, Star } from 'lucide-react';
import { useNFT } from '@/hooks/useNFT';

export const NFTMarketplace = () => {
  const { collections, listings, userNFTs, loading, listNFT, buyNFT } = useNFT();
  const [selectedNFT, setSelectedNFT] = useState<any>(null);
  const [listPrice, setListPrice] = useState('');

  const handleListNFT = async (nftId: string) => {
    const price = parseFloat(listPrice);
    if (price > 0) {
      await listNFT(nftId, price);
      setListPrice('');
      setSelectedNFT(null);
    }
  };

  const handleBuyNFT = async (listing: any) => {
    await buyNFT(listing.id, listing.nft_id, listing.seller_id, listing.price);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading NFT marketplace...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Image className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">NFT Marketplace</h1>
      </div>

      <Tabs defaultValue="marketplace" className="space-y-4">
        <TabsList>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="my-nfts">My NFTs</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <div className="aspect-square bg-muted rounded-t-lg flex items-center justify-center">
                    {listing.nft?.image_url ? (
                      <img 
                        src={listing.nft.image_url} 
                        alt={listing.nft.name}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <Image className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <CardTitle className="text-lg">{listing.nft?.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      {listing.nft?.collection?.name}
                      {listing.nft?.collection?.verified && (
                        <Verified className="h-4 w-4 text-blue-500" />
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-muted-foreground">Price</span>
                      <div className="text-lg font-semibold">
                        {listing.price} {listing.currency}
                      </div>
                    </div>
                    <Button onClick={() => handleBuyNFT(listing)}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Buy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="collections" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <Card key={collection.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {collection.name}
                      {collection.verified && (
                        <Verified className="h-5 w-5 text-blue-500" />
                      )}
                    </CardTitle>
                    <Badge variant="outline">{collection.symbol}</Badge>
                  </div>
                  <CardDescription>{collection.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Floor Price</span>
                      <div className="text-lg font-semibold">
                        {collection.floor_price} ETH
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Volume (24h)</span>
                      <div className="text-lg font-semibold">
                        {collection.volume_24h.toFixed(2)} ETH
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Supply</span>
                      <div className="text-lg font-semibold">
                        {collection.total_supply.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-nfts" className="space-y-4">
          {userNFTs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Image className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No NFTs</h3>
                <p className="text-muted-foreground text-center">
                  You don't own any NFTs yet. Browse the marketplace to start collecting!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {userNFTs.map((nft) => (
                <Card key={nft.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="p-0">
                    <div className="aspect-square bg-muted rounded-t-lg flex items-center justify-center">
                      {nft.image_url ? (
                        <img 
                          src={nft.image_url} 
                          alt={nft.name}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                      ) : (
                        <Image className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <CardTitle className="text-lg">{nft.name}</CardTitle>
                      <CardDescription>{nft.collection?.name}</CardDescription>
                    </div>
                    <div className="flex items-center justify-between">
                      {nft.is_listed ? (
                        <Badge variant="secondary">
                          <Tag className="h-3 w-3 mr-1" />
                          Listed for {nft.price} ETH
                        </Badge>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedNFT(nft)}
                            >
                              <Tag className="h-4 w-4 mr-2" />
                              List for Sale
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>List NFT for Sale</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Price (ETH)</label>
                                <Input
                                  type="number"
                                  placeholder="0.1"
                                  value={listPrice}
                                  onChange={(e) => setListPrice(e.target.value)}
                                />
                              </div>
                              <Button 
                                onClick={() => handleListNFT(nft.id)}
                                disabled={!listPrice || parseFloat(listPrice) <= 0}
                                className="w-full"
                              >
                                List NFT
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};