import { useState, createContext, useContext, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './AuthContext'

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
  const [favorites, setFavorites] = useState<string[]>([])
  const { user } = useAuth()

  // Load favorites from Supabase on component mount
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('user_favorites')
          .select('agent_id')
          .eq('user_id', user.id)

        if (error) {
          console.error('Error loading favorites:', error)
          return
        }

        const favoriteIds = data?.map(fav => fav.agent_id) || []
        setFavorites(favoriteIds)
      } catch (error) {
        console.error('Error loading favorites:', error)
      }
    }

    loadFavorites()
  }, [user])

  const addToFavorites = async (agentId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('user_favorites')
        .insert({ user_id: user.id, agent_id: agentId })

      if (!error) {
        setFavorites(prev => [...prev, agentId])
      }
    } catch (error) {
      console.error('Error adding favorite:', error)
    }
  }

  const removeFromFavorites = async (agentId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('agent_id', agentId)

      if (!error) {
        setFavorites(prev => prev.filter(id => id !== agentId))
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
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