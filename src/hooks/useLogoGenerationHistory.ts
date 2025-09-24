import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface LogoGenerationRecord {
  id: string
  user_id?: string
  agent_name: string
  agent_symbol: string
  style: string
  prompt_used?: string
  image_url?: string
  generation_time_ms?: number
  success: boolean
  error_message?: string
  created_at: string
}

export const useLogoGenerationHistory = () => {
  const [history, setHistory] = useState<LogoGenerationRecord[]>([])
  const [loading, setLoading] = useState(false)

  const addGenerationRecord = async (
    agentName: string,
    agentSymbol: string,
    style: string,
    options?: {
      promptUsed?: string
      imageUrl?: string
      generationTimeMs?: number
      success?: boolean
      errorMessage?: string
    }
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const record = {
        user_id: user?.id,
        agent_name: agentName,
        agent_symbol: agentSymbol,
        style,
        prompt_used: options?.promptUsed,
        image_url: options?.imageUrl,
        generation_time_ms: options?.generationTimeMs,
        success: options?.success ?? true,
        error_message: options?.errorMessage
      }

      const { data, error } = await supabase
        .from('logo_generation_history')
        .insert(record)
        .select()
        .single()

      if (error) throw error

      setHistory(prev => [data, ...prev])
      return data
    } catch (error) {
      console.error('Failed to add generation record:', error)
      return null
    }
  }

  const fetchUserHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setLoading(true)
      const { data, error } = await supabase
        .from('logo_generation_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setHistory(data || [])
    } catch (error) {
      console.error('Failed to fetch generation history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGenerationStats = () => {
    const total = history.length
    const successful = history.filter(r => r.success).length
    const avgTime = history
      .filter(r => r.generation_time_ms)
      .reduce((sum, r) => sum + (r.generation_time_ms || 0), 0) / total || 0

    const styleStats = history.reduce((acc, record) => {
      acc[record.style] = (acc[record.style] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total,
      successful,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      avgGenerationTime: Math.round(avgTime),
      popularStyles: Object.entries(styleStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([style, count]) => ({ style, count }))
    }
  }

  useEffect(() => {
    fetchUserHistory()
  }, [])

  return {
    history,
    loading,
    addGenerationRecord,
    fetchUserHistory,
    getGenerationStats
  }
}