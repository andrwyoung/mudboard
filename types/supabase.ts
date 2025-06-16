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
          caption: string | null
          col_index: number
          created_at: string
          data: Json | null
          deleted: boolean
          deleted_at: string | null
          height: number
          image_id: string | null
          OLD_board_id: string | null
          order_index: number
          row_index: number
          section_id: string
          subsection_id: string | null
          updated_at: string | null
          width: number | null
        }
        Insert: {
          block_id?: string
          block_type: string
          caption?: string | null
          col_index?: number
          created_at?: string
          data?: Json | null
          deleted?: boolean
          deleted_at?: string | null
          height: number
          image_id?: string | null
          OLD_board_id?: string | null
          order_index?: number
          row_index?: number
          section_id: string
          subsection_id?: string | null
          updated_at?: string | null
          width?: number | null
        }
        Update: {
          block_id?: string
          block_type?: string
          caption?: string | null
          col_index?: number
          created_at?: string
          data?: Json | null
          deleted?: boolean
          deleted_at?: string | null
          height?: number
          image_id?: string | null
          OLD_board_id?: string | null
          order_index?: number
          row_index?: number
          section_id?: string
          subsection_id?: string | null
          updated_at?: string | null
          width?: number | null
        }
        Relationships: [
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
          {
            foreignKeyName: "blocks_subsection_id_fkey"
            columns: ["subsection_id"]
            isOneToOne: false
            referencedRelation: "subsections"
            referencedColumns: ["subsection_id"]
          },
        ]
      }
      board_sections: {
        Row: {
          board_id: string
          board_section_id: string
          created_at: string
          deleted: boolean
          deleted_at: string | null
          order_index: number
          section_id: string
          updated_at: string | null
        }
        Insert: {
          board_id: string
          board_section_id?: string
          created_at?: string
          deleted?: boolean
          deleted_at?: string | null
          order_index: number
          section_id: string
          updated_at?: string | null
        }
        Update: {
          board_id?: string
          board_section_id?: string
          created_at?: string
          deleted?: boolean
          deleted_at?: string | null
          order_index?: number
          section_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "board_sections_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "board_stats"
            referencedColumns: ["board_id"]
          },
          {
            foreignKeyName: "board_sections_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["board_id"]
          },
          {
            foreignKeyName: "board_sections_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "expired_boards"
            referencedColumns: ["board_id"]
          },
          {
            foreignKeyName: "board_sections_section_id_fkey"
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
          deleted: boolean | null
          deleted_at: string | null
          expired_at: string | null
          is_demo: boolean | null
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
          deleted?: boolean | null
          deleted_at?: string | null
          expired_at?: string | null
          is_demo?: boolean | null
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
          deleted?: boolean | null
          deleted_at?: string | null
          expired_at?: string | null
          is_demo?: boolean | null
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
          created_at: string
          deleted: boolean
          file_ext: string
          image_id: string
          modified_at: string | null
          og_height: number
          og_width: number
          original_name: string
        }
        Insert: {
          blurhash?: string | null
          created_at?: string
          deleted?: boolean
          file_ext: string
          image_id?: string
          modified_at?: string | null
          og_height: number
          og_width: number
          original_name: string
        }
        Update: {
          blurhash?: string | null
          created_at?: string
          deleted?: boolean
          file_ext?: string
          image_id?: string
          modified_at?: string | null
          og_height?: number
          og_width?: number
          original_name?: string
        }
        Relationships: []
      }
      sections: {
        Row: {
          created_at: string
          deleted: boolean
          deleted_at: string | null
          description: string | null
          forked_from: string | null
          OLD_board_id: string | null
          OLD_order_index: number | null
          owned_by: string | null
          section_id: string
          title: string | null
        }
        Insert: {
          created_at?: string
          deleted?: boolean
          deleted_at?: string | null
          description?: string | null
          forked_from?: string | null
          OLD_board_id?: string | null
          OLD_order_index?: number | null
          owned_by?: string | null
          section_id?: string
          title?: string | null
        }
        Update: {
          created_at?: string
          deleted?: boolean
          deleted_at?: string | null
          description?: string | null
          forked_from?: string | null
          OLD_board_id?: string | null
          OLD_order_index?: number | null
          owned_by?: string | null
          section_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sections_forked_from_fkey"
            columns: ["forked_from"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["section_id"]
          },
        ]
      }
      subsections: {
        Row: {
          created_at: string
          deleted: boolean
          deleted_at: string | null
          order_index: number
          section_id: string
          subsection_id: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          deleted?: boolean
          deleted_at?: string | null
          order_index: number
          section_id: string
          subsection_id?: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          deleted?: boolean
          deleted_at?: string | null
          order_index?: number
          section_id?: string
          subsection_id?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subsections_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["section_id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          role: Database["public"]["Enums"]["admin_level"] | null
          tier: Database["public"]["Enums"]["tier_level"]
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          email: string
          role?: Database["public"]["Enums"]["admin_level"] | null
          tier?: Database["public"]["Enums"]["tier_level"]
          user_id?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          role?: Database["public"]["Enums"]["admin_level"] | null
          tier?: Database["public"]["Enums"]["tier_level"]
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      board_stats: {
        Row: {
          block_count: number | null
          board_id: string | null
          image_count: number | null
          real_block_count: number | null
          section_count: number | null
        }
        Relationships: []
      }
      expired_boards: {
        Row: {
          age: unknown | null
          board_expired: boolean | null
          board_id: string | null
          created_at: string | null
          current_time: string | null
          user_id: string | null
        }
        Insert: {
          age?: never
          board_expired?: never
          board_id?: string | null
          created_at?: string | null
          current_time?: never
          user_id?: string | null
        }
        Update: {
          age?: never
          board_expired?: never
          board_id?: string | null
          created_at?: string | null
          current_time?: never
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
      orphaned_images: {
        Row: {
          blurhash: string | null
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
      admin_level: "admin" | "sudo"
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
      admin_level: ["admin", "sudo"],
      tier_level: ["free", "beta", "pro", "alpha"],
    },
  },
} as const
