// Utility functions for generating default avatars

/**
 * Generates a default avatar URL using a service like DiceBear or similar
 * Falls back to a gradient-based avatar if service is unavailable
 */
export function generateDefaultAvatar(name: string, style: 'identicon' | 'initials' | 'bottts' = 'identicon'): string {
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  
  // Use DiceBear for consistent, deterministic avatars
  const diceBearStyles = {
    identicon: 'identicon',
    initials: 'initials', 
    bottts: 'bottts'
  }
  
  const selectedStyle = diceBearStyles[style]
  
  // Generate avatar using DiceBear API
  return `https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${cleanName}&backgroundColor=0066cc,007acc,0088dd,0099ee&size=128`
}

/**
 * Generates a fallback gradient avatar for when external services fail
 */
export function generateGradientAvatar(name: string): string {
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
  ]
  
  // Use name hash to consistently select the same gradient
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  
  const colorIndex = Math.abs(hash) % colors.length
  return colors[colorIndex]
}

/**
 * Gets initials from a name for fallback avatars
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Creates a data URL for a simple SVG avatar with initials
 */
export function createInitialsAvatar(name: string): string {
  const initials = getInitials(name)
  const gradient = generateGradientAvatar(name)
  
  const svg = `
    <svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="64" cy="64" r="64" fill="url(#grad)" />
      <text x="64" y="74" font-family="Arial, sans-serif" font-size="36" font-weight="bold" text-anchor="middle" fill="white">
        ${initials}
      </text>
    </svg>
  `
  
  return `data:image/svg+xml;base64,${btoa(svg)}`
}