export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      album_images: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          is_thumbnail: boolean | null
          order_num: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          is_thumbnail?: boolean | null
          order_num: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          is_thumbnail?: boolean | null
          order_num?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "album_images_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_room_participants: {
        Row: {
          chat_room_id: string
          created_at: string | null
          id: string
          unread_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chat_room_id: string
          created_at?: string | null
          id?: string
          unread_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chat_room_id?: string
          created_at?: string | null
          id?: string
          unread_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_participants_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_room_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string | null
          id: string
          last_message: string | null
          last_message_time: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_time?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_time?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string | null
          following_id: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          created_at: string | null
          description: string | null
          genre: string[] | null
          id: string
          image_url: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          genre?: string[] | null
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          genre?: string[] | null
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          chat_room_id: string | null
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          chat_room_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          chat_room_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          related_id: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          related_id?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          related_id?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_paid: number
          amount_total: number
          channel_name: string
          created_at: string | null
          currency: string
          external_payment_id: string
          method_detail: Json
          method_type: string
          order_name: string
          paid_at: string
          payment_id: string
          provider: string
          raw_response: Json
          receipt_url: string | null
          requested_at: string
          status: Database["public"]["Enums"]["payment_status_enum"]
          transaction_id: string
        }
        Insert: {
          amount_paid: number
          amount_total: number
          channel_name: string
          created_at?: string | null
          currency?: string
          external_payment_id: string
          method_detail: Json
          method_type: string
          order_name: string
          paid_at: string
          payment_id?: string
          provider: string
          raw_response: Json
          receipt_url?: string | null
          requested_at: string
          status?: Database["public"]["Enums"]["payment_status_enum"]
          transaction_id: string
        }
        Update: {
          amount_paid?: number
          amount_total?: number
          channel_name?: string
          created_at?: string | null
          currency?: string
          external_payment_id?: string
          method_detail?: Json
          method_type?: string
          order_name?: string
          paid_at?: string
          payment_id?: string
          provider?: string
          raw_response?: Json
          receipt_url?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["payment_status_enum"]
          transaction_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          description: string | null
          follower_count: number | null
          id: string
          is_mate: boolean | null
          is_partner: boolean
          nickname: string | null
          public_id: number
          rating: number | null
          selected_games: string[] | null
          selected_tags: string[] | null
          updated_at: string | null
          user_id: string | null
          username: string | null
          youtube_urls: string[] | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          follower_count?: number | null
          id?: string
          is_mate?: boolean | null
          is_partner?: boolean
          nickname?: string | null
          public_id?: number
          rating?: number | null
          selected_games?: string[] | null
          selected_tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
          youtube_urls?: string[] | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          follower_count?: number | null
          id?: string
          is_mate?: boolean | null
          is_partner?: boolean
          nickname?: string | null
          public_id?: number
          rating?: number | null
          selected_games?: string[] | null
          selected_tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
          youtube_urls?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          created_at: string | null
          game: string | null
          id: string
          price: number
          provider_id: string | null
          requester_id: string | null
          scheduled_date: string
          scheduled_time: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          game?: string | null
          id?: string
          price: number
          provider_id?: string | null
          requester_id?: string | null
          scheduled_date: string
          scheduled_time: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          game?: string | null
          id?: string
          price?: number
          provider_id?: string | null
          requester_id?: string | null
          scheduled_date?: string
          scheduled_time?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requests_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          content: string
          created_at: string | null
          id: string
          rating: number | null
          request_id: string | null
          reviewed_id: string | null
          reviewer_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          rating?: number | null
          request_id?: string | null
          reviewed_id?: string | null
          reviewer_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          rating?: number | null
          request_id?: string | null
          reviewed_id?: string | null
          reviewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewed_id_fkey"
            columns: ["reviewed_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tag_masters: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      token_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          payment_id: string | null
          related_user_id: string | null
          transaction_id: string
          transaction_type: Database["public"]["Enums"]["transaction_type_enum"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          payment_id?: string | null
          related_user_id?: string | null
          transaction_id?: string
          transaction_type: Database["public"]["Enums"]["transaction_type_enum"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          payment_id?: string | null
          related_user_id?: string | null
          transaction_id?: string
          transaction_type?: Database["public"]["Enums"]["transaction_type_enum"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["payment_id"]
          },
        ]
      }
      user_games: {
        Row: {
          created_at: string | null
          game_id: string | null
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          price: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          game_id?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          price: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          game_id?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          price?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_games_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_games_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tags: {
        Row: {
          created_at: string | null
          id: string
          tag_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          tag_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          tag_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tag_masters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tokens: {
        Row: {
          balance: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          auth_provider: string
          created_at: string | null
          email: string
          id: string
          is_online: boolean | null
          last_login_at: string | null
          name: string
          profile_circle_img: string | null
          profile_thumbnail_img: string | null
          token: number | null
          updated_at: string | null
        }
        Insert: {
          auth_provider: string
          created_at?: string | null
          email: string
          id: string
          is_online?: boolean | null
          last_login_at?: string | null
          name: string
          profile_circle_img?: string | null
          profile_thumbnail_img?: string | null
          token?: number | null
          updated_at?: string | null
        }
        Update: {
          auth_provider?: string
          created_at?: string | null
          email?: string
          id?: string
          is_online?: boolean | null
          last_login_at?: string | null
          name?: string
          profile_circle_img?: string | null
          profile_thumbnail_img?: string | null
          token?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_request_and_refund: {
        Args: { p_request_id: string }
        Returns: undefined
      }
      complete_order_payment: {
        Args: { p_order_id: string }
        Returns: undefined
      }
      create_order_with_payment: {
        Args: {
          p_requester_id: string
          p_provider_id: string
          p_game: string
          p_scheduled_date: string
          p_scheduled_time: string
          p_price: number
        }
        Returns: string
      }
      get_monthly_token_usage: {
        Args: { user_id_param: string; current_ts: string }
        Returns: {
          usage_this_month: number
          usage_last_month: number
          diff: number
        }[]
      }
      increment_balance: {
        Args: { user_id_param: string; amount_param: number }
        Returns: number
      }
      mark_messages_as_read: {
        Args: { p_chat_room_id: string; p_user_id: string }
        Returns: undefined
      }
      update_thumbnail: {
        Args: { p_user_id: string; p_image_id: string }
        Returns: undefined
      }
    }
    Enums: {
      payment_status_enum: "PAID" | "FAILED" | "CANCELLED" | "REFUNDED"
      transaction_type_enum: "CHARGE" | "EARN" | "SPEND" | "REFUND"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      payment_status_enum: ["PAID", "FAILED", "CANCELLED", "REFUNDED"],
      transaction_type_enum: ["CHARGE", "EARN", "SPEND", "REFUND"],
    },
  },
} as const
