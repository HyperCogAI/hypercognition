import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface GeneratedLogo {
  imageUrl: string
  agentName: string
  agentSymbol: string
}

export const useAgentLogo = () => {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateLogo = async (
    agentName: string, 
    agentSymbol: string, 
    style: string = "modern minimalist",
    agentId?: string
  ): Promise<GeneratedLogo | null> => {
    setIsGenerating(true)
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-agent-logo', {
        body: {
          agentName,
          agentSymbol,
          style,
          agentId
        }
      })

      if (error) {
        console.error('Error generating logo:', error)
        throw error
      }

      if (data?.success) {
        return {
          imageUrl: data.imageUrl,
          agentName: data.agentName,
          agentSymbol: data.agentSymbol
        }
      }

      return null
    } catch (error) {
      console.error('Failed to generate agent logo:', error)
      throw error
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    generateLogo,
    isGenerating
  }
}