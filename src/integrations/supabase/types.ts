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
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
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
          price: number | null
          side: string
          status: string
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
          price?: number | null
          side: string
          status?: string
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
          price?: number | null
          side?: string
          status?: string
          trigger_price?: number | null
          type?: string
          updated_at?: string
          user_id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          endpoint_param: string
          identifier_param: string
          max_requests?: number
          window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      validate_input_security: {
        Args: { allow_html?: boolean; input_text: string; max_length?: number }
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
