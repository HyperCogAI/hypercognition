export const generateWebsiteStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "HyperCognition",
  "description": "AI Agent Trading Marketplace - Co-own next-gen AI trading agents",
  "url": "https://hypercognition.lovable.app",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://hypercognition.lovable.app/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
})

export const generateOrganizationStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "HyperCognition",
  "description": "Leading AI Agent Trading Marketplace",
  "url": "https://hypercognition.lovable.app",
  "logo": "https://hypercognition.lovable.app/hyper-cognition-logo.png",
  "sameAs": [
    "https://twitter.com/hypercognition",
    "https://discord.gg/hypercognition",
    "https://telegram.me/hypercognition"
  ]
})

export const generateSoftwareApplicationStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "HyperCognition",
  "description": "AI Agent Trading Marketplace",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "1000"
  }
})

export const generateAgentStructuredData = (agent: {
  id: string
  name: string
  symbol: string
  description?: string
  price: number
  market_cap: number
}) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": agent.name,
  "description": agent.description || `${agent.name} AI Trading Agent`,
  "identifier": agent.symbol,
  "offers": {
    "@type": "Offer",
    "price": agent.price,
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "category": "AI Trading Agent",
  "brand": {
    "@type": "Brand",
    "name": "HyperCognition"
  }
})