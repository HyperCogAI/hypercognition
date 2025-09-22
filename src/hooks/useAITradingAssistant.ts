import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface AIResponse {
  response: string;
  timestamp: string;
}

interface AIAssistantHook {
  sendMessage: (query: string, context?: string) => Promise<AIResponse>;
  isLoading: boolean;
  error: string | null;
}

export const useAITradingAssistant = (): AIAssistantHook => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const sendMessage = useCallback(async (query: string, context?: string): Promise<AIResponse> => {
    if (!query.trim()) {
      throw new Error('Query cannot be empty');
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('ai-trading-assistant', {
        body: {
          query: query.trim(),
          userId: user?.id,
          context: context || 'AI Trading Assistant Query'
        }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Failed to get AI response');
      }

      if (!data) {
        throw new Error('No response received from AI assistant');
      }

      return {
        response: data.response,
        timestamp: data.timestamp
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      toast({
        title: "AI Assistant Error",
        description: errorMessage,
        variant: "destructive",
      });

      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);

  return {
    sendMessage,
    isLoading,
    error
  };
};