import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface NFTCollection {
  id: string;
  name: string;
  symbol: string;
  description?: string;
  contract_address: string;
  creator_id: string;
  floor_price: number;
  volume_24h: number;
  total_supply: number;
  verified: boolean;
}

export interface NFTItem {
  id: string;
  collection_id: string;
  token_id: string;
  name: string;
  description?: string;
  image_url?: string;
  metadata: any;
  owner_id: string;
  is_listed: boolean;
  price?: number;
  collection?: NFTCollection;
}

export interface NFTListing {
  id: string;
  nft_id: string;
  seller_id: string;
  price: number;
  currency: string;
  expires_at?: string;
  is_active: boolean;
  nft?: NFTItem;
}

export const useNFT = () => {
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [items, setItems] = useState<NFTItem[]>([]);
  const [listings, setListings] = useState<NFTListing[]>([]);
  const [userNFTs, setUserNFTs] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('nft_collections')
        .select('*')
        .order('volume_24h', { ascending: false });

      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching NFT collections:', error);
      toast({
        title: "Error",
        description: "Failed to fetch NFT collections",
        variant: "destructive",
      });
    }
  };

  const fetchItems = async (collectionId?: string) => {
    try {
      let query = supabase
        .from('nft_items')
        .select(`
          *,
          collection:nft_collections(*)
        `);

      if (collectionId) {
        query = query.eq('collection_id', collectionId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching NFT items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch NFT items",
        variant: "destructive",
      });
    }
  };

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('nft_listings')
        .select(`
          *,
          nft:nft_items(
            *,
            collection:nft_collections(*)
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching NFT listings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch NFT listings",
        variant: "destructive",
      });
    }
  };

  const fetchUserNFTs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('nft_items')
        .select(`
          *,
          collection:nft_collections(*)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserNFTs(data || []);
    } catch (error) {
      console.error('Error fetching user NFTs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your NFTs",
        variant: "destructive",
      });
    }
  };

  const listNFT = async (nftId: string, price: number, currency: string = 'ETH') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('nft_listings')
        .insert({
          nft_id: nftId,
          seller_id: user.id,
          price,
          currency
        });

      if (error) throw error;

      // Update NFT as listed
      await supabase
        .from('nft_items')
        .update({ is_listed: true, price })
        .eq('id', nftId);

      toast({
        title: "Success",
        description: "NFT listed successfully",
      });

      await fetchListings();
      await fetchUserNFTs();
    } catch (error) {
      console.error('Error listing NFT:', error);
      toast({
        title: "Error",
        description: "Failed to list NFT",
        variant: "destructive",
      });
    }
  };

  const buyNFT = async (listingId: string, nftId: string, sellerId: string, price: number) => {
    if (!user) return;

    try {
      // Create sale record
      const { error: saleError } = await supabase
        .from('nft_sales')
        .insert({
          nft_id: nftId,
          seller_id: sellerId,
          buyer_id: user.id,
          price,
          currency: 'ETH'
        });

      if (saleError) throw saleError;

      // Update NFT ownership
      await supabase
        .from('nft_items')
        .update({
          owner_id: user.id,
          is_listed: false,
          price: null
        })
        .eq('id', nftId);

      // Deactivate listing
      await supabase
        .from('nft_listings')
        .update({ is_active: false })
        .eq('id', listingId);

      toast({
        title: "Success",
        description: "NFT purchased successfully",
      });

      await fetchListings();
      await fetchUserNFTs();
    } catch (error) {
      console.error('Error buying NFT:', error);
      toast({
        title: "Error",
        description: "Failed to purchase NFT",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCollections(),
        fetchItems(),
        fetchListings()
      ]);
      if (user) {
        await fetchUserNFTs();
      }
      setLoading(false);
    };

    loadData();
  }, [user]);

  return {
    collections,
    items,
    listings,
    userNFTs,
    loading,
    listNFT,
    buyNFT,
    refetch: () => {
      fetchCollections();
      fetchItems();
      fetchListings();
      if (user) fetchUserNFTs();
    }
  };
};