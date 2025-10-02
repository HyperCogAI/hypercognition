import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const useAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (userMessage: string, context?: string) => {
    if (!userMessage.trim()) return;

    const newUserMessage: Message = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
      
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, newUserMessage],
          context,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: 'Rate limit exceeded',
            description: 'Please wait a moment before sending another message.',
            variant: 'destructive',
          });
          return;
        }
        if (response.status === 402) {
          toast({
            title: 'Service unavailable',
            description: 'AI service credits depleted. Please contact support.',
            variant: 'destructive',
          });
          return;
        }
        throw new Error('Failed to get response');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let textBuffer = '';
      let streamDone = false;

      // Create initial assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantMessage += content;
              setMessages(prev => {
                const newMessages = [...prev];
                if (newMessages[newMessages.length - 1]?.role === 'assistant') {
                  newMessages[newMessages.length - 1] = {
                    role: 'assistant',
                    content: assistantMessage,
                  };
                }
                return newMessages;
              });
            }
          } catch (e) {
            // Incomplete JSON, put it back
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw || raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantMessage += content;
              setMessages(prev => {
                const newMessages = [...prev];
                if (newMessages[newMessages.length - 1]?.role === 'assistant') {
                  newMessages[newMessages.length - 1] = {
                    role: 'assistant',
                    content: assistantMessage,
                  };
                }
                return newMessages;
              });
            }
          } catch {
            // Ignore partial leftovers
          }
        }
      }

      // Log to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user && assistantMessage) {
        await supabase.from('ai_assistant_logs').insert({
          user_id: user.id,
          query: userMessage,
          response: assistantMessage,
          context,
        });
      }

    } catch (error) {
      console.error('AI chat error:', error);
      toast({
        title: 'Error',
        description: 'Failed to get AI response. Please try again.',
        variant: 'destructive',
      });
      
      // Remove the empty assistant message on error
      setMessages(prev => {
        const filtered = prev.filter((msg, idx) => 
          !(idx === prev.length - 1 && msg.role === 'assistant' && !msg.content)
        );
        return filtered;
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
};
