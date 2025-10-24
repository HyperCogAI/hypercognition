import { useEffect, useState } from 'react'
import hyperLogo from '@/assets/Hyper_Cognition_logo3large-7.png'

export const Web3ModalBranding = () => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const checkModalOpen = () => {
      const modal = document.querySelector('w3m-modal, wcm-modal, [data-testid="w3m-modal"]')
      const isVisible = modal && (modal as HTMLElement).style.display !== 'none'
      setIsOpen(!!isVisible)
    }

    const observer = new MutationObserver(checkModalOpen)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    })

    const interval = setInterval(checkModalOpen, 300)
    
    return () => {
      observer.disconnect()
      clearInterval(interval)
    }
  }, [])

  if (!isOpen) return null

  return (
    <div 
      className="fixed left-1/2 -translate-x-1/2 z-[10000] pointer-events-none"
      style={{ top: 'clamp(12px, 4vh, 32px)', width: 'min(92vw, 420px)' }}
    >
      <div className="bg-[rgba(10,12,15,0.9)] border-2 border-[hsl(var(--primary)/0.3)] rounded-[10px] p-2 backdrop-blur-sm flex justify-center">
        <img 
          src={hyperLogo} 
          alt="HyperCognition" 
          className="h-7 md:h-8 w-auto"
        />
      </div>
    </div>
  )
}
