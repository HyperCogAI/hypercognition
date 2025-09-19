import { useToast } from "@/hooks/use-toast"

export const useNotifications = () => {
  const { toast } = useToast()

  const showSuccess = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "default",
    })
  }

  const showError = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "destructive",
    })
  }

  const showTradeSuccess = (type: 'buy' | 'sell', amount: string, symbol: string) => {
    toast({
      title: `${type === 'buy' ? 'Purchase' : 'Sale'} Successful!`,
      description: `${type === 'buy' ? 'Bought' : 'Sold'} ${amount} ${symbol}`,
      variant: "default",
    })
  }

  const showTradeError = (type: 'buy' | 'sell', error?: string) => {
    toast({
      title: `${type === 'buy' ? 'Purchase' : 'Sale'} Failed`,
      description: error || `Failed to ${type} tokens. Please try again.`,
      variant: "destructive",
    })
  }

  return {
    showSuccess,
    showError,
    showTradeSuccess,
    showTradeError,
  }
}