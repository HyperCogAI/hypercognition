import { useEffect } from "react"

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  structuredData?: object[]
}

export const SEOHead = ({
  title = "HyperCognition - AI Agent Trading Marketplace",
  description = "Co-own next-gen AI trading agents with equal early access through Hyper Points. Enjoy a fair 24h bidding system and get a full refund if milestones aren't met.",
  keywords = "AI trading agents, autonomous trading, cryptocurrency, DeFi, blockchain, trading bots, AI marketplace",
  image = "/hero-bg.jpg",
  url = "https://hypercognition.lovable.app",
  structuredData
}: SEOHeadProps) => {
  useEffect(() => {
    // Update document title
    document.title = title

    // Helper function to update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name'
      let tag = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement
      
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute(attribute, name)
        document.head.appendChild(tag)
      }
      
      tag.content = content
    }

    // Update basic meta tags
    updateMetaTag('description', description)
    updateMetaTag('keywords', keywords)
    updateMetaTag('author', 'HyperCognition')
    updateMetaTag('robots', 'index, follow')

    // Update Open Graph tags
    updateMetaTag('og:title', title, true)
    updateMetaTag('og:description', description, true)
    updateMetaTag('og:image', image, true)
    updateMetaTag('og:url', url, true)
    updateMetaTag('og:type', 'website', true)
    updateMetaTag('og:site_name', 'HyperCognition', true)

    // Update Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:title', title)
    updateMetaTag('twitter:description', description)
    updateMetaTag('twitter:image', image)

    // Update theme color
    updateMetaTag('theme-color', '#0f0f0f')

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
    if (!canonicalLink) {
      canonicalLink = document.createElement('link')
      canonicalLink.rel = 'canonical'
      document.head.appendChild(canonicalLink)
    }
    canonicalLink.href = url

    // Add structured data
    if (structuredData) {
      // Remove existing structured data
      const existingScripts = document.querySelectorAll('script[type="application/ld+json"]')
      existingScripts.forEach(script => script.remove())

      // Add new structured data
      structuredData.forEach((data, index) => {
        const script = document.createElement('script')
        script.type = 'application/ld+json'
        script.id = `structured-data-${index}`
        script.textContent = JSON.stringify(data)
        document.head.appendChild(script)
      })
    }

    // Cleanup function to remove added elements when component unmounts
    return () => {
      // We don't remove meta tags on cleanup to avoid flickering
      // They will be updated by the next page's SEOHead component
    }
  }, [title, description, keywords, image, url, structuredData])

  return null // This component doesn't render anything
}