import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AuthMethodsPanel } from "./AuthMethodsPanel"
import hypercognitionLogo from "@/assets/Hyper_Cognition_logo3large.png"

interface UnifiedAuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export const UnifiedAuthModal = ({ isOpen, onClose }: UnifiedAuthModalProps) => {

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-[#0f1419] to-[#0a0c0f] border border-border rounded-2xl">
        <DialogHeader className="space-y-4">
          {/* HyperCognition Logo */}
          <div className="flex justify-center mb-2">
            <img 
              src={hypercognitionLogo} 
              alt="HyperCognition" 
              className="h-10 w-auto"
            />
          </div>
          
          <DialogTitle className="text-2xl font-bold text-center text-white">
            Log in or sign up
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            Choose your preferred sign-in method
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <AuthMethodsPanel />
        </div>
      </DialogContent>
    </Dialog>
  )
}
