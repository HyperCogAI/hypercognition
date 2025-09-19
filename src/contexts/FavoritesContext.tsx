import { useState, createContext, useContext } from 'react'

interface FavoritesContextType {
  favorites: string[]
  addToFavorites: (agentId: string) => void
  removeFromFavorites: (agentId: string) => void
  isFavorite: (agentId: string) => boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider')
  }
  return context
}

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>(['1', '3', '7']) // Mock initial favorites

  const addToFavorites = (agentId: string) => {
    setFavorites(prev => [...prev, agentId])
  }

  const removeFromFavorites = (agentId: string) => {
    setFavorites(prev => prev.filter(id => id !== agentId))
  }

  const isFavorite = (agentId: string) => {
    return favorites.includes(agentId)
  }

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addToFavorites,
      removeFromFavorites,
      isFavorite
    }}>
      {children}
    </FavoritesContext.Provider>
  )
}