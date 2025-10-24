import { useWeb3ModalState } from '@web3modal/wagmi/react'
import hyperLogo from '@/assets/Hyper_Cognition_logo3large-7.png'

export const Web3ModalBranding = () => {
  const { open: isOpen } = useWeb3ModalState()

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
