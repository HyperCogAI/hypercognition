import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface ShowcaseInteraction {
  id: string
  user_id?: string
  component_type: string
  interaction_type: string
  data?: any
  created_at: string
}

export const useShowcaseInteractions = () => {
  const [interactions, setInteractions] = useState<ShowcaseInteraction[]>([])
  const [loading, setLoading] = useState(false)

  const trackInteraction = async (
    componentType: string, 
    interactionType: string, 
    data?: any
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const interaction = {
        user_id: user?.id,
        component_type: componentType,
        interaction_type: interactionType,
        data: data || null
      }

      const { error } = await supabase
        .from('showcase_interactions')
        .insert(interaction)

      if (error) throw error

      // Update local state
      setInteractions(prev => [...prev, {
        ...interaction,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      }])

    } catch (error) {
      console.error('Failed to track interaction:', error)
    }
  }

  const getInteractionStats = () => {
    const stats = interactions.reduce((acc, interaction) => {
      const key = `${interaction.component_type}-${interaction.interaction_type}`
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return stats
  }

  const getUserInteractions = async (userId?: string) => {
    if (!userId) return []

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('showcase_interactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to fetch user interactions:', error)
      return []
    } finally {
      setLoading(false)
    }
  }

  return {
    interactions,
    loading,
    trackInteraction,
    getInteractionStats,
    getUserInteractions
  }
}