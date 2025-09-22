import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'general' | 'feature_request' | 'bug_report';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_for_customer' | 'resolved' | 'closed';
  assigned_agent_id?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  customer_satisfaction_rating?: number;
  tags: string[];
  attachments?: string[];
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: 'customer' | 'agent' | 'system';
  message: string;
  is_internal_note: boolean;
  attachments?: string[];
  created_at: string;
}

export interface SupportAgent {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  status: 'online' | 'busy' | 'offline';
  specializations: string[];
  current_tickets: number;
  max_tickets: number;
  rating: number;
  total_resolved: number;
  avg_response_time: number;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  helpful_votes: number;
  total_votes: number;
  published: boolean;
  created_at: string;
  updated_at: string;
  author_id: string;
}

export interface SupportStats {
  total_tickets: number;
  open_tickets: number;
  resolved_tickets: number;
  avg_response_time: number;
  avg_resolution_time: number;
  customer_satisfaction: number;
  tickets_by_category: Record<string, number>;
  tickets_by_priority: Record<string, number>;
  agent_performance: Array<{
    agent_id: string;
    name: string;
    tickets_resolved: number;
    avg_response_time: number;
    satisfaction_rating: number;
  }>;
}

export const useCustomerSupport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [messages, setMessages] = useState<Record<string, SupportMessage[]>>({});
  const [agents, setAgents] = useState<SupportAgent[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseArticle[]>([]);
  const [supportStats, setSupportStats] = useState<SupportStats | null>(null);
  const [realtimeChannel, setRealtimeChannel] = useState<any>(null);

  // Fetch user's tickets
  const fetchTickets = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // In a real implementation, this would fetch from the database
      // For now, using mock data
      const mockTickets: SupportTicket[] = [
        {
          id: 'ticket_1',
          user_id: user.id,
          subject: 'Cannot connect to Binance exchange',
          description: 'I\'m getting authentication errors when trying to connect my Binance account. I\'ve double-checked my API keys.',
          category: 'technical',
          priority: 'high',
          status: 'in_progress',
          assigned_agent_id: 'agent_1',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          updated_at: new Date(Date.now() - 3600000).toISOString(),
          tags: ['exchange', 'binance', 'api'],
          attachments: []
        },
        {
          id: 'ticket_2',
          user_id: user.id,
          subject: 'Feature request: Dark mode for mobile app',
          description: 'It would be great to have a dark mode option for the mobile application to reduce eye strain during night trading.',
          category: 'feature_request',
          priority: 'medium',
          status: 'open',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          tags: ['mobile', 'ui', 'dark-mode'],
          attachments: []
        },
        {
          id: 'ticket_3',
          user_id: user.id,
          subject: 'Billing inquiry about premium features',
          description: 'I\'m interested in upgrading to premium but have questions about the features included and billing cycle.',
          category: 'billing',
          priority: 'low',
          status: 'resolved',
          assigned_agent_id: 'agent_2',
          created_at: new Date(Date.now() - 259200000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          resolved_at: new Date(Date.now() - 86400000).toISOString(),
          customer_satisfaction_rating: 5,
          tags: ['billing', 'premium'],
          attachments: []
        }
      ];

      setTickets(mockTickets);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load support tickets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Fetch messages for a ticket
  const fetchTicketMessages = useCallback(async (ticketId: string) => {
    try {
      // Mock messages
      const mockMessages: SupportMessage[] = [
        {
          id: 'msg_1',
          ticket_id: ticketId,
          sender_id: user?.id || 'user_1',
          sender_type: 'customer',
          message: 'I\'m getting authentication errors when trying to connect my Binance account. I\'ve double-checked my API keys.',
          is_internal_note: false,
          created_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: 'msg_2',
          ticket_id: ticketId,
          sender_id: 'agent_1',
          sender_type: 'agent',
          message: 'Thank you for contacting us. I\'ve reviewed your case and it looks like there might be an issue with the API permissions. Can you please check if your API key has trading permissions enabled?',
          is_internal_note: false,
          created_at: new Date(Date.now() - 5400000).toISOString()
        },
        {
          id: 'msg_3',
          ticket_id: ticketId,
          sender_id: user?.id || 'user_1',
          sender_type: 'customer',
          message: 'I checked and the API key does have trading permissions. The error message says "Invalid signature" - could this be a timestamp issue?',
          is_internal_note: false,
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'msg_4',
          ticket_id: ticketId,
          sender_id: 'agent_1',
          sender_type: 'agent',
          message: 'That\'s a good observation! Invalid signature errors are often related to timestamp synchronization. Please try the following steps:\n\n1. Make sure your system clock is synchronized\n2. Clear browser cache and cookies\n3. Try connecting again\n\nLet me know if this resolves the issue.',
          is_internal_note: false,
          created_at: new Date(Date.now() - 1800000).toISOString()
        }
      ];

      setMessages(prev => ({
        ...prev,
        [ticketId]: mockMessages
      }));
    } catch (error) {
      console.error('Failed to fetch ticket messages:', error);
    }
  }, [user]);

  // Fetch available agents
  const fetchAgents = useCallback(async () => {
    try {
      const mockAgents: SupportAgent[] = [
        {
          id: 'agent_1',
          user_id: 'user_agent_1',
          name: 'Sarah Chen',
          email: 'sarah.chen@hypercognition.io',
          avatar_url: '',
          status: 'online',
          specializations: ['Technical Support', 'Exchange Integration', 'API Issues'],
          current_tickets: 8,
          max_tickets: 15,
          rating: 4.8,
          total_resolved: 1247,
          avg_response_time: 45
        },
        {
          id: 'agent_2',
          user_id: 'user_agent_2',
          name: 'Marcus Rodriguez',
          email: 'marcus.rodriguez@hypercognition.io',
          avatar_url: '',
          status: 'online',
          specializations: ['Billing Support', 'Account Management', 'Premium Features'],
          current_tickets: 12,
          max_tickets: 20,
          rating: 4.9,
          total_resolved: 987,
          avg_response_time: 38
        },
        {
          id: 'agent_3',
          user_id: 'user_agent_3',
          name: 'Emma Thompson',
          email: 'emma.thompson@hypercognition.io',
          avatar_url: '',
          status: 'busy',
          specializations: ['Trading Support', 'Portfolio Management', 'Risk Management'],
          current_tickets: 18,
          max_tickets: 20,
          rating: 4.7,
          total_resolved: 1456,
          avg_response_time: 52
        }
      ];

      setAgents(mockAgents);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
  }, []);

  // Fetch knowledge base articles
  const fetchKnowledgeBase = useCallback(async () => {
    try {
      const mockArticles: KnowledgeBaseArticle[] = [
        {
          id: 'kb_1',
          title: 'How to Connect Your Exchange Account',
          content: 'Step-by-step guide to securely connect your cryptocurrency exchange accounts...',
          category: 'Getting Started',
          tags: ['exchange', 'setup', 'api'],
          views: 1547,
          helpful_votes: 89,
          total_votes: 92,
          published: true,
          created_at: new Date(Date.now() - 604800000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          author_id: 'admin_1'
        },
        {
          id: 'kb_2',
          title: 'Understanding Arbitrage Opportunities',
          content: 'Learn how our multi-exchange arbitrage detection works and how to maximize profits...',
          category: 'Trading',
          tags: ['arbitrage', 'trading', 'profit'],
          views: 987,
          helpful_votes: 76,
          total_votes: 81,
          published: true,
          created_at: new Date(Date.now() - 1209600000).toISOString(),
          updated_at: new Date(Date.now() - 172800000).toISOString(),
          author_id: 'admin_2'
        },
        {
          id: 'kb_3',
          title: 'Troubleshooting Common API Errors',
          content: 'Solutions for the most common API authentication and connection issues...',
          category: 'Troubleshooting',
          tags: ['api', 'errors', 'troubleshooting'],
          views: 2341,
          helpful_votes: 156,
          total_votes: 167,
          published: true,
          created_at: new Date(Date.now() - 1814400000).toISOString(),
          updated_at: new Date(Date.now() - 259200000).toISOString(),
          author_id: 'admin_1'
        }
      ];

      setKnowledgeBase(mockArticles);
    } catch (error) {
      console.error('Failed to fetch knowledge base:', error);
    }
  }, []);

  // Create new support ticket
  const createTicket = async (ticketData: Omit<SupportTicket, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);

      const newTicket: SupportTicket = {
        id: `ticket_${Date.now()}`,
        user_id: user?.id || '',
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...ticketData
      };

      setTickets(prev => [newTicket, ...prev]);

      toast({
        title: "Ticket Created",
        description: `Your support ticket #${newTicket.id} has been created successfully.`,
      });

      return newTicket;
    } catch (error) {
      console.error('Failed to create ticket:', error);
      toast({
        title: "Error",
        description: "Failed to create support ticket",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Send message to ticket
  const sendMessage = async (ticketId: string, message: string, attachments?: File[]) => {
    try {
      const newMessage: SupportMessage = {
        id: `msg_${Date.now()}`,
        ticket_id: ticketId,
        sender_id: user?.id || '',
        sender_type: 'customer',
        message,
        is_internal_note: false,
        created_at: new Date().toISOString(),
        attachments: attachments ? attachments.map(f => f.name) : undefined
      };

      setMessages(prev => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), newMessage]
      }));

      // Update ticket status to indicate customer response
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, updated_at: new Date().toISOString(), status: ticket.status === 'waiting_for_customer' ? 'in_progress' : ticket.status }
          : ticket
      ));

      toast({
        title: "Message Sent",
        description: "Your message has been sent to our support team.",
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  // Rate support interaction
  const rateSupportInteraction = async (ticketId: string, rating: number, feedback?: string) => {
    try {
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, customer_satisfaction_rating: rating }
          : ticket
      ));

      toast({
        title: "Thank You",
        description: "Your feedback has been recorded and helps us improve our service.",
      });
    } catch (error) {
      console.error('Failed to rate support:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive"
      });
    }
  };

  // Search knowledge base
  const searchKnowledgeBase = (query: string) => {
    const searchTerms = query.toLowerCase().split(' ');
    return knowledgeBase.filter(article => 
      article.published && (
        searchTerms.some(term => 
          article.title.toLowerCase().includes(term) ||
          article.content.toLowerCase().includes(term) ||
          article.tags.some(tag => tag.toLowerCase().includes(term))
        )
      )
    ).sort((a, b) => b.views - a.views);
  };

  // Get support statistics (for admin dashboard)
  const fetchSupportStats = useCallback(async () => {
    try {
      const mockStats: SupportStats = {
        total_tickets: 1247,
        open_tickets: 89,
        resolved_tickets: 1089,
        avg_response_time: 42, // minutes
        avg_resolution_time: 8.5, // hours
        customer_satisfaction: 4.7,
        tickets_by_category: {
          technical: 456,
          billing: 234,
          general: 298,
          feature_request: 145,
          bug_report: 114
        },
        tickets_by_priority: {
          low: 387,
          medium: 654,
          high: 156,
          urgent: 50
        },
        agent_performance: [
          {
            agent_id: 'agent_1',
            name: 'Sarah Chen',
            tickets_resolved: 247,
            avg_response_time: 45,
            satisfaction_rating: 4.8
          },
          {
            agent_id: 'agent_2',
            name: 'Marcus Rodriguez',
            tickets_resolved: 187,
            avg_response_time: 38,
            satisfaction_rating: 4.9
          }
        ]
      };

      setSupportStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch support stats:', error);
    }
  }, []);

  // Initialize
  useEffect(() => {
    if (user) {
      fetchTickets();
      fetchAgents();
      fetchKnowledgeBase();
    }
  }, [user, fetchTickets, fetchAgents, fetchKnowledgeBase]);

  // Setup real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`support:${user.id}`)
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `ticket_id=in.(${tickets.map(t => t.id).join(',')})`
        },
        (payload) => {
          const newMessage = payload.new as SupportMessage;
          if (newMessage.sender_type === 'agent') {
            setMessages(prev => ({
              ...prev,
              [newMessage.ticket_id]: [...(prev[newMessage.ticket_id] || []), newMessage]
            }));

            toast({
              title: "New Message",
              description: "You have a new message from our support team.",
            });
          }
        }
      )
      .subscribe();

    setRealtimeChannel(channel);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, tickets, toast]);

  return {
    loading,
    tickets,
    messages,
    agents,
    knowledgeBase,
    supportStats,
    createTicket,
    sendMessage,
    fetchTicketMessages,
    rateSupportInteraction,
    searchKnowledgeBase,
    fetchSupportStats,
    // Utility functions
    getTicketById: (id: string) => tickets.find(t => t.id === id),
    getOpenTicketsCount: () => tickets.filter(t => ['open', 'in_progress'].includes(t.status)).length,
    getTicketMessages: (ticketId: string) => messages[ticketId] || [],
    getAvailableAgents: () => agents.filter(a => a.status === 'online' && a.current_tickets < a.max_tickets)
  };
};