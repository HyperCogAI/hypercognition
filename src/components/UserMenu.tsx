import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"

export const UserMenu = () => {
  const { user, address, isConnected, signOut } = useAuth()
  const navigate = useNavigate()

  if (!isConnected || !user) {
    return null
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
          <AvatarFallback className="bg-primary/10 text-primary">
            {address ? address.slice(2, 4).toUpperCase() : 'U'}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm">
          <div className="font-medium">Connected Wallet</div>
          <div className="text-muted-foreground">{address && formatAddress(address)}</div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/portfolio')}>
          <User className="h-4 w-4 mr-2" />
          Portfolio
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/analytics')}>
          <Settings className="h-4 w-4 mr-2" />
          Analytics
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}