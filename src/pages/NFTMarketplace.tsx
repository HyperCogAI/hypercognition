import React from 'react';
import { NFTMarketplace } from '@/components/nft/NFTMarketplace';
import { SEOHead } from '@/components/seo/SEOHead';

const NFTMarketplacePage = () => {
  return (
    <>
      <SEOHead
        title="NFT Marketplace - Trade AI Agent NFTs | HyperCognition"
        description="Discover, buy, and sell unique AI agent NFTs. Explore collections, trade digital assets, and participate in the NFT economy."
        keywords="NFT marketplace, AI agent NFTs, digital collectibles, blockchain art, crypto art"
      />
      <div className="container mx-auto px-4 py-8">
        <NFTMarketplace />
      </div>
    </>
  );
};

export default NFTMarketplacePage;