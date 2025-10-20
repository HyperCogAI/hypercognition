export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      acp_contracts: {
        Row: {
          agent_id: string | null
          blockchain_address: string | null
          contract_hash: string | null
          contract_type: string
          created_at: string
          deliverables: Json | null
          end_date: string | null
          id: string
          job_id: string | null
          metadata: Json | null
          milestones: Json | null
          party_a_id: string
          party_b_id: string | null
          payment_terms: Json
          service_id: string | null
          signed_by_a_at: string | null
          signed_by_b_at: string | null
          start_date: string | null
          status: string
          terms: Json
          title: string
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          blockchain_address?: string | null
          contract_hash?: string | null
          contract_type: string
          created_at?: string
          deliverables?: Json | null
          end_date?: string | null
          id?: string
          job_id?: string | null
          metadata?: Json | null
          milestones?: Json | null
          party_a_id: string
          party_b_id?: string | null
          payment_terms: Json
          service_id?: string | null
          signed_by_a_at?: string | null
          signed_by_b_at?: string | null
          start_date?: string | null
          status?: string
          terms: Json
          title: string
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          blockchain_address?: string | null
          contract_hash?: string | null
          contract_type?: string
          created_at?: string
          deliverables?: Json | null
          end_date?: string | null
          id?: string
          job_id?: string | null
          metadata?: Json | null
          milestones?: Json | null
          party_a_id?: string
          party_b_id?: string | null
          payment_terms?: Json
          service_id?: string | null
          signed_by_a_at?: string | null
          signed_by_b_at?: string | null
          start_date?: string | null
          status?: string
          terms?: Json
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "acp_contracts_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acp_contracts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "acp_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acp_contracts_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "acp_services"
            referencedColumns: ["id"]
          },
        ]
      }
      acp_job_bids: {
        Row: {
          agent_id: string | null
          bid_amount: number
          bidder_id: string
          created_at: string
          currency: string
          delivery_time_hours: number | null
          id: string
          job_id: string
          metadata: Json | null
          proposal: string
          status: string
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          bid_amount: number
          bidder_id: string
          created_at?: string
          currency?: string
          delivery_time_hours?: number | null
          id?: string
          job_id: string
          metadata?: Json | null
          proposal: string
          status?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          bid_amount?: number
          bidder_id?: string
          created_at?: string
          currency?: string
          delivery_time_hours?: number | null
          id?: string
          job_id?: string
          metadata?: Json | null
          proposal?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "acp_job_bids_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acp_job_bids_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "acp_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      acp_jobs: {
        Row: {
          agent_id: string | null
          assignee_id: string | null
          bids_count: number | null
          budget: number
          cancelled_at: string | null
          category: string
          completed_at: string | null
          created_at: string
          currency: string
          deadline: string | null
          deliverables: Json | null
          description: string
          id: string
          metadata: Json | null
          poster_id: string
          requirements: Json | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          assignee_id?: string | null
          bids_count?: number | null
          budget: number
          cancelled_at?: string | null
          category: string
          completed_at?: string | null
          created_at?: string
          currency?: string
          deadline?: string | null
          deliverables?: Json | null
          description: string
          id?: string
          metadata?: Json | null
          poster_id: string
          requirements?: Json | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          assignee_id?: string | null
          bids_count?: number | null
          budget?: number
          cancelled_at?: string | null
          category?: string
          completed_at?: string | null
          created_at?: string
          currency?: string
          deadline?: string | null
          deliverables?: Json | null
          description?: string
          id?: string
          metadata?: Json | null
          poster_id?: string
          requirements?: Json | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "acp_jobs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      acp_reviews: {
        Row: {
          agent_id: string | null
          created_at: string
          id: string
          job_id: string | null
          metadata: Json | null
          rating: number
          response_at: string | null
          response_text: string | null
          review_text: string | null
          reviewee_id: string | null
          reviewer_id: string
          service_id: string | null
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          metadata?: Json | null
          rating: number
          response_at?: string | null
          response_text?: string | null
          review_text?: string | null
          reviewee_id?: string | null
          reviewer_id: string
          service_id?: string | null
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          metadata?: Json | null
          rating?: number
          response_at?: string | null
          response_text?: string | null
          review_text?: string | null
          reviewee_id?: string | null
          reviewer_id?: string
          service_id?: string | null
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "acp_reviews_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acp_reviews_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "acp_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acp_reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "acp_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acp_reviews_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "acp_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      acp_services: {
        Row: {
          agent_id: string
          category: string
          created_at: string
          creator_id: string | null
          currency: string
          delivery_time_hours: number | null
          description: string
          features: Json | null
          id: string
          metadata: Json | null
          price: number
          rating: number | null
          requirements: Json | null
          status: string
          title: string
          total_orders: number | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          category: string
          created_at?: string
          creator_id?: string | null
          currency?: string
          delivery_time_hours?: number | null
          description: string
          features?: Json | null
          id?: string
          metadata?: Json | null
          price?: number
          rating?: number | null
          requirements?: Json | null
          status?: string
          title: string
          total_orders?: number | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          category?: string
          created_at?: string
          creator_id?: string | null
          currency?: string
          delivery_time_hours?: number | null
          description?: string
          features?: Json | null
          id?: string
          metadata?: Json | null
          price?: number
          rating?: number | null
          requirements?: Json | null
          status?: string
          title?: string
          total_orders?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "acp_services_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      acp_transactions: {
        Row: {
          agent_id: string | null
          amount: number
          blockchain: string | null
          completed_at: string | null
          created_at: string
          currency: string
          escrow_until: string | null
          fee: number | null
          from_user_id: string | null
          id: string
          job_id: string | null
          metadata: Json | null
          payment_method: string | null
          processed_at: string | null
          service_id: string | null
          status: string
          to_user_id: string | null
          transaction_hash: string | null
          transaction_type: string
        }
        Insert: {
          agent_id?: string | null
          amount: number
          blockchain?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          escrow_until?: string | null
          fee?: number | null
          from_user_id?: string | null
          id?: string
          job_id?: string | null
          metadata?: Json | null
          payment_method?: string | null
          processed_at?: string | null
          service_id?: string | null
          status?: string
          to_user_id?: string | null
          transaction_hash?: string | null
          transaction_type: string
        }
        Update: {
          agent_id?: string | null
          amount?: number
          blockchain?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          escrow_until?: string | null
          fee?: number | null
          from_user_id?: string | null
          id?: string
          job_id?: string | null
          metadata?: Json | null
          payment_method?: string | null
          processed_at?: string | null
          service_id?: string | null
          status?: string
          to_user_id?: string | null
          transaction_hash?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "acp_transactions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acp_transactions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "acp_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acp_transactions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "acp_services"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_2fa_secrets: {
        Row: {
          backup_codes: string[] | null
          created_at: string
          id: string
          is_active: boolean
          last_used_at: string | null
          secret_encrypted: string
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          secret_encrypted: string
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          secret_encrypted?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_actions: {
        Row: {
          action_details: Json
          action_type: string
          admin_user_id: string
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          justification: string | null
          requires_approval: boolean | null
          target_resource: string | null
          target_user_id: string | null
        }
        Insert: {
          action_details?: Json
          action_type: string
          admin_user_id: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          justification?: string | null
          requires_approval?: boolean | null
          target_resource?: string | null
          target_user_id?: string | null
        }
        Update: {
          action_details?: Json
          action_type?: string
          admin_user_id?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          justification?: string | null
          requires_approval?: boolean | null
          target_resource?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      admin_privilege_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          resource: string
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource: string
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource?: string
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          permissions: Json
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          permissions?: Json
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          permissions?: Json
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      agent_analytics: {
        Row: {
          agent_id: string
          calculated_at: string
          id: string
          metric_type: string
          metric_value: number
          period: string
        }
        Insert: {
          agent_id: string
          calculated_at?: string
          id?: string
          metric_type: string
          metric_value: number
          period: string
        }
        Update: {
          agent_id?: string
          calculated_at?: string
          id?: string
          metric_type?: string
          metric_value?: number
          period?: string
        }
        Relationships: []
      }
      agent_comments: {
        Row: {
          agent_id: string
          content: string
          created_at: string
          id: string
          likes_count: number
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          content: string
          created_at?: string
          id?: string
          likes_count?: number
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          content?: string
          created_at?: string
          id?: string
          likes_count?: number
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_comments_agent_id_agents_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "agent_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_comments_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      agent_comparisons: {
        Row: {
          agent_1_id: string
          agent_2_id: string
          comparison_data: Json
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          agent_1_id: string
          agent_2_id: string
          comparison_data?: Json
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          agent_1_id?: string
          agent_2_id?: string
          comparison_data?: Json
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_comparisons_agent_1_id_fkey"
            columns: ["agent_1_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_comparisons_agent_2_id_fkey"
            columns: ["agent_2_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_creation_requests: {
        Row: {
          agent_data: Json
          agent_id: string | null
          created_at: string
          creator_id: string
          id: string
          processed_at: string | null
          rejection_reason: string | null
          status: string
        }
        Insert: {
          agent_data: Json
          agent_id?: string | null
          created_at?: string
          creator_id: string
          id?: string
          processed_at?: string | null
          rejection_reason?: string | null
          status?: string
        }
        Update: {
          agent_data?: Json
          agent_id?: string | null
          created_at?: string
          creator_id?: string
          id?: string
          processed_at?: string | null
          rejection_reason?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_creation_requests_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_interactions: {
        Row: {
          agent_id: string
          amount: number | null
          completed_at: string | null
          created_at: string
          description: string | null
          from_user_id: string | null
          id: string
          interaction_type: string
          metadata: Json | null
          status: string
          to_user_id: string | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          amount?: number | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          from_user_id?: string | null
          id?: string
          interaction_type: string
          metadata?: Json | null
          status?: string
          to_user_id?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          amount?: number | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          from_user_id?: string | null
          id?: string
          interaction_type?: string
          metadata?: Json | null
          status?: string
          to_user_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_interactions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_performance_metrics: {
        Row: {
          active_users: number | null
          agent_id: string
          avg_roi: number
          calculated_at: string | null
          id: string
          metadata: Json | null
          period: string
          period_end: string
          period_start: string
          sentiment_score: number | null
          successful_trades: number
          total_holders: number | null
          total_profit: number
          total_trades: number
          total_volume: number
          volatility: number | null
          win_rate: number
        }
        Insert: {
          active_users?: number | null
          agent_id: string
          avg_roi?: number
          calculated_at?: string | null
          id?: string
          metadata?: Json | null
          period: string
          period_end: string
          period_start: string
          sentiment_score?: number | null
          successful_trades?: number
          total_holders?: number | null
          total_profit?: number
          total_trades?: number
          total_volume?: number
          volatility?: number | null
          win_rate?: number
        }
        Update: {
          active_users?: number | null
          agent_id?: string
          avg_roi?: number
          calculated_at?: string | null
          id?: string
          metadata?: Json | null
          period?: string
          period_end?: string
          period_start?: string
          sentiment_score?: number | null
          successful_trades?: number
          total_holders?: number | null
          total_profit?: number
          total_trades?: number
          total_volume?: number
          volatility?: number | null
          win_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "agent_performance_metrics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_ratings: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          rating: number
          review: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          rating: number
          review?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          rating?: number
          review?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agents: {
        Row: {
          avatar_url: string | null
          category: string | null
          chain: string
          change_24h: number
          created_at: string
          creator_id: string | null
          description: string | null
          features: Json | null
          id: string
          initial_price: number | null
          initial_supply: number | null
          logo_generated: boolean | null
          logo_style: string | null
          market_cap: number
          name: string
          price: number
          status: string | null
          symbol: string
          updated_at: string
          volume_24h: number
        }
        Insert: {
          avatar_url?: string | null
          category?: string | null
          chain?: string
          change_24h?: number
          created_at?: string
          creator_id?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          initial_price?: number | null
          initial_supply?: number | null
          logo_generated?: boolean | null
          logo_style?: string | null
          market_cap?: number
          name: string
          price?: number
          status?: string | null
          symbol: string
          updated_at?: string
          volume_24h?: number
        }
        Update: {
          avatar_url?: string | null
          category?: string | null
          chain?: string
          change_24h?: number
          created_at?: string
          creator_id?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          initial_price?: number | null
          initial_supply?: number | null
          logo_generated?: boolean | null
          logo_style?: string | null
          market_cap?: number
          name?: string
          price?: number
          status?: string | null
          symbol?: string
          updated_at?: string
          volume_24h?: number
        }
        Relationships: []
      }
      agents_earnings: {
        Row: {
          agent_id: string
          amount: number
          created_at: string
          currency: string
          description: string | null
          earnings_type: string
          id: string
          metadata: Json | null
          processed_at: string | null
          source_transaction_id: string | null
          user_id: string | null
        }
        Insert: {
          agent_id: string
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          earnings_type: string
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          source_transaction_id?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          earnings_type?: string
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          source_transaction_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_earnings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_assistant_logs: {
        Row: {
          context: string | null
          cost: number | null
          created_at: string | null
          feedback_rating: number | null
          id: string
          query: string
          response: string
          session_id: string | null
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          context?: string | null
          cost?: number | null
          created_at?: string | null
          feedback_rating?: number | null
          id?: string
          query: string
          response: string
          session_id?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          context?: string | null
          cost?: number | null
          created_at?: string | null
          feedback_rating?: number | null
          id?: string
          query?: string
          response?: string
          session_id?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_backtest_results: {
        Row: {
          completed_at: string | null
          created_at: string | null
          detailed_results: Json | null
          end_date: string
          error_message: string | null
          id: string
          max_drawdown: number | null
          period: string
          profit_factor: number | null
          sharpe_ratio: number | null
          start_date: string
          status: Database["public"]["Enums"]["backtest_status"] | null
          strategy_id: string
          total_return: number | null
          total_trades: number | null
          user_id: string
          win_rate: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          detailed_results?: Json | null
          end_date: string
          error_message?: string | null
          id?: string
          max_drawdown?: number | null
          period: string
          profit_factor?: number | null
          sharpe_ratio?: number | null
          start_date: string
          status?: Database["public"]["Enums"]["backtest_status"] | null
          strategy_id: string
          total_return?: number | null
          total_trades?: number | null
          user_id: string
          win_rate?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          detailed_results?: Json | null
          end_date?: string
          error_message?: string | null
          id?: string
          max_drawdown?: number | null
          period?: string
          profit_factor?: number | null
          sharpe_ratio?: number | null
          start_date?: string
          status?: Database["public"]["Enums"]["backtest_status"] | null
          strategy_id?: string
          total_return?: number | null
          total_trades?: number | null
          user_id?: string
          win_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_backtest_results_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "ai_trading_strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_models: {
        Row: {
          accuracy: number | null
          created_at: string | null
          description: string | null
          id: string
          is_system: boolean | null
          last_trained_at: string | null
          model_type: Database["public"]["Enums"]["ai_model_type"]
          name: string
          parameters: Json | null
          performance_metrics: Json | null
          status: Database["public"]["Enums"]["ai_model_status"] | null
          training_data_description: string | null
          updated_at: string | null
          version: string
        }
        Insert: {
          accuracy?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          last_trained_at?: string | null
          model_type: Database["public"]["Enums"]["ai_model_type"]
          name: string
          parameters?: Json | null
          performance_metrics?: Json | null
          status?: Database["public"]["Enums"]["ai_model_status"] | null
          training_data_description?: string | null
          updated_at?: string | null
          version: string
        }
        Update: {
          accuracy?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          last_trained_at?: string | null
          model_type?: Database["public"]["Enums"]["ai_model_type"]
          name?: string
          parameters?: Json | null
          performance_metrics?: Json | null
          status?: Database["public"]["Enums"]["ai_model_status"] | null
          training_data_description?: string | null
          updated_at?: string | null
          version?: string
        }
        Relationships: []
      }
      ai_strategy_subscriptions: {
        Row: {
          created_at: string | null
          id: string
          is_auto_trade: boolean | null
          max_position_size: number | null
          risk_limit: number | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          strategy_id: string
          total_pnl: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_auto_trade?: boolean | null
          max_position_size?: number | null
          risk_limit?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          strategy_id: string
          total_pnl?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_auto_trade?: boolean | null
          max_position_size?: number | null
          risk_limit?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          strategy_id?: string
          total_pnl?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_strategy_subscriptions_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "ai_trading_strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_trading_sessions: {
        Row: {
          cost: number | null
          created_at: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          outcome: string | null
          session_data: Json | null
          session_type: Database["public"]["Enums"]["ai_session_type"]
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          outcome?: string | null
          session_data?: Json | null
          session_type: Database["public"]["Enums"]["ai_session_type"]
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          outcome?: string | null
          session_data?: Json | null
          session_type?: Database["public"]["Enums"]["ai_session_type"]
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
      ai_trading_strategies: {
        Row: {
          avg_return: number | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          max_drawdown: number | null
          model_version: string | null
          name: string
          parameters: Json | null
          sharpe_ratio: number | null
          strategy_type: Database["public"]["Enums"]["ai_strategy_type"]
          total_trades: number | null
          updated_at: string | null
          user_id: string | null
          win_rate: number | null
        }
        Insert: {
          avg_return?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          max_drawdown?: number | null
          model_version?: string | null
          name: string
          parameters?: Json | null
          sharpe_ratio?: number | null
          strategy_type: Database["public"]["Enums"]["ai_strategy_type"]
          total_trades?: number | null
          updated_at?: string | null
          user_id?: string | null
          win_rate?: number | null
        }
        Update: {
          avg_return?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          max_drawdown?: number | null
          model_version?: string | null
          name?: string
          parameters?: Json | null
          sharpe_ratio?: number | null
          strategy_type?: Database["public"]["Enums"]["ai_strategy_type"]
          total_trades?: number | null
          updated_at?: string | null
          user_id?: string | null
          win_rate?: number | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_category: string
          event_data: Json | null
          event_name: string
          event_type: string
          id: string
          ip_address: unknown | null
          page_url: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_category: string
          event_data?: Json | null
          event_name: string
          event_type: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_category?: string
          event_data?: Json | null
          event_name?: string
          event_type?: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_preferences: {
        Row: {
          alert_thresholds: Json | null
          created_at: string | null
          dashboard_layout: Json | null
          default_period: string | null
          favorite_metrics: string[] | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alert_thresholds?: Json | null
          created_at?: string | null
          dashboard_layout?: Json | null
          default_period?: string | null
          favorite_metrics?: string[] | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alert_thresholds?: Json | null
          created_at?: string | null
          dashboard_layout?: Json | null
          default_period?: string | null
          favorite_metrics?: string[] | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean
          key_prefix: string
          last_used_at: string | null
          name: string
          organization_id: string
          permissions: Json
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_prefix: string
          last_used_at?: string | null
          name: string
          organization_id: string
          permissions?: Json
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          organization_id?: string
          permissions?: Json
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_configs: {
        Row: {
          backup_type: string
          compression_enabled: boolean
          created_at: string
          created_by: string
          description: string | null
          encryption_enabled: boolean
          id: string
          is_active: boolean
          last_run_at: string | null
          name: string
          next_run_at: string | null
          retention_days: number
          schedule_cron: string | null
          storage_location: string
          updated_at: string
        }
        Insert: {
          backup_type?: string
          compression_enabled?: boolean
          created_at?: string
          created_by: string
          description?: string | null
          encryption_enabled?: boolean
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          name: string
          next_run_at?: string | null
          retention_days?: number
          schedule_cron?: string | null
          storage_location?: string
          updated_at?: string
        }
        Update: {
          backup_type?: string
          compression_enabled?: boolean
          created_at?: string
          created_by?: string
          description?: string | null
          encryption_enabled?: boolean
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          name?: string
          next_run_at?: string | null
          retention_days?: number
          schedule_cron?: string | null
          storage_location?: string
          updated_at?: string
        }
        Relationships: []
      }
      backup_records: {
        Row: {
          backup_duration_seconds: number | null
          backup_type: string
          checksum: string | null
          completed_at: string | null
          config_id: string
          created_at: string
          error_message: string | null
          file_path: string | null
          file_size_bytes: number | null
          id: string
          metadata: Json | null
          started_at: string
          status: string
        }
        Insert: {
          backup_duration_seconds?: number | null
          backup_type: string
          checksum?: string | null
          completed_at?: string | null
          config_id: string
          created_at?: string
          error_message?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          id?: string
          metadata?: Json | null
          started_at?: string
          status?: string
        }
        Update: {
          backup_duration_seconds?: number | null
          backup_type?: string
          checksum?: string | null
          completed_at?: string | null
          config_id?: string
          created_at?: string
          error_message?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          id?: string
          metadata?: Json | null
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "backup_records_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "backup_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      chain_metrics: {
        Row: {
          active_addresses_24h: number
          avg_gas_price: number
          block_time: number
          chain: string
          id: string
          metadata: Json | null
          timestamp: string
          tps: number
          transactions_24h: number
          tvl: number
          volume_24h: number
        }
        Insert: {
          active_addresses_24h?: number
          avg_gas_price?: number
          block_time?: number
          chain: string
          id?: string
          metadata?: Json | null
          timestamp?: string
          tps?: number
          transactions_24h?: number
          tvl?: number
          volume_24h?: number
        }
        Update: {
          active_addresses_24h?: number
          avg_gas_price?: number
          block_time?: number
          chain?: string
          id?: string
          metadata?: Json | null
          timestamp?: string
          tps?: number
          transactions_24h?: number
          tvl?: number
          volume_24h?: number
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "agent_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      community_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      community_chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_system_message: boolean | null
          metadata: Json | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_system_message?: boolean | null
          metadata?: Json | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_system_message?: boolean | null
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      community_post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_post_replies: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_solution: boolean | null
          like_count: number | null
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_solution?: boolean | null
          like_count?: number | null
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_solution?: boolean | null
          like_count?: number | null
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_post_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          category_id: string | null
          content: string
          created_at: string | null
          id: string
          is_locked: boolean | null
          is_pinned: boolean | null
          last_activity_at: string | null
          like_count: number | null
          reply_count: number | null
          title: string
          updated_at: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          category_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_activity_at?: string | null
          like_count?: number | null
          reply_count?: number | null
          title: string
          updated_at?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          category_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_activity_at?: string | null
          like_count?: number | null
          reply_count?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "community_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      community_reply_likes: {
        Row: {
          created_at: string | null
          id: string
          reply_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reply_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reply_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_reply_likes_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "community_post_replies"
            referencedColumns: ["id"]
          },
        ]
      }
      community_user_stats: {
        Row: {
          created_at: string | null
          id: string
          last_active_at: string | null
          likes_given: number | null
          likes_received: number | null
          posts_created: number | null
          rank: number | null
          replies_created: number | null
          reputation_score: number | null
          solutions_provided: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_active_at?: string | null
          likes_given?: number | null
          likes_received?: number | null
          posts_created?: number | null
          rank?: number | null
          replies_created?: number | null
          reputation_score?: number | null
          solutions_provided?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_active_at?: string | null
          likes_given?: number | null
          likes_received?: number | null
          posts_created?: number | null
          rank?: number | null
          replies_created?: number | null
          reputation_score?: number | null
          solutions_provided?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      competition_participants: {
        Row: {
          competition_id: string
          current_balance: number
          id: string
          joined_at: string
          last_updated: string
          pnl_percentage: number
          rank: number | null
          starting_balance: number
          total_pnl: number
          total_trades: number
          user_id: string
          win_rate: number
        }
        Insert: {
          competition_id: string
          current_balance?: number
          id?: string
          joined_at?: string
          last_updated?: string
          pnl_percentage?: number
          rank?: number | null
          starting_balance?: number
          total_pnl?: number
          total_trades?: number
          user_id: string
          win_rate?: number
        }
        Update: {
          competition_id?: string
          current_balance?: number
          id?: string
          joined_at?: string
          last_updated?: string
          pnl_percentage?: number
          rank?: number | null
          starting_balance?: number
          total_pnl?: number
          total_trades?: number
          user_id?: string
          win_rate?: number
        }
        Relationships: []
      }
      competitions: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string
          entry_fee: number | null
          id: string
          max_participants: number | null
          name: string
          rules: Json | null
          start_date: string
          status: string
          total_prize_pool: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date: string
          entry_fee?: number | null
          id?: string
          max_participants?: number | null
          name: string
          rules?: Json | null
          start_date: string
          status?: string
          total_prize_pool?: number | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string
          entry_fee?: number | null
          id?: string
          max_participants?: number | null
          name?: string
          rules?: Json | null
          start_date?: string
          status?: string
          total_prize_pool?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      compliance_alerts: {
        Row: {
          affected_user_id: string | null
          alert_type: string
          assigned_to: string | null
          created_at: string
          description: string
          id: string
          metadata: Json | null
          related_record_id: string | null
          related_table: string | null
          resolved_at: string | null
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          affected_user_id?: string | null
          alert_type: string
          assigned_to?: string | null
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          related_record_id?: string | null
          related_table?: string | null
          resolved_at?: string | null
          severity: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          affected_user_id?: string | null
          alert_type?: string
          assigned_to?: string | null
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          related_record_id?: string | null
          related_table?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      compliance_frameworks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          region: string
          requirements: Json
          type: string
          updated_at: string
          version: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          region: string
          requirements?: Json
          type: string
          updated_at?: string
          version?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          region?: string
          requirements?: Json
          type?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      compliance_violations: {
        Row: {
          description: string
          detected_at: string
          framework_id: string
          id: string
          metadata: Json | null
          organization_id: string
          requirement_id: string
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
        }
        Insert: {
          description: string
          detected_at?: string
          framework_id: string
          id?: string
          metadata?: Json | null
          organization_id: string
          requirement_id: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
        }
        Update: {
          description?: string
          detected_at?: string
          framework_id?: string
          id?: string
          metadata?: Json | null
          organization_id?: string
          requirement_id?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_violations_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "compliance_frameworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_violations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_violations_real: {
        Row: {
          assigned_to: string | null
          auto_detected: boolean | null
          created_at: string
          description: string
          detection_method: string | null
          id: string
          related_transaction_id: string | null
          resolution_notes: string | null
          resolved_at: string | null
          severity: string
          status: string
          updated_at: string
          user_id: string | null
          violation_type: string
        }
        Insert: {
          assigned_to?: string | null
          auto_detected?: boolean | null
          created_at?: string
          description: string
          detection_method?: string | null
          id?: string
          related_transaction_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          violation_type: string
        }
        Update: {
          assigned_to?: string | null
          auto_detected?: boolean | null
          created_at?: string
          description?: string
          detection_method?: string | null
          id?: string
          related_transaction_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          violation_type?: string
        }
        Relationships: []
      }
      connected_accounts: {
        Row: {
          access_token_encrypted: string | null
          created_at: string
          id: string
          is_active: boolean | null
          last_synced_at: string | null
          provider: string
          provider_account_id: string
          provider_account_name: string | null
          refresh_token_encrypted: string | null
          scopes: string[] | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          provider: string
          provider_account_id: string
          provider_account_name?: string | null
          refresh_token_encrypted?: string | null
          scopes?: string[] | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          provider?: string
          provider_account_id?: string
          provider_account_name?: string | null
          refresh_token_encrypted?: string | null
          scopes?: string[] | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_moderation: {
        Row: {
          action: string
          content_id: string
          content_type: string
          created_at: string
          id: string
          moderator_id: string
          notes: string | null
          reason: string | null
        }
        Insert: {
          action: string
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          moderator_id: string
          notes?: string | null
          reason?: string | null
        }
        Update: {
          action?: string
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          moderator_id?: string
          notes?: string | null
          reason?: string | null
        }
        Relationships: []
      }
      copy_trading_settings: {
        Row: {
          agents_to_copy: string[] | null
          agents_to_exclude: string[] | null
          copy_percentage: number
          copy_types: string[] | null
          created_at: string
          follower_id: string
          id: string
          is_active: boolean
          max_amount_per_trade: number | null
          stop_loss_percentage: number | null
          take_profit_percentage: number | null
          trader_id: string
          updated_at: string
        }
        Insert: {
          agents_to_copy?: string[] | null
          agents_to_exclude?: string[] | null
          copy_percentage?: number
          copy_types?: string[] | null
          created_at?: string
          follower_id: string
          id?: string
          is_active?: boolean
          max_amount_per_trade?: number | null
          stop_loss_percentage?: number | null
          take_profit_percentage?: number | null
          trader_id: string
          updated_at?: string
        }
        Update: {
          agents_to_copy?: string[] | null
          agents_to_exclude?: string[] | null
          copy_percentage?: number
          copy_types?: string[] | null
          created_at?: string
          follower_id?: string
          id?: string
          is_active?: boolean
          max_amount_per_trade?: number | null
          stop_loss_percentage?: number | null
          take_profit_percentage?: number | null
          trader_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      cross_chain_analytics: {
        Row: {
          chain_distribution: Json
          dominant_chain: string | null
          id: string
          metadata: Json | null
          timestamp: string
          total_tvl: number
          total_volume_24h: number
        }
        Insert: {
          chain_distribution?: Json
          dominant_chain?: string | null
          id?: string
          metadata?: Json | null
          timestamp?: string
          total_tvl?: number
          total_volume_24h?: number
        }
        Update: {
          chain_distribution?: Json
          dominant_chain?: string | null
          id?: string
          metadata?: Json | null
          timestamp?: string
          total_tvl?: number
          total_volume_24h?: number
        }
        Relationships: []
      }
      crypto_portfolio: {
        Row: {
          amount: number
          created_at: string | null
          crypto_id: string
          crypto_name: string
          crypto_symbol: string
          exchange: string | null
          id: string
          notes: string | null
          purchase_date: string | null
          purchase_price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          crypto_id: string
          crypto_name: string
          crypto_symbol: string
          exchange?: string | null
          id?: string
          notes?: string | null
          purchase_date?: string | null
          purchase_price: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          crypto_id?: string
          crypto_name?: string
          crypto_symbol?: string
          exchange?: string | null
          id?: string
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      crypto_price_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          crypto_id: string
          crypto_name: string
          crypto_symbol: string
          current_value: number | null
          id: string
          is_active: boolean | null
          is_triggered: boolean | null
          target_value: number
          triggered_at: string | null
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          crypto_id: string
          crypto_name: string
          crypto_symbol: string
          current_value?: number | null
          id?: string
          is_active?: boolean | null
          is_triggered?: boolean | null
          target_value: number
          triggered_at?: string | null
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          crypto_id?: string
          crypto_name?: string
          crypto_symbol?: string
          current_value?: number | null
          id?: string
          is_active?: boolean | null
          is_triggered?: boolean | null
          target_value?: number
          triggered_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      crypto_watchlist: {
        Row: {
          created_at: string | null
          crypto_id: string
          crypto_name: string
          crypto_symbol: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          crypto_id: string
          crypto_name: string
          crypto_symbol: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          crypto_id?: string
          crypto_name?: string
          crypto_symbol?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_evm_tokens: {
        Row: {
          chain_id: number
          chain_name: string | null
          created_at: string
          decimals: number
          id: string
          is_verified: boolean | null
          logo_uri: string | null
          name: string
          symbol: string
          token_address: string
          updated_at: string
          user_id: string
        }
        Insert: {
          chain_id: number
          chain_name?: string | null
          created_at?: string
          decimals?: number
          id?: string
          is_verified?: boolean | null
          logo_uri?: string | null
          name: string
          symbol: string
          token_address: string
          updated_at?: string
          user_id: string
        }
        Update: {
          chain_id?: number
          chain_name?: string | null
          created_at?: string
          decimals?: number
          id?: string
          is_verified?: boolean | null
          logo_uri?: string | null
          name?: string
          symbol?: string
          token_address?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_solana_tokens: {
        Row: {
          created_at: string
          decimals: number
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          mint_address: string
          name: string
          symbol: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          decimals?: number
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          mint_address: string
          name: string
          symbol: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          decimals?: number
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          mint_address?: string
          name?: string
          symbol?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      defi_limit_orders: {
        Row: {
          amount_in: number
          amount_out: number
          created_at: string
          expires_at: string | null
          filled_amount: number | null
          filled_at: string | null
          id: string
          limit_price: number
          metadata: Json | null
          order_type: string
          pool_id: string
          slippage_tolerance: number | null
          status: string
          token_in: string
          token_out: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_in: number
          amount_out: number
          created_at?: string
          expires_at?: string | null
          filled_amount?: number | null
          filled_at?: string | null
          id?: string
          limit_price: number
          metadata?: Json | null
          order_type: string
          pool_id: string
          slippage_tolerance?: number | null
          status?: string
          token_in: string
          token_out: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_in?: number
          amount_out?: number
          created_at?: string
          expires_at?: string | null
          filled_amount?: number | null
          filled_at?: string | null
          id?: string
          limit_price?: number
          metadata?: Json | null
          order_type?: string
          pool_id?: string
          slippage_tolerance?: number | null
          status?: string
          token_in?: string
          token_out?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "defi_limit_orders_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "defi_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      defi_order_book: {
        Row: {
          ask_price: number
          ask_volume: number
          bid_price: number
          bid_volume: number
          id: string
          pool_id: string
          spread: number
          timestamp: string
          token_pair: string
        }
        Insert: {
          ask_price: number
          ask_volume?: number
          bid_price: number
          bid_volume?: number
          id?: string
          pool_id: string
          spread?: number
          timestamp?: string
          token_pair: string
        }
        Update: {
          ask_price?: number
          ask_volume?: number
          bid_price?: number
          bid_volume?: number
          id?: string
          pool_id?: string
          spread?: number
          timestamp?: string
          token_pair?: string
        }
        Relationships: [
          {
            foreignKeyName: "defi_order_book_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "defi_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      defi_order_executions: {
        Row: {
          executed_amount: number
          executed_at: string | null
          execution_price: number
          fee_amount: number | null
          id: string
          metadata: Json | null
          order_id: string
          transaction_hash: string | null
        }
        Insert: {
          executed_amount: number
          executed_at?: string | null
          execution_price: number
          fee_amount?: number | null
          id?: string
          metadata?: Json | null
          order_id: string
          transaction_hash?: string | null
        }
        Update: {
          executed_amount?: number
          executed_at?: string | null
          execution_price?: number
          fee_amount?: number | null
          id?: string
          metadata?: Json | null
          order_id?: string
          transaction_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "defi_order_executions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "defi_limit_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      defi_pools: {
        Row: {
          apy: number
          base_token: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          pool_address: string | null
          quote_token: string
          rewards_token: string
          tvl: number
          type: string
          updated_at: string
        }
        Insert: {
          apy?: number
          base_token: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          pool_address?: string | null
          quote_token: string
          rewards_token: string
          tvl?: number
          type: string
          updated_at?: string
        }
        Update: {
          apy?: number
          base_token?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          pool_address?: string | null
          quote_token?: string
          rewards_token?: string
          tvl?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      developer_data_access_log: {
        Row: {
          access_type: string
          accessed_by: string | null
          created_at: string | null
          developer_id: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
        }
        Insert: {
          access_type: string
          accessed_by?: string | null
          created_at?: string | null
          developer_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Update: {
          access_type?: string
          accessed_by?: string | null
          created_at?: string | null
          developer_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Relationships: []
      }
      dex_swaps: {
        Row: {
          chain_id: number
          chain_name: string | null
          completed_at: string | null
          created_at: string
          estimated_gas: string | null
          failure_reason: string | null
          from_amount: number
          from_token_address: string
          from_token_decimals: number
          from_token_symbol: string
          id: string
          metadata: Json | null
          price_impact_percentage: number | null
          quote_data: Json | null
          slippage_percentage: number | null
          status: string
          to_amount: number
          to_token_address: string
          to_token_decimals: number
          to_token_symbol: string
          transaction_hash: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chain_id: number
          chain_name?: string | null
          completed_at?: string | null
          created_at?: string
          estimated_gas?: string | null
          failure_reason?: string | null
          from_amount: number
          from_token_address: string
          from_token_decimals?: number
          from_token_symbol: string
          id?: string
          metadata?: Json | null
          price_impact_percentage?: number | null
          quote_data?: Json | null
          slippage_percentage?: number | null
          status?: string
          to_amount: number
          to_token_address: string
          to_token_decimals?: number
          to_token_symbol: string
          transaction_hash?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chain_id?: number
          chain_name?: string | null
          completed_at?: string | null
          created_at?: string
          estimated_gas?: string | null
          failure_reason?: string | null
          from_amount?: number
          from_token_address?: string
          from_token_decimals?: number
          from_token_symbol?: string
          id?: string
          metadata?: Json | null
          price_impact_percentage?: number | null
          quote_data?: Json | null
          slippage_percentage?: number | null
          status?: string
          to_amount?: number
          to_token_address?: string
          to_token_decimals?: number
          to_token_symbol?: string
          transaction_hash?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      enhanced_user_sessions: {
        Row: {
          created_at: string | null
          device_fingerprint: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_activity: string | null
          location: Json | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_fingerprint?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          location?: Json | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          location?: Json | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      environment_variables: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          environment: string
          id: string
          is_active: boolean
          is_secret: boolean
          last_accessed_at: string | null
          name: string
          updated_at: string
          updated_by: string | null
          value_encrypted: string | null
          value_plain: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          environment?: string
          id?: string
          is_active?: boolean
          is_secret?: boolean
          last_accessed_at?: string | null
          name: string
          updated_at?: string
          updated_by?: string | null
          value_encrypted?: string | null
          value_plain?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          environment?: string
          id?: string
          is_active?: boolean
          is_secret?: boolean
          last_accessed_at?: string | null
          name?: string
          updated_at?: string
          updated_by?: string | null
          value_encrypted?: string | null
          value_plain?: string | null
        }
        Relationships: []
      }
      exchange_connections: {
        Row: {
          api_key_encrypted: string
          connection_status: string
          created_at: string
          exchange_name: string
          id: string
          is_active: boolean
          is_testnet: boolean
          last_sync_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key_encrypted: string
          connection_status?: string
          created_at?: string
          exchange_name: string
          id?: string
          is_active?: boolean
          is_testnet?: boolean
          last_sync_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key_encrypted?: string
          connection_status?: string
          created_at?: string
          exchange_name?: string
          id?: string
          is_active?: boolean
          is_testnet?: boolean
          last_sync_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exchange_market_data: {
        Row: {
          ask_price: number | null
          bid_price: number | null
          change_24h: number | null
          exchange_name: string
          high_24h: number | null
          id: string
          low_24h: number | null
          price: number
          symbol: string
          timestamp: string
          volume_24h: number | null
        }
        Insert: {
          ask_price?: number | null
          bid_price?: number | null
          change_24h?: number | null
          exchange_name: string
          high_24h?: number | null
          id?: string
          low_24h?: number | null
          price: number
          symbol: string
          timestamp?: string
          volume_24h?: number | null
        }
        Update: {
          ask_price?: number | null
          bid_price?: number | null
          change_24h?: number | null
          exchange_name?: string
          high_24h?: number | null
          id?: string
          low_24h?: number | null
          price?: number
          symbol?: string
          timestamp?: string
          volume_24h?: number | null
        }
        Relationships: []
      }
      execution_orders: {
        Row: {
          agent_id: string
          amount: number
          created_at: string
          exchange_order_id: string | null
          executed_amount: number | null
          executed_price: number | null
          execution_time: string | null
          fees: number | null
          id: string
          latency_ms: number | null
          metadata: Json | null
          order_type: string
          price: number | null
          side: string
          status: string
          strategy_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          amount: number
          created_at?: string
          exchange_order_id?: string | null
          executed_amount?: number | null
          executed_price?: number | null
          execution_time?: string | null
          fees?: number | null
          id?: string
          latency_ms?: number | null
          metadata?: Json | null
          order_type: string
          price?: number | null
          side: string
          status?: string
          strategy_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          amount?: number
          created_at?: string
          exchange_order_id?: string | null
          executed_amount?: number | null
          executed_price?: number | null
          execution_time?: string | null
          fees?: number | null
          id?: string
          latency_ms?: number | null
          metadata?: Json | null
          order_type?: string
          price?: number | null
          side?: string
          status?: string
          strategy_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "execution_orders_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execution_orders_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "execution_strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      execution_strategies: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          parameters: Json
          strategy_type: string
          successful_executions: number
          total_executions: number
          total_pnl: number
          total_volume: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          parameters?: Json
          strategy_type: string
          successful_executions?: number
          total_executions?: number
          total_pnl?: number
          total_volume?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          parameters?: Json
          strategy_type?: string
          successful_executions?: number
          total_executions?: number
          total_pnl?: number
          total_volume?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      kaito_attention_scores: {
        Row: {
          agent_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          rank_30d: number | null
          twitter_user_id: string | null
          twitter_username: string
          updated_at: string | null
          yaps_12m: number | null
          yaps_24h: number | null
          yaps_30d: number | null
          yaps_3m: number | null
          yaps_48h: number | null
          yaps_6m: number | null
          yaps_7d: number | null
          yaps_all: number | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          rank_30d?: number | null
          twitter_user_id?: string | null
          twitter_username: string
          updated_at?: string | null
          yaps_12m?: number | null
          yaps_24h?: number | null
          yaps_30d?: number | null
          yaps_3m?: number | null
          yaps_48h?: number | null
          yaps_6m?: number | null
          yaps_7d?: number | null
          yaps_all?: number | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          rank_30d?: number | null
          twitter_user_id?: string | null
          twitter_username?: string
          updated_at?: string | null
          yaps_12m?: number | null
          yaps_24h?: number | null
          yaps_30d?: number | null
          yaps_3m?: number | null
          yaps_48h?: number | null
          yaps_6m?: number | null
          yaps_7d?: number | null
          yaps_all?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kaito_attention_scores_agent_fk"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kaito_attention_scores_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_verifications: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          document_expiry: string | null
          document_number: string | null
          document_type: string | null
          full_name: string | null
          id: string
          nationality: string | null
          phone_number: string | null
          postal_code: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_score: number | null
          state: string | null
          status: string
          updated_at: string
          user_id: string
          verification_notes: string | null
          verification_type: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          document_expiry?: string | null
          document_number?: string | null
          document_type?: string | null
          full_name?: string | null
          id?: string
          nationality?: string | null
          phone_number?: string | null
          postal_code?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_score?: number | null
          state?: string | null
          status?: string
          updated_at?: string
          user_id: string
          verification_notes?: string | null
          verification_type: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          document_expiry?: string | null
          document_number?: string | null
          document_type?: string | null
          full_name?: string | null
          id?: string
          nationality?: string | null
          phone_number?: string | null
          postal_code?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_score?: number | null
          state?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          verification_notes?: string | null
          verification_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyc_verifications_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      language_request_votes: {
        Row: {
          created_at: string
          id: string
          request_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          request_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          request_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "language_request_votes_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "language_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      language_requests: {
        Row: {
          created_at: string
          id: string
          language_code: string
          language_name: string
          native_name: string | null
          priority: string
          status: string
          updated_at: string
          user_id: string
          votes: number
        }
        Insert: {
          created_at?: string
          id?: string
          language_code: string
          language_name: string
          native_name?: string | null
          priority?: string
          status?: string
          updated_at?: string
          user_id: string
          votes?: number
        }
        Update: {
          created_at?: string
          id?: string
          language_code?: string
          language_name?: string
          native_name?: string | null
          priority?: string
          status?: string
          updated_at?: string
          user_id?: string
          votes?: number
        }
        Relationships: []
      }
      liquidity_pools: {
        Row: {
          apy: number
          chain: string
          fees_24h: number
          id: string
          liquidity: number
          metadata: Json | null
          pair: string
          timestamp: string
          token_a_address: string | null
          token_b_address: string | null
          volume_24h: number
        }
        Insert: {
          apy?: number
          chain: string
          fees_24h?: number
          id?: string
          liquidity?: number
          metadata?: Json | null
          pair: string
          timestamp?: string
          token_a_address?: string | null
          token_b_address?: string | null
          volume_24h?: number
        }
        Update: {
          apy?: number
          chain?: string
          fees_24h?: number
          id?: string
          liquidity?: number
          metadata?: Json | null
          pair?: string
          timestamp?: string
          token_a_address?: string | null
          token_b_address?: string | null
          volume_24h?: number
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempt_type: string
          created_at: string
          failure_reason: string | null
          id: string
          identifier: string
          ip_address: unknown | null
          success: boolean
          user_agent: string | null
        }
        Insert: {
          attempt_type: string
          created_at?: string
          failure_reason?: string | null
          id?: string
          identifier: string
          ip_address?: unknown | null
          success?: boolean
          user_agent?: string | null
        }
        Update: {
          attempt_type?: string
          created_at?: string
          failure_reason?: string | null
          id?: string
          identifier?: string
          ip_address?: unknown | null
          success?: boolean
          user_agent?: string | null
        }
        Relationships: []
      }
      logo_generation_history: {
        Row: {
          agent_name: string
          agent_symbol: string
          created_at: string
          error_message: string | null
          generation_time_ms: number | null
          id: string
          image_url: string | null
          prompt_used: string | null
          style: string
          success: boolean
          user_id: string | null
        }
        Insert: {
          agent_name: string
          agent_symbol: string
          created_at?: string
          error_message?: string | null
          generation_time_ms?: number | null
          id?: string
          image_url?: string | null
          prompt_used?: string | null
          style: string
          success?: boolean
          user_id?: string | null
        }
        Update: {
          agent_name?: string
          agent_symbol?: string
          created_at?: string
          error_message?: string | null
          generation_time_ms?: number | null
          id?: string
          image_url?: string | null
          prompt_used?: string | null
          style?: string
          success?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      market_data_feeds: {
        Row: {
          agent_id: string
          ask_price: number | null
          bid_price: number | null
          change_24h: number | null
          change_percent_24h: number | null
          high_24h: number | null
          id: string
          last_trade_size: number | null
          low_24h: number | null
          metadata: Json | null
          open_24h: number | null
          price: number
          source: string | null
          spread: number | null
          timestamp: string
          volume_24h: number | null
        }
        Insert: {
          agent_id: string
          ask_price?: number | null
          bid_price?: number | null
          change_24h?: number | null
          change_percent_24h?: number | null
          high_24h?: number | null
          id?: string
          last_trade_size?: number | null
          low_24h?: number | null
          metadata?: Json | null
          open_24h?: number | null
          price: number
          source?: string | null
          spread?: number | null
          timestamp?: string
          volume_24h?: number | null
        }
        Update: {
          agent_id?: string
          ask_price?: number | null
          bid_price?: number | null
          change_24h?: number | null
          change_percent_24h?: number | null
          high_24h?: number | null
          id?: string
          last_trade_size?: number | null
          low_24h?: number | null
          metadata?: Json | null
          open_24h?: number | null
          price?: number
          source?: string | null
          spread?: number | null
          timestamp?: string
          volume_24h?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "market_data_feeds_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      market_events: {
        Row: {
          affected_agents: string[] | null
          created_at: string | null
          description: string | null
          event_type: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          severity: string | null
          title: string
        }
        Insert: {
          affected_agents?: string[] | null
          created_at?: string | null
          description?: string | null
          event_type: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          severity?: string | null
          title: string
        }
        Update: {
          affected_agents?: string[] | null
          created_at?: string | null
          description?: string | null
          event_type?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          severity?: string | null
          title?: string
        }
        Relationships: []
      }
      market_news: {
        Row: {
          category: string
          content: string | null
          created_at: string
          id: string
          impact_level: string | null
          metadata: Json | null
          published_at: string
          related_chains: string[] | null
          related_tokens: string[] | null
          sentiment_score: number | null
          source: string
          summary: string
          title: string
          url: string | null
        }
        Insert: {
          category: string
          content?: string | null
          created_at?: string
          id?: string
          impact_level?: string | null
          metadata?: Json | null
          published_at: string
          related_chains?: string[] | null
          related_tokens?: string[] | null
          sentiment_score?: number | null
          source: string
          summary: string
          title: string
          url?: string | null
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          id?: string
          impact_level?: string | null
          metadata?: Json | null
          published_at?: string
          related_chains?: string[] | null
          related_tokens?: string[] | null
          sentiment_score?: number | null
          source?: string
          summary?: string
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      market_sentiment: {
        Row: {
          bearish_percentage: number | null
          bullish_percentage: number | null
          fear_greed_index: number | null
          id: string
          market_cap_change: number | null
          metadata: Json | null
          neutral_percentage: number | null
          overall_sentiment: number
          sentiment_label: string | null
          social_sentiment: string | null
          timeframe: string
          timestamp: string
          volume_sentiment: string | null
        }
        Insert: {
          bearish_percentage?: number | null
          bullish_percentage?: number | null
          fear_greed_index?: number | null
          id?: string
          market_cap_change?: number | null
          metadata?: Json | null
          neutral_percentage?: number | null
          overall_sentiment: number
          sentiment_label?: string | null
          social_sentiment?: string | null
          timeframe: string
          timestamp?: string
          volume_sentiment?: string | null
        }
        Update: {
          bearish_percentage?: number | null
          bullish_percentage?: number | null
          fear_greed_index?: number | null
          id?: string
          market_cap_change?: number | null
          metadata?: Json | null
          neutral_percentage?: number | null
          overall_sentiment?: number
          sentiment_label?: string | null
          social_sentiment?: string | null
          timeframe?: string
          timestamp?: string
          volume_sentiment?: string | null
        }
        Relationships: []
      }
      market_tickers: {
        Row: {
          agent_id: string
          best_ask: number | null
          best_bid: number | null
          change_24h: number | null
          change_percent_24h: number | null
          high_24h: number | null
          id: string
          last_price: number
          low_24h: number | null
          trades_count_24h: number | null
          updated_at: string
          volume_24h: number | null
          vwap_24h: number | null
        }
        Insert: {
          agent_id: string
          best_ask?: number | null
          best_bid?: number | null
          change_24h?: number | null
          change_percent_24h?: number | null
          high_24h?: number | null
          id?: string
          last_price: number
          low_24h?: number | null
          trades_count_24h?: number | null
          updated_at?: string
          volume_24h?: number | null
          vwap_24h?: number | null
        }
        Update: {
          agent_id?: string
          best_ask?: number | null
          best_bid?: number | null
          change_24h?: number | null
          change_percent_24h?: number | null
          high_24h?: number | null
          id?: string
          last_price?: number
          low_24h?: number | null
          trades_count_24h?: number | null
          updated_at?: string
          volume_24h?: number | null
          vwap_24h?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "market_tickers_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: true
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      market_trades: {
        Row: {
          agent_id: string
          id: string
          is_maker: boolean | null
          price: number
          side: string
          size: number
          timestamp: string
          trade_id: string | null
        }
        Insert: {
          agent_id: string
          id?: string
          is_maker?: boolean | null
          price: number
          side: string
          size: number
          timestamp?: string
          trade_id?: string | null
        }
        Update: {
          agent_id?: string
          id?: string
          is_maker?: boolean | null
          price?: number
          side?: string
          size?: number
          timestamp?: string
          trade_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_trades_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_developers: {
        Row: {
          company_name: string
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          total_apis: number
          total_revenue: number
          updated_at: string
          user_id: string
          verified: boolean
          website_url: string | null
        }
        Insert: {
          company_name: string
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          total_apis?: number
          total_revenue?: number
          updated_at?: string
          user_id: string
          verified?: boolean
          website_url?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          total_apis?: number
          total_revenue?: number
          updated_at?: string
          user_id?: string
          verified?: boolean
          website_url?: string | null
        }
        Relationships: []
      }
      marketplace_endpoints: {
        Row: {
          average_rating: number | null
          base_url: string
          category: string
          created_at: string
          description: string | null
          developer_id: string
          id: string
          is_active: boolean
          monthly_price: number | null
          name: string
          price_per_request: number | null
          pricing_model: string
          rate_limit_per_minute: number | null
          total_subscribers: number
          updated_at: string
          version: string
        }
        Insert: {
          average_rating?: number | null
          base_url: string
          category: string
          created_at?: string
          description?: string | null
          developer_id: string
          id?: string
          is_active?: boolean
          monthly_price?: number | null
          name: string
          price_per_request?: number | null
          pricing_model?: string
          rate_limit_per_minute?: number | null
          total_subscribers?: number
          updated_at?: string
          version?: string
        }
        Update: {
          average_rating?: number | null
          base_url?: string
          category?: string
          created_at?: string
          description?: string | null
          developer_id?: string
          id?: string
          is_active?: boolean
          monthly_price?: number | null
          name?: string
          price_per_request?: number | null
          pricing_model?: string
          rate_limit_per_minute?: number | null
          total_subscribers?: number
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_endpoints_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "marketplace_developers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_endpoints_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "marketplace_developers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      nft_collections: {
        Row: {
          contract_address: string
          created_at: string
          creator_id: string
          description: string | null
          floor_price: number
          id: string
          name: string
          symbol: string
          total_supply: number
          verified: boolean
          volume_24h: number
        }
        Insert: {
          contract_address: string
          created_at?: string
          creator_id: string
          description?: string | null
          floor_price?: number
          id?: string
          name: string
          symbol: string
          total_supply?: number
          verified?: boolean
          volume_24h?: number
        }
        Update: {
          contract_address?: string
          created_at?: string
          creator_id?: string
          description?: string | null
          floor_price?: number
          id?: string
          name?: string
          symbol?: string
          total_supply?: number
          verified?: boolean
          volume_24h?: number
        }
        Relationships: []
      }
      nft_items: {
        Row: {
          collection_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_listed: boolean
          metadata: Json | null
          name: string
          owner_id: string
          price: number | null
          token_id: string
          updated_at: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_listed?: boolean
          metadata?: Json | null
          name: string
          owner_id: string
          price?: number | null
          token_id: string
          updated_at?: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_listed?: boolean
          metadata?: Json | null
          name?: string
          owner_id?: string
          price?: number | null
          token_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nft_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "nft_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      nft_listings: {
        Row: {
          created_at: string
          currency: string
          expires_at: string | null
          id: string
          is_active: boolean
          nft_id: string
          price: number
          seller_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          nft_id: string
          price: number
          seller_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          nft_id?: string
          price?: number
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nft_listings_nft_id_fkey"
            columns: ["nft_id"]
            isOneToOne: false
            referencedRelation: "nft_items"
            referencedColumns: ["id"]
          },
        ]
      }
      nft_sales: {
        Row: {
          buyer_id: string
          created_at: string
          currency: string
          id: string
          nft_id: string
          price: number
          seller_id: string
          transaction_hash: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string
          currency?: string
          id?: string
          nft_id: string
          price: number
          seller_id: string
          transaction_hash?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string
          currency?: string
          id?: string
          nft_id?: string
          price?: number
          seller_id?: string
          transaction_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nft_sales_nft_id_fkey"
            columns: ["nft_id"]
            isOneToOne: false
            referencedRelation: "nft_items"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_notifications_enabled: boolean | null
          id: string
          market_news_enabled: boolean | null
          min_price_change_percent: number | null
          portfolio_updates_enabled: boolean | null
          price_alerts_enabled: boolean | null
          push_notifications_enabled: boolean | null
          social_updates_enabled: boolean | null
          twitter_kol_alerts_enabled: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_notifications_enabled?: boolean | null
          id?: string
          market_news_enabled?: boolean | null
          min_price_change_percent?: number | null
          portfolio_updates_enabled?: boolean | null
          price_alerts_enabled?: boolean | null
          push_notifications_enabled?: boolean | null
          social_updates_enabled?: boolean | null
          twitter_kol_alerts_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_notifications_enabled?: boolean | null
          id?: string
          market_news_enabled?: boolean | null
          min_price_change_percent?: number | null
          portfolio_updates_enabled?: boolean | null
          price_alerts_enabled?: boolean | null
          push_notifications_enabled?: boolean | null
          social_updates_enabled?: boolean | null
          twitter_kol_alerts_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          category: string | null
          created_at: string
          data: Json | null
          expires_at: string | null
          id: string
          message: string
          priority: string | null
          read: boolean
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          category?: string | null
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          message: string
          priority?: string | null
          read?: boolean
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          category?: string | null
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          message?: string
          priority?: string | null
          read?: boolean
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_book: {
        Row: {
          agent_id: string
          id: string
          level_index: number
          price: number
          side: string
          size: number
          timestamp: string
          total: number
        }
        Insert: {
          agent_id: string
          id?: string
          level_index?: number
          price: number
          side: string
          size: number
          timestamp?: string
          total: number
        }
        Update: {
          agent_id?: string
          id?: string
          level_index?: number
          price?: number
          side?: string
          size?: number
          timestamp?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_book_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      order_executions: {
        Row: {
          created_at: string
          details: Json | null
          executed_amount: number
          executed_price: number | null
          execution_time: string
          execution_type: string
          fee_amount: number | null
          id: string
          order_id: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          executed_amount?: number
          executed_price?: number | null
          execution_time?: string
          execution_type: string
          fee_amount?: number | null
          id?: string
          order_id: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          executed_amount?: number
          executed_price?: number | null
          execution_time?: string
          execution_type?: string
          fee_amount?: number | null
          id?: string
          order_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          agent_id: string
          amount: number
          average_fill_price: number | null
          created_at: string
          expires_at: string | null
          fees: number | null
          fill_or_kill: boolean | null
          filled_amount: number
          id: string
          order_source: string | null
          parent_order_id: string | null
          price: number | null
          reduce_only: boolean | null
          side: string
          status: string
          stop_loss_price: number | null
          take_profit_price: number | null
          time_in_force: string | null
          trailing_stop_percent: number | null
          trailing_stop_price: number | null
          trigger_price: number | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          amount: number
          average_fill_price?: number | null
          created_at?: string
          expires_at?: string | null
          fees?: number | null
          fill_or_kill?: boolean | null
          filled_amount?: number
          id?: string
          order_source?: string | null
          parent_order_id?: string | null
          price?: number | null
          reduce_only?: boolean | null
          side: string
          status?: string
          stop_loss_price?: number | null
          take_profit_price?: number | null
          time_in_force?: string | null
          trailing_stop_percent?: number | null
          trailing_stop_price?: number | null
          trigger_price?: number | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          amount?: number
          average_fill_price?: number | null
          created_at?: string
          expires_at?: string | null
          fees?: number | null
          fill_or_kill?: boolean | null
          filled_amount?: number
          id?: string
          order_source?: string | null
          parent_order_id?: string | null
          price?: number | null
          reduce_only?: boolean | null
          side?: string
          status?: string
          stop_loss_price?: number | null
          take_profit_price?: number | null
          time_in_force?: string | null
          trailing_stop_percent?: number | null
          trailing_stop_price?: number | null
          trigger_price?: number | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_orders_parent_order"
            columns: ["parent_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          settings: Json
          status: string
          tier: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          settings?: Json
          status?: string
          tier?: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          settings?: Json
          status?: string
          tier?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_metrics: {
        Row: {
          calculated_at: string
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          period: string
        }
        Insert: {
          calculated_at?: string
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          period?: string
        }
        Update: {
          calculated_at?: string
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          period?: string
        }
        Relationships: []
      }
      portfolio_analytics: {
        Row: {
          avg_loss: number
          avg_profit: number
          best_trade: number | null
          calculated_at: string | null
          id: string
          losing_trades: number
          max_drawdown: number | null
          metadata: Json | null
          period: string
          period_end: string
          period_start: string
          sharpe_ratio: number | null
          total_pnl: number
          total_pnl_percentage: number
          total_trades: number
          total_value: number
          user_id: string
          win_rate: number
          winning_trades: number
          worst_trade: number | null
        }
        Insert: {
          avg_loss?: number
          avg_profit?: number
          best_trade?: number | null
          calculated_at?: string | null
          id?: string
          losing_trades?: number
          max_drawdown?: number | null
          metadata?: Json | null
          period: string
          period_end: string
          period_start: string
          sharpe_ratio?: number | null
          total_pnl?: number
          total_pnl_percentage?: number
          total_trades?: number
          total_value?: number
          user_id: string
          win_rate?: number
          winning_trades?: number
          worst_trade?: number | null
        }
        Update: {
          avg_loss?: number
          avg_profit?: number
          best_trade?: number | null
          calculated_at?: string | null
          id?: string
          losing_trades?: number
          max_drawdown?: number | null
          metadata?: Json | null
          period?: string
          period_end?: string
          period_start?: string
          sharpe_ratio?: number | null
          total_pnl?: number
          total_pnl_percentage?: number
          total_trades?: number
          total_value?: number
          user_id?: string
          win_rate?: number
          winning_trades?: number
          worst_trade?: number | null
        }
        Relationships: []
      }
      portfolio_holdings: {
        Row: {
          asset_id: string
          asset_name: string
          asset_symbol: string
          asset_type: string
          average_buy_price: number
          created_at: string
          current_value: number
          id: string
          last_updated: string
          quantity: number
          realized_pnl: number
          total_invested: number
          unrealized_pnl: number
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_id: string
          asset_name: string
          asset_symbol: string
          asset_type?: string
          average_buy_price?: number
          created_at?: string
          current_value?: number
          id?: string
          last_updated?: string
          quantity?: number
          realized_pnl?: number
          total_invested?: number
          unrealized_pnl?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_id?: string
          asset_name?: string
          asset_symbol?: string
          asset_type?: string
          average_buy_price?: number
          created_at?: string
          current_value?: number
          id?: string
          last_updated?: string
          quantity?: number
          realized_pnl?: number
          total_invested?: number
          unrealized_pnl?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_transactions: {
        Row: {
          asset_id: string
          asset_name: string
          asset_symbol: string
          created_at: string
          exchange: string | null
          fees: number
          holding_id: string | null
          id: string
          notes: string | null
          price: number
          quantity: number
          total_amount: number
          transaction_date: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          asset_id: string
          asset_name: string
          asset_symbol: string
          created_at?: string
          exchange?: string | null
          fees?: number
          holding_id?: string | null
          id?: string
          notes?: string | null
          price: number
          quantity: number
          total_amount: number
          transaction_date?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          asset_id?: string
          asset_name?: string
          asset_symbol?: string
          created_at?: string
          exchange?: string | null
          fees?: number
          holding_id?: string | null
          id?: string
          notes?: string | null
          price?: number
          quantity?: number
          total_amount?: number
          transaction_date?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_transactions_holding_id_fkey"
            columns: ["holding_id"]
            isOneToOne: false
            referencedRelation: "portfolio_holdings"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          agent_id: string
          amount: number
          created_at: string | null
          id: string
          purchase_date: string | null
          purchase_price: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agent_id: string
          amount?: number
          created_at?: string | null
          id?: string
          purchase_date?: string | null
          purchase_price?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string
          amount?: number
          created_at?: string | null
          id?: string
          purchase_date?: string | null
          purchase_price?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          likes_count: number
          parent_id: string | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          likes_count?: number
          parent_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          likes_count?: number
          parent_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      post_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: string
          post_id?: string
          user_id?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      price_alerts: {
        Row: {
          agent_id: string
          agent_name: string
          agent_symbol: string
          alert_type: string
          created_at: string | null
          current_value: number | null
          id: string
          is_active: boolean | null
          is_triggered: boolean | null
          target_value: number
          triggered_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agent_id: string
          agent_name: string
          agent_symbol: string
          alert_type: string
          created_at?: string | null
          current_value?: number | null
          id?: string
          is_active?: boolean | null
          is_triggered?: boolean | null
          target_value: number
          triggered_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string
          agent_name?: string
          agent_symbol?: string
          alert_type?: string
          created_at?: string | null
          current_value?: number | null
          id?: string
          is_active?: boolean | null
          is_triggered?: boolean | null
          target_value?: number
          triggered_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      price_history: {
        Row: {
          agent_id: string
          id: string
          market_cap: number
          price: number
          timestamp: string
          volume: number
        }
        Insert: {
          agent_id: string
          id?: string
          market_cap?: number
          price: number
          timestamp?: string
          volume?: number
        }
        Update: {
          agent_id?: string
          id?: string
          market_cap?: number
          price?: number
          timestamp?: string
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "price_history_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      privacy_settings: {
        Row: {
          allow_third_party_cookies: boolean | null
          blocked_users: string[] | null
          created_at: string
          hide_from_search_engines: boolean | null
          id: string
          muted_users: string[] | null
          private_profile: boolean | null
          profile_searchable: boolean | null
          share_trading_data: boolean | null
          share_with_partners: boolean | null
          show_activity_status: boolean | null
          show_last_seen: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_third_party_cookies?: boolean | null
          blocked_users?: string[] | null
          created_at?: string
          hide_from_search_engines?: boolean | null
          id?: string
          muted_users?: string[] | null
          private_profile?: boolean | null
          profile_searchable?: boolean | null
          share_trading_data?: boolean | null
          share_with_partners?: boolean | null
          show_activity_status?: boolean | null
          show_last_seen?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_third_party_cookies?: boolean | null
          blocked_users?: string[] | null
          created_at?: string
          hide_from_search_engines?: boolean | null
          id?: string
          muted_users?: string[] | null
          private_profile?: boolean | null
          profile_searchable?: boolean | null
          share_trading_data?: boolean | null
          share_with_partners?: boolean | null
          show_activity_status?: boolean | null
          show_last_seen?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
          wallet_address: string | null
          wallet_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          wallet_address?: string | null
          wallet_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
          wallet_type?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          identifier: string
          request_count: number
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          identifier: string
          request_count?: number
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          identifier?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          reward_percentage: number
          user_id: string
          uses_count: number
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          reward_percentage?: number
          user_id: string
          uses_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          reward_percentage?: number
          user_id?: string
          uses_count?: number
        }
        Relationships: []
      }
      referral_conversions: {
        Row: {
          created_at: string | null
          credited_at: string | null
          id: string
          metadata: Json | null
          referral_code: string
          referred_user_id: string
          referrer_id: string
          reward_amount: number | null
          status: string
        }
        Insert: {
          created_at?: string | null
          credited_at?: string | null
          id?: string
          metadata?: Json | null
          referral_code: string
          referred_user_id: string
          referrer_id: string
          reward_amount?: number | null
          status?: string
        }
        Update: {
          created_at?: string | null
          credited_at?: string | null
          id?: string
          metadata?: Json | null
          referral_code?: string
          referred_user_id?: string
          referrer_id?: string
          reward_amount?: number | null
          status?: string
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          amount: number
          conversion_id: string | null
          created_at: string | null
          currency: string | null
          id: string
          metadata: Json | null
          paid_at: string | null
          reward_type: string
          status: string
          user_id: string
        }
        Insert: {
          amount?: number
          conversion_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          reward_type: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          conversion_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          reward_type?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_conversion_id_fkey"
            columns: ["conversion_id"]
            isOneToOne: false
            referencedRelation: "referral_conversions"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          claimed_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_id: string
          referrer_id: string
          reward_amount: number
          reward_claimed: boolean
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_id: string
          referrer_id: string
          reward_amount?: number
          reward_claimed?: boolean
        }
        Update: {
          claimed_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          reward_amount?: number
          reward_claimed?: boolean
        }
        Relationships: []
      }
      security_alerts: {
        Row: {
          affected_resource: string | null
          affected_user_id: string | null
          alert_type: string
          assigned_to: string | null
          auto_resolved: boolean | null
          created_at: string
          description: string
          detection_timestamp: string
          id: string
          resolution_notes: string | null
          severity: string
          source_ip: unknown | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          affected_resource?: string | null
          affected_user_id?: string | null
          alert_type: string
          assigned_to?: string | null
          auto_resolved?: boolean | null
          created_at?: string
          description: string
          detection_timestamp?: string
          id?: string
          resolution_notes?: string | null
          severity?: string
          source_ip?: unknown | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          affected_resource?: string | null
          affected_user_id?: string | null
          alert_type?: string
          assigned_to?: string | null
          auto_resolved?: boolean | null
          created_at?: string
          description?: string
          detection_timestamp?: string
          id?: string
          resolution_notes?: string | null
          severity?: string
          source_ip?: unknown | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          resource: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_audit_logs: {
        Row: {
          action: string
          additional_data: Json | null
          created_at: string
          failure_reason: string | null
          id: string
          ip_address: unknown | null
          resource: string | null
          resource_id: string | null
          risk_score: number | null
          session_id: string | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          additional_data?: Json | null
          created_at?: string
          failure_reason?: string | null
          id?: string
          ip_address?: unknown | null
          resource?: string | null
          resource_id?: string | null
          risk_score?: number | null
          session_id?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          additional_data?: Json | null
          created_at?: string
          failure_reason?: string | null
          id?: string
          ip_address?: unknown | null
          resource?: string | null
          resource_id?: string | null
          risk_score?: number | null
          session_id?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_settings: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          setting_name: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          setting_name: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          setting_name?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      settings_change_log: {
        Row: {
          changed_by: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_value: Json | null
          old_value: Json | null
          setting_category: string
          setting_name: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          changed_by: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_value?: Json | null
          old_value?: Json | null
          setting_category: string
          setting_name: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          changed_by?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_value?: Json | null
          old_value?: Json | null
          setting_category?: string
          setting_name?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      showcase_interactions: {
        Row: {
          component_type: string
          created_at: string
          data: Json | null
          id: string
          interaction_type: string
          user_id: string | null
        }
        Insert: {
          component_type: string
          created_at?: string
          data?: Json | null
          id?: string
          interaction_type: string
          user_id?: string | null
        }
        Update: {
          component_type?: string
          created_at?: string
          data?: Json | null
          id?: string
          interaction_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      signal_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          likes_count: number
          parent_id: string | null
          signal_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          likes_count?: number
          parent_id?: string | null
          signal_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          likes_count?: number
          parent_id?: string | null
          signal_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      signal_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: string
          signal_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type: string
          signal_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: string
          signal_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "signal_interactions_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "trading_signals"
            referencedColumns: ["id"]
          },
        ]
      }
      signal_likes: {
        Row: {
          created_at: string
          id: string
          signal_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          signal_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          signal_id?: string
          user_id?: string
        }
        Relationships: []
      }
      social_activities: {
        Row: {
          activity_type: string
          comments_count: number
          content: string | null
          created_at: string
          id: string
          likes_count: number
          metadata: Json | null
          privacy_level: string
          user_id: string
        }
        Insert: {
          activity_type: string
          comments_count?: number
          content?: string | null
          created_at?: string
          id?: string
          likes_count?: number
          metadata?: Json | null
          privacy_level?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          comments_count?: number
          content?: string | null
          created_at?: string
          id?: string
          likes_count?: number
          metadata?: Json | null
          privacy_level?: string
          user_id?: string
        }
        Relationships: []
      }
      social_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          comments_count: number
          content: string
          created_at: string
          id: string
          is_pinned: boolean
          likes_count: number
          media_urls: string[] | null
          post_type: string
          related_agent_id: string | null
          related_order_id: string | null
          shares_count: number
          updated_at: string
          user_id: string
          views_count: number
        }
        Insert: {
          comments_count?: number
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          likes_count?: number
          media_urls?: string[] | null
          post_type: string
          related_agent_id?: string | null
          related_order_id?: string | null
          shares_count?: number
          updated_at?: string
          user_id: string
          views_count?: number
        }
        Update: {
          comments_count?: number
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          likes_count?: number
          media_urls?: string[] | null
          post_type?: string
          related_agent_id?: string | null
          related_order_id?: string | null
          shares_count?: number
          updated_at?: string
          user_id?: string
          views_count?: number
        }
        Relationships: []
      }
      solana_limit_orders: {
        Row: {
          amount_in: number
          amount_out: number
          created_at: string | null
          expires_at: string | null
          filled_amount: number | null
          filled_at: string | null
          id: string
          limit_price: number
          mint_in: string
          mint_out: string
          order_type: string
          pool_id: string | null
          slippage_tolerance: number | null
          status: string
          token_in: string
          token_out: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_in: number
          amount_out: number
          created_at?: string | null
          expires_at?: string | null
          filled_amount?: number | null
          filled_at?: string | null
          id?: string
          limit_price: number
          mint_in: string
          mint_out: string
          order_type: string
          pool_id?: string | null
          slippage_tolerance?: number | null
          status?: string
          token_in: string
          token_out: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_in?: number
          amount_out?: number
          created_at?: string | null
          expires_at?: string | null
          filled_amount?: number | null
          filled_at?: string | null
          id?: string
          limit_price?: number
          mint_in?: string
          mint_out?: string
          order_type?: string
          pool_id?: string | null
          slippage_tolerance?: number | null
          status?: string
          token_in?: string
          token_out?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "solana_limit_orders_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "solana_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      solana_order_book: {
        Row: {
          ask_price: number | null
          ask_volume: number | null
          bid_price: number | null
          bid_volume: number | null
          pool_id: string
          spread: number | null
          timestamp: string | null
        }
        Insert: {
          ask_price?: number | null
          ask_volume?: number | null
          bid_price?: number | null
          bid_volume?: number | null
          pool_id: string
          spread?: number | null
          timestamp?: string | null
        }
        Update: {
          ask_price?: number | null
          ask_volume?: number | null
          bid_price?: number | null
          bid_volume?: number | null
          pool_id?: string
          spread?: number | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solana_order_book_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: true
            referencedRelation: "solana_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      solana_order_executions: {
        Row: {
          executed_amount: number
          executed_at: string | null
          execution_price: number
          fee_amount: number | null
          id: string
          metadata: Json | null
          order_id: string
          transaction_hash: string | null
        }
        Insert: {
          executed_amount: number
          executed_at?: string | null
          execution_price: number
          fee_amount?: number | null
          id?: string
          metadata?: Json | null
          order_id: string
          transaction_hash?: string | null
        }
        Update: {
          executed_amount?: number
          executed_at?: string | null
          execution_price?: number
          fee_amount?: number | null
          id?: string
          metadata?: Json | null
          order_id?: string
          transaction_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solana_order_executions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "solana_limit_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      solana_pools: {
        Row: {
          base_mint: string
          base_token: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          pool_address: string | null
          quote_mint: string
          quote_token: string
          tvl: number | null
          updated_at: string | null
          volume_24h: number | null
        }
        Insert: {
          base_mint: string
          base_token: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          pool_address?: string | null
          quote_mint: string
          quote_token: string
          tvl?: number | null
          updated_at?: string | null
          volume_24h?: number | null
        }
        Update: {
          base_mint?: string
          base_token?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          pool_address?: string | null
          quote_mint?: string
          quote_token?: string
          tvl?: number | null
          updated_at?: string | null
          volume_24h?: number | null
        }
        Relationships: []
      }
      solana_portfolios: {
        Row: {
          amount: number
          created_at: string
          id: string
          mint_address: string
          purchase_date: string | null
          purchase_price: number | null
          token_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          mint_address: string
          purchase_date?: string | null
          purchase_price?: number | null
          token_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          mint_address?: string
          purchase_date?: string | null
          purchase_price?: number | null
          token_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "solana_portfolios_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "solana_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      solana_price_history: {
        Row: {
          id: string
          market_cap: number
          mint_address: string
          price: number
          timestamp: string
          token_id: string
          volume: number
        }
        Insert: {
          id?: string
          market_cap?: number
          mint_address: string
          price: number
          timestamp?: string
          token_id: string
          volume?: number
        }
        Update: {
          id?: string
          market_cap?: number
          mint_address?: string
          price?: number
          timestamp?: string
          token_id?: string
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "solana_price_history_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "solana_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      solana_swaps: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          input_amount: number
          input_mint: string
          input_symbol: string | null
          output_amount: number
          output_mint: string
          output_symbol: string | null
          price_impact: number | null
          route_data: Json | null
          slippage_bps: number
          status: string
          transaction_hash: string | null
          user_id: string | null
          wallet_address: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_amount: number
          input_mint: string
          input_symbol?: string | null
          output_amount: number
          output_mint: string
          output_symbol?: string | null
          price_impact?: number | null
          route_data?: Json | null
          slippage_bps?: number
          status?: string
          transaction_hash?: string | null
          user_id?: string | null
          wallet_address: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_amount?: number
          input_mint?: string
          input_symbol?: string | null
          output_amount?: number
          output_mint?: string
          output_symbol?: string | null
          price_impact?: number | null
          route_data?: Json | null
          slippage_bps?: number
          status?: string
          transaction_hash?: string | null
          user_id?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      solana_tokens: {
        Row: {
          change_24h: number
          created_at: string
          decimals: number
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          market_cap: number
          mint_address: string
          name: string
          price: number
          symbol: string
          updated_at: string
          volume_24h: number
        }
        Insert: {
          change_24h?: number
          created_at?: string
          decimals?: number
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          market_cap?: number
          mint_address: string
          name: string
          price?: number
          symbol: string
          updated_at?: string
          volume_24h?: number
        }
        Update: {
          change_24h?: number
          created_at?: string
          decimals?: number
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          market_cap?: number
          mint_address?: string
          name?: string
          price?: number
          symbol?: string
          updated_at?: string
          volume_24h?: number
        }
        Relationships: []
      }
      staking_programs: {
        Row: {
          apy: number
          created_at: string
          id: string
          is_active: boolean
          lock_period_days: number
          max_stake_amount: number | null
          min_stake_amount: number
          name: string
          rewards_pool: number
          token_symbol: string
          total_staked: number
          updated_at: string
        }
        Insert: {
          apy: number
          created_at?: string
          id?: string
          is_active?: boolean
          lock_period_days?: number
          max_stake_amount?: number | null
          min_stake_amount?: number
          name: string
          rewards_pool?: number
          token_symbol: string
          total_staked?: number
          updated_at?: string
        }
        Update: {
          apy?: number
          created_at?: string
          id?: string
          is_active?: boolean
          lock_period_days?: number
          max_stake_amount?: number | null
          min_stake_amount?: number
          name?: string
          rewards_pool?: number
          token_symbol?: string
          total_staked?: number
          updated_at?: string
        }
        Relationships: []
      }
      support_ticket_messages: {
        Row: {
          attachments: Json | null
          created_at: string | null
          id: string
          is_staff_response: boolean | null
          message: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_staff_response?: boolean | null
          message: string
          ticket_id: string
          user_id: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_staff_response?: boolean | null
          message?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      supported_languages: {
        Row: {
          completion_percentage: number
          created_at: string
          flag_emoji: string | null
          id: string
          is_active: boolean
          is_rtl: boolean
          language_code: string
          language_name: string
          native_name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          completion_percentage?: number
          created_at?: string
          flag_emoji?: string | null
          id?: string
          is_active?: boolean
          is_rtl?: boolean
          language_code: string
          language_name: string
          native_name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          completion_percentage?: number
          created_at?: string
          flag_emoji?: string | null
          id?: string
          is_active?: boolean
          is_rtl?: boolean
          language_code?: string
          language_name?: string
          native_name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      suspicious_transactions: {
        Row: {
          amount: number
          auto_flagged: boolean | null
          created_at: string
          currency: string
          escalated: boolean | null
          escalated_to: string | null
          from_account: string | null
          id: string
          review_notes: string | null
          review_status: string
          reviewed_by: string | null
          risk_score: number
          suspicion_reason: string[]
          to_account: string | null
          transaction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          auto_flagged?: boolean | null
          created_at?: string
          currency?: string
          escalated?: boolean | null
          escalated_to?: string | null
          from_account?: string | null
          id?: string
          review_notes?: string | null
          review_status?: string
          reviewed_by?: string | null
          risk_score: number
          suspicion_reason?: string[]
          to_account?: string | null
          transaction_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          auto_flagged?: boolean | null
          created_at?: string
          currency?: string
          escalated?: boolean | null
          escalated_to?: string | null
          from_account?: string | null
          id?: string
          review_notes?: string | null
          review_status?: string
          reviewed_by?: string | null
          risk_score?: number
          suspicion_reason?: string[]
          to_account?: string | null
          transaction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          invited_by: string | null
          joined_at: string | null
          organization_id: string
          permissions: Json
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id: string
          permissions?: Json
          role?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string
          permissions?: Json
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      technical_indicators: {
        Row: {
          agent_id: string
          calculated_at: string
          created_at: string
          id: string
          indicator_type: string
          parameters: Json | null
          signal: string | null
          strength: number | null
          timeframe: string
          value: number
        }
        Insert: {
          agent_id: string
          calculated_at?: string
          created_at?: string
          id?: string
          indicator_type: string
          parameters?: Json | null
          signal?: string | null
          strength?: number | null
          timeframe?: string
          value: number
        }
        Update: {
          agent_id?: string
          calculated_at?: string
          created_at?: string
          id?: string
          indicator_type?: string
          parameters?: Json | null
          signal?: string | null
          strength?: number | null
          timeframe?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "technical_indicators_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      token_chain_overrides: {
        Row: {
          coingecko_id: string | null
          contract_address: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          liquidity_chain: string | null
          notes: string | null
          primary_chain: string
          symbol: string | null
          updated_at: string
        }
        Insert: {
          coingecko_id?: string | null
          contract_address?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          liquidity_chain?: string | null
          notes?: string | null
          primary_chain: string
          symbol?: string | null
          updated_at?: string
        }
        Update: {
          coingecko_id?: string | null
          contract_address?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          liquidity_chain?: string | null
          notes?: string | null
          primary_chain?: string
          symbol?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      token_metrics: {
        Row: {
          address: string
          chain: string
          holders: number
          id: string
          liquidity: number
          market_cap: number
          metadata: Json | null
          name: string
          price: number
          price_change_24h: number
          symbol: string
          timestamp: string
          transactions_24h: number
          volume_24h: number
        }
        Insert: {
          address: string
          chain: string
          holders?: number
          id?: string
          liquidity?: number
          market_cap?: number
          metadata?: Json | null
          name: string
          price?: number
          price_change_24h?: number
          symbol: string
          timestamp?: string
          transactions_24h?: number
          volume_24h?: number
        }
        Update: {
          address?: string
          chain?: string
          holders?: number
          id?: string
          liquidity?: number
          market_cap?: number
          metadata?: Json | null
          name?: string
          price?: number
          price_change_24h?: number
          symbol?: string
          timestamp?: string
          transactions_24h?: number
          volume_24h?: number
        }
        Relationships: []
      }
      trader_profiles: {
        Row: {
          avatar_url: string | null
          avg_hold_time: unknown | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          is_public: boolean
          is_verified: boolean
          max_drawdown: number
          monthly_return: number
          pnl_percentage: number
          risk_score: number | null
          sharpe_ratio: number | null
          tier: string
          total_followers: number
          total_following: number
          total_pnl: number
          total_trades: number
          updated_at: string
          user_id: string
          win_rate: number
        }
        Insert: {
          avatar_url?: string | null
          avg_hold_time?: unknown | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_public?: boolean
          is_verified?: boolean
          max_drawdown?: number
          monthly_return?: number
          pnl_percentage?: number
          risk_score?: number | null
          sharpe_ratio?: number | null
          tier?: string
          total_followers?: number
          total_following?: number
          total_pnl?: number
          total_trades?: number
          updated_at?: string
          user_id: string
          win_rate?: number
        }
        Update: {
          avatar_url?: string | null
          avg_hold_time?: unknown | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_public?: boolean
          is_verified?: boolean
          max_drawdown?: number
          monthly_return?: number
          pnl_percentage?: number
          risk_score?: number | null
          sharpe_ratio?: number | null
          tier?: string
          total_followers?: number
          total_following?: number
          total_pnl?: number
          total_trades?: number
          updated_at?: string
          user_id?: string
          win_rate?: number
        }
        Relationships: []
      }
      trading_analytics: {
        Row: {
          agent_id: string | null
          avg_position_size: number | null
          avg_trade_duration: unknown | null
          calculated_at: string | null
          consecutive_losses: number | null
          consecutive_wins: number | null
          id: string
          largest_loss: number | null
          largest_win: number | null
          metadata: Json | null
          period: string
          period_end: string
          period_start: string
          profitable_trades: number
          total_loss: number
          total_profit: number
          total_volume: number
          trade_count: number
          unprofitable_trades: number
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          avg_position_size?: number | null
          avg_trade_duration?: unknown | null
          calculated_at?: string | null
          consecutive_losses?: number | null
          consecutive_wins?: number | null
          id?: string
          largest_loss?: number | null
          largest_win?: number | null
          metadata?: Json | null
          period: string
          period_end: string
          period_start: string
          profitable_trades?: number
          total_loss?: number
          total_profit?: number
          total_volume?: number
          trade_count?: number
          unprofitable_trades?: number
          user_id: string
        }
        Update: {
          agent_id?: string | null
          avg_position_size?: number | null
          avg_trade_duration?: unknown | null
          calculated_at?: string | null
          consecutive_losses?: number | null
          consecutive_wins?: number | null
          id?: string
          largest_loss?: number | null
          largest_win?: number | null
          metadata?: Json | null
          period?: string
          period_end?: string
          period_start?: string
          profitable_trades?: number
          total_loss?: number
          total_profit?: number
          total_volume?: number
          trade_count?: number
          unprofitable_trades?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trading_analytics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_competitions: {
        Row: {
          competition_type: string
          created_at: string
          current_participants: number
          description: string | null
          end_date: string
          entry_fee: number | null
          id: string
          is_active: boolean
          max_participants: number | null
          prize_pool: number | null
          rules: Json | null
          start_date: string
          title: string
        }
        Insert: {
          competition_type: string
          created_at?: string
          current_participants?: number
          description?: string | null
          end_date: string
          entry_fee?: number | null
          id?: string
          is_active?: boolean
          max_participants?: number | null
          prize_pool?: number | null
          rules?: Json | null
          start_date: string
          title: string
        }
        Update: {
          competition_type?: string
          created_at?: string
          current_participants?: number
          description?: string | null
          end_date?: string
          entry_fee?: number | null
          id?: string
          is_active?: boolean
          max_participants?: number | null
          prize_pool?: number | null
          rules?: Json | null
          start_date?: string
          title?: string
        }
        Relationships: []
      }
      trading_positions: {
        Row: {
          agent_id: string
          closed_at: string | null
          created_at: string
          current_price: number
          entry_price: number
          id: string
          leverage: number | null
          margin: number
          opened_at: string
          position_type: string
          realized_pnl: number
          size: number
          status: string
          stop_loss_price: number | null
          take_profit_price: number | null
          unrealized_pnl: number
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          closed_at?: string | null
          created_at?: string
          current_price: number
          entry_price: number
          id?: string
          leverage?: number | null
          margin: number
          opened_at?: string
          position_type: string
          realized_pnl?: number
          size: number
          status?: string
          stop_loss_price?: number | null
          take_profit_price?: number | null
          unrealized_pnl?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          closed_at?: string | null
          created_at?: string
          current_price?: number
          entry_price?: number
          id?: string
          leverage?: number | null
          margin?: number
          opened_at?: string
          position_type?: string
          realized_pnl?: number
          size?: number
          status?: string
          stop_loss_price?: number | null
          take_profit_price?: number | null
          unrealized_pnl?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trading_positions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          id: string
          is_public: boolean
          is_verified: boolean
          max_drawdown: number
          pnl_percentage: number
          risk_score: number | null
          sharpe_ratio: number | null
          total_followers: number
          total_following: number
          total_pnl: number
          total_trades: number
          updated_at: string
          user_id: string
          win_rate: number
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          id?: string
          is_public?: boolean
          is_verified?: boolean
          max_drawdown?: number
          pnl_percentage?: number
          risk_score?: number | null
          sharpe_ratio?: number | null
          total_followers?: number
          total_following?: number
          total_pnl?: number
          total_trades?: number
          updated_at?: string
          user_id: string
          win_rate?: number
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_public?: boolean
          is_verified?: boolean
          max_drawdown?: number
          pnl_percentage?: number
          risk_score?: number | null
          sharpe_ratio?: number | null
          total_followers?: number
          total_following?: number
          total_pnl?: number
          total_trades?: number
          updated_at?: string
          user_id?: string
          win_rate?: number
        }
        Relationships: []
      }
      trading_regions: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          region_code: string
          region_name: string
          sort_order: number
          supported_markets: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          region_code: string
          region_name: string
          sort_order?: number
          supported_markets?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          region_code?: string
          region_name?: string
          sort_order?: number
          supported_markets?: Json
          updated_at?: string
        }
        Relationships: []
      }
      trading_signals: {
        Row: {
          actual_result: number | null
          agent_id: string
          ai_model_id: string | null
          confidence: number
          confidence_score: number | null
          created_at: string
          entry_price: number
          execution_status:
            | Database["public"]["Enums"]["signal_execution_status"]
            | null
          exit_price: number | null
          expires_at: string | null
          id: string
          likes_count: number
          metadata: Json | null
          reasoning: string
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          shares_count: number
          signal_type: string
          status: string
          stop_loss: number | null
          stop_loss_price: number | null
          take_profit_price: number | null
          target_price: number | null
          technical_indicators: Json | null
          timeframe: string
          triggered_at: string | null
          updated_at: string
          user_id: string
          views_count: number
        }
        Insert: {
          actual_result?: number | null
          agent_id: string
          ai_model_id?: string | null
          confidence: number
          confidence_score?: number | null
          created_at?: string
          entry_price: number
          execution_status?:
            | Database["public"]["Enums"]["signal_execution_status"]
            | null
          exit_price?: number | null
          expires_at?: string | null
          id?: string
          likes_count?: number
          metadata?: Json | null
          reasoning: string
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          shares_count?: number
          signal_type: string
          status?: string
          stop_loss?: number | null
          stop_loss_price?: number | null
          take_profit_price?: number | null
          target_price?: number | null
          technical_indicators?: Json | null
          timeframe?: string
          triggered_at?: string | null
          updated_at?: string
          user_id: string
          views_count?: number
        }
        Update: {
          actual_result?: number | null
          agent_id?: string
          ai_model_id?: string | null
          confidence?: number
          confidence_score?: number | null
          created_at?: string
          entry_price?: number
          execution_status?:
            | Database["public"]["Enums"]["signal_execution_status"]
            | null
          exit_price?: number | null
          expires_at?: string | null
          id?: string
          likes_count?: number
          metadata?: Json | null
          reasoning?: string
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          shares_count?: number
          signal_type?: string
          status?: string
          stop_loss?: number | null
          stop_loss_price?: number | null
          take_profit_price?: number | null
          target_price?: number | null
          technical_indicators?: Json | null
          timeframe?: string
          triggered_at?: string | null
          updated_at?: string
          user_id?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "trading_signals_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trading_signals_ai_model_id_fkey"
            columns: ["ai_model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trading_signals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trader_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      transactions: {
        Row: {
          agent_id: string
          amount: number
          created_at: string
          gas_fee: number | null
          id: string
          price_per_token: number
          status: string
          total_value: number
          transaction_hash: string | null
          type: string
          user_id: string
        }
        Insert: {
          agent_id: string
          amount: number
          created_at?: string
          gas_fee?: number | null
          id?: string
          price_per_token: number
          status?: string
          total_value: number
          transaction_hash?: string | null
          type: string
          user_id: string
        }
        Update: {
          agent_id?: string
          amount?: number
          created_at?: string
          gas_fee?: number | null
          id?: string
          price_per_token?: number
          status?: string
          total_value?: number
          transaction_hash?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      tutorial_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          step_id: string
          tutorial_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          step_id: string
          tutorial_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          step_id?: string
          tutorial_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tutorials: {
        Row: {
          category: string
          created_at: string
          description: string | null
          difficulty: string
          duration: string | null
          icon: string | null
          id: string
          is_active: boolean
          steps: Json
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          difficulty: string
          duration?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          steps?: Json
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty?: string
          duration?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          steps?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      twitter_kol_accounts: {
        Row: {
          added_at: string
          id: string
          last_checked_at: string | null
          priority: Database["public"]["Enums"]["kol_priority"]
          twitter_user_id: string | null
          twitter_username: string
          watchlist_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          last_checked_at?: string | null
          priority?: Database["public"]["Enums"]["kol_priority"]
          twitter_user_id?: string | null
          twitter_username: string
          watchlist_id: string
        }
        Update: {
          added_at?: string
          id?: string
          last_checked_at?: string | null
          priority?: Database["public"]["Enums"]["kol_priority"]
          twitter_user_id?: string | null
          twitter_username?: string
          watchlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "twitter_kol_accounts_watchlist_id_fkey"
            columns: ["watchlist_id"]
            isOneToOne: false
            referencedRelation: "twitter_kol_watchlists"
            referencedColumns: ["id"]
          },
        ]
      }
      twitter_kol_signals: {
        Row: {
          ai_analysis: string | null
          confidence_score: number
          detected_at: string
          extracted_data: Json | null
          gem_type: Database["public"]["Enums"]["gem_type"] | null
          id: string
          kol_account_id: string
          posted_at: string
          status: Database["public"]["Enums"]["signal_status"]
          tweet_id: string
          tweet_text: string
          tweet_url: string
          user_action: string | null
          user_id: string
          watchlist_id: string
        }
        Insert: {
          ai_analysis?: string | null
          confidence_score: number
          detected_at?: string
          extracted_data?: Json | null
          gem_type?: Database["public"]["Enums"]["gem_type"] | null
          id?: string
          kol_account_id: string
          posted_at: string
          status?: Database["public"]["Enums"]["signal_status"]
          tweet_id: string
          tweet_text: string
          tweet_url: string
          user_action?: string | null
          user_id: string
          watchlist_id: string
        }
        Update: {
          ai_analysis?: string | null
          confidence_score?: number
          detected_at?: string
          extracted_data?: Json | null
          gem_type?: Database["public"]["Enums"]["gem_type"] | null
          id?: string
          kol_account_id?: string
          posted_at?: string
          status?: Database["public"]["Enums"]["signal_status"]
          tweet_id?: string
          tweet_text?: string
          tweet_url?: string
          user_action?: string | null
          user_id?: string
          watchlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "twitter_kol_signals_kol_account_id_fkey"
            columns: ["kol_account_id"]
            isOneToOne: false
            referencedRelation: "twitter_kol_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "twitter_kol_signals_watchlist_id_fkey"
            columns: ["watchlist_id"]
            isOneToOne: false
            referencedRelation: "twitter_kol_watchlists"
            referencedColumns: ["id"]
          },
        ]
      }
      twitter_kol_watchlists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      twitter_user_credentials: {
        Row: {
          created_at: string
          id: string
          is_valid: boolean
          last_validated_at: string | null
          rate_limit_remaining: number | null
          rate_limit_reset_at: string | null
          twitter_access_secret_encrypted: string
          twitter_access_token_encrypted: string
          twitter_api_key_encrypted: string
          twitter_api_secret_encrypted: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_valid?: boolean
          last_validated_at?: string | null
          rate_limit_remaining?: number | null
          rate_limit_reset_at?: string | null
          twitter_access_secret_encrypted: string
          twitter_access_token_encrypted: string
          twitter_api_key_encrypted: string
          twitter_api_secret_encrypted: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_valid?: boolean
          last_validated_at?: string | null
          rate_limit_remaining?: number | null
          rate_limit_reset_at?: string | null
          twitter_access_secret_encrypted?: string
          twitter_access_token_encrypted?: string
          twitter_api_key_encrypted?: string
          twitter_api_secret_encrypted?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_2fa: {
        Row: {
          backup_codes: string[] | null
          created_at: string
          id: string
          is_enabled: boolean
          last_used_at: string | null
          phone_number: string | null
          phone_verified: boolean | null
          recovery_email: string | null
          secret_encrypted: string
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          last_used_at?: string | null
          phone_number?: string | null
          phone_verified?: boolean | null
          recovery_email?: string | null
          secret_encrypted: string
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          last_used_at?: string | null
          phone_number?: string | null
          phone_verified?: boolean | null
          recovery_email?: string | null
          secret_encrypted?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_api_tokens: {
        Row: {
          created_at: string
          created_by_ip: unknown | null
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          name: string
          rate_limit_per_hour: number | null
          scopes: string[] | null
          token_hash: string
          token_prefix: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by_ip?: unknown | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          name: string
          rate_limit_per_hour?: number | null
          scopes?: string[] | null
          token_hash: string
          token_prefix: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          created_by_ip?: unknown | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          name?: string
          rate_limit_per_hour?: number | null
          scopes?: string[] | null
          token_hash?: string
          token_prefix?: string
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_balances: {
        Row: {
          available_balance: number
          created_at: string
          currency: string
          id: string
          locked_balance: number
          total_balance: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          available_balance?: number
          created_at?: string
          currency?: string
          id?: string
          locked_balance?: number
          total_balance?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          available_balance?: number
          created_at?: string
          currency?: string
          id?: string
          locked_balance?: number
          total_balance?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_community_memberships: {
        Row: {
          community_id: string
          id: string
          joined_at: string
          status: string
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string
          status?: string
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      user_defi_positions: {
        Row: {
          amount_deposited: number
          created_at: string
          id: string
          last_claim_at: string | null
          pool_id: string
          rewards_earned: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_deposited?: number
          created_at?: string
          id?: string
          last_claim_at?: string | null
          pool_id: string
          rewards_earned?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_deposited?: number
          created_at?: string
          id?: string
          last_claim_at?: string | null
          pool_id?: string
          rewards_earned?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_defi_positions_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "defi_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_holdings: {
        Row: {
          agent_id: string
          average_cost: number
          id: string
          last_updated: string
          realized_pnl: number
          total_amount: number
          total_invested: number
          unrealized_pnl: number
          user_id: string
        }
        Insert: {
          agent_id: string
          average_cost?: number
          id?: string
          last_updated?: string
          realized_pnl?: number
          total_amount?: number
          total_invested?: number
          unrealized_pnl?: number
          user_id: string
        }
        Update: {
          agent_id?: string
          average_cost?: number
          id?: string
          last_updated?: string
          realized_pnl?: number
          total_amount?: number
          total_invested?: number
          unrealized_pnl?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_holdings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_language_preferences: {
        Row: {
          auto_translate: boolean
          created_at: string
          id: string
          language_code: string
          local_timezone: boolean
          region_code: string
          rtl_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_translate?: boolean
          created_at?: string
          id?: string
          language_code: string
          local_timezone?: boolean
          region_code?: string
          rtl_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_translate?: boolean
          created_at?: string
          id?: string
          language_code?: string
          local_timezone?: boolean
          region_code?: string
          rtl_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      user_referrals: {
        Row: {
          created_at: string | null
          id: string
          referral_code: string
          total_earnings: number | null
          total_referrals: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          referral_code: string
          total_earnings?: number | null
          total_referrals?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          referral_code?: string
          total_earnings?: number | null
          total_referrals?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_relationships: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
          status: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
          status?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
          status?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean
          last_activity: string
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_activity?: string
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_activity?: string
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          allow_analytics: boolean | null
          allow_direct_messages: boolean | null
          allow_personalization: boolean | null
          auto_approve_transactions: boolean | null
          confirm_transactions: boolean | null
          created_at: string
          currency: string | null
          date_format: string | null
          default_slippage_tolerance: number | null
          email_marketing_enabled: boolean | null
          email_notifications_enabled: boolean | null
          email_product_updates: boolean | null
          email_security_alerts: boolean | null
          id: string
          language: string | null
          last_activity_at: string | null
          login_notifications: boolean | null
          metadata: Json | null
          profile_visibility:
            | Database["public"]["Enums"]["privacy_level"]
            | null
          push_notifications_enabled: boolean | null
          push_price_alerts: boolean | null
          push_social_updates: boolean | null
          push_trading_alerts: boolean | null
          require_password_change_days: number | null
          session_timeout_minutes: number | null
          share_anonymous_data: boolean | null
          show_email: boolean | null
          show_portfolio: boolean | null
          show_test_networks: boolean | null
          show_trading_history: boolean | null
          show_wallet_address: boolean | null
          theme_mode: Database["public"]["Enums"]["theme_mode"] | null
          timezone: string | null
          two_factor_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_analytics?: boolean | null
          allow_direct_messages?: boolean | null
          allow_personalization?: boolean | null
          auto_approve_transactions?: boolean | null
          confirm_transactions?: boolean | null
          created_at?: string
          currency?: string | null
          date_format?: string | null
          default_slippage_tolerance?: number | null
          email_marketing_enabled?: boolean | null
          email_notifications_enabled?: boolean | null
          email_product_updates?: boolean | null
          email_security_alerts?: boolean | null
          id?: string
          language?: string | null
          last_activity_at?: string | null
          login_notifications?: boolean | null
          metadata?: Json | null
          profile_visibility?:
            | Database["public"]["Enums"]["privacy_level"]
            | null
          push_notifications_enabled?: boolean | null
          push_price_alerts?: boolean | null
          push_social_updates?: boolean | null
          push_trading_alerts?: boolean | null
          require_password_change_days?: number | null
          session_timeout_minutes?: number | null
          share_anonymous_data?: boolean | null
          show_email?: boolean | null
          show_portfolio?: boolean | null
          show_test_networks?: boolean | null
          show_trading_history?: boolean | null
          show_wallet_address?: boolean | null
          theme_mode?: Database["public"]["Enums"]["theme_mode"] | null
          timezone?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_analytics?: boolean | null
          allow_direct_messages?: boolean | null
          allow_personalization?: boolean | null
          auto_approve_transactions?: boolean | null
          confirm_transactions?: boolean | null
          created_at?: string
          currency?: string | null
          date_format?: string | null
          default_slippage_tolerance?: number | null
          email_marketing_enabled?: boolean | null
          email_notifications_enabled?: boolean | null
          email_product_updates?: boolean | null
          email_security_alerts?: boolean | null
          id?: string
          language?: string | null
          last_activity_at?: string | null
          login_notifications?: boolean | null
          metadata?: Json | null
          profile_visibility?:
            | Database["public"]["Enums"]["privacy_level"]
            | null
          push_notifications_enabled?: boolean | null
          push_price_alerts?: boolean | null
          push_social_updates?: boolean | null
          push_trading_alerts?: boolean | null
          require_password_change_days?: number | null
          session_timeout_minutes?: number | null
          share_anonymous_data?: boolean | null
          show_email?: boolean | null
          show_portfolio?: boolean | null
          show_test_networks?: boolean | null
          show_trading_history?: boolean | null
          show_wallet_address?: boolean | null
          theme_mode?: Database["public"]["Enums"]["theme_mode"] | null
          timezone?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_stakes: {
        Row: {
          amount: number
          created_at: string
          id: string
          is_active: boolean
          last_reward_claim: string | null
          program_id: string
          rewards_earned: number
          staked_at: string
          unlock_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          is_active?: boolean
          last_reward_claim?: string | null
          program_id: string
          rewards_earned?: number
          staked_at?: string
          unlock_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          is_active?: boolean
          last_reward_claim?: string | null
          program_id?: string
          rewards_earned?: number
          staked_at?: string
          unlock_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stakes_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "staking_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          auto_renew: boolean | null
          billing_period: Database["public"]["Enums"]["billing_period"] | null
          created_at: string
          expires_at: string | null
          id: string
          last_payment_at: string | null
          next_payment_at: string | null
          payment_method: string | null
          started_at: string
          status: string
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_renew?: boolean | null
          billing_period?: Database["public"]["Enums"]["billing_period"] | null
          created_at?: string
          expires_at?: string | null
          id?: string
          last_payment_at?: string | null
          next_payment_at?: string | null
          payment_method?: string | null
          started_at?: string
          status?: string
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_renew?: boolean | null
          billing_period?: Database["public"]["Enums"]["billing_period"] | null
          created_at?: string
          expires_at?: string | null
          id?: string
          last_payment_at?: string | null
          next_payment_at?: string | null
          payment_method?: string | null
          started_at?: string
          status?: string
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      marketplace_developers_public: {
        Row: {
          company_name: string | null
          created_at: string | null
          description: string | null
          id: string | null
          logo_url: string | null
          total_apis: number | null
          verified: boolean | null
          website_url: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          logo_url?: string | null
          total_apis?: number | null
          verified?: boolean | null
          website_url?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          logo_url?: string | null
          total_apis?: number | null
          verified?: boolean | null
          website_url?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_strategy_performance: {
        Args: { strategy_id_param: string }
        Returns: undefined
      }
      check_acp_rate_limit: {
        Args: { operation_type: string; user_id_param: string }
        Returns: Json
      }
      check_brute_force: {
        Args: {
          identifier_param: string
          max_attempts?: number
          window_minutes?: number
        }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          endpoint_param: string
          identifier_param: string
          max_requests?: number
          window_minutes?: number
        }
        Returns: boolean
      }
      check_signal_rate_limit: {
        Args: { user_id_param: string }
        Returns: Json
      }
      cleanup_expired_api_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_market_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      detect_unusual_access_pattern: {
        Args: {
          table_name_param: string
          time_window_minutes?: number
          user_id_param: string
        }
        Returns: boolean
      }
      enhanced_rate_limit_check: {
        Args: {
          burst_protection?: boolean
          endpoint_param: string
          identifier_param: string
          ip_address_param?: unknown
          max_requests?: number
          window_minutes?: number
        }
        Returns: Json
      }
      enhanced_sensitive_rate_limit: {
        Args: {
          max_ops?: number
          operation_type: string
          user_id_param?: string
          window_minutes?: number
        }
        Returns: boolean
      }
      expire_limit_orders: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      expire_solana_limit_orders: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_acp_dashboard_stats: {
        Args: { user_id_param: string }
        Returns: Json
      }
      get_agent_comparison_data: {
        Args: { p_agent_1_id: string; p_agent_2_id: string }
        Returns: Json
      }
      get_current_user_admin_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_developer_public_stats: {
        Args: { developer_profile_id: string }
        Returns: Json
      }
      get_order_book_summary: {
        Args: { p_pool_id: string }
        Returns: {
          ask_price: number
          ask_volume: number
          bid_price: number
          bid_volume: number
          spread: number
        }[]
      }
      get_referral_leaderboard: {
        Args: { limit_count?: number }
        Returns: {
          rank: number
          referral_code: string
          total_earnings: number
          total_referrals: number
          user_id: string
        }[]
      }
      get_solana_order_book_summary: {
        Args: { p_pool_id: string }
        Returns: {
          ask_price: number
          ask_volume: number
          bid_price: number
          bid_volume: number
          spread: number
        }[]
      }
      get_user_agent_count_today: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_user_ai_stats: {
        Args: { user_id_param: string }
        Returns: Json
      }
      get_user_dex_stats: {
        Args: { user_id_param: string }
        Returns: Json
      }
      get_user_settings: {
        Args: { p_user_id?: string }
        Returns: Json
      }
      get_user_subscription: {
        Args: { user_id_param?: string }
        Returns: {
          billing_period: Database["public"]["Enums"]["billing_period"]
          expires_at: string
          id: string
          status: string
          tier: Database["public"]["Enums"]["subscription_tier"]
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_agent_creator: {
        Args: { agent_id_param: string }
        Returns: boolean
      }
      is_compliance_officer: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_organization_admin: {
        Args: { org_id: string }
        Returns: boolean
      }
      is_organization_member: {
        Args: { org_id: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_login_attempt: {
        Args: {
          attempt_type_param: string
          failure_reason_param?: string
          identifier_param: string
          ip_param?: unknown
          success_param: boolean
          user_agent_param?: string
        }
        Returns: undefined
      }
      log_sensitive_data_access: {
        Args: {
          additional_context?: Json
          operation: string
          record_id?: string
          table_name: string
        }
        Returns: undefined
      }
      make_user_admin: {
        Args: { target_user_id?: string }
        Returns: undefined
      }
      match_limit_orders: {
        Args: { p_pool_id: string }
        Returns: Json
      }
      match_solana_limit_orders: {
        Args: { p_pool_id: string }
        Returns: Json
      }
      process_referral_conversion: {
        Args: { p_referral_code: string; p_referred_user_id: string }
        Returns: Json
      }
      update_community_user_stats: {
        Args: { p_increment?: number; p_stat_type: string; p_user_id: string }
        Returns: undefined
      }
      update_order_book_from_orders: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_solana_order_book: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      upgrade_subscription: {
        Args: {
          new_billing_period: Database["public"]["Enums"]["billing_period"]
          new_tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Returns: Json
      }
      validate_acp_job: {
        Args: {
          budget_param: number
          description_param: string
          title_param: string
        }
        Returns: Json
      }
      validate_acp_service: {
        Args: {
          category_param: string
          description_param: string
          price_param: number
          title_param: string
        }
        Returns: Json
      }
      validate_agent_creation: {
        Args: {
          agent_category: string
          agent_description: string
          agent_name: string
          agent_symbol: string
        }
        Returns: Json
      }
      validate_agent_creation_enhanced: {
        Args: {
          agent_category: string
          agent_description: string
          agent_name: string
          agent_symbol: string
          avatar_url_param?: string
          features_param?: string[]
        }
        Returns: Json
      }
      validate_and_sanitize_input: {
        Args: {
          allow_html?: boolean
          input_text: string
          max_length?: number
          strict_mode?: boolean
        }
        Returns: Json
      }
      validate_input_security: {
        Args: { allow_html?: boolean; input_text: string; max_length?: number }
        Returns: boolean
      }
      validate_password_policy: {
        Args: { password_param: string }
        Returns: boolean
      }
      validate_password_strength: {
        Args: { password_param: string }
        Returns: Json
      }
      validate_trading_signal: {
        Args: {
          confidence_param: number
          entry_price_param: number
          reasoning_param?: string
          signal_type_param: string
          stop_loss_param?: number
          target_price_param?: number
        }
        Returns: Json
      }
      validate_url: {
        Args: { url_param: string }
        Returns: Json
      }
      vote_language_request: {
        Args: { request_id_param: string }
        Returns: Json
      }
    }
    Enums: {
      access_mode: "personal_api" | "platform_shared"
      ai_model_status: "active" | "training" | "testing" | "deprecated"
      ai_model_type:
        | "lstm"
        | "random_forest"
        | "transformer"
        | "reinforcement"
        | "gpt"
        | "hybrid"
      ai_session_type:
        | "chat"
        | "strategy_creation"
        | "backtesting"
        | "signal_generation"
        | "portfolio_analysis"
      ai_strategy_type:
        | "momentum"
        | "mean_reversion"
        | "arbitrage"
        | "sentiment"
        | "machine_learning"
        | "hybrid"
      backtest_status: "pending" | "running" | "completed" | "failed"
      billing_period: "monthly" | "annual"
      gem_type: "token" | "nft" | "protocol" | "airdrop" | "alpha"
      kol_priority: "high" | "medium" | "low"
      notification_frequency: "instant" | "daily" | "weekly" | "never"
      privacy_level: "public" | "friends" | "private"
      risk_level: "low" | "medium" | "high" | "extreme"
      signal_execution_status:
        | "pending"
        | "active"
        | "executed"
        | "expired"
        | "cancelled"
      signal_status: "new" | "reviewed" | "dismissed"
      subscription_status: "active" | "paused" | "cancelled"
      subscription_tier: "basic" | "pro" | "elite"
      theme_mode: "light" | "dark" | "system"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      access_mode: ["personal_api", "platform_shared"],
      ai_model_status: ["active", "training", "testing", "deprecated"],
      ai_model_type: [
        "lstm",
        "random_forest",
        "transformer",
        "reinforcement",
        "gpt",
        "hybrid",
      ],
      ai_session_type: [
        "chat",
        "strategy_creation",
        "backtesting",
        "signal_generation",
        "portfolio_analysis",
      ],
      ai_strategy_type: [
        "momentum",
        "mean_reversion",
        "arbitrage",
        "sentiment",
        "machine_learning",
        "hybrid",
      ],
      backtest_status: ["pending", "running", "completed", "failed"],
      billing_period: ["monthly", "annual"],
      gem_type: ["token", "nft", "protocol", "airdrop", "alpha"],
      kol_priority: ["high", "medium", "low"],
      notification_frequency: ["instant", "daily", "weekly", "never"],
      privacy_level: ["public", "friends", "private"],
      risk_level: ["low", "medium", "high", "extreme"],
      signal_execution_status: [
        "pending",
        "active",
        "executed",
        "expired",
        "cancelled",
      ],
      signal_status: ["new", "reviewed", "dismissed"],
      subscription_status: ["active", "paused", "cancelled"],
      subscription_tier: ["basic", "pro", "elite"],
      theme_mode: ["light", "dark", "system"],
    },
  },
} as const
