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
        Relationships: []
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
            foreignKeyName: "agent_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "agent_comments"
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
          chain: string
          change_24h: number
          created_at: string
          description: string | null
          id: string
          logo_generated: boolean | null
          logo_style: string | null
          market_cap: number
          name: string
          price: number
          symbol: string
          updated_at: string
          volume_24h: number
        }
        Insert: {
          avatar_url?: string | null
          chain?: string
          change_24h?: number
          created_at?: string
          description?: string | null
          id?: string
          logo_generated?: boolean | null
          logo_style?: string | null
          market_cap?: number
          name: string
          price?: number
          symbol: string
          updated_at?: string
          volume_24h?: number
        }
        Update: {
          avatar_url?: string | null
          chain?: string
          change_24h?: number
          created_at?: string
          description?: string | null
          id?: string
          logo_generated?: boolean | null
          logo_style?: string | null
          market_cap?: number
          name?: string
          price?: number
          symbol?: string
          updated_at?: string
          volume_24h?: number
        }
        Relationships: []
      }
      ai_assistant_logs: {
        Row: {
          context: string | null
          created_at: string | null
          id: string
          query: string
          response: string
          user_id: string | null
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          id?: string
          query: string
          response: string
          user_id?: string | null
        }
        Update: {
          context?: string | null
          created_at?: string | null
          id?: string
          query?: string
          response?: string
          user_id?: string | null
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
          created_at: string
          expires_at: string | null
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
          created_at?: string
          expires_at?: string | null
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
          created_at?: string
          expires_at?: string | null
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
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
      trading_signals: {
        Row: {
          agent_id: string
          comments_count: number
          confidence_level: number | null
          created_at: string
          expires_at: string | null
          id: string
          is_premium: boolean
          likes_count: number
          price: number
          reasoning: string | null
          signal_type: string
          stop_loss_price: number | null
          target_price: number | null
          time_horizon: string | null
          user_id: string
          views_count: number
        }
        Insert: {
          agent_id: string
          comments_count?: number
          confidence_level?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_premium?: boolean
          likes_count?: number
          price: number
          reasoning?: string | null
          signal_type: string
          stop_loss_price?: number | null
          target_price?: number | null
          time_horizon?: string | null
          user_id: string
          views_count?: number
        }
        Update: {
          agent_id?: string
          comments_count?: number
          confidence_level?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_premium?: boolean
          likes_count?: number
          price?: number
          reasoning?: string | null
          signal_type?: string
          stop_loss_price?: number | null
          target_price?: number | null
          time_horizon?: string | null
          user_id?: string
          views_count?: number
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      validate_input_security: {
        Args: { allow_html?: boolean; input_text: string; max_length?: number }
        Returns: boolean
      }
      validate_password_policy: {
        Args: { password_param: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
