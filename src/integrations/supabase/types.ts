export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      bug_reports: {
        Row: {
          created_at: string
          description: string
          email: string | null
          files: Json | null
          id: string
          lovable_ticket_id: string | null
          report_type: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          email?: string | null
          files?: Json | null
          id?: string
          lovable_ticket_id?: string | null
          report_type: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          email?: string | null
          files?: Json | null
          id?: string
          lovable_ticket_id?: string | null
          report_type?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crypto_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_active: boolean
          is_triggered: boolean
          name: string
          symbol: string
          target_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_triggered?: boolean
          name: string
          symbol: string
          target_value: number
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_triggered?: boolean
          name?: string
          symbol?: string
          target_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crypto_holdings: {
        Row: {
          amount: number
          created_at: string
          id: string
          name: string
          notes: string | null
          purchase_date: string
          purchase_price: number
          symbol: string
          updated_at: string
          user_id: string
          wallet_address: string | null
          wallet_type: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          purchase_date: string
          purchase_price: number
          symbol: string
          updated_at?: string
          user_id: string
          wallet_address?: string | null
          wallet_type?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          purchase_date?: string
          purchase_price?: number
          symbol?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
          wallet_type?: string | null
        }
        Relationships: []
      }
      crypto_prices: {
        Row: {
          created_at: string | null
          id: string
          last_updated: string | null
          market_cap: number | null
          price: number
          price_change_24h: number | null
          symbol: string
          volume_24h: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_updated?: string | null
          market_cap?: number | null
          price: number
          price_change_24h?: number | null
          symbol: string
          volume_24h?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_updated?: string | null
          market_cap?: number | null
          price?: number
          price_change_24h?: number | null
          symbol?: string
          volume_24h?: number | null
        }
        Relationships: []
      }
      daily_pnl: {
        Row: {
          created_at: string
          date: string
          id: string
          pnl: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          pnl?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          pnl?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exchange_accounts: {
        Row: {
          account_name: string
          api_key: string
          api_secret: string
          created_at: string
          exchange_name: string
          id: string
          is_active: boolean
          last_synced_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_name: string
          api_key: string
          api_secret: string
          created_at?: string
          exchange_name: string
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_name?: string
          api_key?: string
          api_secret?: string
          created_at?: string
          exchange_name?: string
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string
          description: string | null
          goal_type: string
          id: string
          is_completed: boolean
          period: string
          steps: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          goal_type: string
          id?: string
          is_completed?: boolean
          period: string
          steps?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          goal_type?: string
          id?: string
          is_completed?: boolean
          period?: string
          steps?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      note_folders: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          parent_folder_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          parent_folder_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          parent_folder_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_folder_parent"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "note_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      note_tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          collaboration_settings: Json | null
          content: Json
          created_at: string
          folder_id: string | null
          id: string
          is_favorite: boolean
          is_locked: boolean
          last_viewed_at: string | null
          media_attachments: Json | null
          password_hash: string | null
          plain_text_content: string | null
          tags: string[] | null
          template_type: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          collaboration_settings?: Json | null
          content?: Json
          created_at?: string
          folder_id?: string | null
          id?: string
          is_favorite?: boolean
          is_locked?: boolean
          last_viewed_at?: string | null
          media_attachments?: Json | null
          password_hash?: string | null
          plain_text_content?: string | null
          tags?: string[] | null
          template_type?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          collaboration_settings?: Json | null
          content?: Json
          created_at?: string
          folder_id?: string | null
          id?: string
          is_favorite?: boolean
          is_locked?: boolean
          last_viewed_at?: string | null
          media_attachments?: Json | null
          password_hash?: string | null
          plain_text_content?: string | null
          tags?: string[] | null
          template_type?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_notes_folder"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "note_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_snapshots: {
        Row: {
          created_at: string
          date: string
          holdings_count: number
          id: string
          roi_percentage: number
          total_gain_loss: number
          total_invested: number
          total_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          holdings_count?: number
          id?: string
          roi_percentage?: number
          total_gain_loss?: number
          total_invested?: number
          total_value?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          holdings_count?: number
          id?: string
          roi_percentage?: number
          total_gain_loss?: number
          total_invested?: number
          total_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          due_date: string
          id: string
          is_active: boolean
          is_completed: boolean
          is_recurring: boolean
          notification_methods: string[] | null
          priority: string
          recurrence_end_date: string | null
          recurrence_pattern: string | null
          reminder_type: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          is_active?: boolean
          is_completed?: boolean
          is_recurring?: boolean
          notification_methods?: string[] | null
          priority?: string
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          reminder_type: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          is_active?: boolean
          is_completed?: boolean
          is_recurring?: boolean
          notification_methods?: string[] | null
          priority?: string
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          reminder_type?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          id: string
          image_url: string | null
          note: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date: string
          id?: string
          image_url?: string | null
          note?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          id?: string
          image_url?: string | null
          note?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trusted_devices: {
        Row: {
          created_at: string
          device_fingerprint: string
          device_name: string | null
          expires_at: string
          id: string
          last_used: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_fingerprint: string
          device_name?: string | null
          expires_at?: string
          id?: string
          last_used?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_fingerprint?: string
          device_name?: string | null
          expires_at?: string
          id?: string
          last_used?: string
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
          secret_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          secret_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          secret_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      capture_portfolio_snapshot: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      get_latest_crypto_price: {
        Args: { crypto_symbol: string }
        Returns: {
          symbol: string
          price: number
          price_change_24h: number
          volume_24h: number
          market_cap: number
          last_updated: string
        }[]
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
