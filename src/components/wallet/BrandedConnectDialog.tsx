import { Dialog, DialogContent } from '@/components/ui/dialog'
import hyperLogo from '@/assets/Hyper_Cognition_logo3large-7.png'
import { GradientBorderButton } from '@/components/wallet/GradientBorderButton'
import { Wallet } from 'lucide-react'

interface BrandedConnectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnectEvm: () => void
}

export function BrandedConnectDialog({ 
  open, 
  onOpenChange, 
  onConnectEvm 
}: BrandedConnectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0c0f] border-2 border-[hsl(var(--primary))/0.3] shadow-[0_0_40px_hsl(var(--primary)/0.2)] sm:rounded-xl p-0 sm:max-w-[380px]">
        {/* Logo Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/10 flex justify-center">
          <img src={hyperLogo} alt="HyperCognition" className="h-8 w-auto" />
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold text-white">Connect Your Wallet</h2>
            <p className="text-sm text-white/70">
              Securely connect using your preferred EVM wallet to access AI agent trading
            </p>
          </div>
          
          {/* Connect Button */}
          <div className="flex justify-center pt-2">
            <GradientBorderButton 
              onClick={onConnectEvm} 
              className="w-full sm:w-[200px] justify-center h-10"
            >
              <Wallet className="h-4 w-4 text-white" />
              <span className="text-white font-medium">Connect EVM Wallet</span>
            </GradientBorderButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
