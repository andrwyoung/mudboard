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
      blocks: {
        Row: {
          block_id: string
          block_type: string
          board_id: string
          col_index: number
          created_at: string
          data: Json | null
          deleted: boolean
          deleted_at: string | null
          height: number
          image_id: string | null
          order_index: number
          row_index: number
          section_id: string
          updated_at: string | null
        }
        Insert: {
          block_id?: string
          block_type: string
          board_id: string
          col_index?: number
          created_at?: string
          data?: Json | null
          deleted?: boolean
          deleted_at?: string | null
          height: number
          image_id?: string | null
          order_index?: number
          row_index?: number
          section_id: string
          updated_at?: string | null
        }
        Update: {
          block_id?: string
          block_type?: string
          board_id?: string
          col_index?: number
          created_at?: string
          data?: Json | null
          deleted?: boolean
          deleted_at?: string | null
          height?: number
          image_id?: string | null
          order_index?: number
          row_index?: number
          section_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocks_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["board_id"]
          },
          {
            foreignKeyName: "blocks_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "images"
            referencedColumns: ["image_id"]
          },
          {
            foreignKeyName: "blocks_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "orphaned_images"
            referencedColumns: ["image_id"]
          },
          {
            foreignKeyName: "blocks_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["section_id"]
          },
        ]
      }
      boards: {
        Row: {
          access_level: Database["public"]["Enums"]["access_type"]
          board_id: string
          created_at: string
          deleted_at: string | null
          password_hash: string | null
          saved_column_num: number | null
          shared_with: string[] | null
          slug: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["access_type"]
          board_id?: string
          created_at?: string
          deleted_at?: string | null
          password_hash?: string | null
          saved_column_num?: number | null
          shared_with?: string[] | null
          slug?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_level?: Database["public"]["Enums"]["access_type"]
          board_id?: string
          created_at?: string
          deleted_at?: string | null
          password_hash?: string | null
          saved_column_num?: number | null
          shared_with?: string[] | null
          slug?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "boards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      images: {
        Row: {
          blurhash: string | null
          caption: string | null
          created_at: string
          deleted: boolean
          file_ext: string
          image_id: string
          modified_at: string | null
          original_name: string
          width: number
        }
        Insert: {
          blurhash?: string | null
          caption?: string | null
          created_at?: string
          deleted?: boolean
          file_ext: string
          image_id?: string
          modified_at?: string | null
          original_name: string
          width: number
        }
        Update: {
          blurhash?: string | null
          caption?: string | null
          created_at?: string
          deleted?: boolean
          file_ext?: string
          image_id?: string
          modified_at?: string | null
          original_name?: string
          width?: number
        }
        Relationships: []
      }
      sections: {
        Row: {
          board_id: string
          created_at: string
          deleted: boolean
          deleted_at: string | null
          description: string | null
          order_index: number | null
          section_id: string
          title: string | null
        }
        Insert: {
          board_id: string
          created_at?: string
          deleted?: boolean
          deleted_at?: string | null
          description?: string | null
          order_index?: number | null
          section_id?: string
          title?: string | null
        }
        Update: {
          board_id?: string
          created_at?: string
          deleted?: boolean
          deleted_at?: string | null
          description?: string | null
          order_index?: number | null
          section_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sections_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["board_id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          tier: Database["public"]["Enums"]["tier_level"]
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          email: string
          tier?: Database["public"]["Enums"]["tier_level"]
          user_id?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          tier?: Database["public"]["Enums"]["tier_level"]
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      orphaned_images: {
        Row: {
          blurhash: string | null
          caption: string | null
          created_at: string | null
          deleted: boolean | null
          file_ext: string | null
          image_id: string | null
          modified_at: string | null
          original_name: string | null
          width: number | null
        }
        Insert: {
          blurhash?: string | null
          caption?: string | null
          created_at?: string | null
          deleted?: boolean | null
          file_ext?: string | null
          image_id?: string | null
          modified_at?: string | null
          original_name?: string | null
          width?: number | null
        }
        Update: {
          blurhash?: string | null
          caption?: string | null
          created_at?: string | null
          deleted?: boolean | null
          file_ext?: string | null
          image_id?: string | null
          modified_at?: string | null
          original_name?: string | null
          width?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      update_block_order: {
        Args: { blocks: Json; board: string }
        Returns: undefined
      }
    }
    Enums: {
      access_type: "private" | "shared_with" | "public"
      tier_level: "free" | "beta" | "pro" | "alpha"
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
      access_type: ["private", "shared_with", "public"],
      tier_level: ["free", "beta", "pro", "alpha"],
    },
  },
} as const
