import { supabase } from '@/integrations/supabase/client'

interface Agent {
  id: string
  name: string
  symbol: string
  avatar_url: string | null
  logo_generated: boolean
  logo_style: string | null
}

export const generateLogosForPlaceholderAgents = async () => {
  try {
    // Get all agents with placeholder avatars
    const { data: agents, error: fetchError } = await supabase
      .from('agents')
      .select('id, name, symbol, avatar_url, logo_generated, logo_style')
      .or('avatar_url.is.null,avatar_url.eq./placeholder.svg')

    if (fetchError) throw fetchError

    console.log(`Found ${agents?.length || 0} agents needing logos`)

    // Generate logos for each agent
    for (const agent of agents || []) {
      try {
        console.log(`Generating logo for ${agent.name}...`)
        
        const { data, error } = await supabase.functions.invoke('generate-agent-logo', {
          body: {
            agentName: agent.name,
            agentSymbol: agent.symbol,
            style: agent.logo_style || 'modern minimalist'
          }
        })

        if (error) {
          console.error(`Error generating logo for ${agent.name}:`, error)
          continue
        }

        if (data?.success) {
          // Update the agent's avatar_url with the generated logo
          const { error: updateError } = await supabase
            .from('agents')
            .update({ 
              avatar_url: data.imageUrl,
              logo_generated: true 
            })
            .eq('id', agent.id)

          if (updateError) {
            console.error(`Error updating agent ${agent.name}:`, updateError)
          } else {
            console.log(`✅ Logo generated for ${agent.name}`)
          }
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Failed to generate logo for ${agent.name}:`, error)
      }
    }

    console.log('Logo generation complete!')
  } catch (error) {
    console.error('Error in bulk logo generation:', error)
  }
}