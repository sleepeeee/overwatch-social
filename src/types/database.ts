// 此檔由 Supabase 自動生成（mcp generate_typescript_types / `supabase gen types typescript`）。
// 請勿手動編輯；DB schema 變更後重新生成。
// 來源 project: cxoncanfveqtfofcqyqe
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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          alignments: Json
          color: string
          custom_icon_url: string
          message: string
          num: string
          tag: string
          title: string
          updated_at: string
        }
        Insert: {
          alignments?: Json
          color?: string
          custom_icon_url?: string
          message?: string
          num: string
          tag?: string
          title?: string
          updated_at?: string
        }
        Update: {
          alignments?: Json
          color?: string
          custom_icon_url?: string
          message?: string
          num?: string
          tag?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      developer_whitelist: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      game_special_tags: {
        Row: {
          created_at: string
          game_id: string
          id: string
          style_class: string
          tag_name: string
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          style_class: string
          tag_name: string
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          style_class?: string
          tag_name?: string
        }
        Relationships: []
      }
      hero_alignments: {
        Row: {
          hero_id: string
          scale: number
          translate_x: number
          translate_y: number
          updated_at: string | null
        }
        Insert: {
          hero_id: string
          scale?: number
          translate_x?: number
          translate_y?: number
          updated_at?: string | null
        }
        Update: {
          hero_id?: string
          scale?: number
          translate_x?: number
          translate_y?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          battle_tag: string
          display_name: string | null
          game: string
          id: string
          is_tag_visible: boolean
          languages: string[]
          mbti: string | null
          message: string
          mic_status: string
          selected_heroes: string[]
          server: string
          social_channels: Json
          tags: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          battle_tag?: string
          display_name?: string | null
          game?: string
          id?: string
          is_tag_visible?: boolean
          languages?: string[]
          mbti?: string | null
          message?: string
          mic_status?: string
          selected_heroes?: string[]
          server?: string
          social_channels?: Json
          tags?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          battle_tag?: string
          display_name?: string | null
          game?: string
          id?: string
          is_tag_visible?: boolean
          languages?: string[]
          mbti?: string | null
          message?: string
          mic_status?: string
          selected_heroes?: string[]
          server?: string
          social_channels?: Json
          tags?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          nickname: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          nickname?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          nickname?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          battle_tag: string | null
          display_name: string | null
          game: string | null
          is_tag_visible: boolean | null
          languages: string[] | null
          mbti: string | null
          message: string | null
          mic_status: string | null
          selected_heroes: string[] | null
          server: string | null
          social_channels: Json | null
          tags: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          battle_tag?: never
          display_name?: string | null
          game?: string | null
          is_tag_visible?: boolean | null
          languages?: string[] | null
          mbti?: string | null
          message?: string | null
          mic_status?: string | null
          selected_heroes?: string[] | null
          server?: string | null
          social_channels?: never
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          battle_tag?: never
          display_name?: string | null
          game?: string | null
          is_tag_visible?: boolean | null
          languages?: string[] | null
          mbti?: string | null
          message?: string | null
          mic_status?: string | null
          selected_heroes?: string[] | null
          server?: string | null
          social_channels?: never
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_hero_stats: {
        Args: never
        Returns: {
          hero_count: number
          hero_id: string
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
