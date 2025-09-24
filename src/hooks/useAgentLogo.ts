import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useLogoGenerationHistory } from '@/hooks/useLogoGenerationHistory'

interface GeneratedLogo {
  imageUrl: string
  agentName: string
  agentSymbol: string
}

export const useAgentLogo = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const { addGenerationRecord } = useLogoGenerationHistory()

  const generateLogo = async (
    agentName: string, 
    agentSymbol: string, 
    style: string = "modern minimalist",
    agentId?: string
  ): Promise<GeneratedLogo | null> => {
    setIsGenerating(true)
    const startTime = Date.now()
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-agent-logo', {
        body: {
          agentName,
          agentSymbol,
          style,
          agentId
        }
      })

      const generationTime = Date.now() - startTime

      if (error) {
        console.error('Error generating logo:', error)
        
        // Record failed generation
        await addGenerationRecord(agentName, agentSymbol, style, {
          generationTimeMs: generationTime,
          success: false,
          errorMessage: error.message
        })
        
        throw error
      }

      if (data?.success) {
        const result = {
          imageUrl: data.imageUrl,
          agentName: data.agentName,
          agentSymbol: data.agentSymbol
        }

        // Record successful generation
        await addGenerationRecord(agentName, agentSymbol, style, {
          imageUrl: data.imageUrl,
          generationTimeMs: generationTime,
          success: true
        })

        return result
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